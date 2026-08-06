import Link from "next/link";
import { getLatestPriceBySku, getPriceHistoryBySku } from "@/lib/firestorePrices";
import SafeProductImage from "@/components/SafeProductImage";
import MarketLogo from "@/components/MarketLogo";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import { getProductUrl } from "@/lib/productCatalog";
import { resolveProductImage } from "@/lib/localProductImages";

export const dynamic = "force-dynamic";

const MAX_REASONABLE_CHANGE_PERCENT = 40;

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

function calculateChangePercent(previousPrice: number | null, currentPrice: number | null) {
  if (previousPrice === null || currentPrice === null || previousPrice === 0) return null;
  return Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2));
}

function isSuspiciousPair(previousPrice: number | null, currentPrice: number | null) {
  const percent = calculateChangePercent(previousPrice, currentPrice);
  return percent !== null && Math.abs(percent) > MAX_REASONABLE_CHANGE_PERCENT;
}

export default async function ProductDetailPage({ searchParams }: { searchParams: Promise<{ sku?: string }> }) {
  const { sku } = await searchParams;
  if (!sku) return <main className="min-h-screen bg-[#07101D] p-6 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h1 className="text-xl font-semibold">Geçersiz ürün bağlantısı</h1><Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link></div></main>;

  const [latest, rawHistory] = await Promise.all([getLatestPriceBySku(sku), getPriceHistoryBySku(sku)]);
  if (!latest) return <main className="min-h-screen bg-[#07101D] p-6 text-white"><div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h1 className="text-xl font-semibold">Ürün verisi bulunamadı</h1><Link href="/report" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Rapor sayfasına dön</Link></div></main>;

  const productUrl = getProductUrl(latest.sku, latest.market);
  const imageUrl = resolveProductImage(latest.market, latest.sku, latest.imageUrl);

  const history = [] as typeof rawHistory;
  let lastAcceptedPrice = latest.currentPrice;

  for (const item of rawHistory) {
    const itemPrice = typeof item.price === "number" ? item.price : null;
    const suspiciousAgainstCurrentChain =
      lastAcceptedPrice !== null &&
      itemPrice !== null &&
      isSuspiciousPair(itemPrice, lastAcceptedPrice);
    const suspiciousOwnChange = isSuspiciousPair(item.previousPrice ?? null, itemPrice);

    if (suspiciousAgainstCurrentChain || suspiciousOwnChange) continue;

    history.push({
      ...item,
      previousPrice: suspiciousOwnChange ? null : item.previousPrice,
      changePercent: suspiciousOwnChange ? null : item.changePercent,
      eventType: suspiciousOwnChange ? "initial" : item.eventType,
    });

    if (itemPrice !== null) lastAcceptedPrice = itemPrice;
  }

  const pricedHistory = history.filter((item) => typeof item.price === "number");
  let chartData = pricedHistory.slice(0, 30).reverse().map((item) => ({ date: item.checkedAt, price: item.price as number }));

  const storedPreviousPrice = latest.previousPrice;
  const previousPrice =
    storedPreviousPrice !== null &&
    latest.currentPrice !== null &&
    !isSuspiciousPair(storedPreviousPrice, latest.currentPrice)
      ? storedPreviousPrice
      : null;

  if (chartData.length < 2 && previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice) {
    chartData = [
      { date: latest.lastChangedAt ?? latest.updatedAt, price: previousPrice },
      { date: latest.lastCheckedAt ?? latest.updatedAt, price: latest.currentPrice },
    ];
  }

  const prices = chartData.map((item) => item.price);
  if (latest.currentPrice !== null && !prices.includes(latest.currentPrice)) prices.push(latest.currentPrice);
  if (previousPrice !== null && !prices.includes(previousPrice)) prices.push(previousPrice);
  const minimumPrice = prices.length ? Math.min(...prices) : latest.currentPrice;
  const maximumPrice = prices.length ? Math.max(...prices) : latest.currentPrice;
  const averagePrice = prices.length ? Number((prices.reduce((total, price) => total + price, 0) / prices.length).toFixed(2)) : latest.currentPrice;
  const hasChange = previousPrice !== null && latest.currentPrice !== null && previousPrice !== latest.currentPrice;
  const changePercent = hasChange ? calculateChangePercent(previousPrice, latest.currentPrice) : null;
  const unreadable = latest.currentPrice === null;
  const statusText = unreadable ? "Okunamadı" : latest.inStock ? "Stokta" : "Stok dışı";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07101D] text-white"><div className="mx-auto max-w-[1540px] px-3 pb-24 pt-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
      <section className="mb-3 overflow-hidden rounded-[18px] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_34%),linear-gradient(135deg,#0E1A2C_0%,#091321_100%)] shadow-[0_24px_65px_rgba(0,0,0,0.2)] sm:mb-4 sm:rounded-[20px]"><div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[1fr_210px] lg:gap-0 lg:p-0"><div className="min-w-0 lg:px-6 lg:py-5"><div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3 sm:grid-cols-[minmax(0,1fr)_150px] lg:block"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><div className="origin-left scale-[0.82] sm:scale-100"><MarketLogo market={latest.market} /></div><span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium sm:px-2.5 sm:py-1 sm:text-[11px] ${unreadable ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : latest.inStock ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-rose-400/20 bg-rose-500/10 text-rose-300"}`}>{statusText}</span></div><h1 className="mt-3 text-[22px] font-semibold leading-tight tracking-[-0.035em] sm:text-2xl md:text-[34px]">{latest.name}</h1><div className="mt-2 grid gap-1 text-[11px] text-slate-400 sm:flex sm:flex-wrap sm:gap-x-5 sm:text-xs"><span>SKU <strong className="ml-1 font-medium text-slate-200">{latest.sku}</strong></span><span>Son kontrol <strong className="ml-1 font-medium text-slate-200">{formatDate(latest.lastCheckedAt)}</strong></span></div></div><div className="flex items-start justify-end lg:hidden"><SafeProductImage src={imageUrl} alt={latest.name} className="h-[112px] w-[112px] rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:h-[150px] sm:w-[150px]" imageClassName={`h-full w-full object-contain ${latest.market === "CARREFOUR" ? "scale-[1.22]" : "scale-[1.08]"}`} /></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"><Link href={`/report?market=${encodeURIComponent(latest.market)}`} className="flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold transition hover:bg-blue-500 sm:min-h-0 sm:px-4">Market raporu</Link><Link href="/report" className="flex min-h-10 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-center text-xs text-slate-300 transition hover:bg-white/[0.08] sm:min-h-0 sm:px-4">Tüm raporlar</Link>{productUrl && <a href={productUrl} target="_blank" rel="noreferrer" className="col-span-2 flex min-h-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-center text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/15 sm:col-span-1 sm:min-h-0 sm:px-4 sm:text-xs">Markette aç ↗</a>}</div></div><div className="hidden items-center justify-center border-l border-white/[0.08] bg-white/[0.018] p-4 lg:flex"><SafeProductImage src={imageUrl} alt={latest.name} className="h-[178px] w-[148px] rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)]" imageClassName={`h-full w-full object-contain ${latest.market === "CARREFOUR" ? "scale-[1.28]" : "scale-[1.16]"}`} /></div></div></section>
      {unreadable && <section className="mb-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.055] px-3 py-2.5 text-xs text-amber-100 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">Fiyat ve stok bilgisi şu anda okunamadı. Bu durum ürünün stokta olmadığı anlamına gelmez.</section>}
      <section className="mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3">{[["Güncel fiyat", formatPrice(latest.currentPrice)], ["Önceki fiyat", formatPrice(previousPrice)], ["Durum", statusText]].map(([label, value], index) => <div key={String(label)} className="min-w-0 rounded-xl border border-white/[0.085] bg-white/[0.028] px-2.5 py-2.5 sm:rounded-[16px] sm:px-4 sm:py-3.5"><div className="truncate text-[8px] uppercase tracking-[0.06em] text-slate-500 sm:text-[11px]">{label}</div><div className={`mt-1 truncate text-[15px] font-semibold sm:mt-1.5 sm:text-xl ${index === 2 && latest.inStock ? "text-emerald-300 sm:text-white" : ""}`}>{value}</div></div>)}</section>
      <section className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.075] bg-black/15 p-2.5 sm:mb-4 sm:flex sm:flex-wrap sm:gap-x-6 sm:px-4 sm:py-3 sm:text-xs">{[["↘", "En düşük", formatPrice(minimumPrice)], ["↗", "En yüksek", formatPrice(maximumPrice)], ["Ø", "Ortalama", formatPrice(averagePrice)], ["#", "Kayıt", String(history.length || (latest.currentPrice !== null ? 1 : 0))]].map(([icon, label, value]) => <div key={label} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.018] px-2.5 py-2 sm:border-0 sm:bg-transparent sm:p-0"><span className="text-[11px] text-blue-300">{icon}</span><div className="min-w-0"><div className="text-[9px] text-slate-500 sm:hidden">{label}</div><div className="truncate text-[12px] font-semibold text-slate-100 sm:text-xs"><span className="hidden font-normal text-slate-400 sm:inline">{label} </span>{value}</div></div></div>)}</section>
      {hasChange && <section className={`mb-3 rounded-xl border px-3 py-3 sm:mb-4 sm:px-4 sm:py-3 ${(changePercent ?? 0) >= 0 ? "border-emerald-400/15 bg-emerald-500/[0.055]" : "border-rose-400/15 bg-rose-500/[0.055]"}`}><div className="flex items-center justify-between gap-3 md:block"><div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 md:inline md:text-sm md:normal-case md:tracking-normal">Son fiyat değişimi</div><div className={`text-xs font-semibold md:ml-2 md:inline md:text-sm ${(changePercent ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{changePercent !== null ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "-"}</div></div><div className="mt-1.5 flex items-center gap-2 text-sm text-slate-200 md:mt-0 md:ml-2 md:inline"><span>{formatPrice(previousPrice)}</span><span className="text-slate-500">→</span><strong>{formatPrice(latest.currentPrice)}</strong></div></section>}
      <section className="mb-3 overflow-hidden rounded-[16px] border border-white/[0.085] bg-white/[0.028] sm:mb-4 sm:rounded-[18px]"><div className="flex items-start justify-between gap-3 border-b border-white/[0.075] px-3 py-3 sm:items-center sm:px-4 sm:py-3.5"><div><h2 className="text-sm font-semibold sm:text-base">Fiyat trendi</h2><p className="text-[10px] text-slate-500 sm:text-[11px]">Son 30 fiyat kaydı</p></div><div className="text-right text-[10px] text-slate-400 sm:text-xs">{formatPrice(minimumPrice)} – {formatPrice(maximumPrice)}</div></div><div className="p-2.5 sm:p-4">{chartData.length >= 2 ? <div className="h-[300px] sm:h-auto"><PriceHistoryChart points={chartData} /></div> : <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-black/10 text-center text-sm text-slate-400 sm:min-h-[150px]">Henüz fiyat trendi oluşmadı. İlk fiyat {formatPrice(latest.currentPrice)} olarak kaydedildi.</div>}</div></section>
      <section className="overflow-hidden rounded-[16px] border border-white/[0.085] bg-white/[0.028] sm:rounded-[18px]"><div className="border-b border-white/[0.075] px-3 py-3 sm:px-4 sm:py-3.5"><h2 className="text-sm font-semibold sm:text-base">Fiyat geçmişi</h2></div><div className="divide-y divide-white/[0.07] md:hidden">{history.map((item, index) => { const positive = (item.changePercent ?? 0) > 0; const negative = (item.changePercent ?? 0) < 0; return <div key={`${item.sku}-${item.checkedAt}-${index}`} className="px-3 py-3"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><div className="min-w-0"><div className="text-[11px] font-medium text-slate-300">{formatDate(item.checkedAt)}</div><div className="mt-1 text-[10px] text-slate-500">{item.previousPrice === null || item.previousPrice === undefined ? "İlk kayıt" : `${formatPrice(item.previousPrice)} → ${formatPrice(item.price)}`}</div><div className={`mt-1 text-[10px] ${item.price === null ? "text-amber-300" : item.inStock ? "text-emerald-300" : "text-rose-300"}`}>{item.price === null ? "Okunamadı" : item.inStock ? "Stokta" : "Stok dışı"}</div></div><div className="text-right"><div className="text-[13px] font-semibold text-white">{formatPrice(item.price)}</div><div className={`mt-1 text-[11px] font-medium ${positive ? "text-emerald-300" : negative ? "text-rose-300" : "text-slate-500"}`}>{item.changePercent !== null && item.changePercent !== undefined ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : "-"}</div></div></div></div>; })}{!history.length && latest.currentPrice !== null && <div className="px-4 py-6 text-center text-sm text-slate-400">İlk fiyat {formatPrice(latest.currentPrice)} olarak kaydedildi.</div>}{!history.length && latest.currentPrice === null && <div className="px-4 py-10 text-center text-sm text-slate-400">Geçmiş veri yok</div>}</div><div className="hidden overflow-x-auto md:block"><table className="min-w-full text-xs"><thead className="bg-white/[0.035] text-left text-slate-400"><tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Fiyat</th><th className="px-4 py-3">Önceki</th><th className="px-4 py-3">Değişim</th><th className="px-4 py-3">Durum</th></tr></thead><tbody>{history.map((item, index) => <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t border-white/[0.07]"><td className="px-4 py-3 text-slate-400">{formatDate(item.checkedAt)}</td><td className="px-4 py-3 font-semibold">{formatPrice(item.price)}</td><td className="px-4 py-3 text-slate-400">{item.previousPrice === null || item.previousPrice === undefined ? "İlk kayıt" : formatPrice(item.previousPrice)}</td><td className="px-4 py-3">{item.changePercent !== null && item.changePercent !== undefined ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : "-"}</td><td className={`px-4 py-3 ${item.price === null ? "text-amber-300" : "text-slate-400"}`}>{item.price === null ? "Okunamadı" : item.inStock ? "Var" : "Yok"}</td></tr>)}{!history.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">{latest.currentPrice !== null ? `İlk fiyat ${formatPrice(latest.currentPrice)} olarak kaydedildi.` : "Geçmiş veri yok"}</td></tr>}</tbody></table></div></section>
    </div></main>
  );
}
