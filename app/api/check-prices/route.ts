import { NextResponse } from "next/server";
import { getA101Products } from "@/lib/getPrice";
import { sendPriceChangeEmail } from "@/lib/sendMail";
import {
  readPricesFromFirestore,
  savePricesToFirestore,
} from "@/lib/firestorePrices";

export async function GET() {
  try {
    const products = [
      { name: "Üstad %100 Organik Meyve Suyu Elma 1 L", sku: "13002977" },
      { name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L", sku: "13002976" },
      { name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L", sku: "13002973" },
      { name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml", sku: "13002152" },
      { name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml", sku: "13002151" },
      { name: "Dooy Karpuz Çilek Meyveli İçecek 200 ml", sku: "13002601" },
      { name: "Dooy Şeftali Kayısı Kavun Meyveli İçecek 200 ml", sku: "13002602" },
      { name: "Dooy Atom Aromalı İçecek 7x200 ml", sku: "13002902" },
      { name: "Dooy Elma Çilek Böğürtlen Aromalı İçecek 7x200 ml", sku: "13002903" },
      { name: "Dooy Elma Muz Çilek Aromalı İçecek 7x200 ml", sku: "13002900" },
      { name: "Dooy Vişne Meyve Nektarı 200 ml", sku: "13001966" },
      { name: "Dooy Kayısı Meyve Nektarı 200 ml", sku: "13001955" },
      { name: "Dooy Şeftali Meyve Nektarı 200 ml", sku: "13001960" },
      { name: "Dooy Karışık Meyve Nektarı 200 ml", sku: "13001952" },
      { name: "Dooy Vişne Meyve Nektarı 1 L", sku: "13001964" },
      { name: "Dooy Sarı Meyveli Meyve Suyu %100 6x200 ml", sku: "13002505" },
      { name: "Dooy Kayısı Meyve Nektarı 1 L", sku: "13001953" },
      { name: "Dooy Şeftali Meyve Nektarı 1 L", sku: "13001958" },
      { name: "Dooy Ananas Meyve Aromalı İçecek 1 L", sku: "13001667" },
      { name: "Dooy Karışık Meyve Nektarı 1 L", sku: "13001951" },
    ];

    const pricedProducts = await getA101Products(products);
    const oldPrices = await readPricesFromFirestore();

    const updatedPrices: Record<string, string> = {};
    const changedProducts: {
      name: string;
      sku: string;
      oldPrice: string;
      newPrice: string;
    }[] = [];

    for (const product of pricedProducts) {
      const oldPrice = oldPrices[product.sku];
      const currentPrice = product.price;

      if (oldPrice && oldPrice !== currentPrice) {
        changedProducts.push({
          name: product.name,
          sku: product.sku,
          oldPrice,
          newPrice: currentPrice,
        });
      }

      updatedPrices[product.sku] = currentPrice;
    }

    if (changedProducts.length > 0) {
      await sendPriceChangeEmail(changedProducts);
    }

    await savePricesToFirestore(updatedPrices);

    return NextResponse.json({
      ok: true,
      checkedCount: pricedProducts.length,
      changedCount: changedProducts.length,
      changedProducts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Kontrol sırasında hata oldu" },
      { status: 500 }
    );
  }
}