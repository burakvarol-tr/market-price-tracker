import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import MarketLogo from "@/components/MarketLogo";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  return value === null ? "-" : `${value.toFixed(2)} TL`;
}

function formatPercent(value: number | null) {
  if (value === null) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatMovementDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default async function AnalysisPage() {
  const items = await getLatestPrices();
  const todayChangedItems = items.filter(
    (item) =>
      isChangedToday(item) &&
      item.previousPrice !== null &&
      item.currentPrice !== null &&
      item.previousPrice !== item.currentPrice &&
      item.changePercent !== null
  );
  const unreadable = items.filter((item) => item.currentPrice === null);
  const outOfStock = items.filter((item) => item.currentPrice !== null && !item.inStock);
  const markets = Array.from(new Set(items.map((item) => item.market)));

  const gainers = [...todayChangedItems]
    .filter((item) => (item.changePercent ?? 0) > 0)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, 8);
  const decliners = [...todayChangedItems]
    .filter((item) => (item.changePercent ?? 0) < 0)
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, 8);

  const marketSummary = markets.map((market) => {
    const marketItems = items.filter((item) => item.market === market);
    const priced = marketItems.filter((item) => item.currentPrice !== null);
    return {
      market,
      total: marketItems.length,
      changedToday: marketItems.filter(isChangedToday).length,
      outOfStock: marketItems.filter((item) => item.currentPrice !== null && !item.inStock).length,
      unreadable: marketItems.filter((item) => item.currentPrice === null).length,
      averagePrice: priced.length
        ? priced.reduce((sum, item) => sum + (item.currentPrice ?? 0), 0) / priced.length
        : null,
    };
  });

  const executiveSummary = todayChangedItems.length
    ? `Bugün ${todayChangedItems.length} üründe fiyat değişikliği tespit edildi. ${gainers.length} ürünün fiyatı arttı, ${decliners.length} ürünün fiyatı düştü.`
    : `Bugün fiyat değişmedi · ${unreadable.length} ürün okunamadı · ${outOfStock.length} ürün stok dışı`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-3 pb-24 pt-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="FİYAT ANALİZİ"
          title="Fiyat ve stok analizi"
          description="Market bazında güncel hareketleri, stok ve veri erişim durumunu yönetici seviyesinde inceleyin."
          navItems={[
            { href: "/", label: "Ana sayfa", tone: "neutral" },
            { href: "/report", label: "Fiyat raporu", tone: "primary" },
            { href: "/price-check", label: "Fiyat kontrolü", tone: "neutral" },
          ]}
        />

        <section className="mb-3 rounded-xl border border-blue-400/15 bg-[linear-gradient(135deg,rgba(30,64,175,0.14),rgba(15,23,42,0.38))] px-3 py-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] sm:mb-4 sm:rounded-[18px] sm:px-4 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-blue-300 sm:text-[10px] sm:tracking-[0.14em]">Yönetici özeti</div>
            <span className="text-[10px] text-slate-500 sm:hidden">Bugünkü durum</span>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-slate-300 sm:mt-1.5 sm:text-sm sm:leading-6">{executiveSummary}</p>
        </section>

        <section className="mb-3 grid grid-cols-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626] md:hidden">
          {[
            ["Ürün", items.length, "text-white"],
            ["Değişen", todayChangedItems.length, "text-emerald-300"],
            ["Okunamayan", unreadable.length, "text-amber-300"],
            ["Market", markets.length, "text-blue-300"],
          ].map(([label, value, color], index) => (
            <div key={String(label)} className={`min-w-0 px-2 py-2.5 text-center ${index > 0 ? "border-l border-white/[0.07]" : ""}`}>
              <div className={`text-[20px] font-semibold leading-none ${color}`}>{value}</div>
              <div className="mt-1.5 truncate text-[7px] uppercase tracking-[0.09em] text-slate-600">{label}</div>
            </div>
          ))}
        </section>

        <section className="mb-5 hidden grid-cols-2 gap-3 md:grid md:grid-cols-5">
          <MetricCard label="Toplam ürün" value={items.length} />
          <MetricCard label="Bugün değişen" value={todayChangedItems.length} tone="positive" />
          <MetricCard label="Stok dışı" value={outOfStock.length} tone="negative" />
          <MetricCard label="Okunamayan" value={unreadable.length} tone="warning" />
          <MetricCard label="Aktif market" value={markets.length} tone="info" />
        </section>

        <section className="mb-3 overflow-hidden rounded-xl border border-white/[0.085] bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.15)] sm:mb-5 sm:rounded-[18px]">
          <div className="border-b border-white/[0.08] px-3 py-3 sm:px-4 sm:py-3.5">
            <h2 className="text-sm font-semibold tracking-[-0.01em] sm:text-base">Market özeti</h2>
            <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">Bugünkü değişim ve güncel erişim görünümü</p>
          </div>

          <div className="divide-y divide-white/[0.07] md:hidden">
            {marketSummary.map((item) => (
              <div key={item.market} className="px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <MarketLogo market={item.market} compact />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{item.total} ürün</div>
                    <div className="text-[10px] text-slate-500">Ort. {formatPrice(item.averagePrice)}</div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-white/[0.06] bg-black/10 px-2 py-1.5">
                    <div className="text-[8px] uppercase tracking-[0.08em] text-slate-600">Değişen</div>
                    <div className="mt-0.5 text-sm font-semibold text-emerald-300">{item.changedToday}</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-black/10 px-2 py-1.5">
                    <div className="text-[8px] uppercase tracking-[0.08em] text-slate-600">Stok dışı</div>
                    <div className="mt-0.5 text-sm font-semibold text-rose-300">{item.outOfStock}</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-black/10 px-2 py-1.5">
                    <div className="text-[8px] uppercase tracking-[0.08em] text-slate-600">Okunamayan</div>
                    <div className="mt-0.5 text-sm font-semibold text-amber-300">{item.unreadable}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-[13px]">
              <thead className="bg-white/[0.035] text-left text-xs text-slate-400">
                <tr><th className="px-4 py-3">Market</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">Bugün değişen</th><th className="px-4 py-3">Stok dışı</th><th className="px-4 py-3">Okunamayan</th><th className="px-4 py-3">Ort. fiyat</th></tr>
              </thead>
              <tbody>
                {marketSummary.map((item) => (
                  <tr key={item.market} className="border-t border-white/[0.07] transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><MarketLogo market={item.market} compact /></td>
                    <td className="px-4 py-3 font-semibold">{item.total}</td>
                    <td className="px-4 py-3 text-emerald-300">{item.changedToday}</td>
                    <td className="px-4 py-3 text-slate-300">{item.outOfStock}</td>
                    <td className="px-4 py-3 text-amber-300">{item.unreadable}</td>
                    <td className="px-4 py-3 text-slate-300">{formatPrice(item.averagePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <MovementList title="Bugün fiyatı artanlar" items={gainers} positive />
          <MovementList title="Bugün fiyatı düşenler" items={decliners} positive={false} />
        </div>
      </div>
    </main>
  );
}

function MovementList({ title, items, positive }: { title: string; items: Awaited<ReturnType<typeof getLatestPrices>>; positive: boolean }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.085] bg-white/[0.03] shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:rounded-[18px]">
      <div className="border-b border-white/[0.08] px-3 py-3 sm:px-4 sm:py-3.5"><h2 className="text-sm font-semibold tracking-[-0.01em] sm:text-base">{title}</h2></div>
      <div className="divide-y divide-white/[0.07]">
        {items.map((item) => (
          <Link key={`${item.market}-${item.sku}`} href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="flex items-center justify-between gap-4 px-3 py-3 transition hover:bg-white/[0.025] sm:px-4">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium sm:text-sm">{item.name}</div>
              <div className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-[11px]">{item.market} · {formatPrice(item.currentPrice)} · {formatMovementDate(item.lastChangedAt)}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>{formatPercent(item.changePercent)}</span>
          </Link>
        ))}
        {!items.length && (
          <div className="flex items-center gap-2 px-3 py-3 text-[11px] text-slate-400 sm:px-4 sm:py-4 sm:text-sm">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>✓</span>
            Bugün bu yönde fiyat hareketi yok.
          </div>
        )}
      </div>
    </section>
  );
}
