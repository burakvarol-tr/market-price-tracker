import { getCatalogImage } from "./productCatalog";

export function getFixedProductImage(sku: string): string | null {
  return getCatalogImage(sku);
}
