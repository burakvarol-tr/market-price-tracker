import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";

export const dynamic = "force-dynamic";

function formatPrice(price?: number | null) {
  if (price == null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value?: number | null, changed?: boolean) {
  if (!changed || value == null || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default async function HomePage() {
  const items = await getLatestPrices();

  const markets = Array.from(new Set(items.map((item) => item.market)));

  const marketSummaries = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const changedCount = marketItems.filter((item) => item.changed).length;

    return {
      market,
      total: marketItems.length,
      changedCount,
      lastUpdated:
        marketItems.length > 0
          ? marketItems
              .map((x) => new Date(x.updatedAt).getTime())
              .sort((a, b) => b - a)[0]
          : null,
    };
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EEF4FF_0%,#F5F8FD_45%,#FAFCFF_100%)] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#DCE7F5] bg-[linear-gradient(135deg,#FDFEFF_0%,#F4F8FF_58%,#EAF2FF_100%)] p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-10">
          <div className="pointer-events-none absolute -right-12 -top-10 h-48 w-48 rounded-full bg-[#CFE1FF] blur-3xl opacity-55" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white blur-2xl opacity-80" />

          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[#D5E2F2] bg-white/90 px-4 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-[#3B5B8F] backdrop-blur">
              MARKET PRICE TRACKER
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
              Market Fiyat Takibi
            </h1>

            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#5E6B7D] md:text-[17px]">
              Seçili ürünlerin güncel fiyatlarını tek ekranda takip et.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/report"
                className="rounded-full bg-[linear-gradient(135deg,#3563E9_0%,#2D5BDE_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,99,233,0.22)] transition duration-200 hover:-translate-y-[1px]"
              >
                Tüm raporu aç
              </Link>

              <div className="rounded-full border border-[#DDE5F0] bg-white/90 px-5 py-3.5 text-sm font-medium text-[#5C6B7E] backdrop-blur">
                {items.length} ürün izleniyor
              </div>
            </div>
          </div>
        </section>

        <section className="mb-9 grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-[#E1EAF5] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Toplam Ürün</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {items.length}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E1EAF5] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Fiyat Değişen</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {items.filter((x) => x.changed).length}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E1EAF5] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Market Sayısı</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {markets.length}
            </div>
          </div>
        </section>

        <section className="mb-9">
          <div className="mb-5">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Marketler
            </h2>
            <p className="mt-1 text-[15px] text-[#6B788A]">
              Her market için ayrı rapor ekranına geçebilirsin.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {marketSummaries.map((summary) => (
              <Link
                key={summary.market}
                href={`/report?market=${encodeURIComponent(summary.market)}`}
                className="group rounded-[28px] border border-[#E3EBF5] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[22px] font-semibold tracking-[-0.025em] text-[#0F172A]">
                      {summary.market}
                    </div>
                    <div className="mt-1 text-sm text-[#718094]">
                      Market raporunu aç
                    </div>
                  </div>

                  <div className="rounded-full border border-[#E6EDF6] bg-[#F8FAFD] px-3 py-1 text-xs font-semibold text-[#68788C]">
                    {summary.total} ürün
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] border border-[#EEF2F7] bg-[#FAFCFE] p-4">
                    <div className="text-xs font-medium text-[#8390A0]">Toplam</div>
                    <div className="mt-2 text-2xl font-semibold text-[#0F172A]">
                      {summary.total}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[#EEF2F7] bg-[#FAFCFE] p-4">
                    <div className="text-xs font-medium text-[#8390A0]">Değişen</div>
                    <div className="mt-2 text-2xl font-semibold text-[#0F172A]">
                      {summary.changedCount}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-[#8591A1]">
                  Son güncelleme:{" "}
                  {summary.lastUpdated
                    ? new Date(summary.lastUpdated).toLocaleString("tr-TR")
                    : "-"}
                </div>
              </Link>
            ))}

            {!marketSummaries.length && (
              <div className="rounded-[28px] border border-[#E7ECF3] bg-white p-6 text-sm text-[#6D7A8D] shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
                Henüz veri yok
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Son Durum
            </h2>
            <p className="mt-1 text-[15px] text-[#6B788A]">
              Tüm ürünlerin güncel fiyat görünümü
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E3EBF5] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F4F8FD] text-left text-[#5F7083]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ürün</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Market</th>
                    <th className="px-6 py-4 font-semibold">Güncel Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Önceki Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Değişim</th>
                    <th className="px-6 py-4 font-semibold">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const changePositive = item.changed && (item.changePercent ?? 0) > 0;
                    const changeNegative = item.changed && (item.changePercent ?? 0) < 0;

                    return (
                      <tr
                        key={item.sku}
                        className="border-t border-[#EFF3F7] transition hover:bg-[#FBFCFF]"
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
                        <td className="px-6 py-4 text-[#657488]">{item.market}</td>
                        <td className="px-6 py-4 font-semibold text-[#0F172A]">
                          {formatPrice(item.currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-[#657488]">
                          {item.changed ? formatPrice(item.previousPrice) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              changePositive
                                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                                : changeNegative
                                ? "border border-rose-100 bg-rose-50 text-rose-700"
                                : "border border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {formatPercent(item.changePercent, item.changed)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/report/detail?sku=${item.sku}`}
                            className="font-medium text-[#3A67E8] transition hover:text-[#2D58D8]"
                          >
                            Aç
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {!items.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-14 text-center text-[#8391A2]"
                      >
                        Veri bulunamadı
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