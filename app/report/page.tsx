import { getLatestPrices } from "@/lib/firestorePrices";
import { getRecentAnalyticsHistory } from "@/lib/analyticsData";
import { resolveProductImage } from "@/lib/localProductImages";
import ReportExplorer from "@/components/ReportExplorer";
import DashboardHeader from "@/components/DashboardHeader";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ market?: string; changed?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const market = resolved?.market || "";
  const highlightedSkus = (resolved?.changed || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const [rawItems, recentHistory] = await Promise.all([
    getLatestPrices(),
    getRecentAnalyticsHistory(240),
  ]);

  const allItems = rawItems.map((item) => ({
    ...item,
    imageUrl: resolveProductImage(item.market, item.sku, item.imageUrl),
  }));

  const priceHistoryMap = recentHistory.reduce<Record<string, number[]>>((map, item) => {
    if (item.price === null || Number.isNaN(item.price)) return map;
    const values = map[item.sku] ?? [];
    values.push(item.price);
    map[item.sku] = values.slice(-12);
    return map;
  }, {});

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
