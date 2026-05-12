import type { LivePriceProduct, TrackedProduct } from "@/lib/getPrice";

const SOK_URLS: Record<string, string> = {
  "6130": "https://www.sokmarket.com.tr/mis-meyve-nektari-visne-200-ml-p-6130",
  "6129": "https://www.sokmarket.com.tr/mis-meyve-nektari-kayisi-200-ml-p-6129",
  "8722": "https://www.sokmarket.com.tr/mis-meyve-nektari-karisik-200-ml-p-8722",
  "6062": "https://www.sokmarket.com.tr/mis-meyve-nektari-seftali-1-l-p-6062",
  "7209": "https://www.sokmarket.com.tr/mis-meyve-nektari-kayisi-1-l-p-7209",
  "8627": "https://www.sokmarket.com.tr/mis-meyve-nektari-visne-1-l-p-8627",
  "5811": "https://www.sokmarket.com.tr/mis-meyve-nektari-karisik-1-l-p-5811",
  "267699": "https://www.sokmarket.com.tr/mis-portakalli-mandalinali-ananasli-icecek-200-ml-p-267699",
  "269541": "https://www.sokmarket.com.tr/mis-elmali-cilek-ejder-meyve-havuclu-icecek-200-ml-p-269541",
};

function parseTurkishPrice(value: string): number | null {
  const cleaned = value
    .replace(/\s/g, "")
    .replace("₺", "")
    .replace("TL", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);

  if (Number.isNaN(parsed)) return null;

  return Number(parsed.toFixed(2));
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSokPriceFromHtml(html: string): {
  currentPrice: number | null;
  priceText: string;
} {
  const text = stripHtml(html);

  const patterns = [
    /([0-9]{1,4},[0-9]{2})\s*₺/g,
    /([0-9]{1,4},[0-9]{2})\s*TL/gi,
    /"price"\s*:\s*"?([0-9]{1,4}[.,][0-9]{1,2})"?/gi,
    /"salePrice"\s*:\s*"?([0-9]{1,4}[.,][0-9]{1,2})"?/gi,
    /"finalPrice"\s*:\s*"?([0-9]{1,4}[.,][0-9]{1,2})"?/gi,
  ];

  for (const pattern of patterns) {
    const match = [...text.matchAll(pattern)][0] || [...html.matchAll(pattern)][0];

    if (match?.[1]) {
      const currentPrice = parseTurkishPrice(match[1]);

      return {
        currentPrice,
        priceText:
          currentPrice !== null
            ? `${currentPrice.toFixed(2).replace(".", ",")} TL`
            : "-",
      };
    }
  }

  return {
    currentPrice: null,
    priceText: "-",
  };
}

function parseSokImageFromHtml(html: string): string | null {
  const productAssetMatch = html.match(
    /https:\/\/images\.ceptesok\.com[^"'\\\s<>]+product-assets[^"'\\\s<>]+/i
  );

  if (productAssetMatch?.[0]) {
    return productAssetMatch[0].replace(/\\u002F/g, "/").replace(/\\/g, "");
  }

  return null;
}

function parseSokProductCodeFromHtml(html: string): string | null {
  const text = stripHtml(html);
  const match = text.match(/\b00[0-9]{5,}\b/);

  return match?.[0] || null;
}

export async function getSokProductBySku(
  product: TrackedProduct
): Promise<LivePriceProduct> {
  const url = SOK_URLS[product.sku];

  if (!url) {
    return {
      ...product,
      currentPrice: null,
      priceText: "-",
      inStock: false,
      imageUrl: null,
      raw: {
        error: `ŞOK URL bulunamadı: ${product.sku}`,
      },
    };
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
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
          error: `ŞOK HTTP ${res.status}`,
          url,
        },
      };
    }

    const html = await res.text();
    const parsedPrice = parseSokPriceFromHtml(html);
    const imageUrl = parseSokImageFromHtml(html);
    const productCode = parseSokProductCodeFromHtml(html);

    return {
      ...product,
      currentPrice: parsedPrice.currentPrice,
      priceText: parsedPrice.priceText,
      inStock: parsedPrice.currentPrice !== null,
      imageUrl,
      raw: {
        source: "sok_html",
        url,
        productCode,
        priceFound: parsedPrice.currentPrice !== null,
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