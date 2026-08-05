import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import MarketLogo from "@/components/MarketLogo";
import { getLatestPrices } from "@/lib/firestorePrices";
import {
  dateKeyInTurkey,
  getRecentAnalyticsHistory,
  isPriceChange,
} from "@/lib/analyticsData";
import { getProductCategory } from "@/lib/productCategory";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  return value === null ? "-" : `${value.toFixed(2)} TL`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Istanbul",
  });
}

export default async function IntelligencePage() {
  const [latest, history] = await Promise.all([
    getLatestPrices(),
    getRecentAnalyticsHistory(30),
  ]);

  const changes = history.filter(isPriceChange);
  const markets = Array.from(new Set(latest.map((item) => item.market)));
  const dateKeys = Array.from(new Set(changes.map((item) => dateKeyInTurkey(item.checkedAt))))
    .filter(Boolean)
    .sort()
    .slice(-14);

  const marketHeatmap = markets.map((market) => ({
    market,
    values: dateKeys.map((date) =>
      changes.filter(
        (item) => item.market === market && dateKeyInTurkey(item.checkedAt) === date
      ).length
    ),
    total: changes.filter((item) => item.market === market).length,
  }));

  const categoryMap = new Map<string, { total: number; changed: number; avg: number[] }>();
  for (const item of latest) {
    const category = getProductCategory(item.name);
    const current = categoryMap.get(category) ?? { total: 0, changed: 0, avg: [] };
    current.total += 1;
    if (item.currentPrice !== null) current.avg.push(item.currentPrice);
    categoryMap.set(category, current);
  }
  for (const change of changes) {
    const category = getProductCategory(change.name);
    const current = categoryMap.get(category);
    if (current) current.changed += 1;
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      total: value.total,
      changed: value.changed,
      average: value.avg.length
        ? value.avg.reduce((sum, price) => sum + price, 0) / value.avg.length
        : null,
    }))
    .sort((a, b) => b.total - a.total);

  const calendar = dateKeys.map((date) => ({
    date,
    count: changes.filter((item) => dateKeyInTurkey(item.checkedAt) === date).length,
  }));

  const biggestRise = [...changes]
    .filter((item) => (item.changePercent ?? 0) > 0)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))[0];
  const biggestDrop = [...changes]
    .filter((item) => (item.changePercent ?? 0) < 0)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))[0];
  const busiestMarket = [...marketHeatmap].sort((a, b) => b.total - a.total)[0];

  const summaryParts = [
    `Son 30 günde ${changes.length} fiyat değişikliği kaydedildi.`,
    busiestMarket && busiestMarket.total > 0
      ? `En fazla hareket ${busiestMarket.market} marketinde görüldü (${busiestMarket.total} değişiklik).`
      : "Belirgin bir market hareketi bulunmuyor.",
    biggestRise
      ? `En yüksek artış ${biggestRise.name} ürününde %${Math.abs(biggestRise.changePercent ?? 0).toFixed(2)} oldu.`
      : "Fiyat artışı kaydı bulunmuyor.",
    biggestDrop
      ? `En yüksek düşüş ${biggestDrop.name} ürününde %${Math.abs(biggestDrop.changePercent ?? 0).toFixed(2)} oldu.`
      : "Fiyat düşüşü kaydı bulunmuyor.",
  ];

  const maxHeat = Math.max(1, ...marketHeatmap.flatMap((row) => row.values));

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="İLERİ ANALİZ"
          title="Retail Intelligence"
          description="Son 30 günlük fiyat hareketlerini market, tarih ve kategori bazında yöneticiler için özetleyin."
          navItems={[
            { href: "/", label: "Ana sayfa", tone: "neutral" },
            { href: "/report", label: "Fiyat raporu", tone: "primary" },
            { href: "/report/analysis", label: "Standart analiz", tone: "success" },
          ]}
        />

        <section className="mb-4 rounded-2xl border border-blue-400/15 bg-[radial-gradient(circle_at_top_right,#2563EB24,transparent_32%),linear-gradient(135deg,#0E1A2C,#0A1322)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">Yönetici özeti</div>
          <p className="mt-2 max-w-6xl text-base leading-7 text-slate-200">{summaryParts.join(" ")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/api/export/excel" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20 hover:bg-emerald-500/15">Excel indir</a>
            <Link href="/report/export" className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/20 hover:bg-blue-500/15">PDF raporu aç</Link>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1626]">
            <div className="border-b border-white/[0.07] px-4 py-3">
              <h2 className="font-semibold">30 günlük fiyat ısı haritası</h2>
              <p className="text-[11px] text-slate-500">Renk yoğunluğu değişiklik adedini gösterir.</p>
            </div>
            <div className="overflow-x-auto p-4">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[120px_repeat(14,minmax(34px,1fr))] gap-1 text-[9px] text-slate-600">
                  <div />
                  {dateKeys.map((date) => <div key={date} className="text-center">{formatDate(date)}</div>)}
                </div>
                <div className="mt-2 space-y-2">
                  {marketHeatmap.map((row) => (
                    <div key={row.market} className="grid grid-cols-[120px_repeat(14,minmax(34px,1fr))] gap-1 items-center">
                      <div><MarketLogo market={row.market} compact /></div>
                      {row.values.map((value, index) => {
                        const opacity = value === 0 ? 0.035 : 0.18 + (value / maxHeat) * 0.62;
                        return <div key={`${row.market}-${index}`} title={`${value} değişiklik`} className="flex h-8 items-center justify-center rounded-md border border-white/[0.05] text-[10px] font-semibold" style={{ backgroundColor: `rgba(59,130,246,${opacity})`, color: value ? "#dbeafe" : "#475569" }}>{value || "·"}</div>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1626]">
            <div className="border-b border-white/[0.07] px-4 py-3">
              <h2 className="font-semibold">Değişim takvimi</h2>
              <p className="text-[11px] text-slate-500">Gün bazında toplam fiyat hareketi</p>
            </div>
            <div className="grid grid-cols-7 gap-2 p-4">
              {calendar.map((day) => (
                <div key={day.date} className={`rounded-xl border p-3 text-center ${day.count > 0 ? "border-blue-400/20 bg-blue-500/10" : "border-white/[0.06] bg-white/[0.02]"}`}>
                  <div className="text-[10px] text-slate-500">{formatDate(day.date)}</div>
                  <div className={`mt-1 text-xl font-semibold ${day.count > 0 ? "text-blue-300" : "text-slate-600"}`}>{day.count}</div>
                </div>
              ))}
              {!calendar.length && <div className="col-span-7 py-12 text-center text-sm text-slate-500">Son 30 günde değişiklik kaydı yok.</div>}
            </div>
          </section>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1626]">
          <div className="border-b border-white/[0.07] px-4 py-3">
            <h2 className="font-semibold">Kategori bazlı analiz</h2>
            <p className="text-[11px] text-slate-500">Ürün dağılımı, değişim adedi ve ortalama fiyat</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.035] text-left text-[10px] uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-4 py-3">Kategori</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">30 günde değişim</th><th className="px-4 py-3">Ortalama fiyat</th><th className="px-4 py-3">Yoğunluk</th></tr></thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.name} className="border-t border-white/[0.06]">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-slate-300">{category.total}</td>
                    <td className="px-4 py-3 text-blue-300">{category.changed}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPrice(category.average)}</td>
                    <td className="px-4 py-3"><div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(100, (category.changed / Math.max(1, changes.length)) * 100)}%` }} /></div></td>
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
