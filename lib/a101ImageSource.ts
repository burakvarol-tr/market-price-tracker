export function getA101ImageUrl(sku: string): string {
  return `/products/a101/${encodeURIComponent(sku)}.webp`;
}
