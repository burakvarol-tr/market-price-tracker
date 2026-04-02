import { NextResponse } from "next/server";
import { getProductsByMarket, type TrackedProduct } from "@/lib/getPrice";
import {
  readLatestPricesMap,
  saveCheckedProducts,
} from "@/lib/firestorePrices";
import { sendPriceChangeEmailByMarket } from "@/lib/sendMail";

export const dynamic = "force-dynamic";

const PRODUCTS: TrackedProduct[] = [
  {
    sku: "13002977",
    name: "Üstad %100 Organik Meyve Suyu Elma 1 L",
    market: "A101",
  },
  {
    sku: "13002976",
    name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L",
    market: "A101",
  },
  {
    sku: "13002973",
    name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L",
    market: "A101",
  },
  {
    sku: "13002152",
    name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml",
    market: "A101",
  },
  {
    sku: "13002151",
    name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml",
    market: "A101",
  },
];

export async function GET() {
  try {
    const previousMap = await readLatestPricesMap();
    const liveProducts = await getProductsByMarket(PRODUCTS);

    const { changedProducts, allSavedProducts } = await saveCheckedProducts(
      liveProducts,
      previousMap
    );

    const groupedByMarket = changedProducts.reduce<Record<string, typeof changedProducts>>(
      (acc, item) => {
        if (!acc[item.market]) {
          acc[item.market] = [];
        }
        acc[item.market].push(item);
        return acc;
      },
      {}
    );

    const mailResults = await Promise.all(
      Object.entries(groupedByMarket).map(async ([market, items]) => {
        const result = await sendPriceChangeEmailByMarket(market, items);
        return { market, count: items.length, result };
      })
    );

    return NextResponse.json({
      ok: true,
      checkedCount: allSavedProducts.length,
      changedCount: changedProducts.length,
      changedProducts,
      mailResults,
    });
  } catch (error) {
    console.error("check-prices error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}