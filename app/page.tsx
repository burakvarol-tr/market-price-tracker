import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";

export const dynamic = "force-dynamic";

function formatPrice(price?: number | null) {
  if (price == null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-";
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
    <main className="min-h-screen bg-[#F5F7FA] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 rounded-[28px] border border-[#E7ECF3] bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF4FF] p-7 shadow-[0_10px_40px_rgba(15,23,42,0.05)] md:p-9">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full border border-[#D8E3F2] bg-white/80 px-3 py-1 text-[12px] font-semibold tracking-wide text-[#315B9E]">
              MARKET PRICE TRACKER
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#0F172A] md:text-4xl">
              Market bazlı fiyat takip paneli
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5B6B80] md:text-base">
              Ürün fiyatlarını tek ekranda izle, değişimleri hızlıca gör,
              market bazlı raporları sade ve profesyonel bir görünümle yönet.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/report"
                className="rounded-full bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(29,78,216,0.20)] transition hover:translate-y-[-1px]"
              >
                Tüm raporu aç
              </Link>

              <div className="rounded-full border border-[#DCE4EE] bg-white px-5 py-3 text-sm font-medium text-[#536273]">
                {items.length} ürün izleniyor
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Toplam Ürün</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              {items.length}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Fiyat Değişen</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              {items.filter((x) => x.changed).length}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Market Sayısı</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              {markets.length}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                Marketler
              </h2>
              <p className="mt-1 text-sm text-[#66758A]">
                Her market için ayrı rapor ekranına geçebilirsin.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {marketSummaries.map((summary) => (
              <Link
                key={summary.market}
                href={`/report?market=${encodeURIComponent(summary.market)}`}
                className="group rounded-[26px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                      {summary.market}
                    </div>
                    <div className="mt-1 text-sm text-[#6A7788]">
                      Market raporunu aç
                    </div>
                  </div>

                  <div className="rounded-full border border-[#E3EAF3] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#617286]">
                    {summary.total} ürün
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#EDF2F7] bg-[#F8FAFC] p-4">
                    <div className="text-xs font-medium text-[#7A8798]">Toplam</div>
                    <div className="mt-2 text-2xl font-semibold text-[#0F172A]">
                      {summary.total}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#EDF2F7] bg-[#F8FAFC] p-4">
                    <div className="text-xs font-medium text-[#7A8798]">Değişen</div>
                    <div className="mt-2 text-2xl font-semibold text-[#0F172A]">
                      {summary.changedCount}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-[#7B8798]">
                  Son güncelleme:{" "}
                  {summary.lastUpdated
                    ? new Date(summary.lastUpdated).toLocaleString("tr-TR")
                    : "-"}
                </div>
              </Link>
            ))}

            {!marketSummaries.length && (
              <div className="rounded-[26px] border border-[#E6EBF2] bg-white p-6 text-sm text-[#6B7788] shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                Henüz veri yok
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">
              Son Durum
            </h2>
            <p className="mt-1 text-sm text-[#66758A]">
              Tüm ürünlerin güncel fiyat görünümü
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#E6EBF2] bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F7F9FC] text-left text-[#536273]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Ürün</th>
                    <th className="px-5 py-4 font-semibold">SKU</th>
                    <th className="px-5 py-4 font-semibold">Market</th>
                    <th className="px-5 py-4 font-semibold">Güncel Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Önceki Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Değişim</th>
                    <th className="px-5 py-4 font-semibold">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const changePositive = (item.changePercent ?? 0) > 0;
                    const changeNegative = (item.changePercent ?? 0) < 0;

                    return (
                      <tr
                        key={item.sku}
                        className="border-t border-[#EEF2F6] transition hover:bg-[#FAFCFF]"
                      >
                        <td className="px-5 py-4 font-medium text-[#0F172A]">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-[#5E6C80]">{item.sku}</td>
                        <td className="px-5 py-4 text-[#5E6C80]">{item.market}</td>
                        <td className="px-5 py-4 font-semibold text-[#0F172A]">
                          {formatPrice(item.currentPrice)}
                        </td>
                        <td className="px-5 py-4 text-[#5E6C80]">
                          {formatPrice(item.previousPrice)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              changePositive
                                ? "bg-emerald-50 text-emerald-700"
                                : changeNegative
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {formatPercent(item.changePercent)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/report/${item.sku}`}
                            className="font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
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
                        className="px-5 py-12 text-center text-[#7A8798]"
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