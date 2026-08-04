import Link from "next/link";
import {
  getLatestPriceBySku,
  getPriceHistoryBySku,
} from "@/lib/firestorePrices";
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

function buildChartPoints(values: number[], width = 760, height = 220) {
  if (!values.length) return "";
  if (values.length === 1) return `${width / 2},${height / 2}`;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 24) - 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
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
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
          <h1 className="text-2xl font-semibold">Geçersiz ürün bağlantısı</h1>
          <p className="mt-3 text-slate-400">Ürün kodu bulunamadı.</p>
          <Link href="/report" className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold">
            Rapor sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  const latest = await getLatestPriceBySku(sku);
  const history = await getPriceHistoryBySku(sku);

  if (!latest) {
    return (
      <main className="min-h-screen bg-[#08111F] p-6 text-white">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
          <h1 className="text-2xl font-semibold">Ürün verisi bulunamadı</h1>
          <p className="mt-3 text-slate-400">Bu SKU için henüz fiyat kaydı oluşmamış olabilir.</p>
          <Link href="/report" className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold">
            Rapor sayfasına dön
          </Link>
        </div>
      </main>
    );
  }

  const productUrl = getProductUrl(latest.sku, latest.market);
  const pricedHistory = history.filter((item) => typeof item.price === "number");
  const chartHistory = pricedHistory.slice(0, 30).reverse();
  const chartValues = chartHistory.map((item) => item.price as number);
  const chartPoints = buildChartPoints(chartValues);

  const allPrices = pricedHistory.map((item) => item.price as number);
  if (latest.currentPrice !== null) allPrices.push(latest.currentPrice);

  const minimumPrice = allPrices.length ? Math.min(...allPrices) : null;
  const maximumPrice = allPrices.length ? Math.max(...allPrices) : null;
  const averagePrice = allPrices.length
    ? Number((allPrices.reduce((total, price) => total + price, 0) / allPrices.length).toFixed(2))
    : null;

  const previousPrice = latest.previousPrice ?? history[0]?.previousPrice ?? history[1]?.price ?? null;
  const hasChange =
    previousPrice !== null &&
    latest.currentPrice !== null &&
    previousPrice !== latest.currentPrice;

  const changePercent =
    hasChange && previousPrice !== 0 && latest.currentPrice !== null
      ? Number((((latest.currentPrice - previousPrice) / previousPrice) * 100).toFixed(2))
      : null;

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-7 shadow-2xl md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
                  PRODUCT DETAIL
                </div>
                <MarketLogo market={latest.market} />
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                {latest.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Güncel fiyatı, stok durumunu, ürün bağlantısını ve geçmiş fiyat hareketlerini tek ekranda inceleyin.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/report?market=${encodeURIComponent(latest.market)}`}
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Market raporuna dön
                </Link>

                <Link
                  href="/report"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  Tüm raporlar
                </Link>

                {productUrl && (
                  <a
                    href={productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    Markette aç ↗
                  </a>
                )}
              </div>

              <div className="mt-6 text-sm text-slate-400">
                Son kontrol: <span className="font-medium text-slate-200">{formatDate(latest.lastCheckedAt)}</span>
              </div>
            </div>

            <SafeProductImage
              src={latest.imageUrl}
              alt={latest.name}
              className="h-[250px] w-full rounded-[28px]"
              imageClassName="h-full w-full object-contain p-4"
              placeholderText="Ürün görseli yok"
            />
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["SKU", latest.sku],
            ["Güncel Fiyat", formatPrice(latest.currentPrice)],
            ["Önceki Fiyat", formatPrice(previousPrice)],
            ["Stok", latest.inStock ? "Var" : "Yok"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-3 break-words text-2xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ["En Düşük", formatPrice(minimumPrice)],
            ["En Yüksek", formatPrice(maximumPrice)],
            ["Ortalama", formatPrice(averagePrice)],
            ["Kayıt Sayısı", history.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        {hasChange && (
          <section className={`mb-8 rounded-[28px] border p-6 ${
            (changePercent ?? 0) >= 0
              ? "border-emerald-400/15 bg-emerald-500/[0.06]"
              : "border-rose-400/15 bg-rose-500/[0.06]"
          }`}>
            <h2 className="text-xl font-semibold">Son fiyat değişimi</h2>
            <p className="mt-2 text-sm text-slate-300">
              {formatPrice(previousPrice)} → {formatPrice(latest.currentPrice)} · {changePercent !== null ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%` : "-"}
            </p>
          </section>
        )}

        <section className="mb-8 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold">Son 30 kayıt fiyat grafiği</h2>
            <p className="mt-1 text-sm text-slate-400">Mevcut geçmiş kayıtlar üzerinden oluşturulmuştur.</p>
          </div>

          <div className="p-6">
            {chartValues.length ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-4">
                <svg viewBox="0 0 760 220" className="h-[240px] min-w-[680px] w-full" role="img" aria-label="Fiyat geçmişi grafiği">
                  <line x1="0" y1="208" x2="760" y2="208" stroke="rgba(148,163,184,0.25)" />
                  <polyline points={chartPoints} fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="text-blue-400" />
                  {chartPoints.split(" ").map((point, index) => {
                    const [cx, cy] = point.split(",");
                    return <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r="4" fill="currentColor" className="text-blue-300" />;
                  })}
                </svg>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-12 text-center text-slate-400">
                Grafik için henüz yeterli fiyat kaydı yok.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold">Fiyat Geçmişi</h2>
            <p className="mt-1 text-sm text-slate-400">Ürün için kaydedilen fiyat ve stok hareketleri</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Tarih</th>
                  <th className="px-5 py-4 font-semibold">Fiyat</th>
                  <th className="px-5 py-4 font-semibold">Önceki</th>
                  <th className="px-5 py-4 font-semibold">Değişim</th>
                  <th className="px-5 py-4 font-semibold">Stok</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4 text-slate-400">{formatDate(item.checkedAt)}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(item.price)}</td>
                    <td className="px-5 py-4 text-slate-400">{formatPrice(item.previousPrice ?? null)}</td>
                    <td className="px-5 py-4 text-slate-300">
                      {item.changePercent !== null && item.changePercent !== undefined
                        ? `${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{item.inStock ? "Var" : "Yok"}</td>
                  </tr>
                ))}

                {!history.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">Geçmiş veri yok</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
