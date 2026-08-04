import { getLatestPrices } from "@/lib/firestorePrices";
import ReportExplorer from "@/components/ReportExplorer";
import DashboardHeader from "@/components/DashboardHeader";

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
    <main className="min-h-screen bg-[#07101D] text-white">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 md:py-5">
        <DashboardHeader
          eyebrow="PERAKENDE FİYAT İZLEME"
          title="Fiyat raporu"
          description="Ürünleri arayın, market ve durum bazında filtreleyin; güncel fiyatları tek ekranda karşılaştırın."
          navItems={[
            { href: "/", label: "Ana sayfa", tone: "primary" },
            { href: "/report/analysis", label: "Analiz paneli", tone: "success" },
            { href: "/price-check", label: "Fiyat kontrolü", tone: "neutral" },
          ]}
        />

        <ReportExplorer
          initialItems={allItems}
          initialMarket={market}
          highlightedSkus={highlightedSkus}
        />
      </div>
    </main>
  );
}
