"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Product = {
  name: string;
  sku: string;
  oldPrice?: number;
  newPrice: number;
};

const products: Product[] = [
  { name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml", sku: "13002151", oldPrice: 9.5, newPrice: 10.5 },
  { name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml", sku: "13002152", oldPrice: 10.5, newPrice: 10.5 },
  { name: "Üstad %100 Organik Meyve Suyu Elma 1 L", sku: "13002977", oldPrice: 109, newPrice: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L", sku: "13002973", oldPrice: 119, newPrice: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L", sku: "13002976", oldPrice: 119, newPrice: 119 },
];

export default function ReportPage() {
  const searchParams = useSearchParams();

  const changedSet = useMemo(() => {
    const param = searchParams.get("changed");
    if (!param) return new Set<string>();
    return new Set(param.split(","));
  }, [searchParams]);

  useEffect(() => {
    if (changedSet.size === 0) return;

    changedSet.forEach((sku) => {
      const el = document.getElementById(`row-${sku}`);
      if (el) {
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 3000);
      }
    });
  }, [changedSet]);

  const getPercent = (oldP?: number, newP?: number) => {
    if (!oldP || !newP) return null;
    return (((newP - oldP) / oldP) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-transparent">
          <h1 className="text-xl font-semibold">Fiyat Değişim Paneli</h1>
          <p className="text-xs text-gray-300">
            Değişen ürünler otomatik vurgulanır
          </p>
        </div>

        {/* TABLE */}
        <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-[#0f172a] text-gray-400 text-xs">
              <tr>
                <th className="text-left p-3">Ürün</th>
                <th className="p-3">Eski</th>
                <th className="p-3">Yeni</th>
                <th className="p-3">Değişim</th>
                <th className="p-3">Detay</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const percent = getPercent(p.oldPrice, p.newPrice);
                const isUp = percent && Number(percent) > 0;

                return (
                  <tr
                    key={p.sku}
                    id={`row-${p.sku}`}
                    className="border-t border-gray-700 hover:bg-[#1f2937] transition"
                  >
                    <td className="p-3">{p.name}</td>

                    <td className="text-center text-gray-400">
                      {p.oldPrice ? p.oldPrice.toFixed(2) + " ₺" : "-"}
                    </td>

                    <td className="text-center font-semibold">
                      {isUp ? "▲ " : percent ? "▼ " : ""}
                      {p.newPrice.toFixed(2)} ₺
                    </td>

                    <td className="text-center">
                      {percent ? (
                        <span className={isUp ? "text-green-400" : "text-red-400"}>
                          %{percent}
                        </span>
                      ) : "-"}
                    </td>

                    <td className="text-center">
                      <Link href={`/report/${p.sku}`} className="text-blue-400">
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

      {/* FLASH */}
      <style jsx>{`
        .flash {
          animation: flashBg 3s ease;
        }

        @keyframes flashBg {
          0% {
            background: rgba(59, 130, 246, 0.4);
          }
          100% {
            background: transparent;
          }
        }
      `}</style>
    </div>
  );
}