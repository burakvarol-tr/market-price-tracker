import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePricesSafe";
import MarketLogo from "@/components/MarketLogo";

export const dynamic = "force-dynamic";

function formatPrice(price?: number | null) {
  if (price == null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
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

function isChangedToday(item: { lastChangedAt?: string | null }) {
  const todayKey = dateKeyInTurkey(new Date().toISOString());
  return Boolean(item.lastChangedAt) && dateKeyInTurkey(item.lastChangedAt) === todayKey;
}

const accentMap: Record<string, string> = {
  A101: "bg-cyan-400",
  SOK: "bg-yellow-300",
  BIZIM: "bg-orange-400",
  CARREFOUR: "bg-blue-400",
};

export default async function HomePage() {
  const items = await getLatestPrices();
  const markets = Array.from(new Set(items.map((item) => item.market)));
  const todayChangedItems = items.filter(isChangedToday);
  const unreadableItems = items.filter((item) => item.currentPrice === null);

  const marketSummaries = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    return {
      market,
      total: marketItems.length,
      changedToday: marketItems.filter(isChangedToday).length,
      unreadable: marketItems.filter((item) => item.currentPrice === null).length,
    };
  });

  const lastUpdated = items.length
    ? new Date(Math.max(...items.map((item) => new Date(item.updatedAt).getTime()))).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
    : "-";

  const executiveSummary = todayChangedItems.length > 0
    ? `Bugün ${items.length} ürün kontrol edildi ve ${todayChangedItems.length} üründe yeni fiyat hareketi tespit edildi.${unreadableItems.length ? ` ${unreadableItems.length} ürünün verisi okunamadı.` : ""}`
    : `Bugün ${items.length} ürün kontrol edildi. Yeni fiyat değişikliği tespit edilmedi.${unreadableItems.length ? ` ${unreadableItems.length} ürünün verisi okunamadı.` : " Tüm ürünlere başarıyla erişildi."}`;

  return (
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <header className="relative mb-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-[118px] items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] px-3">
                <img src="/brand/goknur-white.svg" alt="Göknur" className="h-auto w-full" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">Göknur Retail Intelligence</div>
                <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">Market Fiyat Takibi</h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <span className="mr-1 rounded-md border border-white/[0.07] bg-[#08111F] px-3 py-2 text-[11px] text-slate-500">Son güncelleme <strong className="ml-1 font-medium text-slate-300">{lastUpdated}</strong></span>
              <Link href="/report" className="rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">Fiyat raporu</Link>
              <Link href="/report/analysis" className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06]">Analiz</Link>
              <Link href="/price-check" className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06]">Fiyat kontrolü</Link>
            </nav>
          </div>
        </header>

        <section className="mb-4 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34%),linear-gradient(135deg,#0E1A2C_0%,#0A1322_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <span className="inline-flex rounded-md border border-blue-400/15 bg-blue-500/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">Yönetici görünümü</span>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] md:text-[32px]">Bugünün fiyat ve erişim özeti</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{executiveSummary}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[["Toplam ürün", items.length, "text-white"], ["Bugün değişen", todayChangedItems.length, "text-emerald-300"], ["Okunamayan", unreadableItems.length, "text-amber-300"], ["Aktif market", markets.length, "text-blue-300"]].map(([label, value, color]) => (
                <div key={String(label)} className="rounded-lg border border-white/[0.07] bg-black/10 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                  <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626] shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <div><h2 className="text-sm font-semibold text-slate-100">Market durumu</h2><p className="text-[10px] text-slate-600">Son kontrol sonuçları</p></div>
              <span className="text-[10px] text-slate-600">{markets.length} market</span>
            </div>
            <div className="divide-y divide-white/[0.055]">
              {marketSummaries.map((summary) => (
                <Link key={summary.market} href={`/report?market=${encodeURIComponent(summary.market)}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-white/[0.025]">
                  <div className={`h-8 w-1 rounded-full ${accentMap[summary.market] ?? "bg-slate-500"}`} />
                  <div className="flex min-w-0 items-center gap-3">
                    <MarketLogo market={summary.market} compact />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200">{summary.total} ürün izleniyor</div>
                      <div className="text-[10px] text-slate-600">{summary.changedToday > 0 ? `${summary.changedToday} üründe bugün fiyat değişti` : summary.unreadable > 0 ? `${summary.unreadable} ürünün verisi okunamadı` : "Yeni fiyat değişimi yok"}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-blue-300">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626] shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div><h2 className="text-sm font-semibold text-slate-100">Bugünkü fiyat hareketleri</h2><p className="text-[10px] text-slate-600">Yalnızca bugün kaydedilen yeni değişiklikler</p></div>
            <Link href="/report" className="rounded-md border border-white/[0.07] px-2.5 py-1.5 text-[10px] font-medium text-slate-400">Tüm rapor</Link>
          </div>
          {todayChangedItems.length > 0 ? (
            <div className="divide-y divide-white/[0.055]">
              {todayChangedItems.slice(0, 5).map((item) => (
                <Link key={`${item.market}-${item.sku}`} href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-white/[0.025]">
                  <div className="min-w-0"><div className="truncate text-xs font-medium text-slate-200">{item.name}</div><div className="text-[10px] text-slate-600">{item.market} · {item.sku}</div></div>
                  <div className="text-right text-[11px] tabular-nums text-slate-500">{formatPrice(item.previousPrice)} <span className="px-1 text-slate-700">→</span> <span className="font-semibold text-slate-100">{formatPrice(item.currentPrice)}</span></div>
                  <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${(item.changePercent ?? 0) >= 0 ? "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300" : "border-rose-400/15 bg-rose-400/[0.08] text-rose-300"}`}>{formatPercent(item.changePercent)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[118px] items-center justify-center px-4 text-center text-sm text-slate-400">Bugün yeni fiyat değişikliği yok.</div>
          )}
        </section>
      </div>
    </main>
  );
}
