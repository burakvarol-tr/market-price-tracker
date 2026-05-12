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

function marketColor(market: string) {
  if (market === "A101") return "bg-sky-500/15 text-sky-300 border-sky-400/20";
  if (market === "SOK") return "bg-yellow-500/15 text-yellow-300 border-yellow-400/20";
  if (market === "BIZIM") return "bg-orange-500/15 text-orange-300 border-orange-400/20";
  return "bg-slate-500/15 text-slate-300 border-slate-400/20";
}

export default async function HomePage() {
  const items = await getLatestPrices();

  const markets = Array.from(new Set(items.map((item) => item.market)));

  const changedItems = items.filter(
    (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
  );

  const marketSummaries = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const changedCount = marketItems.filter(
      (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
    ).length;

    return {
      market,
      total: marketItems.length,
      changedCount,
      lastUpdated:
        marketItems.length > 0
          ? marketItems.map((x) => new Date(x.updatedAt).getTime()).sort((a, b) => b - a)[0]
          : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-7 shadow-2xl md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-blue-200">
                MARKET PRICE TRACKER
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                Market Fiyat Takibi
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Seçili ürünlerin güncel fiyatlarını, fiyat değişimlerini ve market bazlı durumunu tek ekranda takip edin.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/report"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Tüm raporu aç
                </Link>

                <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300">
                  {items.length} ürün izleniyor
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
              <div className="text-slate-400">Son güncelleme</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {items.length
                  ? new Date(
                      Math.max(...items.map((x) => new Date(x.updatedAt).getTime()))
                    ).toLocaleString("tr-TR")
                  : "-"}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ["Toplam Ürün", items.length],
            ["Fiyat Değişen", changedItems.length],
            ["Market Sayısı", markets.length],
            ["Aktif Takip", items.length],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10"
            >
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                {value}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">Marketler</h2>
              <p className="mt-1 text-sm text-slate-400">Her market için ayrı rapor ekranına geçebilirsiniz.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {marketSummaries.map((summary) => (
              <Link
                key={summary.market}
                href={`/report?market=${encodeURIComponent(summary.market)}`}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{summary.market}</div>
                    <div className="mt-1 text-sm text-slate-400">Market raporunu aç</div>
                  </div>

                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${marketColor(summary.market)}`}>
                    {summary.total} ürün
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="text-xs text-slate-400">Toplam</div>
                    <div className="mt-2 text-2xl font-semibold">{summary.total}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="text-xs text-slate-400">Değişen</div>
                    <div className="mt-2 text-2xl font-semibold text-emerald-300">
                      {summary.changedCount}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-slate-500">
                  Son güncelleme:{" "}
                  {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString("tr-TR") : "-"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {changedItems.length > 0 && (
          <section className="mb-8 rounded-[30px] border border-emerald-400/15 bg-emerald-500/[0.06] p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Fiyatı Değişen Ürünler</h2>
              <p className="mt-1 text-sm text-slate-400">Geçmiş fiyata göre değişim görünen ürünler.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {changedItems.slice(0, 6).map((item) => (
                <Link
                  key={item.sku}
                  href={`/report/detail?sku=${item.sku}`}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-black/30"
                >
                  <div className="text-sm font-semibold leading-6">{item.name}</div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{formatPrice(item.previousPrice)}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-semibold">{formatPrice(item.currentPrice)}</span>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                      {formatPercent(item.changePercent)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Son Durum</h2>
            <p className="mt-1 text-sm text-slate-400">Tüm ürünlerin güncel fiyat görünümü</p>
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
                    <th className="px-5 py-4 font-semibold">Güncel Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Önceki Fiyat</th>
                    <th className="px-5 py-4 font-semibold">Değişim</th>
                    <th className="px-5 py-4 font-semibold">Detay</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const hasChange =
                      item.previousPrice !== null && item.previousPrice !== item.currentPrice;

                    return (
                      <tr key={item.sku} className="border-t border-white/10 transition hover:bg-white/[0.03]">
                        <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                        <td className="px-5 py-4">
                          <div className="max-w-[340px] font-medium leading-6">{item.name}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{item.sku}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${marketColor(item.market)}`}>
                            {item.market}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold">{formatPrice(item.currentPrice)}</td>
                        <td className="px-5 py-4 text-slate-400">{formatPrice(item.previousPrice)}</td>
                        <td className="px-5 py-4">
                          {hasChange ? (
                            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                              {formatPercent(item.changePercent)}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-400/10 px-3 py-1 text-xs text-slate-400">
                              -
                            </span>
                          )}
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
                      <td colSpan={8} className="px-6 py-14 text-center text-slate-400">
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