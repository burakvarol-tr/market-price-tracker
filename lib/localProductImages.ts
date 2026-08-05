const LOCAL_IMAGE_VERSION = "20260805-2";

const LOCAL_ONLY_MARKETS = new Set(["A101", "CARREFOUR", "BIZIM"]);

export function getLocalProductImage(market: string, sku: string): string | null {
  const encodedSku = encodeURIComponent(sku.trim());

  if (market === "A101") {
    return `/products/a101/${encodedSku}.webp?v=${LOCAL_IMAGE_VERSION}`;
  }

  if (market === "CARREFOUR") {
    return `/products/carrefour/${encodedSku}.svg?v=${LOCAL_IMAGE_VERSION}`;
  }

  if (market === "BIZIM") {
    return `/products/bizim/${encodedSku}.webp?v=${LOCAL_IMAGE_VERSION}`;
  }

  return null;
}

export function resolveProductImage(
  market: string,
  sku: string,
  remoteImageUrl?: string | null
): string | null {
  const localImage = getLocalProductImage(market, sku);

  if (localImage) return localImage;
  if (LOCAL_ONLY_MARKETS.has(market)) return null;

  return remoteImageUrl ?? null;
}
