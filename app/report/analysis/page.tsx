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
  const changedItems = items.filter((item) => item.previousPrice !== null && item.currentPrice !== null && item.previousPrice !== item.currentPrice && item.changePercent !== null);
  const unreadable = items.filter((item) => item.currentPrice === null);
  const outOfStock = items.filter((item) => item.currentPrice !== null && !item.inStock);
  const markets = Array.from(new Set(items.map((item) => item.market)));

  const gainers = [...changedItems].filter((item) => (item.changePercent ?? 0) > 0).sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 8);
  const decliners = [...changedItems].filter((item) => (item.changePercent ?? 0) < 0).sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0)).slice(0, 8);

  const marketSummary = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const priced = marketItems.filter((item) => item.currentPrice !== null);
    return {
      market,
      total: marketItems.length,
      changed: marketItems.filter((item) => item.previousPrice !== null && item.currentPrice !== null && item.previousPrice !== item.currentPrice).length,
      outOfStock: marketItems.filter((item) => item.currentPrice !== null && !item.inStock).length,
      unreadable: marketItems.filter((item) => item.currentPrice === null).length,
      averagePrice: priced.length ? priced.reduce((sum, item) => sum + (item.currentPrice ?? 0), 0) / priced.length : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
        <section className="mb-4 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] px-5 py-4 shadow-xl md:px-6 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-200">PRICE ANALYTICS</div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Fiyat ve stok analizi</h1>
              <p className="mt-1.5 text-sm text-slate-300">Market bazında ürün, değişim, stok ve veri erişim özeti.</p>
            </div>
            <Link href="/report" className="inline-flex w-fit rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold">Fiyat raporuna dön</Link>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          {[["Toplam Ürün", items.length], ["Değişen", changedItems.length], ["Stok Dışı", outOfStock.length], ["Okunamayan", unreadable.length], ["Aktif Market", markets.length]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-[11px] text-slate-400">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-4 py-3"><h2 className="text-lg font-semibold">Market özeti</h2></div>
          <div className="overflow-x-auto"><table className="min-w-full text-[13px]">
            <thead className="bg-white/[0.04] text-left text-xs text-slate-400"><tr><th className="px-3 py-2.5">Market</th><th className="px-3 py-2.5">Ürün</th><th className="px-3 py-2.5">Değişen</th><th className="px-3 py-2.5">Stok Dışı</th><th className="px-3 py-2.5">Okunamayan</th><th className="px-3 py-2.5">Ort. Fiyat</th></tr></thead>
            <tbody>{marketSummary.map((item) => <tr key={item.market} className="border-t border-white/10"><td className="px-3 py-2.5"><MarketLogo market={item.market} compact /></td><td className="px-3 py-2.5 font-semibold">{item.total}</td><td className="px-3 py-2.5 text-slate-300">{item.changed}</td><td className="px-3 py-2.5 text-slate-300">{item.outOfStock}</td><td className="px-3 py-2.5 text-amber-300">{item.unreadable}</td><td className="px-3 py-2.5 text-slate-300">{formatPrice(item.averagePrice)}</td></tr>)}</tbody>
          </table></div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <MovementList title="En çok artanlar" items={gainers} positive />
          <MovementList title="En çok düşenler" items={decliners} positive={false} />
        </div>
      </div>
    </main>
  );
}

function MovementList({ title, items, positive }: { title: string; items: Awaited<ReturnType<typeof getLatestPrices>>; positive: boolean }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-4 py-3"><h2 className="text-lg font-semibold">{title}</h2></div>
      <div className="divide-y divide-white/10">
        {items.map((item) => <Link key={`${item.market}-${item.sku}`} href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/[0.03]"><div className="min-w-0"><div className="truncate text-sm font-medium">{item.name}</div><div className="mt-0.5 text-[11px] text-slate-500">{item.market} · {formatPrice(item.currentPrice)}</div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>{formatPercent(item.changePercent)}</span></Link>)}
        {!items.length && <div className="px-4 py-8 text-center text-sm text-slate-400">Gösterilecek hareket yok.</div>}
      </div>
    </section>
  );
}
