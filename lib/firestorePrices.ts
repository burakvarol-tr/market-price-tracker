import admin from "firebase-admin";
import { db } from "@/lib/firebaseAdmin";

const COLLECTION_NAME = "market_latest_prices";

export async function readPricesFromFirestore(): Promise<Record<string, string>> {
  const snapshot = await db.collection(COLLECTION_NAME).get();

  const prices: Record<string, string> = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    prices[doc.id] = data.price || "";
  });

  return prices;
}

export async function savePricesToFirestore(prices: Record<string, string>) {
  const batch = db.batch();

  Object.entries(prices).forEach(([sku, price]) => {
    const ref = db.collection(COLLECTION_NAME).doc(sku);
    batch.set(
      ref,
      {
        price,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  await batch.commit();
}