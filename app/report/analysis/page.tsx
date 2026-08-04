import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import MarketLogo from "@/components/MarketLogo";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  return value === null ? "-" : `${value.toFixed(2)} TL`;
}

function formatPercent(value: number | null) {
  if (value === null) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default async function AnalysisPage() {
  const items = await getLatestPrices();
  const changedItems = items.filter(
    (item) =>
      item.previousPrice !== null &&
      item.currentPrice !== null &&
      item.previousPrice !== item.currentPrice &&
      item.changePercent !== null
  );
  const unreadable = items.filter((item) => item.currentPrice === null);
  const outOfStock = items.filter((item) => item.currentPrice !== null && !item.inStock);
  const markets = Array.from(new Set(items.map((item) => item.market)));

  const gainers = [...changedItems]
    .filter((item) => (item.changePercent ?? 0) > 0)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 8);
  const decliners = [...changedItems]
    .filter((item) => (item.changePercent ?? 0) < 0)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 8);

  const marketSummary = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const priced = marketItems.filter((item) => item.currentPrice !== null);
    return {
      market,
      total: marketItems.length,
      changed: marketItems.filter(
        (item) =>
          item.previousPrice !== null &&
          item.currentPrice !== null &&
          item.previousPrice !== item.currentPrice
      ).length,
      outOfStock: marketItems.filter(
        (item) => item.currentPrice !== null && !item.inStock
      ).length,
      unreadable: marketItems.filter((item) => item.currentPrice === null).length,
      averagePrice: priced.length
        ? priced.reduce((sum, item) => sum + (item.currentPrice ?? 0), 0) /
          priced.length
        : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="FİYAT ANALİZİ"
          title="Fiyat ve stok analizi"
          description="Market bazında ürün, değişim, stok ve veri erişim durumunu yönetici seviyesinde özetleyin."
          navItems={[
            { href: "/", label: "Ana sayfa", tone: "neutral" },
            { href: "/report", label: "Fiyat raporu", tone: "primary" },
            { href: "/price-check", label: "Fiyat kontrolü", tone: "neutral" },
          ]}
        />

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <MetricCard label="Toplam ürün" value={items.length} />
          <MetricCard label="Değişen" value={changedItems.length} tone="positive" />
          <MetricCard label="Stok dışı" value={outOfStock.length} tone="negative" />
          <MetricCard label="Okunamayan" value={unreadable.length} tone="warning" />
          <MetricCard label="Aktif market" value={markets.length} tone="info" />
        </section>

        <section className="mb-5 overflow-hidden rounded-[18px] border border-white/[0.085] bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
          <div className="border-b border-white/[0.08] px-4 py-3.5">
            <h2 className="font-semibold tracking-[-0.01em]">Market özeti</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Güncel ürün, değişim ve veri erişim görünümü
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead className="bg-white/[0.035] text-left text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">Değişen</th>
                  <th className="px-4 py-3">Stok dışı</th>
                  <th className="px-4 py-3">Okunamayan</th>
                  <th className="px-4 py-3">Ort. fiyat</th>
                </tr>
              </thead>
              <tbody>
                {marketSummary.map((item) => (
                  <tr key={item.market} className="border-t border-white/[0.07] transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><MarketLogo market={item.market} compact /></td>
                    <td className="px-4 py-3 font-semibold">{item.total}</td>
                    <td className="px-4 py-3 text-slate-300">{item.changed}</td>
                    <td className="px-4 py-3 text-slate-300">{item.outOfStock}</td>
                    <td className="px-4 py-3 text-amber-300">{item.unreadable}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPrice(item.averagePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <MovementList title="En çok artanlar" items={gainers} positive />
          <MovementList title="En çok düşenler" items={decliners} positive={false} />
        </div>
      </div>
    </main>
  );
}

function MovementList({
  title,
  items,
  positive,
}: {
  title: string;
  items: Awaited<ReturnType<typeof getLatestPrices>>;
  positive: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-white/[0.085] bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
      <div className="border-b border-white/[0.08] px-4 py-3.5">
        <h2 className="font-semibold tracking-[-0.01em]">{title}</h2>
      </div>
      <div className="divide-y divide-white/[0.07]">
        {items.map((item) => (
          <Link
            key={`${item.market}-${item.sku}`}
            href={`/report/detail?sku=${encodeURIComponent(item.sku)}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/[0.025]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{item.name}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                {item.market} · {formatPrice(item.currentPrice)}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                positive
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {formatPercent(item.changePercent)}
            </span>
          </Link>
        ))}
        {!items.length && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Gösterilecek hareket yok.
          </div>
        )}
      </div>
    </section>
  );
}
