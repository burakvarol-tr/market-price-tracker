"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PriceRecord } from "@/lib/firestorePrices";
import SafeProductImage from "./SafeProductImage";
import MarketLogo from "./MarketLogo";

type SortKey = "market" | "name" | "price-asc" | "price-desc" | "change-desc" | "updated-desc";

type Props = {
  initialItems: PriceRecord[];
  initialMarket?: string;
  highlightedSkus?: string[];
};

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value: number | null, changed: boolean) {
  if (!changed || value === null || Number.isNaN(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
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
    return <span className="inline-flex rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">Okunamadı</span>;
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.inStock ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
      {item.inStock ? "Var" : "Yok"}
    </span>
  );
}

export default function ReportExplorer({ initialItems, initialMarket = "", highlightedSkus = [] }: Props) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState(initialMarket);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [onlyUnreadable, setOnlyUnreadable] = useState(false);
  const [onlyWithoutImage, setOnlyWithoutImage] = useState(false);
  const [sort, setSort] = useState<SortKey>("market");

  const highlightedSet = useMemo(() => new Set(highlightedSkus), [highlightedSkus]);
  const markets = useMemo(() => Array.from(new Set(initialItems.map((item) => item.market))), [initialItems]);

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = initialItems.filter((item) => {
      const matchesQuery = !normalizedQuery || item.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery) || item.sku.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
      const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
      return matchesQuery && (!market || item.market === market) && (!onlyChanged || hasChange) && (!onlyOutOfStock || isOutOfStock(item)) && (!onlyUnreadable || isUnreadable(item)) && (!onlyWithoutImage || !item.imageUrl);
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
  }, [initialItems, market, onlyChanged, onlyOutOfStock, onlyUnreadable, onlyWithoutImage, query, sort]);

  const changedCount = items.filter((item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice).length;
  const outOfStockCount = items.filter(isOutOfStock).length;
  const unreadableCount = items.filter(isUnreadable).length;

  const filterButtons = [
    { label: "Değişenler", active: onlyChanged, toggle: () => setOnlyChanged((v) => !v) },
    { label: "Stok dışı", active: onlyOutOfStock, toggle: () => setOnlyOutOfStock((v) => !v) },
    { label: "Okunamayan", active: onlyUnreadable, toggle: () => setOnlyUnreadable((v) => !v) },
    { label: "Görselsiz", active: onlyWithoutImage, toggle: () => setOnlyWithoutImage((v) => !v) },
  ];

  return (
    <>
      <section className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {[["Ürün", items.length], ["Değişen", changedCount], ["Stok Dışı", outOfStockCount], ["Okunamayan", unreadableCount], ["Market", market || "Tümü"]].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-[11px] text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-semibold tracking-[-0.03em]">{value}</div>
          </div>
        ))}
      </section>

      <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="grid gap-2 lg:grid-cols-[1.5fr_0.75fr_0.85fr]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün adı veya SKU ara" className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/40" />
          <select value={market} onChange={(e) => setMarket(e.target.value)} className="h-10 rounded-xl border border-white/10 bg-[#101B2E] px-3 text-sm text-white outline-none">
            <option value="">Tüm marketler</option>
            {markets.map((marketItem) => <option key={marketItem} value={marketItem}>{marketItem}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-xl border border-white/10 bg-[#101B2E] px-3 text-sm text-white outline-none">
            <option value="market">Markete göre</option><option value="name">Ürün adına göre</option><option value="price-asc">Fiyat artan</option><option value="price-desc">Fiyat azalan</option><option value="change-desc">Değişim oranı</option><option value="updated-desc">Son güncelleme</option>
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {filterButtons.map((filter) => <button key={filter.label} type="button" onClick={filter.toggle} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${filter.active ? "border-blue-500 bg-blue-600 text-white" : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`}>{filter.label}</button>)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div><h2 className="text-xl font-semibold">Ürün Listesi</h2><p className="mt-0.5 text-xs text-slate-400">Güncel fiyat ve değişim görünümü</p></div>
          <div className="text-xs text-slate-500">{items.length} kayıt</div>
        </div>

        <div className="space-y-2 md:hidden">
          {items.map((item) => {
            const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
            return (
              <Link key={`${item.market}-${item.sku}`} href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className={`block rounded-xl border border-white/10 px-3 py-2.5 ${highlightedSet.has(item.sku) ? "bg-emerald-500/[0.08]" : "bg-white/[0.03]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5"><SafeProductImage src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg" /><div className="min-w-0"><div className="line-clamp-2 text-[13px] font-semibold">{item.name}</div><div className="mt-0.5 text-[10px] text-slate-500">SKU: {item.sku}</div><div className="mt-1.5 flex gap-2"><MarketLogo market={item.market} compact /><StockBadge item={item} /></div></div></div>
                  <div className="shrink-0 text-right"><div className="text-sm font-semibold">{formatPrice(item.currentPrice)}</div><div className="mt-0.5 text-[10px] text-slate-500">{formatPrice(item.previousPrice)}</div><div className="mt-1 text-[10px] text-slate-400">{formatPercent(item.changePercent, hasChange)}</div></div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] md:block">
          <div className="overflow-x-auto"><table className="min-w-full text-[13px]">
            <thead className="bg-white/[0.04] text-left text-xs text-slate-400"><tr><th className="px-3 py-2.5">#</th><th className="px-3 py-2.5">Ürün</th><th className="px-3 py-2.5">Market</th><th className="px-3 py-2.5">Eski</th><th className="px-3 py-2.5">Yeni</th><th className="px-3 py-2.5">Değişim</th><th className="px-3 py-2.5">Durum</th><th className="px-3 py-2.5">Detay</th></tr></thead>
            <tbody>{items.map((item, index) => {
              const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
              const positive = hasChange && (item.changePercent ?? 0) > 0;
              const negative = hasChange && (item.changePercent ?? 0) < 0;
              return <tr key={`${item.market}-${item.sku}`} className={`border-t border-white/10 hover:bg-white/[0.03] ${highlightedSet.has(item.sku) ? "bg-emerald-500/[0.06]" : ""}`}>
                <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                <td className="px-3 py-2.5"><div className="flex min-w-[280px] items-center gap-3"><SafeProductImage src={item.imageUrl} alt={item.name} className="h-11 w-11 rounded-lg" /><div><div className="max-w-[390px] font-medium leading-5">{item.name}</div><div className="text-[11px] text-slate-500">SKU: {item.sku}</div></div></div></td>
                <td className="px-3 py-2.5"><MarketLogo market={item.market} compact /></td><td className="px-3 py-2.5 text-slate-400">{formatPrice(item.previousPrice)}</td><td className="px-3 py-2.5 font-semibold">{formatPrice(item.currentPrice)}</td>
                <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${positive ? "bg-emerald-400/10 text-emerald-300" : negative ? "bg-rose-400/10 text-rose-300" : "bg-slate-400/10 text-slate-400"}`}>{formatPercent(item.changePercent, hasChange)}</span></td>
                <td className="px-3 py-2.5"><StockBadge item={item} /></td><td className="px-3 py-2.5"><Link href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">Aç</Link></td>
              </tr>;
            })}</tbody>
          </table></div>
        </div>

        {!items.length && <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">Filtrelere uygun ürün bulunamadı.</div>}
      </section>
    </>
  );
}
