import { db } from "./firebaseAdmin";
import type { MarketName, LivePriceProduct } from "./getPrice";
import { getFixedProductImage } from "./productImages";

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
  lastCheckedAt?: string;
  lastChangedAt?: string | null;
  source: string;
  imageUrl: string | null;
};

export type PriceHistoryRecord = {
  sku: string;
  name?: string;
  market?: MarketName;
  price: number | null;
  previousPrice?: number | null;
  changePercent?: number | null;
  inStock: boolean;
  checkedAt: string;
  imageUrl?: string | null;
  eventType?:
    | "initial"
    | "price_changed"
    | "stock_changed"
    | "price_and_stock_changed";
};

export type ChangeEventItem = {
  sku: string;
  name: string;
  market: MarketName;
  previousPrice: number | null;
  currentPrice: number | null;
  changePercent: number | null;
  inStock: boolean;
  checkedAt: string;
};

export type ChangeEventRecord = {
  id: string;
  market: string;
  createdAt: string;
  itemCount: number;
  items: ChangeEventItem[];
};

const COLLECTION_LATEST = "latest_prices";
const COLLECTION_HISTORY = "price_history";
const COLLECTION_CHANGE_EVENTS = "change_events";

const MAX_REASONABLE_CHANGE_PERCENT = 300;

function ensureDb() {
  if (!db) {
    throw new Error("Firestore bağlantısı yok. Env değerlerini kontrol et.");
  }

  return db;
}

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    if (Number.isNaN(value)) return null;

    if (value >= 1000) {
      return Number((value / 100).toFixed(2));
    }

    return Number(value.toFixed(2));
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(",", ".").trim());

    if (Number.isNaN(normalized)) return null;

    if (normalized >= 1000) {
      return Number((normalized / 100).toFixed(2));
    }

    return Number(normalized.toFixed(2));
  }

  return null;
}

function calculateChangePercent(
  previousPrice: number | null,
  currentPrice: number | null
) {
  if (previousPrice === null || currentPrice === null || previousPrice === 0) {
    return null;
  }

  return Number(
    (((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)
  );
}

function isSuspiciousPriceChange(changePercent: number | null) {
  if (changePercent === null) return false;
  return Math.abs(changePercent) > MAX_REASONABLE_CHANGE_PERCENT;
}

function resolveImageUrl(sku: string, incoming?: string | null) {
  if (incoming && incoming.trim()) return incoming;
  return getFixedProductImage(sku);
}

function isSamePrice(a: number | null, b: number | null) {
  return a === b;
}

function buildHistoryEventType(priceChanged: boolean, stockChanged: boolean) {
  if (priceChanged && stockChanged) return "price_and_stock_changed";
  if (priceChanged) return "price_changed";
  if (stockChanged) return "stock_changed";
  return "initial";
}

export async function readLatestPricesMap(): Promise<
  Record<string, PriceRecord>
> {
  const firestore = ensureDb();
  const snap = await firestore.collection(COLLECTION_LATEST).get();

  const map: Record<string, PriceRecord> = {};

  snap.forEach((doc) => {
    const data = doc.data();
    const sku = String(data.sku ?? doc.id);

    map[doc.id] = {
      sku,
      name: String(data.name ?? ""),
      market: (data.market ?? "A101") as MarketName,
      currentPrice: normalizePrice(data.currentPrice),
      previousPrice: normalizePrice(data.previousPrice),
      changed: Boolean(data.changed),
      changePercent:
        typeof data.changePercent === "number" ? data.changePercent : null,
      inStock: Boolean(data.inStock),
      updatedAt: String(data.updatedAt ?? data.lastCheckedAt ?? ""),
      lastCheckedAt: String(data.lastCheckedAt ?? data.updatedAt ?? ""),
      lastChangedAt:
        typeof data.lastChangedAt === "string" ? data.lastChangedAt : null,
      source: String(data.source ?? data.market ?? ""),
      imageUrl: resolveImageUrl(
        sku,
        typeof data.imageUrl === "string" ? data.imageUrl : null
      ),
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

    const previousCurrentPrice = previous?.currentPrice ?? null;
    const currentPrice = normalizePrice(product.currentPrice);

    const fallbackPreviousPrice =
      previous?.previousPrice ??
      (previousCurrentPrice !== currentPrice ? previousCurrentPrice : null);

    const isFirstSave = !previous;

    const priceChanged =
      !isFirstSave &&
      currentPrice !== null &&
      !isSamePrice(previousCurrentPrice, currentPrice);

    const calculatedChangePercent = priceChanged
      ? calculateChangePercent(previousCurrentPrice, currentPrice)
      : fallbackPreviousPrice !== null
      ? calculateChangePercent(fallbackPreviousPrice, currentPrice)
      : null;

    const suspiciousPriceChange =
      priceChanged && isSuspiciousPriceChange(calculatedChangePercent);

    const safePriceChanged = priceChanged && !suspiciousPriceChange;

    const safeCurrentPrice = suspiciousPriceChange
      ? previousCurrentPrice
      : currentPrice;

    const stockChanged = !isFirstSave && previous.inStock !== product.inStock;

    const finalImageUrl = resolveImageUrl(
      product.sku,
      product.imageUrl ?? previous?.imageUrl ?? null
    );

    const record: PriceRecord = {
      sku: product.sku,
      name: product.name,
      market: product.market,
      currentPrice: safeCurrentPrice,
      previousPrice: safePriceChanged
        ? previousCurrentPrice
        : fallbackPreviousPrice,
      changed: safePriceChanged ? true : previous?.changed ?? false,
      changePercent: safePriceChanged
        ? calculatedChangePercent
        : fallbackPreviousPrice !== null
        ? calculateChangePercent(fallbackPreviousPrice, safeCurrentPrice)
        : null,
      inStock: product.inStock,
      updatedAt: nowIso,
      lastCheckedAt: nowIso,
      lastChangedAt: safePriceChanged
        ? nowIso
        : previous?.lastChangedAt ?? null,
      source: product.market,
      imageUrl: finalImageUrl,
    };

    const latestRef = firestore.collection(COLLECTION_LATEST).doc(product.sku);
    batch.set(latestRef, record, { merge: true });

    const shouldWriteHistory = isFirstSave || safePriceChanged || stockChanged;

    if (shouldWriteHistory) {
      const historyRef = firestore.collection(COLLECTION_HISTORY).doc();

      const historyRecord: PriceHistoryRecord = {
        sku: product.sku,
        name: product.name,
        market: product.market,
        price: safeCurrentPrice,
        previousPrice: safePriceChanged ? previousCurrentPrice : null,
        changePercent: safePriceChanged ? calculatedChangePercent : null,
        inStock: product.inStock,
        checkedAt: nowIso,
        imageUrl: finalImageUrl,
        eventType: buildHistoryEventType(safePriceChanged, stockChanged),
      };

      batch.set(historyRef, historyRecord);
    }

    allSavedProducts.push(record);

    if (safePriceChanged) {
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

  const items = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data();
      const sku = String(data.sku ?? doc.id);

      const currentPrice = normalizePrice(data.currentPrice);
      let previousPrice = normalizePrice(data.previousPrice);
      let changePercent =
        typeof data.changePercent === "number" ? data.changePercent : null;

      if (previousPrice === null) {
        const historySnap = await firestore
          .collection(COLLECTION_HISTORY)
          .where("sku", "==", sku)
          .get();

        const historyItems = historySnap.docs
          .map((historyDoc) => {
            const historyData = historyDoc.data();

            return {
              price: normalizePrice(historyData.price),
              previousPrice: normalizePrice(historyData.previousPrice),
              checkedAt: String(historyData.checkedAt ?? ""),
            };
          })
          .sort(
            (a, b) =>
              new Date(b.checkedAt).getTime() -
              new Date(a.checkedAt).getTime()
          );

        const latestChange = historyItems.find(
          (history) =>
            history.previousPrice !== null &&
            history.price !== null &&
            history.price === currentPrice
        );

        if (latestChange) {
          previousPrice = latestChange.previousPrice;
          changePercent = calculateChangePercent(previousPrice, currentPrice);
        }
      }

      return {
        sku,
        name: String(data.name ?? ""),
        market: (data.market ?? "A101") as MarketName,
        currentPrice,
        previousPrice,
        changed: previousPrice !== null && previousPrice !== currentPrice,
        changePercent,
        inStock: Boolean(data.inStock),
        updatedAt: String(data.updatedAt ?? data.lastCheckedAt ?? ""),
        lastCheckedAt: String(data.lastCheckedAt ?? data.updatedAt ?? ""),
        lastChangedAt:
          typeof data.lastChangedAt === "string" ? data.lastChangedAt : null,
        source: String(data.source ?? data.market ?? ""),
        imageUrl: resolveImageUrl(
          sku,
          typeof data.imageUrl === "string" ? data.imageUrl : null
        ),
      } as PriceRecord;
    })
  );

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
      updatedAt: String(data.updatedAt ?? data.lastCheckedAt ?? ""),
      lastCheckedAt: String(data.lastCheckedAt ?? data.updatedAt ?? ""),
      lastChangedAt:
        typeof data.lastChangedAt === "string" ? data.lastChangedAt : null,
      source: String(data.source ?? data.market ?? ""),
      imageUrl: resolveImageUrl(
        sku,
        typeof data.imageUrl === "string" ? data.imageUrl : null
      ),
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

    const items = snap.docs
      .map((doc) => {
        const data = doc.data();

        return {
          sku: String(data.sku ?? sku),
          name: data.name ? String(data.name) : undefined,
          market: data.market ? (data.market as MarketName) : undefined,
          price: normalizePrice(data.price),
          previousPrice: normalizePrice(data.previousPrice),
          changePercent:
            typeof data.changePercent === "number" ? data.changePercent : null,
          inStock: Boolean(data.inStock),
          checkedAt: String(data.checkedAt ?? ""),
          imageUrl: resolveImageUrl(
            sku,
            typeof data.imageUrl === "string" ? data.imageUrl : null
          ),
          eventType:
            typeof data.eventType === "string"
              ? (data.eventType as PriceHistoryRecord["eventType"])
              : undefined,
        } as PriceHistoryRecord;
      })
      .sort(
        (a, b) =>
          new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
      );

    const deduped: PriceHistoryRecord[] = [];
    let lastKey = "";

    for (const item of items) {
      const key = `${item.price ?? "null"}-${item.inStock}`;

      if (key === lastKey) {
        continue;
      }

      deduped.push(item);
      lastKey = key;
    }

    return deduped;
  } catch (error) {
    console.error("getPriceHistoryBySku error:", error);
    return [];
  }
}

export async function createChangeEvent(
  market: string,
  items: PriceRecord[]
): Promise<string> {
  const firestore = ensureDb();
  const docRef = firestore.collection(COLLECTION_CHANGE_EVENTS).doc();
  const createdAt = new Date().toISOString();

  const payload: Omit<ChangeEventRecord, "id"> = {
    market,
    createdAt,
    itemCount: items.length,
    items: items.map((item) => ({
      sku: item.sku,
      name: item.name,
      market: item.market,
      previousPrice: item.previousPrice,
      currentPrice: item.currentPrice,
      changePercent: item.changePercent,
      inStock: item.inStock,
      checkedAt: createdAt,
    })),
  };

  await docRef.set(payload);

  return docRef.id;
}

export async function getChangeEventById(
  eventId: string
): Promise<ChangeEventRecord | null> {
  try {
    const firestore = ensureDb();
    const doc = await firestore
      .collection(COLLECTION_CHANGE_EVENTS)
      .doc(eventId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();

    if (!data) {
      return null;
    }

    const itemsRaw = Array.isArray(data.items) ? data.items : [];

    return {
      id: doc.id,
      market: String(data.market ?? ""),
      createdAt: String(data.createdAt ?? ""),
      itemCount: Number(data.itemCount ?? itemsRaw.length ?? 0),
      items: itemsRaw.map((item) => ({
        sku: String(item?.sku ?? ""),
        name: String(item?.name ?? ""),
        market: (item?.market ?? data.market ?? "A101") as MarketName,
        previousPrice: normalizePrice(item?.previousPrice),
        currentPrice: normalizePrice(item?.currentPrice),
        changePercent:
          typeof item?.changePercent === "number"
            ? item.changePercent
            : null,
        inStock: Boolean(item?.inStock),
        checkedAt: String(item?.checkedAt ?? data.createdAt ?? ""),
      })),
    };
  } catch (error) {
    console.error("getChangeEventById error:", error);
    return null;
  }
}
