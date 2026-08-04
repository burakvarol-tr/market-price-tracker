import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import MarketLogo from "@/components/MarketLogo";

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

  const gainers = [...changedItems]
    .filter((item) => (item.changePercent ?? 0) > 0)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 8);

  const decliners = [...changedItems]
    .filter((item) => (item.changePercent ?? 0) < 0)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 8);

  const outOfStock = items.filter((item) => !item.inStock);
  const markets = Array.from(new Set(items.map((item) => item.market)));

  const marketSummary = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const changed = marketItems.filter(
      (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
    ).length;

    return {
      market,
      total: marketItems.length,
      changed,
      outOfStock: marketItems.filter((item) => !item.inStock).length,
      averagePrice:
        marketItems.filter((item) => item.currentPrice !== null).length > 0
          ? marketItems.reduce((sum, item) => sum + (item.currentPrice ?? 0), 0) /
            marketItems.filter((item) => item.currentPrice !== null).length
          : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-7 shadow-2xl md:p-10">
          <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
            PRICE ANALYTICS
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
            Fiyat ve stok analizi
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            Market bazında ürün sayıları, değişimler, stok durumu ve öne çıkan fiyat hareketleri.
          </p>
          <Link href="/report" className="mt-7 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-600/25">
            Fiyat raporuna dön
          </Link>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Toplam Ürün", items.length],
            ["Fiyatı Değişen", changedItems.length],
            ["Stok Dışı", outOfStock.length],
            ["Aktif Market", markets.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-3 text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold">Market özeti</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-slate-400">
                <tr>
                  <th className="px-5 py-4">Market</th>
                  <th className="px-5 py-4">Ürün</th>
                  <th className="px-5 py-4">Değişen</th>
                  <th className="px-5 py-4">Stok Dışı</th>
                  <th className="px-5 py-4">Ortalama Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {marketSummary.map((item) => (
                  <tr key={item.market} className="border-t border-white/10">
                    <td className="px-5 py-4"><MarketLogo market={item.market} /></td>
                    <td className="px-5 py-4 font-semibold">{item.total}</td>
                    <td className="px-5 py-4 text-slate-300">{item.changed}</td>
                    <td className="px-5 py-4 text-slate-300">{item.outOfStock}</td>
                    <td className="px-5 py-4 text-slate-300">{formatPrice(item.averagePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
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
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-white/10">
        {items.map((item) => (
          <Link
            key={`${item.market}-${item.sku}`}
            href={`/report/detail?sku=${encodeURIComponent(item.sku)}`}
            className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/[0.03]"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{item.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{item.market}</span>
                <span>{formatPrice(item.currentPrice)}</span>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
              {formatPercent(item.changePercent)}
            </span>
          </Link>
        ))}

        {!items.length && (
          <div className="px-6 py-10 text-center text-sm text-slate-400">Gösterilecek hareket yok.</div>
        )}
      </div>
    </section>
  );
}
