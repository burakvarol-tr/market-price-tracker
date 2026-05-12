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

function marketColor(market: string) {
  if (market === "A101") return "bg-sky-500/15 text-sky-300 border-sky-400/20";
  if (market === "SOK")
    return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
  if (market === "BIZIM")
    return "bg-orange-500/15 text-orange-300 border-orange-400/20";
  return "bg-slate-500/15 text-slate-300 border-slate-400/20";
}

function getRowStyle(item: PriceRecord, changedSet: Set<string>) {
  if (changedSet.has(item.sku)) return "bg-emerald-500/[0.06]";
  if (item.changed && (item.changePercent ?? 0) > 0)
    return "bg-emerald-500/[0.04]";
  if (item.changed && (item.changePercent ?? 0) < 0)
    return "bg-rose-500/[0.04]";
  return "";
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

  const changedCount = items.filter(
    (item) =>
      item.previousPrice !== null && item.previousPrice !== item.currentPrice
  ).length;

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-7 shadow-2xl md:p-10">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
              REPORT
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              {market ? `${market} fiyat raporu` : "Fiyat raporu"}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
              Seçili ürünlerin güncel fiyatlarını, eski fiyatlarını ve değişim
              durumlarını tek ekranda takip edin.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Ana sayfaya dön
              </Link>

              {market && (
                <Link
                  href="/report"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  Tüm marketleri gör
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Toplam Ürün</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
              {items.length}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Değişen</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-emerald-300">
              {changedCount}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Rapor</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              Hazır
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10">
            <div className="text-sm text-slate-400">Durum</div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
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
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
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
                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {marketItem}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">
              Ürün Listesi
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Güncel fiyatlar ve değişim görünümü
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">#</th>
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
                  {items.map((item, index) => {
                    const hasChange =
                      item.previousPrice !== null &&
                      item.previousPrice !== item.currentPrice;

                    const changePositive =
                      hasChange && (item.changePercent ?? 0) > 0;
                    const changeNegative =
                      hasChange && (item.changePercent ?? 0) < 0;

                    return (
                      <tr
                        key={item.sku}
                        className={`border-t border-white/10 transition hover:bg-white/[0.03] ${getRowStyle(
                          item,
                          changedSet
                        )}`}
                      >
                        <td className="px-5 py-4 text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[360px] font-medium leading-6">
                            {item.name}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {item.sku}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${marketColor(
                              item.market
                            )}`}
                          >
                            {item.market}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {formatPrice(item.previousPrice)}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatPrice(item.currentPrice)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              changePositive
                                ? "bg-emerald-400/10 text-emerald-300"
                                : changeNegative
                                ? "bg-rose-400/10 text-rose-300"
                                : "bg-slate-400/10 text-slate-400"
                            }`}
                          >
                            {formatPercent(item.changePercent, hasChange)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {item.inStock ? "Var" : "Yok"}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/report/detail?sku=${item.sku}`}
                            className="font-semibold text-blue-300 hover:text-blue-200"
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
                        colSpan={9}
                        className="px-6 py-14 text-center text-slate-400"
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