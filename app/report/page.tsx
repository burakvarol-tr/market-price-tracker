import { getLatestPrices } from "@/lib/firestorePricesSafe";
import { getRecentAnalyticsHistory } from "@/lib/analyticsData";
import { resolveProductImage } from "@/lib/localProductImages";
import ReportExplorer from "@/components/ReportExplorer";
import DashboardHeader from "@/components/DashboardHeader";

export const dynamic = "force-dynamic";

function dateKeyInTurkey(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function changedToday(value?: string | null) {
  return Boolean(value) && dateKeyInTurkey(value) === dateKeyInTurkey(new Date().toISOString());
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ market?: string; changed?: string; status?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const market = resolved?.market || "";
  const status = resolved?.status || "";
  const highlightedSkus = (resolved?.changed || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const [rawItems, recentHistory] = await Promise.all([
    getLatestPrices(),
    getRecentAnalyticsHistory(30),
  ]);

  const allItems = rawItems
    .map((item) => ({
      ...item,
      imageUrl: resolveProductImage(item.market, item.sku, item.imageUrl),
    }))
    .filter((item) => {
      if (status === "changed") return changedToday(item.lastChangedAt);
      if (status === "out-of-stock") return item.currentPrice !== null && !item.inStock;
      if (status === "unreadable") return item.currentPrice === null;
      return true;
    });

  const priceHistoryMap = recentHistory.reduce<Record<string, number[]>>((map, item) => {
    if (item.price === null || Number.isNaN(item.price)) return map;
    const values = map[item.sku] ?? [];
    values.push(item.price);
    map[item.sku] = values.slice(-12);
    return map;
  }, {});

  for (const item of allItems) {
    const values = priceHistoryMap[item.sku] ?? [];
    const fallback: number[] = [];

    if (item.previousPrice !== null && Number.isFinite(item.previousPrice)) {
      fallback.push(item.previousPrice);
    }
    if (item.currentPrice !== null && Number.isFinite(item.currentPrice)) {
      fallback.push(item.currentPrice);
    }

    if (values.length < 2 && fallback.length >= 2 && fallback[0] !== fallback[1]) {
      priceHistoryMap[item.sku] = fallback;
    } else if (values.length === 0 && fallback.length === 1) {
      priceHistoryMap[item.sku] = fallback;
    }
  }

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="PERAKENDE FİYAT İZLEME"
          title="Fiyat raporu"
          description="Ürünleri arayın, market, kategori ve durum bazında filtreleyin; mini trendlerle fiyat hareketini tek ekranda izleyin."
          navItems={[
            { href: "/", label: "Ana sayfa", tone: "neutral" },
            { href: "/report/analysis", label: "Analiz", tone: "success" },
            { href: "/report/intelligence", label: "İleri analiz", tone: "primary" },
            { href: "/report/export", label: "PDF raporu", tone: "neutral" },
            { href: "/api/export/excel", label: "Excel indir", tone: "neutral" },
            { href: "/price-check", label: "Fiyat kontrolü", tone: "neutral" },
          ]}
        />

        {status && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-blue-400/15 bg-blue-500/[0.06] px-3 py-2 text-xs text-blue-200">
            <span>
              {status === "changed" && "Bugün değişen ürünler gösteriliyor"}
              {status === "out-of-stock" && "Stok dışı ürünler gösteriliyor"}
              {status === "unreadable" && "Verisi okunamayan ürünler gösteriliyor"}
            </span>
            <a href={market ? `/report?market=${encodeURIComponent(market)}` : "/report"} className="rounded-md border border-blue-300/20 px-2 py-1 text-[10px]">Filtreyi temizle</a>
          </div>
        )}

        <ReportExplorer
          initialItems={allItems}
          initialMarket={market}
          highlightedSkus={highlightedSkus}
          priceHistoryMap={priceHistoryMap}
        />
      </div>
    </main>
  );
}
