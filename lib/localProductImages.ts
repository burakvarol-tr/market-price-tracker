const LOCAL_IMAGE_VERSION = "20260804-2";

export function getLocalProductImage(market: string, sku: string): string | null {
  const encodedSku = encodeURIComponent(sku.trim());

  if (market === "A101") {
    return `/products/a101/${encodedSku}.webp?v=${LOCAL_IMAGE_VERSION}`;
  }

  if (market === "CARREFOUR") {
    return `/products/carrefour/${encodedSku}.svg?v=${LOCAL_IMAGE_VERSION}`;
  }

  return null;
}

export function resolveProductImage(
  market: string,
  sku: string,
  remoteImageUrl?: string | null
): string | null {
  return getLocalProductImage(market, sku) ?? remoteImageUrl ?? null;
}
