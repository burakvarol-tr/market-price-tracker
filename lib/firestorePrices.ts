// @ts-nocheck
import { db } from "@/lib/firebaseAdmin";

export type ProductPrice = {
  sku: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  priceText?: string | null;
  discountedPriceText?: string | null;
  url?: string | null;
};

export type ProductHistoryItem = {
  id: string;
  sku?: string;
  name?: string;
  price?: number | null;
  discountedPrice?: number | null;
  priceText?: string | null;
  discountedPriceText?: string | null;
  url?: string | null;
  checkedAt?: string | null;
};

export type ProductWithHistory = {
  sku: string;
  name: string;
  url?: string | null;
  lastPrice?: number | null;
  lastDiscountedPrice?: number | null;
  updatedAt?: string | null;
  lastChangedAt?: string | null;
  latest: ProductHistoryItem | null;
  previous: ProductHistoryItem | null;
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
  const now = new Date().toISOString();

  for (const product of products) {
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(product.sku);
    const existingDoc = await productRef.get();
    const existingData = existingDoc.exists ? existingDoc.data() : null;

    const oldPrice =
      existingData && typeof existingData.lastPrice === "number"
        ? existingData.lastPrice
        : null;

    const isPriceChanged =
      oldPrice !== null && typeof product.price === "number" && oldPrice !== product.price;

    const lastChangedAt = isPriceChanged
      ? now
      : existingData?.lastChangedAt ?? null;

    await productRef.set(
      {
        sku: product.sku,
        name: product.name,
        lastPrice: product.price,
        lastDiscountedPrice: product.discountedPrice ?? null,
        priceText: product.priceText ?? null,
        discountedPriceText: product.discountedPriceText ?? null,
        url: product.url ?? null,
        updatedAt: now,
        lastChangedAt,
      },
      { merge: true }
    );

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

export async function getProductHistory(
  sku: string
): Promise<{
  product: Record<string, any>;
  history: ProductHistoryItem[];
} | null> {
  const productRef = db.collection(PRODUCTS_COLLECTION).doc(sku);
  const productDoc = await productRef.get();

  if (!productDoc.exists) {
    return null;
  }

  const productData = productDoc.data() || {};

  const historySnapshot = await productRef
    .collection("history")
    .orderBy("checkedAt", "desc")
    .get();

  const history: ProductHistoryItem[] = historySnapshot.docs.map((doc) => {
    const data = doc.data() as Omit<ProductHistoryItem, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });

  return {
    product: productData,
    history,
  };
}

export async function getAllProductsWithHistory(): Promise<ProductWithHistory[]> {
  const snapshot = await db
    .collection(PRODUCTS_COLLECTION)
    .orderBy("name", "asc")
    .get();

  const items: ProductWithHistory[] = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const product = doc.data() || {};

      const historySnapshot = await doc.ref
        .collection("history")
        .orderBy("checkedAt", "desc")
        .limit(2)
        .get();

      const history: ProductHistoryItem[] = historySnapshot.docs.map((h) => {
        const data = h.data() as Omit<ProductHistoryItem, "id">;
        return {
          id: h.id,
          ...data,
        };
      });

      const latest = history[0] ?? null;
      const previous = history[1] ?? null;

      return {
        sku: product?.sku ?? doc.id,
        name: product?.name ?? "İsimsiz ürün",
        url: product?.url ?? null,
        lastPrice: product?.lastPrice ?? null,
        lastDiscountedPrice: product?.lastDiscountedPrice ?? null,
        updatedAt: product?.updatedAt ?? null,
        lastChangedAt: product?.lastChangedAt ?? null,
        latest,
        previous,
      };
    })
  );

  return items;
}