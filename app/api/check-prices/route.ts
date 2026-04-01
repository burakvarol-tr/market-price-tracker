import { NextResponse } from "next/server";
import { getA101Products } from "@/lib/getPrice";
import { sendPriceChangeEmail } from "@/lib/sendMail";
import {
  readPricesFromFirestore,
  savePricesToFirestore,
} from "@/lib/firestorePrices";

export async function GET() {
  try {
    const products = await getA101Products([
      {
        sku: "13002977",
        name: "Üstad %100 Organik Meyve Suyu Elma 1 L",
        url: "https://www.a101.com.tr/icecek/ustad-100-organik-meyve-suyu-elma-1-l-p-13002977",
      },
      {
        sku: "13002976",
        name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L",
        url: "https://www.a101.com.tr/icecek/ustad-100-organik-meyve-suyu-sari-meyve-1-l-p-13002976",
      },
      {
        sku: "13002973",
        name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L",
        url: "https://www.a101.com.tr/icecek/ustad-100-organik-meyve-suyu-kirmizi-meyve-1-l-p-13002973",
      },
      {
        sku: "13002152",
        name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml",
        url: "https://www.a101.com.tr/icecek/dooy-sihirli-ejderha-meyveli-icecek-200-ml-p-13002152",
      },
      {
        sku: "13002151",
        name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml",
        url: "https://www.a101.com.tr/icecek/dooy-safari-meyveleri-meyveli-icecek-200-ml-p-13002151",
      },

      // Buraya diğer ürünlerini aynı yapıda ekleyebilirsin
      // {
      //   sku: "xxxxx",
      //   name: "Ürün adı",
      //   url: "https://www.a101.com.tr/....",
      // },
    ]);

    const oldPrices = await readPricesFromFirestore();

    const changedProducts = products
      .filter((product) => {
        const oldPrice = oldPrices[product.sku];
        return typeof oldPrice === "number" && oldPrice !== product.price;
      })
      .map((product) => ({
        sku: product.sku,
        name: product.name,
        oldPrice: oldPrices[product.sku],
        newPrice: product.price,
      }));

    await savePricesToFirestore(products);

    if (changedProducts.length > 0) {
      await sendPriceChangeEmail(changedProducts);
    }

    return NextResponse.json({
      ok: true,
      checkedCount: products.length,
      changedCount: changedProducts.length,
      changedProducts,
    });
  } catch (error: any) {
    console.error("CHECK_PRICES_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Kontrol sırasında hata oldu",
        stack:
          process.env.NODE_ENV === "development" ? error?.stack || null : undefined,
      },
      { status: 500 }
    );
  }
}