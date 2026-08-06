import { db } from "./firebaseAdmin";
import type { LivePriceProduct } from "./getPrice";
import type { PriceHistoryRecord, PriceRecord } from "./firestorePrices";
import { getFixedProductImage } from "./productImages";

const COLLECTION_LATEST = "latest_prices";
const COLLECTION_HISTORY = "price_history";
const MAX_REASONABLE_CHANGE_PERCENT = 40;

function ensureDb() {
  if (!db) {
    throw new Error("Firestore bağlantısı yok. Env değerlerini kontrol et.");
  }
  return db;
}

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(",", ".").trim())
        : Number.NaN;

  if (Number.isNaN(parsed)) return null;
  return Number((parsed >= 1000 ? parsed / 100 : parsed).toFixed(2));
}

function calculateChangePercent(previousPrice: number | null, currentPrice: number | null) {
  if (previousPrice === null || currentPrice === null || previousPrice === 0) return null;
  return Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2));
}

function isSuspicious(previousPrice: number | null, currentPrice: number | null) {
  const change = calculateChangePercent(previousPrice, currentPrice);
  return change !== null && Math.abs(change) > MAX_REASONABLE_CHANGE_PERCENT;
}

function resolveImageUrl(sku: string, incoming?: string | null) {
  if (incoming && incoming.trim()) return incoming;
  return getFixedProductImage(sku);
}

export async function saveCheckedProductsSafe(
  products: LivePriceProduct[],
  previousMap: Record<string, PriceRecord>
) {
  const firestore = ensureDb();
  const batch = firestore.batch();
  const nowIso = new Date().toISOString();
  const changedProducts: PriceRecord[] = [];
  const allSavedProducts: PriceRecord[] = [];

  for (const product of products) {
    const previous = previousMap[product.sku] ?? null;
    const previousCurrentPrice = previous?.currentPrice ?? null;
    const incomingPrice = normalizePrice(product.currentPrice);
    const isFirstSave = !previous;
    const actualPriceChanged =
      !isFirstSave &&
      incomingPrice !== null &&
      previousCurrentPrice !== null &&
      incomingPrice !== previousCurrentPrice;

    const incomingSuspicious =
      actualPriceChanged && isSuspicious(previousCurrentPrice, incomingPrice);
    const storedComparisonSuspicious =
      previous !== null && isSuspicious(previous.previousPrice, previous.currentPrice);
    const resetAsBaseline = incomingSuspicious || storedComparisonSuspicious;

    const validPriceChanged = actualPriceChanged && !incomingSuspicious;
    const changePercent = validPriceChanged
      ? calculateChangePercent(previousCurrentPrice, incomingPrice)
      : null;
    const stockChanged = !isFirstSave && previous.inStock !== product.inStock;
    const finalImageUrl = resolveImageUrl(
      product.sku,
      product.imageUrl ?? previous?.imageUrl ?? null
    );

    const record: PriceRecord = {
      sku: product.sku,
      name: product.name,
      market: product.market,
      currentPrice: incomingPrice,
      previousPrice: resetAsBaseline
        ? null
        : validPriceChanged
          ? previousCurrentPrice
          : previous?.previousPrice ?? null,
      changed: resetAsBaseline
        ? false
        : validPriceChanged
          ? true
          : previous?.changed ?? false,
      changePercent: resetAsBaseline
        ? null
        : validPriceChanged
          ? changePercent
          : previous?.changePercent ?? null,
      inStock: product.inStock,
      updatedAt: nowIso,
      lastCheckedAt: nowIso,
      lastChangedAt: resetAsBaseline
        ? null
        : validPriceChanged
          ? nowIso
          : previous?.lastChangedAt ?? null,
      source: product.market,
      imageUrl: finalImageUrl,
    };

    batch.set(
      firestore.collection(COLLECTION_LATEST).doc(product.sku),
      record,
      { merge: true }
    );

    const shouldWriteHistory =
      isFirstSave || validPriceChanged || stockChanged || resetAsBaseline;

    if (shouldWriteHistory) {
      const historyRecord: PriceHistoryRecord = {
        sku: product.sku,
        name: product.name,
        market: product.market,
        price: incomingPrice,
        previousPrice: validPriceChanged ? previousCurrentPrice : null,
        changePercent: validPriceChanged ? changePercent : null,
        inStock: product.inStock,
        checkedAt: nowIso,
        imageUrl: finalImageUrl,
        eventType: validPriceChanged
          ? stockChanged
            ? "price_and_stock_changed"
            : "price_changed"
          : stockChanged
            ? "stock_changed"
            : "initial",
      };

      batch.set(firestore.collection(COLLECTION_HISTORY).doc(), historyRecord);
    }

    allSavedProducts.push(record);
    if (validPriceChanged) changedProducts.push(record);
  }

  await batch.commit();

  return { changedProducts, allSavedProducts };
}
