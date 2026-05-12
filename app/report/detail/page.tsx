import Link from "next/link";
import {
  getLatestPriceBySku,
  getPriceHistoryBySku,
} from "@/lib/firestorePrices";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function marketColor(market: string) {
  if (market === "A101") return "bg-sky-500/15 text-sky-300 border-sky-400/20";
  if (market === "SOK")
    return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
  if (market === "BIZIM")
    return "bg-orange-500/15 text-orange-300 border-orange-400/20";
  return "bg-slate-500/15 text-slate-300 border-slate-400/20";
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
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20">
          <h1 className="text-2xl font-semibold">Geçersiz ürün bağlantısı</h1>
          <p className="mt-3 text-slate-400">Ürün kodu bulunamadı.</p>
          <div className="mt-6">
            <Link
              href="/report"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Rapor sayfasına dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const latest = await getLatestPriceBySku(sku);
  const history = await getPriceHistoryBySku(sku);

  if (!latest) {
    return (
      <main className="min-h-screen bg-[#08111F] text-white">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
          <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-8 shadow-2xl md:p-10">
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
              PRODUCT DETAIL
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Bu ürün için henüz detay verisi yok
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Bu SKU için henüz detay kaydı oluşmamış olabilir. Önce fiyat
              kontrolünü çalıştırıp sonra tekrar deneyebilirsiniz.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/report"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Rapor sayfasına dön
              </Link>

              <Link
                href="/api/check-prices"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Fiyat kontrolünü çalıştır
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const latestHistory = history[0];
  const previousHistory = history[1];

  const previousPrice =
    latest.previousPrice ??
    previousHistory?.price ??
    latestHistory?.previousPrice ??
    null;

  const hasChange =
    previousPrice !== null &&
    latest.currentPrice !== null &&
    previousPrice !== latest.currentPrice;

  const changePercent =
    hasChange && previousPrice !== 0 && latest.currentPrice !== null
      ? Number(
          (((latest.currentPrice - previousPrice) / previousPrice) * 100).toFixed(
            2
          )
        )
      : null;

  const changePositive = (changePercent ?? 0) > 0;
  const changeNegative = (changePercent ?? 0) < 0;

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-7 shadow-2xl md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
                PRODUCT DETAIL
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">
                {latest.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Ürünün güncel fiyatını, stok durumunu ve geçmiş fiyat
                hareketlerini tek ekranda inceleyin.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/report?market=${encodeURIComponent(latest.market)}`}
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  {latest.market} raporuna dön
                </Link>

                <Link
                  href="/report"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  Tüm raporlar
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
              <div className="text-slate-400">Son güncelleme</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {latest.lastCheckedAt
                  ? new Date(latest.lastCheckedAt).toLocaleString("tr-TR")
                  : "-"}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">SKU</div>
            <div className="mt-3 break-words text-2xl font-semibold">
              {latest.sku}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Market</div>
            <div className="mt-3">
              <span
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${marketColor(
                  latest.market
                )}`}
              >
                {latest.market}
              </span>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Güncel Fiyat</div>
            <div className="mt-3 text-2xl font-semibold">
              {formatPrice(latest.currentPrice)}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Stok</div>
            <div className="mt-3 text-2xl font-semibold">
              {latest.inStock ? "Var" : "Yok"}
            </div>
          </div>
        </section>

        {hasChange && (
          <section className="mb-8 rounded-[30px] border border-emerald-400/15 bg-emerald-500/[0.06] p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Son Fiyat Değişimi</h2>
              <p className="mt-1 text-sm text-slate-400">
                Ürünün son bilinen eski fiyatı ile güncel fiyatı.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-slate-400">Önceki Fiyat</div>
                <div className="mt-3 text-2xl font-semibold">
                  {formatPrice(previousPrice)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-slate-400">Güncel Fiyat</div>
                <div className="mt-3 text-2xl font-semibold">
                  {formatPrice(latest.currentPrice)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm text-slate-400">Değişim</div>
                <div
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    changePositive
                      ? "bg-emerald-400/10 text-emerald-300"
                      : changeNegative
                      ? "bg-rose-400/10 text-rose-300"
                      : "bg-slate-400/10 text-slate-400"
                  }`}
                >
                  {changePercent !== null
                    ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(
                        2
                      )}%`
                    : "-"}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold">Fiyat Geçmişi</h2>
            <p className="mt-1 text-sm text-slate-400">
              Ürünün kayıt edilen fiyat hareketleri
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Son Güncelleme</th>
                  <th className="px-5 py-4 font-semibold">Fiyat</th>
                  <th className="px-5 py-4 font-semibold">Stok</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={`${item.sku}-${item.checkedAt}-${index}`}
                    className="border-t border-white/10 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(item.checkedAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {item.inStock ? "Var" : "Yok"}
                    </td>
                  </tr>
                ))}

                {!history.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-12 text-center text-slate-400"
                    >
                      Geçmiş veri yok
                    </td>
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