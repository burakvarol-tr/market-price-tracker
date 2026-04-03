import Link from "next/link";
import { getLatestPrices, type PriceRecord } from "@/lib/firestorePrices";

export const dynamic = "force-dynamic";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value: number | null, changed: boolean) {
  if (!changed || value === null || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getRowStyle(item: PriceRecord, changedSet: Set<string>) {
  if (changedSet.has(item.sku)) return "bg-[#FFFBEF]";
  if (item.changed && (item.changePercent ?? 0) > 0) return "bg-[#F8FCF9]";
  if (item.changed && (item.changePercent ?? 0) < 0) return "bg-[#FFF8F8]";
  return "bg-white";
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    market?: string;
    changed?: string;
  }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const market = resolved?.market || "";
  const changed = resolved?.changed || "";

  const items = await getLatestPrices({
    market: market || undefined,
  });

  const changedSet = new Set(
    changed
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
  );

  const markets = Array.from(new Set(items.map((x) => x.market)));
  const changedCount = items.filter((item) => item.changed).length;

  return (
    <main className="min-h-screen bg-[#F6F8FB] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#E8EDF5] bg-[linear-gradient(135deg,#FFFFFF_0%,#FAFCFF_55%,#F3F7FF_100%)] p-7 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#DCEBFF] blur-3xl opacity-50" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[#D9E4F2] bg-white/85 px-4 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-[#3B5B8F] backdrop-blur">
              REPORT
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] md:text-5xl">
              {market ? `${market} fiyat raporu` : "Fiyat raporu"}
            </h1>

            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#5E6B7D] md:text-[17px]">
              Seçili ürünlerin güncel fiyatlarını ve değişim durumlarını tek
              ekranda takip et.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[linear-gradient(135deg,#3563E9_0%,#2D5BDE_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(53,99,233,0.22)] transition duration-200 hover:-translate-y-[1px]"
              >
                Ana sayfaya dön
              </Link>

              {market && (
                <Link
                  href="/report"
                  className="rounded-full border border-[#DDE5F0] bg-white/90 px-5 py-3.5 text-sm font-medium text-[#5C6B7E]"
                >
                  Tüm marketleri gör
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Toplam Ürün</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {items.length}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Değişen</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0F172A]">
              {changedCount}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Rapor</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              Hazır
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E7ECF3] bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
            <div className="text-sm font-medium text-[#738195]">Durum</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              Aktif
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/report"
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                !market
                  ? "border-[#3563E9] bg-[#3563E9] text-white shadow-[0_8px_20px_rgba(53,99,233,0.18)]"
                  : "border-[#DDE5F0] bg-white text-[#5C6B7E]"
              }`}
            >
              Tümü
            </Link>

            {markets.map((marketItem) => (
              <Link
                key={marketItem}
                href={`/report?market=${encodeURIComponent(marketItem)}`}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                  market === marketItem
                    ? "border-[#3563E9] bg-[#3563E9] text-white shadow-[0_8px_20px_rgba(53,99,233,0.18)]"
                    : "border-[#DDE5F0] bg-white text-[#5C6B7E]"
                }`}
              >
                {marketItem}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Ürün Listesi
            </h2>
            <p className="mt-1 text-[15px] text-[#6B788A]">
              Güncel fiyatlar ve değişim görünümü
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E7ECF3] bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFD] text-left text-[#5F7083]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ürün</th>
                    <th className="px-6 py-4 font-semibold">SKU</th>
                    <th className="px-6 py-4 font-semibold">Market</th>
                    <th className="px-6 py-4 font-semibold">Eski Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Yeni Fiyat</th>
                    <th className="px-6 py-4 font-semibold">Değişim</th>
                    <th className="px-6 py-4 font-semibold">Stok</th>
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
                        className={`border-t border-[#EFF3F7] transition hover:bg-[#FBFCFF] ${getRowStyle(
                          item,
                          changedSet
                        )}`}
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
                        <td className="px-6 py-4 text-[#657488]">
                          {item.changed ? formatPrice(item.previousPrice) : "-"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#0F172A]">
                          {formatPrice(item.currentPrice)}
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
                        <td className="px-6 py-4 text-[#657488]">
                          {item.inStock ? "Var" : "Yok"}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/report/detail?sku=${item.sku}`}
                            className="font-medium text-[#3A67E8] transition hover:text-[#2D58D8]"
                          >
                            Detayı aç
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {!items.length && (
                    <tr>
                      <td
                        colSpan={8}
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