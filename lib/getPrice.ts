export type MarketName = "A101" | "BIM" | "SOK" | "CARREFOUR";

export type TrackedProduct = {
  sku: string;
  name: string;
  market: MarketName;
};

export type LivePriceProduct = TrackedProduct & {
  currentPrice: number | null;
  priceText: string;
  inStock: boolean;
  raw?: unknown;
};

function normalizeA101Number(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  // A101 bazen 11900 gibi kuruş döndürüyor
  // bunu 119.00 TL yapıyoruz
  if (value >= 1000) {
    return Number((value / 100).toFixed(2));
  }

  return Number(value.toFixed(2));
}

function parseA101Price(rawProduct: any): {
  currentPrice: number | null;
  priceText: string;
  inStock: boolean;
} {
  const discounted = normalizeA101Number(rawProduct?.price?.discounted);
  const normal = normalizeA101Number(rawProduct?.price?.normal);

  const discountedStr = rawProduct?.price?.discountedStr;
  const normalStr = rawProduct?.price?.normalStr;

  const currentPrice =
    typeof discounted === "number"
      ? discounted
      : typeof normal === "number"
      ? normal
      : null;

  const priceText =
    discountedStr ||
    normalStr ||
    (typeof currentPrice === "number" ? currentPrice.toFixed(2) : "-");

  const stock = rawProduct?.stock;
  const quantity = rawProduct?.quantity;

  const inStock =
    stock === "HIGH" ||
    stock === "LOW" ||
    stock === "MEDIUM" ||
    Number(quantity || 0) > 0;

  return {
    currentPrice,
    priceText,
    inStock,
  };
}

export async function getA101ProductBySku(
  product: TrackedProduct
): Promise<LivePriceProduct> {
  const url = `https://rio.a101.com.tr/dbmk89vnr/CALL/Store/getProductBySku/VS032?sku=${product.sku}&channel=SLOT&__culture=tr-TR&__platform=web&data=e30%3D&__isbase64=true`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!res.ok) {
    throw new Error(`${product.sku} için fiyat alınamadı. Status: ${res.status}`);
  }

  const data = await res.json();
  const rawProduct = data?.product || data?.data?.product || data;
  const parsed = parseA101Price(rawProduct);

  return {
    ...product,
    currentPrice: parsed.currentPrice,
    priceText: parsed.priceText,
    inStock: parsed.inStock,
    raw: data,
  };
}

export async function getProductsByMarket(
  products: TrackedProduct[]
): Promise<LivePriceProduct[]> {
  const results = await Promise.allSettled(
    products.map(async (product) => {
      if (product.market === "A101") {
        return getA101ProductBySku(product);
      }

      return {
        ...product,
        currentPrice: null,
        priceText: "-",
        inStock: false,
        raw: null,
      } as LivePriceProduct;
    })
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      ...products[index],
      currentPrice: null,
      priceText: "-",
      inStock: false,
      raw: {
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      },
    };
  });
}