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
    return "bg-yellow-50 border-yellow-300";
  }

  if (item.changed && (item.changePercent ?? 0) > 0) {
    return "bg-green-50 border-green-200";
  }

  if (item.changed && (item.changePercent ?? 0) < 0) {
    return "bg-red-50 border-red-200";
  }

  return "bg-white border-gray-200";
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

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Fiyat Raporu</h1>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/report"
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                !market ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Tümü
            </Link>

            {markets.map((marketItem) => (
              <Link
                key={marketItem}
                href={`/report?market=${encodeURIComponent(marketItem)}`}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  market === marketItem
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {marketItem}
              </Link>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            {market ? (
              <span>Seçili market: <strong>{market}</strong></span>
            ) : (
              <span>Tüm marketler gösteriliyor</span>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Eski Fiyat</th>
                  <th className="px-4 py-3">Yeni Fiyat</th>
                  <th className="px-4 py-3">Değişim</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Güncelleme</th>
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
                    <tr
                      key={item.sku}
                      className={`border-t ${getRowStyle(item, changedSet)}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link
                          href={`/report/${item.sku}`}
                          className="underline underline-offset-2"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.sku}</td>
                      <td className="px-4 py-3 text-gray-700">{item.market}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatPrice(item.previousPrice)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {formatPrice(item.currentPrice)}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${changeColor}`}>
                        {formatPercent(item.changePercent)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.inStock ? "Var" : "Yok"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(item.updatedAt).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  );
                })}

                {!items.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}