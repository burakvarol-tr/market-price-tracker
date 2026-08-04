import Link from "next/link";
import { getLatestPriceBySku, getPriceHistoryBySku } from "@/lib/firestorePrices";
import SafeProductImage from "@/components/SafeProductImage";
import MarketLogo from "@/components/MarketLogo";
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

function buildChartPoints(values: number[], width = 760, height = 180) {
  if (!values.length) return "";
  if (values.length === 1) return `${width / 2},${height / 2}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 24) - 12;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export default async function ProductDetailPage({ searchParams }: { searchParams: Promise<{ sku?: string }> }) {
  const { sku } = await searchParams;
  if (!sku) return <EmptyState title="Geçersiz ürün bağlantısı" />;

  const latest = await getLatestPriceBySku(sku);
  const history = await getPriceHistoryBySku(sku);
  if (!latest) return <EmptyState title="Ürün verisi bulunamadı" />;

  const productUrl = getProductUrl(latest.sku, latest.market);
  const pricedHistory = history.filter((item) => typeof item.price === "number");
  const chartHistory = pricedHistory.slice(0, 30).reverse();
  const chartValues = chartHistory.map((item) => item.price as number);
  const chartPoints = buildChartPoints(chartValues);
  const allPrices = pricedHistory.map((item) => item.price as number);
  if (latest.currentPrice !== null) allPrices.push(latest.currentPrice);

  const minimumPrice = allPrices.length ? Math.min(...allPrices) : null;
  const maximumPrice = allPrices.length ? Math.max(...allPrices) : null;
  const averagePrice = allPrices.length ? Number((allPrices.reduce((sum, value) => sum + value, 0) / allPrices.length).toFixed(2)) : null;
  const previousPrice = latest.previousPrice ?? history[0]?.previousPrice ?? history[1]?.price ?? null;
  const hasChange = previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice;
  const changePercent = hasChange && previousPrice !== 0 && latest.currentPrice !== null ? Number((((latest.currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)) : null;
  const unreadable = latest.currentPrice === null;
  const statusText = unreadable ? "Veri alınamadı" : latest.inStock ? "Var" : "Yok";

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
        <section className="mb-4 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-4 shadow-xl md:p-5">
          <div className={`grid items-center gap-5 ${latest.imageUrl ? "md:grid-cols-[1fr_190px]" : "md:grid-cols-1"}`}>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-200">PRODUCT DETAIL</span><MarketLogo market={latest.market} compact /></div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{latest.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/report?market=${encodeURIComponent(latest.market)}`} className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold">Market raporu</Link>
                <Link href="/report" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">Tüm raporlar</Link>
                {productUrl && <a href={productUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">Markette aç ↗</a>}
              </div>
              <div className="mt-3 text-xs text-slate-400">Son kontrol: <span className="text-slate-200">{formatDate(latest.lastCheckedAt)}</span></div>
            </div>
            {latest.imageUrl && <SafeProductImage src={latest.imageUrl} alt={latest.name} className="h-[165px] w-full rounded-2xl" imageClassName="h-full w-full object-contain p-3" />}
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[["SKU", latest.sku], ["Güncel", formatPrice(latest.currentPrice)], ["Önceki", formatPrice(previousPrice)], ["Durum", statusText]].map(([label, value]) => <Metric key={label} label={String(label)} value={value} />)}
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[["En Düşük", formatPrice(minimumPrice)], ["En Yüksek", formatPrice(maximumPrice)], ["Ortalama", formatPrice(averagePrice)], ["Kayıt", history.length]].map(([label, value]) => <Metric key={label} label={String(label)} value={value} secondary />)}
        </section>

        {unreadable && <section className="mb-4 rounded-xl border border-amber-400/15 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200">Bu ürün için fiyat ve stok bilgisi okunamadı. “Stok yok” anlamına gelmez.</section>}
        {hasChange && <section className={`mb-4 rounded-xl border px-4 py-3 ${(changePercent ?? 0) >= 0 ? "border-emerald-400/15 bg-emerald-500/[0.06]" : "border-rose-400/15 bg-rose-500/[0.06]"}`}><span className="text-sm font-semibold">Son değişim:</span> <span className="ml-2 text-sm text-slate-300">{formatPrice(previousPrice)} → {formatPrice(latest.currentPrice)} · {changePercent !== null ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "-"}</span></section>}

        <section className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><h2 className="text-lg font-semibold">Fiyat grafiği</h2><p className="text-xs text-slate-400">Son 30 fiyat kaydı</p></div>{chartValues.length > 0 && <div className="text-xs text-slate-400">{formatPrice(Math.min(...chartValues))} – {formatPrice(Math.max(...chartValues))}</div>}</div>
          <div className="p-4">
            {chartValues.length ? <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-3"><svg viewBox="0 0 760 180" className="h-[190px] min-w-[650px] w-full" role="img" aria-label="Fiyat geçmişi grafiği"><line x1="0" y1="168" x2="760" y2="168" stroke="rgba(148,163,184,0.25)" /><polyline points={chartPoints} fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="text-blue-400" />{chartPoints.split(" ").map((point, index) => { const [cx, cy] = point.split(","); return <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="3.5" fill="currentColor" className="text-blue-300"><title>{`${formatDate(chartHistory[index]?.checkedAt)} · ${formatPrice(chartHistory[index]?.price ?? null)}`}</title></circle>; })}</svg></div> : <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-slate-400">Grafik için fiyat kaydı yok.</div>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-4 py-3"><h2 className="text-lg font-semibold">Fiyat Geçmişi</h2></div>
          <div className="overflow-x-auto"><table className="min-w-full text-[13px]"><thead className="bg-white/[0.04] text-left text-xs text-slate-400"><tr><th className="px-3 py-2.5">Tarih</th><th className="px-3 py-2.5">Fiyat</th><th className="px-3 py-2.5">Önceki</th><th className="px-3 py-2.5">Değişim</th><th className="px-3 py-2.5">Durum</th></tr></thead><tbody>{history.map((item, index) => <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t border-white/10"><td className="px-3 py-2.5 text-slate-400">{formatDate(item.checkedAt)}</td><td className="px-3 py-2.5 font-semibold">{formatPrice(item.price)}</td><td className="px-3 py-2.5 text-slate-400">{formatPrice(item.previousPrice ?? null)}</td><td className="px-3 py-2.5 text-slate-300">{item.changePercent !== null && item.changePercent !== undefined ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : "-"}</td><td className="px-3 py-2.5 text-slate-400">{item.price === null ? "Okunamadı" : item.inStock ? "Var" : "Yok"}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, secondary = false }: { label: string; value: string | number; secondary?: boolean }) {
  return <div className={`rounded-2xl border border-white/10 px-4 py-3 ${secondary ? "bg-black/20" : "bg-white/[0.04]"}`}><div className="text-[11px] text-slate-400">{label}</div><div className="mt-1 break-words text-lg font-semibold">{value}</div></div>;
}

function EmptyState({ title }: { title: string }) {
  return <main className="min-h-screen bg-[#08111F] p-6 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h1 className="text-xl font-semibold">{title}</h1><Link href="/report" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold">Rapor sayfasına dön</Link></div></main>;
}
