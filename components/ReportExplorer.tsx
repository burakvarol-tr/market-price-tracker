"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PriceRecord } from "@/lib/firestorePrices";
import { getProductCategory } from "@/lib/productCategory";
import SafeProductImage from "./SafeProductImage";
import MarketLogo from "./MarketLogo";
import MiniSparkline from "./MiniSparkline";

type SortKey = "market" | "name" | "price-asc" | "price-desc" | "change-desc" | "updated-desc";

type Props = {
  initialItems: PriceRecord[];
  initialMarket?: string;
  highlightedSkus?: string[];
  priceHistoryMap?: Record<string, number[]>;
};

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value: number | null, changed: boolean) {
  if (!changed || value === null || Number.isNaN(value)) return "-";
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

function isChangedToday(item: PriceRecord) {
  const todayKey = dateKeyInTurkey(new Date().toISOString());
  return Boolean(item.lastChangedAt) && dateKeyInTurkey(item.lastChangedAt) === todayKey;
}

function isUnreadable(item: PriceRecord) {
  return item.currentPrice === null;
}

function isOutOfStock(item: PriceRecord) {
  return item.currentPrice !== null && !item.inStock;
}

function compareNullableNumber(a: number | null, b: number | null, direction: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * direction;
}

function StockBadge({ item }: { item: PriceRecord }) {
  if (isUnreadable(item)) {
    return <span className="inline-flex rounded-md border border-amber-400/15 bg-amber-400/[0.08] px-2 py-1 text-[10px] font-semibold text-amber-300">Okunamadı</span>;
  }

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${item.inStock ? "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300" : "border-rose-400/15 bg-rose-400/[0.08] text-rose-300"}`}>
      {item.inStock ? "Stokta" : "Stok dışı"}
    </span>
  );
}

export default function ReportExplorer({ initialItems, initialMarket = "", highlightedSkus = [], priceHistoryMap = {} }: Props) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState(initialMarket);
  const [category, setCategory] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [onlyUnreadable, setOnlyUnreadable] = useState(false);
  const [onlyWithoutImage, setOnlyWithoutImage] = useState(false);
  const [sort, setSort] = useState<SortKey>("market");

  const highlightedSet = useMemo(() => new Set(highlightedSkus), [highlightedSkus]);
  const markets = useMemo(() => Array.from(new Set(initialItems.map((item) => item.market))), [initialItems]);
  const categories = useMemo(() => Array.from(new Set(initialItems.map((item) => getProductCategory(item.name)))).sort((a, b) => a.localeCompare(b, "tr")), [initialItems]);

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = initialItems.filter((item) => {
      const matchesQuery = !normalizedQuery || item.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery) || item.sku.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
      return matchesQuery && (!market || item.market === market) && (!category || getProductCategory(item.name) === category) && (!onlyChanged || isChangedToday(item)) && (!onlyOutOfStock || isOutOfStock(item)) && (!onlyUnreadable || isUnreadable(item)) && (!onlyWithoutImage || !item.imageUrl);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "tr");
      if (sort === "price-asc") return compareNullableNumber(a.currentPrice, b.currentPrice, 1);
      if (sort === "price-desc") return compareNullableNumber(a.currentPrice, b.currentPrice, -1);
      if (sort === "change-desc") return compareNullableNumber(a.changePercent, b.changePercent, -1);
      if (sort === "updated-desc") return new Date(b.lastCheckedAt ?? b.updatedAt).getTime() - new Date(a.lastCheckedAt ?? a.updatedAt).getTime();
      if (a.market !== b.market) return a.market.localeCompare(b.market, "tr");
      return a.name.localeCompare(b.name, "tr");
    });
  }, [initialItems, market, category, onlyChanged, onlyOutOfStock, onlyUnreadable, onlyWithoutImage, query, sort]);

  const filterButtons = [
    { label: "Bugün değişen", active: onlyChanged, toggle: () => setOnlyChanged((value) => !value) },
    { label: "Stok dışı", active: onlyOutOfStock, toggle: () => setOnlyOutOfStock((value) => !value) },
    { label: "Okunamayan", active: onlyUnreadable, toggle: () => setOnlyUnreadable((value) => !value) },
    { label: "Görselsiz", active: onlyWithoutImage, toggle: () => setOnlyWithoutImage((value) => !value) },
  ];

  return (
    <>
      <section className="mb-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626]">
        <div className="grid grid-cols-4 divide-x divide-white/[0.07] md:grid-cols-5">
          {[
            ["Gösterilen", items.length, "text-white"],
            ["Bugün değişen", items.filter(isChangedToday).length, "text-emerald-300"],
            ["Stok dışı", items.filter(isOutOfStock).length, "text-rose-300"],
            ["Okunamayan", items.filter(isUnreadable).length, "text-amber-300"],
            ["Market", market || "Tümü", "text-blue-300"],
          ].map(([label, value, color], index) => (
            <div key={String(label)} className={`${index === 4 ? "hidden md:block" : ""} min-w-0 px-2 py-2.5 sm:px-4 sm:py-3`}>
              <div className="truncate text-[8px] font-semibold uppercase tracking-[0.09em] text-slate-500 sm:text-[10px] sm:tracking-[0.12em]">{label}</div>
              <div className={`mt-1 truncate text-base font-semibold sm:text-lg ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-3 rounded-xl border border-white/[0.08] bg-[#0C1626] p-2.5 sm:mb-4 sm:p-3">
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-[1.35fr_0.62fr_0.72fr_0.72fr]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün adı veya SKU ile ara" className="col-span-2 h-10 min-w-0 rounded-lg border border-white/[0.08] bg-[#08111F] px-3 text-[13px] text-white outline-none placeholder:text-slate-600 xl:col-span-1 xl:text-sm" />
          <select value={market} onChange={(event) => setMarket(event.target.value)} className="h-10 min-w-0 rounded-lg border border-white/[0.08] bg-[#08111F] px-2.5 text-[12px] text-white sm:px-3 sm:text-sm"><option value="">Tüm marketler</option>{markets.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 min-w-0 rounded-lg border border-white/[0.08] bg-[#08111F] px-2.5 text-[12px] text-white sm:px-3 sm:text-sm"><option value="">Tüm kategoriler</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="col-span-2 h-10 min-w-0 rounded-lg border border-white/[0.08] bg-[#08111F] px-2.5 text-[12px] text-white sm:px-3 sm:text-sm xl:col-span-1"><option value="market">Markete göre</option><option value="name">Ürün adına göre</option><option value="price-asc">Fiyat: düşükten yükseğe</option><option value="price-desc">Fiyat: yüksekten düşüğe</option><option value="change-desc">En yüksek değişim</option><option value="updated-desc">Son güncelleme</option></select>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto border-t border-white/[0.06] pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
          {filterButtons.map((filter) => <button key={filter.label} type="button" onClick={filter.toggle} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${filter.active ? "border-blue-400/30 bg-blue-500/15 text-blue-200" : "border-white/[0.08] text-slate-400"}`}>{filter.label}</button>)}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-end justify-between gap-3"><div className="min-w-0"><h2 className="text-base font-semibold text-slate-100">Ürün listesi</h2><p className="truncate text-[10px] text-slate-500 sm:text-[11px]">Güncel fiyat, kategori, mini trend ve erişim durumu</p></div><div className="shrink-0 rounded-md border border-white/[0.07] px-2.5 py-1 text-[11px] text-slate-500">{items.length} kayıt</div></div>

        <div className="space-y-2 md:hidden">
          {items.map((item) => {
            const href = `/report/detail?sku=${encodeURIComponent(item.sku)}`;
            const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
            return (
              <Link key={`${item.market}-${item.sku}`} href={href} className="block rounded-xl border border-white/[0.08] bg-[#0C1626] px-3 py-2.5">
                <div className="grid grid-cols-[52px_minmax(0,1fr)_92px] gap-2.5">
                  <SafeProductImage src={item.imageUrl} alt={item.name} className="h-[52px] w-[52px] rounded-lg" />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-slate-100">{item.name}</div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">SKU {item.sku} · {getProductCategory(item.name)}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="min-w-0 origin-left scale-[0.88]"><MarketLogo market={item.market} compact /></div>
                      <StockBadge item={item} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col items-end text-right">
                    <div className="text-[14px] font-semibold leading-5 text-white">{formatPrice(item.currentPrice)}</div>
                    <div className="mt-0.5 origin-right scale-[0.82]"><MiniSparkline values={priceHistoryMap[item.sku] ?? []} /></div>
                    <div className="mt-auto text-[10px] text-slate-400">{formatPercent(item.changePercent, hasChange)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1626] md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <thead className="bg-[#111C2D] text-left text-[10px] uppercase tracking-[0.1em] text-slate-500"><tr><th className="w-12 px-3 py-2.5">#</th><th className="px-3 py-2.5">Ürün</th><th className="px-3 py-2.5">Market</th><th className="px-3 py-2.5 text-center">Trend</th><th className="px-3 py-2.5 text-right">Önceki</th><th className="px-3 py-2.5 text-right">Güncel</th><th className="px-3 py-2.5 text-center">Değişim</th><th className="px-3 py-2.5 text-center">Durum</th><th className="w-16 px-3 py-2.5 text-center">Detay</th></tr></thead>
              <tbody>
                {items.map((item, index) => {
                  const href = `/report/detail?sku=${encodeURIComponent(item.sku)}`;
                  const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
                  const positive = hasChange && (item.changePercent ?? 0) > 0;
                  const negative = hasChange && (item.changePercent ?? 0) < 0;
                  return (
                    <tr key={`${item.market}-${item.sku}`} className={`border-t border-white/[0.055] transition hover:bg-white/[0.025] ${highlightedSet.has(item.sku) ? "bg-emerald-500/[0.05]" : index % 2 === 1 ? "bg-white/[0.012]" : ""}`}>
                      <td className="px-3 py-2 text-slate-600">{String(index + 1).padStart(2, "0")}</td>
                      <td className="px-3 py-2"><Link href={href} className="group flex min-w-[300px] items-center gap-3"><SafeProductImage src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md" /><div><div className="max-w-[390px] font-medium leading-5 text-slate-100 transition group-hover:text-blue-300">{item.name}</div><div className="text-[10px] text-slate-600">SKU {item.sku} · {getProductCategory(item.name)}</div></div></Link></td>
                      <td className="px-3 py-2"><MarketLogo market={item.market} compact /></td>
                      <td className="px-3 py-2"><div className="flex justify-center"><MiniSparkline values={priceHistoryMap[item.sku] ?? []} /></div></td>
                      <td className="px-3 py-2 text-right text-slate-500">{formatPrice(item.previousPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-100">{formatPrice(item.currentPrice)}</td>
                      <td className="px-3 py-2 text-center"><span className={`inline-flex min-w-[58px] justify-center rounded-md border px-2 py-1 text-[10px] font-semibold ${positive ? "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300" : negative ? "border-rose-400/15 bg-rose-400/[0.08] text-rose-300" : "border-white/[0.06] text-slate-500"}`}>{formatPercent(item.changePercent, hasChange)}</span></td>
                      <td className="px-3 py-2 text-center"><StockBadge item={item} /></td>
                      <td className="px-3 py-2 text-center"><Link href={href} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-blue-400/15 bg-blue-500/[0.08] text-blue-300">→</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {!items.length && <div className="rounded-xl border border-white/[0.08] bg-[#0C1626] px-4 py-10 text-center text-sm text-slate-500">Filtrelere uygun ürün bulunamadı.</div>}
      </section>
    </>
  );
}
