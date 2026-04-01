import { db } from "@/lib/firebaseAdmin";

export type ProductPrice = {
  sku: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  priceText?: string;
  discountedPriceText?: string;
  url?: string;
};

const PRODUCTS_COLLECTION = "products";

export async function readPricesFromFirestore(): Promise<Record<string, number>> {
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();

  const prices: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data?.sku && typeof data?.lastPrice === "number") {
      prices[data.sku] = data.lastPrice;
    }
  });

  return prices;
}

export async function savePricesToFirestore(products: ProductPrice[]) {
  const batch = db.batch();
  const now = new Date().toISOString();

  for (const product of products) {
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(product.sku);

    batch.set(
      productRef,
      {
        sku: product.sku,
        name: product.name,
        lastPrice: product.price,
        lastDiscountedPrice: product.discountedPrice ?? null,
        priceText: product.priceText ?? null,
        discountedPriceText: product.discountedPriceText ?? null,
        url: product.url ?? null,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();

  for (const product of products) {
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(product.sku);

    await productRef.collection("history").add({
      sku: product.sku,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice ?? null,
      priceText: product.priceText ?? null,
      discountedPriceText: product.discountedPriceText ?? null,
      url: product.url ?? null,
      checkedAt: now,
    });
  }
}

export async function getProductHistory(sku: string) {
  const productRef = db.collection(PRODUCTS_COLLECTION).doc(sku);
  const productDoc = await productRef.get();

  if (!productDoc.exists) {
    return null;
  }

  const productData = productDoc.data();

  const historySnapshot = await productRef
    .collection("history")
    .orderBy("checkedAt", "desc")
    .get();

  const history = historySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    product: productData,
    history,
  };
}