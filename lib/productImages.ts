import { getCatalogImage } from "./productCatalog";

const LOCAL_PRODUCT_IMAGES: Record<string, string> = {
  "30509958": "/products/carrefour/30509958.svg",
  "30510027": "/products/carrefour/30510027.svg",
  "30510076": "/products/carrefour/30510076.svg",
  "30510077": "/products/carrefour/30510077.svg",
  "30511967": "/products/carrefour/30511967.svg",
  "30512090": "/products/carrefour/30512090.svg",
};

export function getFixedProductImage(sku: string): string | null {
  return LOCAL_PRODUCT_IMAGES[sku] ?? getCatalogImage(sku);
}
