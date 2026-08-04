import Link from "next/link";
import { getLatestPrices } from "@/lib/firestorePrices";
import ReportExplorer from "@/components/ReportExplorer";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{
    market?: string;
    changed?: string;
  }>;
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
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <section className="mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,#1D4ED820,transparent_35%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] p-6 shadow-2xl md:mb-8 md:rounded-[32px] md:p-10">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-blue-200 md:text-xs">
              RETAIL PRICE MONITORING
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-6xl">
              Fiyat raporu
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-300 md:text-lg md:leading-8">
              Ürünleri arayın, markete ve stok durumuna göre filtreleyin; fiyat değişimlerini tek ekranda karşılaştırın.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Ana sayfaya dön
              </Link>

              <Link
                href="/api/check-prices"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Fiyat kontrolünü çalıştır
              </Link>
            </div>
          </div>
        </section>

        <ReportExplorer
          initialItems={allItems}
          initialMarket={market}
          highlightedSkus={highlightedSkus}
        />
      </div>
    </main>
  );
}
