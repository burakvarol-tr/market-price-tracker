export function getLocalProductImage(market: string, sku: string): string | null {
  if (market === "A101") return `/products/a101/${encodeURIComponent(sku)}.webp`;
  if (market === "CARREFOUR") return `/products/carrefour/${encodeURIComponent(sku)}.webp`;
  return null;
}
