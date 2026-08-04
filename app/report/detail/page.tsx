import Link from "next/link";
import { getLatestPriceBySku, getPriceHistoryBySku } from "@/lib/firestorePrices";
import SafeProductImage from "@/components/SafeProductImage";
import MarketLogo from "@/components/MarketLogo";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { getProductUrl } from "@/lib/productCatalog";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

export default async function ProductDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string }>;
}) {
  const { sku } = await searchParams;

  if (!sku) {
    return (
      <main className="min-h-screen bg-[#08111F] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-xl font-semibold">Geçersiz ürün bağlantısı</h1>
          <Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link>
        </div>
      </main>
    );
  }

  const latest = await getLatestPriceBySku(sku);
  const history = await getPriceHistoryBySku(sku);

  if (!latest) {
    return (
      <main className="min-h-screen bg-[#08111F] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-xl font-semibold">Ürün verisi bulunamadı</h1>
          <Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link>
        </div>
      </main>
    );
  }

  const productUrl = getProductUrl(latest.sku, latest.market);
  const pricedHistory = history.filter((item) => typeof item.price === "number");
  const chartData = pricedHistory
    .slice(0, 30)
    .reverse()
    .map((item) => ({ date: item.checkedAt, price: item.price as number }));

  const prices = pricedHistory.map((item) => item.price as number);
  if (latest.currentPrice !== null && !prices.includes(latest.currentPrice)) prices.push(latest.currentPrice);

  const minimumPrice = prices.length ? Math.min(...prices) : null;
  const maximumPrice = prices.length ? Math.max(...prices) : null;
  const averagePrice = prices.length
    ? Number((prices.reduce((total, price) => total + price, 0) / prices.length).toFixed(2))
    : null;

  const previousPrice = latest.previousPrice ?? history[0]?.previousPrice ?? null;
  const hasChange = previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice;
  const changePercent =
    hasChange && previousPrice !== 0 && latest.currentPrice !== null
      ? Number((((latest.currentPrice - previousPrice) / previousPrice) * 100).toFixed(2))
      : null;
  const unreadable = latest.currentPrice === null;
  const statusText = unreadable ? "Okunamadı" : latest.inStock ? "Stokta" : "Stok dışı";

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6">
        <section className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)]">
          <div className={`grid items-stretch gap-0 ${latest.imageUrl ? "lg:grid-cols-[1fr_180px]" : ""}`}>
            <div className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <MarketLogo market={latest.market} />
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${unreadable ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : latest.inStock ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-rose-400/20 bg-rose-500/10 text-rose-300"}`}>
                  {statusText}
                </span>
              </div>

              <h1 className="mt-3 max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.03em] md:text-3xl">
                {latest.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span>SKU: <strong className="font-medium text-slate-200">{latest.sku}</strong></span>
                <span>Son kontrol: <strong className="font-medium text-slate-200">{formatDate(latest.lastCheckedAt)}</strong></span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/report?market=${encodeURIComponent(latest.market)}`} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold hover:bg-blue-500">Market raporu</Link>
                <Link href="/report" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10">Tüm raporlar</Link>
                {productUrl && (
                  <a href={productUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15">Markette aç ↗</a>
                )}
              </div>
            </div>

            {latest.imageUrl && (
              <div className="flex items-center justify-center border-t border-white/10 bg-white/[0.025] p-3 lg:border-l lg:border-t-0">
                <SafeProductImage
                  src={latest.imageUrl}
                  alt={latest.name}
                  className="h-[170px] w-[135px] rounded-xl"
                  imageClassName="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
        </section>

        {unreadable && (
          <section className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200">
            Fiyat ve stok bilgisi şu anda okunamadı. Bu durum ürünün stokta olmadığı anlamına gelmez.
          </section>
        )}

        <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["Güncel fiyat", formatPrice(latest.currentPrice)],
            ["Önceki fiyat", formatPrice(previousPrice)],
            ["Durum", statusText],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="text-xs text-slate-400">{label}</div>
              <div className="mt-1 break-words text-lg font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["En düşük", formatPrice(minimumPrice)],
            ["En yüksek", formatPrice(maximumPrice)],
            ["Ortalama", formatPrice(averagePrice)],
            ["Kayıt", history.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs text-slate-400">{label}</div>
              <div className="mt-1 text-lg font-semibold">{value}</div>
            </div>
          ))}
        </section>

        {hasChange && (
          <section className={`mb-4 rounded-xl border px-4 py-3 text-sm ${(changePercent ?? 0) >= 0 ? "border-emerald-400/15 bg-emerald-500/[0.06]" : "border-rose-400/15 bg-rose-500/[0.06]"}`}>
            <strong>Son değişim:</strong> <span className="ml-2 text-slate-300">{formatPrice(previousPrice)} → {formatPrice(latest.currentPrice)} · {changePercent !== null ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "-"}</span>
          </section>
        )}

        <section className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div><h2 className="font-semibold">Fiyat grafiği</h2><p className="text-xs text-slate-500">Son 30 fiyat kaydı</p></div>
            <div className="text-xs text-slate-400">{formatPrice(minimumPrice)} – {formatPrice(maximumPrice)}</div>
          </div>
          <div className="p-4"><PriceHistoryChart points={chartData} /></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-4 py-3"><h2 className="font-semibold">Fiyat geçmişi</h2></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-white/[0.04] text-left text-slate-400"><tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Fiyat</th><th className="px-4 py-3">Önceki</th><th className="px-4 py-3">Değişim</th><th className="px-4 py-3">Durum</th></tr></thead>
              <tbody>
                {history.map((item, index) => {
                  const rowUnreadable = item.price === null;
                  return (
                    <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t border-white/10">
                      <td className="px-4 py-3 text-slate-400">{formatDate(item.checkedAt)}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-slate-400">{formatPrice(item.previousPrice ?? null)}</td>
                      <td className="px-4 py-3">{item.changePercent !== null && item.changePercent !== undefined ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : "-"}</td>
                      <td className={`px-4 py-3 ${rowUnreadable ? "text-amber-300" : "text-slate-400"}`}>{rowUnreadable ? "Okunamadı" : item.inStock ? "Var" : "Yok"}</td>
                    </tr>
                  );
                })}
                {!history.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Geçmiş veri yok</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
