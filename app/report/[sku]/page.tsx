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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  try {
    const { sku } = await params;

    if (!sku) {
      return (
        <main className="min-h-screen bg-[#F6F8FB] p-6 text-[#0F172A]">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E7ECF3] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <h1 className="text-2xl font-semibold">Geçersiz ürün bağlantısı</h1>
            <p className="mt-3 text-[#66758A]">Ürün kodu bulunamadı.</p>
            <div className="mt-6">
              <Link
                href="/report"
                className="rounded-full bg-[#3563E9] px-5 py-3 text-sm font-semibold text-white"
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
        <main className="min-h-screen bg-[#F6F8FB] text-[#0F172A]">
          <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
            <section className="rounded-[32px] border border-[#E8EDF5] bg-[linear-gradient(135deg,#FFFFFF_0%,#FAFCFF_55%,#F3F7FF_100%)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-10">
              <div className="mb-4 inline-flex rounded-full border border-[#D9E4F2] bg-white/85 px-4 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-[#3B5B8F]">
                PRODUCT DETAIL
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-4xl">
                Bu ürün için henüz detay verisi yok
              </h1>

              <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#5E6B7D]">
                Bu SKU için henüz detay kaydı oluşmamış olabilir. Önce fiyat
                kontrolünü çalıştırıp sonra tekrar deneyebilirsin.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/report"
                  className="rounded-full bg-[linear-gradient(135deg,#3563E9_0%,#2D5BDE_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,99,233,0.22)]"
                >
                  Rapor sayfasına dön
                </Link>

                <Link
                  href="/api/check-prices"
                  className="rounded-full border border-[#DDE5F0] bg-white px-5 py-3.5 text-sm font-medium text-[#5C6B7E]"
                >
                  Fiyat kontrolünü çalıştır
                </Link>
              </div>
            </section>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#F5F7FA] text-[#0F172A]">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <section className="mb-8 rounded-[28px] border border-[#E7ECF3] bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF4FF] p-7 shadow-[0_10px_40px_rgba(15,23,42,0.05)] md:p-9">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-[#D8E3F2] bg-white/80 px-3 py-1 text-[12px] font-semibold tracking-wide text-[#315B9E]">
                PRODUCT DETAIL
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#0F172A] md:text-4xl">
                {latest.name}
              </h1>

              <p className="mt-3 text-[15px] leading-7 text-[#5B6B80] md:text-base">
                Ürünün güncel durumunu ve fiyat geçmişini sade, yumuşak ve premium
                bir görünümle inceleyin.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/report?market=${encodeURIComponent(latest.market)}`}
                  className="rounded-full bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(29,78,216,0.20)] transition hover:translate-y-[-1px]"
                >
                  {latest.market} raporuna dön
                </Link>

                <Link
                  href="/report"
                  className="rounded-full border border-[#DCE4EE] bg-white px-5 py-3 text-sm font-medium text-[#536273]"
                >
                  Tüm raporlar
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-[#6A7788]">SKU</div>
              <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {latest.sku}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-[#6A7788]">Market</div>
              <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {latest.market}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-[#6A7788]">Güncel Fiyat</div>
              <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {formatPrice(latest.currentPrice)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="text-sm font-medium text-[#6A7788]">Stok</div>
              <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {latest.inStock ? "Var" : "Yok"}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-[#E6EBF2] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                Fiyat Geçmişi
              </h2>
              <p className="mt-1 text-sm text-[#66758A]">
                Bu ürün için kaydedilen geçmiş fiyat hareketleri
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F7F9FC] text-left text-[#536273]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Tarih</th>
                    <th className="px-5 py-4 font-semibold">Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr
                      key={`${item.sku}-${item.checkedAt}-${index}`}
                      className="border-t border-[#EEF2F6] transition hover:bg-[#FAFCFF]"
                    >
                      <td className="px-5 py-4 text-[#5E6C80]">
                        {new Date(item.checkedAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#0F172A]">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-5 py-4 text-[#5E6C80]">
                        {item.inStock ? "Var" : "Yok"}
                      </td>
                    </tr>
                  ))}

                  {!history.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-[#7A8798]"
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
  } catch (error) {
    console.error("product detail page error:", error);

    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6 text-[#0F172A]">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E7ECF3] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
          <h1 className="text-2xl font-semibold">Ürün detayı şu an yüklenemedi</h1>
          <p className="mt-3 text-[#66758A]">
            Sayfa geçici olarak açılamadı. Rapor ekranına dönüp tekrar deneyebilirsin.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/report"
              className="rounded-full bg-[#3563E9] px-5 py-3 text-sm font-semibold text-white"
            >
              Rapor sayfasına dön
            </Link>

            <Link
              href="/api/check-prices"
              className="rounded-full border border-[#DDE5F0] bg-white px-5 py-3 text-sm font-medium text-[#5C6B7E]"
            >
              Fiyat kontrolünü çalıştır
            </Link>
          </div>
        </div>
      </main>
    );
  }
}