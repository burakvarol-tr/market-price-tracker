import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import ReportExplorer from "@/components/ReportExplorer";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ market?: string; changed?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const market = resolved?.market || "";
  const highlightedSkus = (resolved?.changed || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const allItems = await getLatestPrices();

  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-5">
        <section className="mb-4 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] px-5 py-4 shadow-xl md:px-6 md:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-200">
                RETAIL PRICE MONITORING
              </div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Fiyat raporu</h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-300">
                Ürünleri arayın, filtreleyin ve fiyat değişimlerini tek ekranda karşılaştırın.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">Ana sayfa</Link>
              <Link href="/report/analysis" className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20">Analiz paneli</Link>
              <Link href="/api/check-prices" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10">Fiyat kontrolü</Link>
            </div>
          </div>
        </section>

        <ReportExplorer initialItems={allItems} initialMarket={market} highlightedSkus={highlightedSkus} />
      </div>
    </main>
  );
}
