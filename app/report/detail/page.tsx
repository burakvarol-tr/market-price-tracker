import Link from "next/link";
import { getLatestPriceBySku, getPriceHistoryBySku } from "@/lib/firestorePrices";
import SafeProductImage from "@/components/SafeProductImage";
import MarketLogo from "@/components/MarketLogo";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { getProductUrl } from "@/lib/productCatalog";
import { resolveProductImage } from "@/lib/localProductImages";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

export default async function ProductDetailPage({ searchParams }: { searchParams: Promise<{ sku?: string }> }) {
  const { sku } = await searchParams;

  if (!sku) {
    return (
      <main className="min-h-screen bg-[#07101D] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-xl font-semibold">Geçersiz ürün bağlantısı</h1>
          <Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link>
        </div>
      </main>
    );
  }

  const [latest, history] = await Promise.all([
    getLatestPriceBySku(sku),
    getPriceHistoryBySku(sku),
  ]);

  if (!latest) {
    return (
      <main className="min-h-screen bg-[#07101D] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-xl font-semibold">Ürün verisi bulunamadı</h1>
          <Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link>
        </div>
      </main>
    );
  }

  const productUrl = getProductUrl(latest.sku, latest.market);
  const imageUrl = resolveProductImage(latest.market, latest.sku, latest.imageUrl);
  const pricedHistory = history.filter((item) => typeof item.price === "number");
  let chartData = pricedHistory
    .slice(0, 30)
    .reverse()
    .map((item) => ({ date: item.checkedAt, price: item.price as number }));

  const previousPrice = latest.previousPrice ?? history[0]?.previousPrice ?? null;
  if (chartData.length < 2 && previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice) {
    chartData = [
      { date: latest.lastChangedAt ?? latest.updatedAt, price: previousPrice },
      { date: latest.lastCheckedAt ?? latest.updatedAt, price: latest.currentPrice },
    ];
  }

  const prices = chartData.map((item) => item.price);
  if (latest.currentPrice !== null && !prices.includes(latest.currentPrice)) prices.push(latest.currentPrice);
  if (previousPrice !== null && !prices.includes(previousPrice)) prices.push(previousPrice);

  const minimumPrice = prices.length ? Math.min(...prices) : null;
  const maximumPrice = prices.length ? Math.max(...prices) : null;
  const averagePrice = prices.length ? Number((prices.reduce((total, price) => total + price, 0) / prices.length).toFixed(2)) : null;
  const hasChange = previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice;
  const changePercent = hasChange && previousPrice !== 0 && latest.currentPrice !== null
    ? Number((((latest.currentPrice - previousPrice) / previousPrice) * 100).toFixed(2))
    : null;
  const unreadable = latest.currentPrice === null;
  const statusText = unreadable ? "Okunamadı" : latest.inStock ? "Stokta" : "Stok dışı";

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <section className="mb-4 overflow-hidden rounded-[20px] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_34%),linear-gradient(135deg,#0E1A2C_0%,#091321_100%)] shadow-[0_24px_65px_rgba(0,0,0,0.2)]">
          <div className="grid items-stretch lg:grid-cols-[1fr_210px]">
            <div className="px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <MarketLogo market={latest.market} />
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${unreadable ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : latest.inStock ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-rose-400/20 bg-rose-500/10 text-rose-300"}`}>{statusText}</span>
              </div>
              <h1 className="mt-4 max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.035em] md:text-[34px]">{latest.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
                <span>SKU <strong className="ml-1 font-medium text-slate-200">{latest.sku}</strong></span>
                <span>Son kontrol <strong className="ml-1 font-medium text-slate-200">{formatDate(latest.lastCheckedAt)}</strong></span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/report?market=${encodeURIComponent(latest.market)}`} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold transition hover:bg-blue-500">Market raporu</Link>
                <Link href="/report" className="rounded-lg border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-xs text-slate-300 transition hover:bg-white/[0.08]">Tüm raporlar</Link>
                {productUrl && <a href={productUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15">Markette aç ↗</a>}
              </div>
            </div>
            <div className="flex items-center justify-center border-t border-white/[0.08] bg-white/[0.018] p-4 lg:border-l lg:border-t-0">
              <SafeProductImage
                src={imageUrl}
                alt={latest.name}
                className="h-[178px] w-[148px] rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                imageClassName={`h-full w-full object-contain ${latest.market === "CARREFOUR" ? "scale-[1.28]" : "scale-[1.16]"}`}
              />
            </div>
          </div>
        </section>

        {unreadable && (
          <section className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.055] px-4 py-3 text-sm text-amber-100">
            Fiyat ve stok bilgisi şu anda okunamadı. Bu durum ürünün stokta olmadığı anlamına gelmez.
          </section>
        )}

        <section className="mb-4 grid gap-3 md:grid-cols-3">
          {[["Güncel fiyat", formatPrice(latest.currentPrice)], ["Önceki fiyat", formatPrice(previousPrice)], ["Durum", statusText]].map(([label, value]) => (
            <div key={String(label)} className="rounded-[16px] border border-white/[0.085] bg-white/[0.028] px-4 py-3.5">
              <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{label}</div>
              <div className="mt-1.5 text-xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-white/[0.075] bg-black/15 px-4 py-3 text-xs text-slate-400">
          <span>En düşük <strong className="ml-1 text-slate-100">{formatPrice(minimumPrice)}</strong></span>
          <span>En yüksek <strong className="ml-1 text-slate-100">{formatPrice(maximumPrice)}</strong></span>
          <span>Ortalama <strong className="ml-1 text-slate-100">{formatPrice(averagePrice)}</strong></span>
          <span>Kayıt <strong className="ml-1 text-slate-100">{history.length}</strong></span>
        </section>

        {hasChange && (
          <section className={`mb-4 rounded-xl border px-4 py-3 text-sm ${(changePercent ?? 0) >= 0 ? "border-emerald-400/15 bg-emerald-500/[0.055]" : "border-rose-400/15 bg-rose-500/[0.055]"}`}>
            <strong>Son değişim</strong><span className="ml-2 text-slate-300">{formatPrice(previousPrice)} → {formatPrice(latest.currentPrice)} · {changePercent !== null ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "-"}</span>
          </section>
        )}

        <section className="mb-4 overflow-hidden rounded-[18px] border border-white/[0.085] bg-white/[0.028]">
          <div className="flex items-center justify-between border-b border-white/[0.075] px-4 py-3.5">
            <div><h2 className="font-semibold">Fiyat trendi</h2><p className="text-[11px] text-slate-500">Son 30 fiyat kaydı</p></div>
            <div className="text-xs text-slate-400">{formatPrice(minimumPrice)} – {formatPrice(maximumPrice)}</div>
          </div>
          <div className="p-4">
            {chartData.length >= 2 ? <PriceHistoryChart points={chartData} /> : (
              <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-black/10 text-center text-sm text-slate-400">Henüz fiyat trendi oluşmadı.</div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-white/[0.085] bg-white/[0.028]">
          <div className="border-b border-white/[0.075] px-4 py-3.5"><h2 className="font-semibold">Fiyat geçmişi</h2></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-white/[0.035] text-left text-slate-400"><tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Fiyat</th><th className="px-4 py-3">Önceki</th><th className="px-4 py-3">Değişim</th><th className="px-4 py-3">Durum</th></tr></thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t border-white/[0.07]">
                    <td className="px-4 py-3 text-slate-400">{formatDate(item.checkedAt)}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-slate-400">{formatPrice(item.previousPrice ?? null)}</td>
                    <td className="px-4 py-3">{item.changePercent !== null && item.changePercent !== undefined ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : "-"}</td>
                    <td className={`px-4 py-3 ${item.price === null ? "text-amber-300" : "text-slate-400"}`}>{item.price === null ? "Okunamadı" : item.inStock ? "Var" : "Yok"}</td>
                  </tr>
                ))}
                {!history.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Geçmiş veri yok</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
