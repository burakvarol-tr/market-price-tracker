import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import MarketLogo from "@/components/MarketLogo";

export const dynamic = "force-dynamic";

function formatPrice(price?: number | null) {
  if (price == null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default async function HomePage() {
  const items = await getLatestPrices();
  const markets = Array.from(new Set(items.map((item) => item.market)));
  const changedItems = items.filter(
    (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
  );
  const readableItems = items.filter((item) => item.currentPrice !== null);
  const unreadableItems = items.filter((item) => item.currentPrice === null);
  const increased = changedItems.filter((item) => (item.changePercent ?? 0) > 0).length;
  const decreased = changedItems.filter((item) => (item.changePercent ?? 0) < 0).length;

  const marketSummaries = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    return {
      market,
      total: marketItems.length,
      changed: marketItems.filter(
        (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
      ).length,
      unreadable: marketItems.filter((item) => item.currentPrice === null).length,
      lastUpdated: Math.max(...marketItems.map((item) => new Date(item.updatedAt).getTime())),
    };
  });

  const lastUpdated = items.length
    ? new Date(Math.max(...items.map((item) => new Date(item.updatedAt).getTime()))).toLocaleString("tr-TR")
    : "-";

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
        <section className="mb-4 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] px-5 py-4 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-200">
                MARKET FİYAT TAKİBİ
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Yönetim Paneli</h1>
              <p className="mt-1 text-sm text-slate-400">Fiyat, stok ve veri erişim durumunu tek ekranda izleyin.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                Son güncelleme: <span className="font-semibold text-white">{lastUpdated}</span>
              </div>
              <Link href="/report" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">Fiyat raporu</Link>
              <Link href="/report/analysis" className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">Analiz</Link>
              <Link href="/price-check" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Fiyat kontrolü</Link>
            </div>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Toplam", items.length, "text-white"],
            ["Okunan", readableItems.length, "text-blue-300"],
            ["Değişen", changedItems.length, "text-emerald-300"],
            ["Artan", increased, "text-emerald-300"],
            ["Düşen", decreased, "text-rose-300"],
            ["Okunamayan", unreadableItems.length, "text-amber-300"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-slate-400">{label}</div>
              <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-4">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Marketler</h2>
              <p className="text-xs text-slate-500">Market bazında güncel özet</p>
            </div>
            <span className="text-xs text-slate-500">{markets.length} market</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {marketSummaries.map((summary) => (
              <Link key={summary.market} href={`/report?market=${encodeURIComponent(summary.market)}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
                <div className="flex items-center justify-between gap-3">
                  <MarketLogo market={summary.market} />
                  <span className="text-xs text-slate-500">{summary.total} ürün</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-black/20 px-2 py-2"><div className="text-[10px] text-slate-500">Toplam</div><div className="mt-1 font-semibold">{summary.total}</div></div>
                  <div className="rounded-lg bg-black/20 px-2 py-2"><div className="text-[10px] text-slate-500">Değişen</div><div className="mt-1 font-semibold text-emerald-300">{summary.changed}</div></div>
                  <div className="rounded-lg bg-black/20 px-2 py-2"><div className="text-[10px] text-slate-500">Okunamayan</div><div className="mt-1 font-semibold text-amber-300">{summary.unreadable}</div></div>
                </div>
                <div className="mt-2 text-[10px] text-slate-600">{new Date(summary.lastUpdated).toLocaleString("tr-TR")}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 px-4 py-3"><h2 className="font-semibold">Bugünkü Özet</h2></div>
            <div className="grid grid-cols-2 gap-2 p-4 text-sm">
              <div className="rounded-lg bg-black/20 p-3"><span className="text-slate-400">Kontrol edilen</span><strong className="float-right">{items.length}</strong></div>
              <div className="rounded-lg bg-black/20 p-3"><span className="text-slate-400">Fiyat değişen</span><strong className="float-right text-emerald-300">{changedItems.length}</strong></div>
              <div className="rounded-lg bg-black/20 p-3"><span className="text-slate-400">Fiyat artan</span><strong className="float-right text-emerald-300">{increased}</strong></div>
              <div className="rounded-lg bg-black/20 p-3"><span className="text-slate-400">Fiyat düşen</span><strong className="float-right text-rose-300">{decreased}</strong></div>
              <div className="col-span-2 rounded-lg bg-amber-500/[0.06] p-3"><span className="text-slate-400">Verisi okunamayan</span><strong className="float-right text-amber-300">{unreadableItems.length}</strong></div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 px-4 py-3"><h2 className="font-semibold">Son fiyat hareketleri</h2></div>
            <div className="divide-y divide-white/10">
              {changedItems.slice(0, 6).map((item) => (
                <Link key={`${item.market}-${item.sku}`} href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.03]">
                  <div className="min-w-0"><div className="truncate font-medium">{item.name}</div><div className="text-[10px] text-slate-500">{item.market} · {item.sku}</div></div>
                  <div className="text-right text-xs text-slate-400">{formatPrice(item.previousPrice)} → <span className="font-semibold text-white">{formatPrice(item.currentPrice)}</span></div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${(item.changePercent ?? 0) >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>{formatPercent(item.changePercent)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
