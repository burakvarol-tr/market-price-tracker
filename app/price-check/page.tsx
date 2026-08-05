import Link from "next/link";
import PriceCheckPanel from "@/components/PriceCheckPanel";

export const dynamic = "force-dynamic";

export default function PriceCheckPage() {
  return (
    <main className="min-h-screen bg-[#08111F] text-white">
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-6">
        <section className="mb-4 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-blue-200">FİYAT KONTROLÜ</div>
              <h1 className="mt-2 text-2xl font-semibold">Marketleri şimdi kontrol et</h1>
              <p className="mt-1 text-sm text-slate-400">Sonuçlar anlaşılır bir özet halinde gösterilir.</p>
            </div>
            <Link href="/report" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Fiyat raporuna dön</Link>
          </div>
        </section>
        <PriceCheckPanel />
      </div>
    </main>
  );
}
