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
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Market Price Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Market bazlı fiyat takip ve raporlama ekranı
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Toplam Ürün</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {items.length}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Fiyat Değişen</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {items.filter((x) => x.changed).length}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Market Sayısı</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {markets.length}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Marketler
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {marketSummaries.map((summary) => (
              <Link
                key={summary.market}
                href={`/report?market=${encodeURIComponent(summary.market)}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {summary.market}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Market raporunu aç
                    </div>
                  </div>

                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {summary.total} ürün
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Toplam</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {summary.total}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Değişen</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {summary.changedCount}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Son güncelleme:{" "}
                  {summary.lastUpdated
                    ? new Date(summary.lastUpdated).toLocaleString("tr-TR")
                    : "-"}
                </div>
              </Link>
            ))}

            {!marketSummaries.length && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
                Henüz veri yok
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Son Durum
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Ürün</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-4 py-3">Güncel Fiyat</th>
                    <th className="px-4 py-3">Önceki Fiyat</th>
                    <th className="px-4 py-3">Değişim</th>
                    <th className="px-4 py-3">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const changeColor =
                      (item.changePercent ?? 0) > 0
                        ? "text-green-600"
                        : (item.changePercent ?? 0) < 0
                        ? "text-red-600"
                        : "text-gray-500";

                    return (
                      <tr key={item.sku} className="border-t">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.sku}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.market}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {formatPrice(item.currentPrice)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatPrice(item.previousPrice)}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${changeColor}`}>
                          {formatPercent(item.changePercent)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/report/${item.sku}`}
                            className="underline underline-offset-2"
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
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        Veri bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}