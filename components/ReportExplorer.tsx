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
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function compareNullableNumber(a: number | null, b: number | null, direction: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * direction;
}

export default function ReportExplorer({
  initialItems,
  initialMarket = "",
  highlightedSkus = [],
}: Props) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState(initialMarket);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [onlyWithoutImage, setOnlyWithoutImage] = useState(false);
  const [sort, setSort] = useState<SortKey>("market");

  const highlightedSet = useMemo(() => new Set(highlightedSkus), [highlightedSkus]);
  const markets = useMemo(
    () => Array.from(new Set(initialItems.map((item) => item.market))),
    [initialItems]
  );

  const items = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    const filtered = initialItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLocaleLowerCase("tr-TR").includes(normalizedQuery) ||
        item.sku.toLocaleLowerCase("tr-TR").includes(normalizedQuery);

      const hasChange =
        item.previousPrice !== null && item.previousPrice !== item.currentPrice;

      return (
        matchesQuery &&
        (!market || item.market === market) &&
        (!onlyChanged || hasChange) &&
        (!onlyOutOfStock || !item.inStock) &&
        (!onlyWithoutImage || !item.imageUrl)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "tr");
      if (sort === "price-asc") return compareNullableNumber(a.currentPrice, b.currentPrice, 1);
      if (sort === "price-desc") return compareNullableNumber(a.currentPrice, b.currentPrice, -1);
      if (sort === "change-desc") return compareNullableNumber(a.changePercent, b.changePercent, -1);
      if (sort === "updated-desc") {
        return new Date(b.lastCheckedAt ?? b.updatedAt).getTime() - new Date(a.lastCheckedAt ?? a.updatedAt).getTime();
      }

      if (a.market !== b.market) return a.market.localeCompare(b.market, "tr");
      return a.name.localeCompare(b.name, "tr");
    });
  }, [initialItems, market, onlyChanged, onlyOutOfStock, onlyWithoutImage, query, sort]);

  const changedCount = items.filter(
    (item) => item.previousPrice !== null && item.previousPrice !== item.currentPrice
  ).length;

  const outOfStockCount = items.filter((item) => !item.inStock).length;

  return (
    <>
      <section className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
        {[
          ["Gösterilen Ürün", items.length],
          ["Değişen", changedCount],
          ["Stok Dışı", outOfStockCount],
          ["Market", market || "Tümü"],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 md:rounded-[26px] md:p-6"
          >
            <div className="text-xs text-slate-400 md:text-sm">{label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] md:mt-3 md:text-4xl">
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-7 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 md:p-6">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ürün adı veya SKU ara"
            className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/40"
          />

          <select
            value={market}
            onChange={(event) => setMarket(event.target.value)}
            className="h-12 rounded-2xl border border-white/10 bg-[#101B2E] px-4 text-sm text-white outline-none"
          >
            <option value="">Tüm marketler</option>
            {markets.map((marketItem) => (
              <option key={marketItem} value={marketItem}>
                {marketItem}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-12 rounded-2xl border border-white/10 bg-[#101B2E] px-4 text-sm text-white outline-none"
          >
            <option value="market">Markete göre</option>
            <option value="name">Ürün adına göre</option>
            <option value="price-asc">Fiyat: düşükten yükseğe</option>
            <option value="price-desc">Fiyat: yüksekten düşüğe</option>
            <option value="change-desc">Değişim yüzdesine göre</option>
            <option value="updated-desc">Son güncellenene göre</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["Sadece değişenler", onlyChanged, setOnlyChanged],
            ["Sadece stok dışı", onlyOutOfStock, setOnlyOutOfStock],
            ["Görseli olmayanlar", onlyWithoutImage, setOnlyWithoutImage],
          ].map(([label, active, setter]) => (
            <button
              key={String(label)}
              type="button"
              onClick={() => (setter as (value: boolean) => void)(!(active as boolean))}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Ürün Listesi</h2>
          <p className="mt-1 text-sm text-slate-400">Güncel fiyatlar, ürün görselleri ve değişim görünümü</p>
        </div>

        <div className="space-y-2 md:hidden">
          {items.map((item) => {
            const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
            const changePositive = hasChange && (item.changePercent ?? 0) > 0;
            const changeNegative = hasChange && (item.changePercent ?? 0) < 0;

            return (
              <Link
                key={`${item.market}-${item.sku}`}
                href={`/report/detail?sku=${encodeURIComponent(item.sku)}`}
                className={`block rounded-2xl border border-white/10 px-3 py-3 transition active:scale-[0.99] ${
                  highlightedSet.has(item.sku) ? "bg-emerald-500/[0.08]" : "bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <SafeProductImage src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-xl" />
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-[13px] font-semibold leading-5 text-white">{item.name}</div>
                      <div className="mt-1 text-[10px] text-slate-500">SKU: {item.sku}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <MarketLogo market={item.market} compact />
                        <span className={`rounded-full px-2 py-[3px] text-[10px] font-semibold ${item.inStock ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                          {item.inStock ? "Stokta" : "Stok yok"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-white">{formatPrice(item.currentPrice)}</div>
                    <div className="mt-1 text-[11px] text-slate-500">Eski: {formatPrice(item.previousPrice)}</div>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-[3px] text-[10px] font-semibold ${changePositive ? "bg-emerald-400/10 text-emerald-300" : changeNegative ? "bg-rose-400/10 text-rose-300" : "bg-slate-400/10 text-slate-400"}`}>
                      {formatPercent(item.changePercent, hasChange)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">#</th>
                  <th className="px-5 py-4 font-semibold">Ürün</th>
                  <th className="px-5 py-4 font-semibold">Market</th>
                  <th className="px-5 py-4 font-semibold">Eski Fiyat</th>
                  <th className="px-5 py-4 font-semibold">Yeni Fiyat</th>
                  <th className="px-5 py-4 font-semibold">Değişim</th>
                  <th className="px-5 py-4 font-semibold">Stok</th>
                  <th className="px-5 py-4 font-semibold">Detay</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const hasChange = item.previousPrice !== null && item.previousPrice !== item.currentPrice;
                  const changePositive = hasChange && (item.changePercent ?? 0) > 0;
                  const changeNegative = hasChange && (item.changePercent ?? 0) < 0;

                  return (
                    <tr key={`${item.market}-${item.sku}`} className={`border-t border-white/10 transition hover:bg-white/[0.03] ${highlightedSet.has(item.sku) ? "bg-emerald-500/[0.06]" : ""}`}>
                      <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[320px] items-center gap-4">
                          <SafeProductImage src={item.imageUrl} alt={item.name} />
                          <div className="min-w-0">
                            <div className="max-w-[360px] font-medium leading-6 text-white">{item.name}</div>
                            <div className="mt-1 text-xs text-slate-500">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><MarketLogo market={item.market} /></td>
                      <td className="px-5 py-4 text-slate-400">{formatPrice(item.previousPrice)}</td>
                      <td className="px-5 py-4 font-semibold">{formatPrice(item.currentPrice)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${changePositive ? "bg-emerald-400/10 text-emerald-300" : changeNegative ? "bg-rose-400/10 text-rose-300" : "bg-slate-400/10 text-slate-400"}`}>
                          {formatPercent(item.changePercent, hasChange)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.inStock ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                          {item.inStock ? "Var" : "Yok"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/report/detail?sku=${encodeURIComponent(item.sku)}`} className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 font-semibold text-blue-300 transition hover:bg-blue-500/20">
                          Aç
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!items.length && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-slate-400">
            Filtrelere uygun ürün bulunamadı.
          </div>
        )}
      </section>
    </>
  );
}
