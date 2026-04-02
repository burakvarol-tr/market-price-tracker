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
  params: { sku: string };
}) {
  const latest = await getLatestPriceBySku(params.sku);
  const history = await getPriceHistoryBySku(params.sku);

  if (!latest) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-700">Ürün bulunamadı.</p>
          <Link href="/report" className="mt-4 inline-block underline">
            Report’a dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link href={`/report?market=${encodeURIComponent(latest.market)}`} className="mb-6 inline-block text-sm underline">
          ← {latest.market} raporuna dön
        </Link>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{latest.name}</h1>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-500">SKU</div>
              <div className="mt-1 font-semibold text-gray-900">{latest.sku}</div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Market</div>
              <div className="mt-1 font-semibold text-gray-900">{latest.market}</div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Güncel Fiyat</div>
              <div className="mt-1 font-semibold text-gray-900">
                {formatPrice(latest.currentPrice)}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-500">Stok</div>
              <div className="mt-1 font-semibold text-gray-900">
                {latest.inStock ? "Var" : "Yok"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Fiyat Geçmişi</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Fiyat</th>
                  <th className="px-4 py-3">Stok</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={`${item.sku}-${item.checkedAt}-${index}`} className="border-t">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(item.checkedAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.inStock ? "Var" : "Yok"}
                    </td>
                  </tr>
                ))}

                {!history.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                      Geçmiş veri yok
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