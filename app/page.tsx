import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import MarketLogo from "@/components/MarketLogo";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";

export const dynamic = "force-dynamic";

function formatPrice(price?: number | null) {
  if (price == null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

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

function isChangedToday(item: { lastChangedAt?: string | null }) {
  const todayKey = dateKeyInTurkey(new Date().toISOString());
  return Boolean(item.lastChangedAt) && dateKeyInTurkey(item.lastChangedAt) === todayKey;
}

const marketAccent: Record<string, string> = {
  A101: "border-cyan-400/25 hover:border-cyan-300/45",
  SOK: "border-yellow-300/25 hover:border-yellow-200/45",
  BIZIM: "border-orange-400/25 hover:border-orange-300/45",
  CARREFOUR: "border-blue-400/25 hover:border-blue-300/45",
};

export default async function HomePage() {
  const items = await getLatestPrices();
  const markets = Array.from(new Set(items.map((item) => item.market)));
  const todayChangedItems = items.filter(isChangedToday);
  const unreadableItems = items.filter((item) => item.currentPrice === null);

  const marketSummaries = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const changedToday = marketItems.filter(isChangedToday).length;

    return {
      market,
      total: marketItems.length,
      changedToday,
      lastUpdated: Math.max(
        ...marketItems.map((item) => new Date(item.updatedAt).getTime())
      ),
    };
  });

  const lastUpdated = items.length
    ? new Date(
        Math.max(...items.map((item) => new Date(item.updatedAt).getTime()))
      ).toLocaleString("tr-TR")
    : "-";

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="MARKET FİYAT TAKİBİ"
          title="Market Fiyat Takibi"
          description="Güncel fiyat değişimlerini, veri erişimini ve market performansını tek ekranda izleyin."
          meta={`Son güncelleme · ${lastUpdated}`}
          navItems={[
            { href: "/report", label: "Fiyat raporu", tone: "primary" },
            { href: "/report/analysis", label: "Analiz", tone: "success" },
            { href: "/price-check", label: "Fiyat kontrolü", tone: "neutral" },
          ]}
        />

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Toplam ürün" value={items.length} />
          <MetricCard
            label="Bugün değişen"
            value={todayChangedItems.length}
            tone="positive"
          />
          <MetricCard
            label="Okunamayan"
            value={unreadableItems.length}
            tone="warning"
          />
          <MetricCard label="Aktif market" value={markets.length} tone="info" />
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Marketler</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Market bazında güncel durum ve hızlı rapor erişimi
              </p>
            </div>
            <span className="text-xs text-slate-500">{markets.length} market</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {marketSummaries.map((summary) => (
              <Link
                key={summary.market}
                href={`/report?market=${encodeURIComponent(summary.market)}`}
                className={`group rounded-[18px] border bg-white/[0.028] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.045] ${
                  marketAccent[summary.market] ?? "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <MarketLogo market={summary.market} />
                  <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-xs text-slate-300">
                    {summary.total} ürün
                  </span>
                </div>

                <div className="mt-5 text-sm font-semibold text-slate-100">
                  {summary.changedToday > 0
                    ? `Bugün ${summary.changedToday} üründe değişiklik`
                    : "Bugün fiyat değişimi yok"}
                </div>
                <div className="mt-1 text-xs text-slate-500 transition group-hover:text-slate-300">
                  Market raporunu aç →
                </div>
                <div className="mt-4 border-t border-white/[0.07] pt-3 text-[10px] text-slate-600">
                  Son kontrol · {new Date(summary.lastUpdated).toLocaleString("tr-TR")}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-white/[0.085] bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
            <div>
              <h2 className="font-semibold tracking-[-0.01em]">Bugünkü fiyat hareketleri</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Yalnızca bugün kaydedilen değişiklikler</p>
            </div>
            <Link href="/report" className="text-xs font-medium text-blue-300 hover:text-blue-200">
              Tüm raporu gör
            </Link>
          </div>

          {todayChangedItems.length > 0 ? (
            <div className="divide-y divide-white/[0.07]">
              {todayChangedItems.slice(0, 5).map((item) => (
                <Link
                  key={`${item.market}-${item.sku}`}
                  href={`/report/detail?sku=${encodeURIComponent(item.sku)}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/[0.025]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.market} · {item.sku}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {formatPrice(item.previousPrice)} →{" "}
                    <span className="font-semibold text-white">{formatPrice(item.currentPrice)}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      (item.changePercent ?? 0) >= 0
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {formatPercent(item.changePercent)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              Bugün kaydedilmiş yeni bir fiyat değişikliği yok.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
