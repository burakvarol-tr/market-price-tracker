export type MarketName = "A101" | "BIM" | "SOK" | "CARREFOUR" | "WALMART";

export type TrackedProduct = {
  sku: string;
  name: string;
  market: MarketName;
};

export type LivePriceProduct = TrackedProduct & {
  currentPrice: number | null;
  priceText: string;
  inStock: boolean;
  imageUrl: string | null;
  raw?: unknown;
};

function normalizeA101Number(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  if (value >= 1000) {
    return Number((value / 100).toFixed(2));
  }

  return Number(value.toFixed(2));
}

function pickImageUrl(rawProduct: any): string | null {
  const candidates = [
    rawProduct?.images?.[0]?.original,
    rawProduct?.images?.[0]?.large,
    rawProduct?.images?.[0]?.medium,
    rawProduct?.images?.[0]?.small,
    rawProduct?.images?.[0]?.url,
    rawProduct?.image?.original,
    rawProduct?.image?.large,
    rawProduct?.image?.medium,
    rawProduct?.image?.small,
    rawProduct?.image?.url,
    rawProduct?.primaryImage,
    rawProduct?.imageUrl,
  ];

  for (const item of candidates) {
    if (typeof item === "string" && item.trim()) {
      return item.trim();
    }
  }

  return null;
}

function parseA101Price(rawProduct: any): {
  currentPrice: number | null;
  priceText: string;
  inStock: boolean;
  imageUrl: string | null;
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

  const imageUrl = pickImageUrl(rawProduct);

  return {
    currentPrice,
    priceText,
    inStock,
    imageUrl,
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
    imageUrl: parsed.imageUrl,
    raw: data,
  };
}

function safeNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Number(value.toFixed(2));
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);

    if (!Number.isNaN(parsed)) {
      return Number(parsed.toFixed(2));
    }
  }

  return null;
}

function extractJsonLdPrice(html: string): number | null {
  const matches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];

  for (const match of matches) {
    const content = match[1];

    try {
      const parsed = JSON.parse(content);

      const blocks = Array.isArray(parsed) ? parsed : [parsed];

      for (const block of blocks) {
        const offerPrice = safeNumber(block?.offers?.price);
        if (offerPrice !== null) return offerPrice;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractPriceFromStructuredBlocks(html: string): number | null {
  const patterns = [
    /"priceInfo"\s*:\s*\{\s*"currentPrice"\s*:\s*\{\s*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/,
    /"currentPrice"\s*:\s*\{\s*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/,
    /"priceString"\s*:\s*"\$([0-9]+(?:\.[0-9]+)?)"/,
    /"currentPrice"\s*:\s*"\$?([0-9]+(?:\.[0-9]+)?)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1]);
      if (!Number.isNaN(value)) {
        return Number(value.toFixed(2));
      }
    }
  }

  return null;
}

function parseWalmartPriceFromHtml(html: string): number | null {
  const jsonLdPrice = extractJsonLdPrice(html);
  if (jsonLdPrice !== null) return jsonLdPrice;

  const structuredPrice = extractPriceFromStructuredBlocks(html);
  if (structuredPrice !== null) return structuredPrice;

  return null;
}

function parseWalmartImageFromHtml(html: string): string | null {
  const patterns = [
    /"image"\s*:\s*"([^"]+)"/,
    /"thumbnailUrl"\s*:\s*"([^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\\u002F/g, "/").replace(/\\/g, "");
    }
  }

  return null;
}

async function getWalmartProductBySku(
  product: TrackedProduct
): Promise<LivePriceProduct> {
  const url = `https://www.walmart.com/ip/${product.sku}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return {
        ...product,
        currentPrice: null,
        priceText: "-",
        inStock: false,
        imageUrl: null,
        raw: {
          error: `Walmart HTTP ${res.status}`,
        },
      };
    }

    const html = await res.text();

    const price = parseWalmartPriceFromHtml(html);
    const imageUrl = parseWalmartImageFromHtml(html);

    return {
      ...product,
      currentPrice: price,
      priceText: typeof price === "number" ? `$${price.toFixed(2)}` : "-",
      inStock: price !== null,
      imageUrl,
      raw: {
        source: "walmart_html",
        priceFound: price !== null,
      },
    };
  } catch (error) {
    return {
      ...product,
      currentPrice: null,
      priceText: "-",
      inStock: false,
      imageUrl: null,
      raw: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

export async function getProductsByMarket(
  products: TrackedProduct[]
): Promise<LivePriceProduct[]> {
  const results = await Promise.allSettled(
    products.map(async (product) => {
      if (product.market === "A101") {
        return getA101ProductBySku(product);
      }

      if (product.market === "WALMART") {
        return getWalmartProductBySku(product);
      }

      return {
        ...product,
        currentPrice: null,
        priceText: "-",
        inStock: false,
        imageUrl: null,
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
      imageUrl: null,
      raw: {
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      },
    };
  });
}