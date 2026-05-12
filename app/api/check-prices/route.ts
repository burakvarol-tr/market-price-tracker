import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { getProductsByMarket } from "@/lib/getPrice";
import {
  readLatestPricesMap,
  saveCheckedProducts,
} from "@/lib/firestorePrices";
import { sendPriceChangeEmailByMarket } from "@/lib/sendMail";

export const dynamic = "force-dynamic";

function buildMarketReportUrl(market: string, skus: string[]) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://market-price-tracker-gold.vercel.app";

  const query = new URLSearchParams();

  if (market) {
    query.set("market", market);
  }

  if (skus.length > 0) {
    query.set("changed", skus.join(","));
  }

  return `${baseUrl}/report?${query.toString()}`;
}

export async function GET() {
  try {
    const previousMap = await readLatestPricesMap();
    const liveProducts = await getProductsByMarket(PRODUCTS);

    const { changedProducts, allSavedProducts } = await saveCheckedProducts(
      liveProducts,
      previousMap
    );

    const groupedByMarket = changedProducts.reduce<
      Record<string, typeof changedProducts>
    >((acc, item) => {
      if (!acc[item.market]) {
        acc[item.market] = [];
      }

      acc[item.market].push(item);
      return acc;
    }, {});

    const mailResults = await Promise.all(
      Object.entries(groupedByMarket).map(async ([market, items]) => {
        const reportUrl = buildMarketReportUrl(
          market,
          items.map((item) => item.sku)
        );

        const result = await sendPriceChangeEmailByMarket(
          market,
          items,
          reportUrl
        );

        return {
          market,
          changedCount: items.length,
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
          reportUrl: string;
        }
      >
    >((acc, item) => {
      if (!acc[item.market]) {
        acc[item.market] = {
          market: item.market,
          total: 0,
          changedCount: 0,
          reportUrl: buildMarketReportUrl(item.market, []),
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
      liveProducts,
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