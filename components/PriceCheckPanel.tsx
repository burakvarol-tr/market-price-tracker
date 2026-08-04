"use client";

import Link from "next/link";
import { useState } from "react";

type MarketResult = {
  market: string;
  total: number;
  changedCount: number;
};

type CheckResult = {
  ok: boolean;
  checkedCount: number;
  changedCount: number;
  markets: MarketResult[];
};

export default function PriceCheckPanel() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  async function runCheck() {
    setStatus("running");
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/check-prices", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || `Kontrol başarısız: ${response.status}`);
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Manuel fiyat kontrolü</h2>
          <p className="mt-1 text-sm text-slate-400">Tüm marketlerdeki ürün fiyatlarını ve stok durumunu şimdi kontrol eder.</p>
        </div>
        <button
          type="button"
          onClick={runCheck}
          disabled={status === "running"}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "running" ? "Kontrol ediliyor..." : "Kontrolü başlat"}
        </button>
      </div>

      {status === "idle" && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
          Kontrol başlatıldığında sonuçlar teknik JSON yerine burada özet olarak gösterilir.
        </div>
      )}

      {status === "running" && (
        <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-500/[0.06] p-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
          </div>
          <p className="mt-3 text-sm text-blue-200">Marketler kontrol ediliyor. Bu işlem birkaç saniye sürebilir.</p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4 text-sm text-rose-200">
          Kontrol tamamlanamadı: {error}
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-400">Kontrol edilen</div><div className="mt-1 text-2xl font-semibold">{result.checkedCount}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-400">Yeni değişiklik</div><div className="mt-1 text-2xl font-semibold text-emerald-300">{result.changedCount}</div></div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-slate-400">Durum</div><div className="mt-1 text-2xl font-semibold text-emerald-300">Tamamlandı</div></div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-slate-400"><tr><th className="px-4 py-3">Market</th><th className="px-4 py-3">Ürün</th><th className="px-4 py-3">Değişen</th></tr></thead>
              <tbody>
                {result.markets.map((item) => (
                  <tr key={item.market} className="border-t border-white/10"><td className="px-4 py-3 font-semibold">{item.market}</td><td className="px-4 py-3">{item.total}</td><td className="px-4 py-3">{item.changedCount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/report" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold">Raporu aç</Link>
            <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Ana sayfa</Link>
          </div>
        </div>
      )}
    </div>
  );
}
