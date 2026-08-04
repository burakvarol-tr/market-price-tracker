import Link from "next/link";
import PrintReportButton from "@/components/PrintReportButton";
import MarketLogo from "@/components/MarketLogo";
import { getLatestPrices } from "@/lib/firestorePrices";
import { getProductCategory } from "@/lib/productCategory";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  return value === null ? "-" : `${value.toFixed(2)} TL`;
}

function dateKeyInTurkey(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function ExportReportPage() {
  const items = await getLatestPrices();
  const today = dateKeyInTurkey(new Date().toISOString());
  const changedToday = items.filter((item) => dateKeyInTurkey(item.lastChangedAt) === today);
  const unreadable = items.filter((item) => item.currentPrice === null);
  const markets = Array.from(new Set(items.map((item) => item.market)));
  const generatedAt = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const categories = Array.from(
    items.reduce((map, item) => {
      const category = getProductCategory(item.name);
      map.set(category, (map.get(category) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-[#E9EEF5] px-4 py-6 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-[1100px] rounded-2xl bg-white p-8 shadow-2xl print:max-w-none print:rounded-none print:p-6 print:shadow-none">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Göknur Retail Intelligence</div>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em]">Market Fiyat Takip Raporu</h1>
            <p className="mt-1 text-sm text-slate-500">Oluşturulma: {generatedAt}</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Link href="/report/intelligence" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Geri dön</Link>
            <PrintReportButton />
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Toplam ürün", items.length],
            ["Bugün değişen", changedToday.length],
            ["Okunamayan", unreadable.length],
            ["Aktif market", markets.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-bold">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold">Yönetici özeti</h2>
          <p className="mt-2 leading-7 text-slate-700">
            Bugün {items.length} ürün kontrol edildi. {changedToday.length > 0 ? `${changedToday.length} üründe yeni fiyat değişikliği tespit edildi.` : "Yeni fiyat değişikliği tespit edilmedi."} {unreadable.length > 0 ? `${unreadable.length} ürünün verisi okunamadı.` : "Tüm ürünler başarıyla okundu."}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-bold">Market özeti</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600"><tr><th className="px-4 py-3">Market</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">Bugün değişen</th><th className="px-4 py-3">Okunamayan</th></tr></thead>
              <tbody>
                {markets.map((market) => {
                  const marketItems = items.filter((item) => item.market === market);
                  return (
                    <tr key={market} className="border-t border-slate-200">
                      <td className="px-4 py-3"><MarketLogo market={market} compact /></td>
                      <td className="px-4 py-3">{marketItems.length}</td>
                      <td className="px-4 py-3">{marketItems.filter((item) => dateKeyInTurkey(item.lastChangedAt) === today).length}</td>
                      <td className="px-4 py-3">{marketItems.filter((item) => item.currentPrice === null).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">Kategori dağılımı</h2>
            <div className="mt-3 space-y-2">
              {categories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span>{category}</span><strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold">Bugünkü değişiklikler</h2>
            <div className="mt-3 space-y-2">
              {changedToday.slice(0, 10).map((item) => (
                <div key={`${item.market}-${item.sku}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.market} · {formatPrice(item.previousPrice)} → {formatPrice(item.currentPrice)}</div>
                </div>
              ))}
              {!changedToday.length && <div className="rounded-lg border border-slate-200 px-3 py-6 text-center text-sm text-slate-500">Bugün fiyat değişikliği yok.</div>}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-bold">Ürün listesi</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-100 text-left text-slate-600"><tr><th className="px-3 py-2">Market</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Ürün</th><th className="px-3 py-2">Kategori</th><th className="px-3 py-2">Fiyat</th><th className="px-3 py-2">Durum</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.market}-${item.sku}`} className="border-t border-slate-200">
                    <td className="px-3 py-2">{item.market}</td><td className="px-3 py-2">{item.sku}</td><td className="px-3 py-2">{item.name}</td><td className="px-3 py-2">{getProductCategory(item.name)}</td><td className="px-3 py-2">{formatPrice(item.currentPrice)}</td><td className="px-3 py-2">{item.currentPrice === null ? "Okunamadı" : item.inStock ? "Stokta" : "Stok dışı"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
