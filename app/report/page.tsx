import Link from "next/link";
import { getLatestPrices, type PriceRecord } from "@/lib/firestorePrices";

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

function getRowStyle(item: PriceRecord, changedSet: Set<string>) {
  if (changedSet.has(item.sku)) {
    return "bg-[#FFFBEF]";
  }

  if (item.changed && (item.changePercent ?? 0) > 0) {
    return "bg-[#F7FCF8]";
  }

  if (item.changed && (item.changePercent ?? 0) < 0) {
    return "bg-[#FFF8F8]";
  }

  return "bg-white";
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: {
    market?: string;
    changed?: string;
  };
}) {
  const market = searchParams?.market || "";
  const changed = searchParams?.changed || "";

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
    <main className="min-h-screen bg-[#F5F7FA] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 rounded-[28px] border border-[#E7ECF3] bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF4FF] p-7 shadow-[0_10px_40px_rgba(15,23,42,0.05)] md:p-9">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full border border-[#D8E3F2] bg-white/80 px-3 py-1 text-[12px] font-semibold tracking-wide text-[#315B9E]">
              PREMIUM REPORT
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-[#0F172A] md:text-4xl">
              {market ? `${market} fiyat raporu` : "Fiyat raporu"}
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5B6B80] md:text-base">
              Değişen ürünleri, güncel fiyatları ve market bazlı görünümü sade,
              yumuşak ve premium bir arayüzde inceleyin.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(29,78,216,0.20)] transition hover:translate-y-[-1px]"
              >
                Ana sayfaya dön
              </Link>

              {market && (
                <Link
                  href="/report"
                  className="rounded-full border border-[#DCE4EE] bg-white px-5 py-3 text-sm font-medium text-[#536273]"
                >
                  Tüm marketleri gör
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Toplam Ürün</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              {items.length}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Değişen</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              {changedCount}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Rapor</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              Hazır
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="text-sm font-medium text-[#6A7788]">Durum</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A]">
              Aktif
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href="/report"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                !market
                  ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                  : "border-[#DCE4EE] bg-white text-[#536273]"
              }`}
            >
              Tümü
            </Link>

            {markets.map((marketItem) => (
              <Link
                key={marketItem}
                href={`/report?market=${encodeURIComponent(marketItem)}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  market === marketItem
                    ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                    : "border-[#DCE4EE] bg-white text-[#536273]"
                }`}
              >
                {marketItem}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">
              Ürün Listesi
            </h2>
            <p className="mt-1 text-sm text-[#66758A]">
              Güncel fiyatlar ve değişim görünümü
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
                    <th className="px-5 py-4 font-semibold">Eski Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Yeni Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Değişim</th>
                    <th className="px-5 py-4 font-semibold">Stok</th>
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
                        className={`border-t border-[#EEF2F6] transition hover:bg-[#FAFCFF] ${getRowStyle(
                          item,
                          changedSet
                        )}`}
                      >
                        <td className="px-5 py-4 font-medium text-[#0F172A]">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-[#5E6C80]">{item.sku}</td>
                        <td className="px-5 py-4 text-[#5E6C80]">{item.market}</td>
                        <td className="px-5 py-4 text-[#5E6C80]">
                          {formatPrice(item.previousPrice)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#0F172A]">
                          {formatPrice(item.currentPrice)}
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
                        <td className="px-5 py-4 text-[#5E6C80]">
                          {item.inStock ? "Var" : "Yok"}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/report/${item.sku}`}
                            className="font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
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