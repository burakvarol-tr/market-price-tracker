import type { LivePriceProduct, TrackedProduct } from "@/lib/getPrice";

const CARREFOUR_URLS: Record<string, string> = {
  "30509958":
    "https://www.carrefoursa.com/bonheur-100-elma-suyu-1-l-p-30509958",
  "30510027":
    "https://www.carrefoursa.com/bonheur-100-elma-visne-1-l-p-30510027",
  "30510076":
    "https://www.carrefoursa.com/bonheur-100-seftali-elma-suyu-1-l-p-30510076",
  "30510077":
    "https://www.carrefoursa.com/bonheur-100-karisik-meyve-suyu-1-l-p-30510077",
  "30511967":
    "https://www.carrefoursa.com/bonheur-limonata-1-l-p-30511967",
  "30512090":
    "https://www.carrefoursa.com/bonheur-limonata-sekersiz-nane-aromali-1-l-p-30512090",
};

type CarrefourSchemaProduct = {
  "@type"?: string;
  name?: string;
  sku?: string | number;
  image?: string | string[];
  offers?: {
    price?: number | string;
    priceCurrency?: string;
    availability?: string;
    url?: string;
  };
};

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Number(value.toFixed(2));
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace("₺", "")
    .replace("TL", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractProductSchema(
  html: string,
  expectedSku: string
): CarrefourSchemaProduct | null {
  const specificMatch = html.match(
    /<script[^>]*id=["']productSchema["'][^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );

  const genericMatches = Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )
  );

  const candidates = specificMatch?.[1]
    ? [specificMatch[1], ...genericMatches.map((match) => match[1])]
    : genericMatches.map((match) => match[1]);

  for (const rawCandidate of candidates) {
    try {
      const decoded = decodeHtmlEntities(rawCandidate).trim();
      const parsed = JSON.parse(decoded);

      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.["@graph"])
        ? parsed["@graph"]
        : [parsed];

      for (const item of items) {
        const type = String(item?.["@type"] ?? "").toLowerCase();
        const sku = String(item?.sku ?? "");

        if (type === "product" && sku === expectedSku) {
          return item as CarrefourSchemaProduct;
        }
      }
    } catch {
      // Geçersiz JSON-LD bloklarını atla.
    }
  }

  return null;
}

function getImageUrl(schema: CarrefourSchemaProduct): string | null {
  const image = schema.image;

  if (Array.isArray(image)) {
    const firstValid = image.find(
      (item) => typeof item === "string" && item.trim()
    );

    return firstValid?.trim() ?? null;
  }

  if (typeof image === "string" && image.trim()) {
    return image.trim();
  }

  return null;
}

function isInStock(availability: unknown): boolean {
  if (typeof availability !== "string") {
    return false;
  }

  const normalized = availability.toLowerCase();

  return (
    normalized.endsWith("/instock") ||
    normalized === "instock" ||
    normalized.includes("in_stock")
  );
}

export async function getCarrefourProductBySku(
  product: TrackedProduct
): Promise<LivePriceProduct> {
  const url = CARREFOUR_URLS[product.sku];

  if (!url) {
    return {
      ...product,
      currentPrice: null,
      priceText: "-",
      inStock: false,
      imageUrl: null,
      raw: {
        error: `Carrefour URL bulunamadı: ${product.sku}`,
      },
    };
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
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
          error: `Carrefour HTTP ${res.status}`,
          url,
        },
      };
    }

    const html = await res.text();
    const schema = extractProductSchema(html, product.sku);

    if (!schema) {
      return {
        ...product,
        currentPrice: null,
        priceText: "-",
        inStock: false,
        imageUrl: null,
        raw: {
          error: "Carrefour productSchema bulunamadı",
          url,
        },
      };
    }

    const currentPrice = parsePrice(schema.offers?.price);
    const inStock = isInStock(schema.offers?.availability);
    const imageUrl = getImageUrl(schema);

    return {
      ...product,
      currentPrice,
      priceText:
        currentPrice !== null
          ? `${currentPrice.toFixed(2).replace(".", ",")} TL`
          : "-",
      inStock,
      imageUrl,
      raw: {
        source: "carrefour_json_ld",
        url,
        schemaSku: String(schema.sku ?? ""),
        schemaName: schema.name ?? null,
        priceFound: currentPrice !== null,
        availability: schema.offers?.availability ?? null,
        priceCurrency: schema.offers?.priceCurrency ?? null,
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
        url,
      },
    };
  }
}
