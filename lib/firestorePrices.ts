import { db } from "./firebaseAdmin";
import type { MarketName, LivePriceProduct } from "./getPrice";

export type PriceRecord = {
  sku: string;
  name: string;
  market: MarketName;
  currentPrice: number | null;
  previousPrice: number | null;
  changed: boolean;
  changePercent: number | null;
  inStock: boolean;
  updatedAt: string;
  source: string;
  imageUrl: string | null;
};

export type PriceHistoryRecord = {
  sku: string;
  name?: string;
  market?: MarketName;
  price: number | null;
  inStock: boolean;
  checkedAt: string;
  imageUrl?: string | null;
};

const COLLECTION_LATEST = "latest_prices";
const COLLECTION_HISTORY = "price_history";

function ensureDb() {
  if (!db) {
    throw new Error("Firestore bağlantısı yok. Env değerlerini kontrol et.");
  }
  return db;
}

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  if (value >= 1000) {
    return Number((value / 100).toFixed(2));
  }

  return Number(value.toFixed(2));
}

function calculateChangePercent(
  previousPrice: number | null,
  currentPrice: number | null
) {
  if (
    previousPrice === null ||
    currentPrice === null ||
    previousPrice === 0
  ) {
    return null;
  }

  return Number(
    (((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)
  );
}

export async function readLatestPricesMap(): Promise<Record<string, PriceRecord>> {
  const firestore = ensureDb();
  const snap = await firestore.collection(COLLECTION_LATEST).get();

  const map: Record<string, PriceRecord> = {};

  snap.forEach((doc) => {
    const data = doc.data();

    map[doc.id] = {
      sku: String(data.sku ?? doc.id),
      name: String(data.name ?? ""),
      market: (data.market ?? "A101") as MarketName,
      currentPrice: normalizePrice(data.currentPrice),
      previousPrice: normalizePrice(data.previousPrice),
      changed: Boolean(data.changed),
      changePercent:
        typeof data.changePercent === "number" ? data.changePercent : null,
      inStock: Boolean(data.inStock),
      updatedAt: String(data.updatedAt ?? ""),
      source: String(data.source ?? data.market ?? ""),
      imageUrl:
        typeof data.imageUrl === "string" && data.imageUrl.trim()
          ? data.imageUrl
          : null,
    };
  });

  return map;
}

export async function saveCheckedProducts(
  products: LivePriceProduct[],
  previousMap: Record<string, PriceRecord>
) {
  const firestore = ensureDb();
  const batch = firestore.batch();

  const nowIso = new Date().toISOString();
  const changedProducts: PriceRecord[] = [];
  const allSavedProducts: PriceRecord[] = [];

  for (const product of products) {
    const previous = previousMap[product.sku] || null;
    const previousPrice = previous?.currentPrice ?? null;
    const currentPrice = product.currentPrice ?? null;

    const changed =
      previousPrice !== null && currentPrice !== null
        ? previousPrice !== currentPrice
        : false;

    const record: PriceRecord = {
      sku: product.sku,
      name: product.name,
      market: product.market,
      currentPrice,
      previousPrice,
      changed,
      changePercent: calculateChangePercent(previousPrice, currentPrice),
      inStock: product.inStock,
      updatedAt: nowIso,
      source: product.market,
      imageUrl: product.imageUrl ?? previous?.imageUrl ?? null,
    };

    const latestRef = firestore.collection(COLLECTION_LATEST).doc(product.sku);
    batch.set(latestRef, record, { merge: true });

    const historyRef = firestore.collection(COLLECTION_HISTORY).doc();
    const historyRecord: PriceHistoryRecord = {
      sku: product.sku,
      name: product.name,
      market: product.market,
      price: currentPrice,
      inStock: product.inStock,
      checkedAt: nowIso,
      imageUrl: product.imageUrl ?? null,
    };
    batch.set(historyRef, historyRecord);

    allSavedProducts.push(record);

    if (changed) {
      changedProducts.push(record);
    }
  }

  await batch.commit();

  return {
    changedProducts,
    allSavedProducts,
  };
}

export async function getLatestPrices(options?: {
  market?: string;
}): Promise<PriceRecord[]> {
  const firestore = ensureDb();
  let query: FirebaseFirestore.Query = firestore.collection(COLLECTION_LATEST);

  if (options?.market) {
    query = query.where("market", "==", options.market);
  }

  const snap = await query.get();

  const items = snap.docs.map((doc) => {
    const data = doc.data();

    return {
      sku: String(data.sku ?? doc.id),
      name: String(data.name ?? ""),
      market: (data.market ?? "A101") as MarketName,
      currentPrice: normalizePrice(data.currentPrice),
      previousPrice: normalizePrice(data.previousPrice),
      changed: Boolean(data.changed),
      changePercent:
        typeof data.changePercent === "number" ? data.changePercent : null,
      inStock: Boolean(data.inStock),
      updatedAt: String(data.updatedAt ?? ""),
      source: String(data.source ?? data.market ?? ""),
      imageUrl:
        typeof data.imageUrl === "string" && data.imageUrl.trim()
          ? data.imageUrl
          : null,
    } as PriceRecord;
  });

  return items.sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function getLatestPriceBySku(
  sku: string
): Promise<PriceRecord | null> {
  try {
    const firestore = ensureDb();
    const doc = await firestore.collection(COLLECTION_LATEST).doc(sku).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (!data) {
      return null;
    }

    return {
      sku: String(data.sku ?? sku),
      name: String(data.name ?? ""),
      market: (data.market ?? "A101") as MarketName,
      currentPrice: normalizePrice(data.currentPrice),
      previousPrice: normalizePrice(data.previousPrice),
      changed: Boolean(data.changed),
      changePercent:
        typeof data.changePercent === "number" ? data.changePercent : null,
      inStock: Boolean(data.inStock),
      updatedAt: String(data.updatedAt ?? ""),
      source: String(data.source ?? data.market ?? ""),
      imageUrl:
        typeof data.imageUrl === "string" && data.imageUrl.trim()
          ? data.imageUrl
          : null,
    };
  } catch (error) {
    console.error("getLatestPriceBySku error:", error);
    return null;
  }
}

export async function getPriceHistoryBySku(
  sku: string
): Promise<PriceHistoryRecord[]> {
  try {
    const firestore = ensureDb();

    const snap = await firestore
      .collection(COLLECTION_HISTORY)
      .where("sku", "==", sku)
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        sku: String(data.sku ?? sku),
        name: data.name ? String(data.name) : undefined,
        market: data.market ? (data.market as MarketName) : undefined,
        price: normalizePrice(data.price),
        inStock: Boolean(data.inStock),
        checkedAt: String(data.checkedAt ?? ""),
        imageUrl:
          typeof data.imageUrl === "string" && data.imageUrl.trim()
            ? data.imageUrl
            : null,
      } as PriceHistoryRecord;
    });

    return items.sort(
      (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    );
  } catch (error) {
    console.error("getPriceHistoryBySku error:", error);
    return [];
  }
}