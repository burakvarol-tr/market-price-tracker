import { NextResponse } from "next/server";
import { getProductsByMarket, type TrackedProduct } from "@/lib/getPrice";
import {
  createChangeEvent,
  readLatestPricesMap,
  saveCheckedProducts,
} from "@/lib/firestorePrices";
import { sendPriceChangeEmailByMarket } from "@/lib/sendMail";

export const dynamic = "force-dynamic";

const PRODUCTS: TrackedProduct[] = [
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
  {
    sku: "13002601",
    name: "Dooy Karpuz Çilek Meyveli İçecek 200 ml",
    market: "A101",
  },
  {
    sku: "13001966",
    name: "Dooy Vişne Meyve Nektarı 200 ml",
    market: "A101",
  },
  {
    sku: "13001960",
    name: "Dooy Şeftali Meyve Nektarı 200 ml",
    market: "A101",
  },
  {
    sku: "13001952",
    name: "Dooy Karışık Meyve Nektarı 200 ml",
    market: "A101",
  },
  {
    sku: "13001955",
    name: "Dooy Kayısı Meyve Nektarı 200 ml",
    market: "A101",
  },
  {
    sku: "13001964",
    name: "Dooy Vişne Meyve Nektarı 1 L",
    market: "A101",
  },
  {
    sku: "13001953",
    name: "Dooy Kayısı Meyve Nektarı 1 L",
    market: "A101",
  },
  {
    sku: "13001958",
    name: "Dooy Şeftali Meyve Nektarı 1 L",
    market: "A101",
  },
  {
    sku: "13001667",
    name: "Dooy Ananas Meyve Aromalı İçecek 1 L",
    market: "A101",
  },
  {
    sku: "13001951",
    name: "Dooy Karışık Meyve Nektarı 1 L",
    market: "A101",
  },
  {
    sku: "13002505",
    name: "Dooy Sarı Meyveli Meyve Suyu %100 6x200 ml",
    market: "A101",
  },
  {
    sku: "13002974",
    name: "Üstad Organik %100 Portakal Suyu 1 L",
    market: "A101",
  },
];

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://market-price-tracker-gold.vercel.app"
  );
}

function buildEventReportUrl(eventId: string) {
  return `${getBaseUrl()}/report/event?eventId=${encodeURIComponent(eventId)}`;
}

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
        const eventId = await createChangeEvent(market, items);
        const reportUrl = buildEventReportUrl(eventId);

        const result = await sendPriceChangeEmailByMarket(
          market,
          items,
          reportUrl
        );

        return {
          market,
          changedCount: items.length,
          eventId,
          reportUrl,
          mailResult: result,
        };
      })
    );

    const summaryByMarket = allSavedProducts.reduce<
      Record<
        string,
        {
          market: string;
          total: number;
          changedCount: number;
        }
      >
    >((acc, item) => {
      if (!acc[item.market]) {
        acc[item.market] = {
          market: item.market,
          total: 0,
          changedCount: 0,
        };
      }

      acc[item.market].total += 1;

      if (item.changed) {
        acc[item.market].changedCount += 1;
      }

      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      checkedCount: allSavedProducts.length,
      changedCount: changedProducts.length,
      changedProducts,
      markets: Object.values(summaryByMarket),
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