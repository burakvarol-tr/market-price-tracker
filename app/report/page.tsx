import Link from "next/link";
import { getChangeEventById } from "@/lib/firestorePrices";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default async function EventReportPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  if (!eventId) {
    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6 text-[#0F172A]">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E7ECF3] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
          <h1 className="text-2xl font-semibold">Geçersiz event bağlantısı</h1>
          <p className="mt-3 text-[#66758A]">eventId bulunamadı.</p>
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

  const event = await getChangeEventById(eventId);

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F6F8FB] p-6 text-[#0F172A]">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-[#E7ECF3] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
          <h1 className="text-2xl font-semibold">Event kaydı bulunamadı</h1>
          <p className="mt-3 text-[#66758A]">
            Bu mail kaydı silinmiş olabilir veya bağlantı hatalı olabilir.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/report"
              className="rounded-full bg-[#3563E9] px-5 py-3 text-sm font-semibold text-white"
            >
              Canlı rapora dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#E8EDF5] bg-[linear-gradient(135deg,#FFFFFF_0%,#FAFCFF_55%,#F3F7FF_100%)] p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-10">
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[#D9E4F2] bg-white/85 px-4 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-[#3B5B8F] backdrop-blur">
              CHANGE EVENT REPORT
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
              {event.market} değişim raporu
            </h1>

            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#5E6B7D] md:text-[17px]">
              Bu sayfa canlı son durumu değil, mailin atıldığı andaki değişim
              görüntüsünü gösterir.
            </p>

            <div className="mt-5 text-sm text-[#64748B]">
              Oluşturulma zamanı:{" "}
              <strong>
                {new Date(event.createdAt).toLocaleString("tr-TR")}
              </strong>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/report"
                className="rounded-full bg-[linear-gradient(135deg,#3563E9_0%,#2D5BDE_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,99,233,0.22)] transition duration-200 hover:-translate-y-[1px]"
              >
                Canlı rapora dön
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Market</div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {event.market}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Değişen Ürün</div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {event.itemCount}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Durum</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              Kayıtlı Event
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Maildeki Değişim Listesi
            </h2>
            <p className="mt-1 text-[15px] text-[#6B788A]">
              Mail gönderildiği andaki eski ve yeni fiyat bilgileri
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E7ECF3] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFD] text-left text-[#5F7083]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ürün</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Eski Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Yeni Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Değişim</th>
                    <th className="px-6 py-4 font-semibold">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {event.items.map((item, index) => {
                    const positive = (item.changePercent ?? 0) > 0;
                    const negative = (item.changePercent ?? 0) < 0;

                    return (
                      <tr
                        key={`${item.sku}-${index}`}
                        className="border-t border-[#EFF3F7] bg-white"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#DCE4F0] bg-[linear-gradient(135deg,#EEF4FF_0%,#F8FBFF_100%)] text-sm font-bold text-[#3B5B8F]">
                              {index + 1}
                            </div>
                            <div className="font-medium text-[#0F172A]">
                              {item.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#657488]">{item.sku}</td>
                        <td className="px-6 py-4 text-[#657488]">
                          {formatPrice(item.previousPrice)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#0F172A]">
                          {formatPrice(item.currentPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              positive
                                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                : negative
                                ? "border border-rose-100 bg-rose-50 text-rose-700"
                                : "border border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {formatPercent(item.changePercent)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#657488]">
                          {item.inStock ? "Var" : "Yok"}
                        </td>
                      </tr>
                    );
                  })}

                  {!event.items.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center text-[#8391A2]"
                      >
                        Event içinde veri yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}