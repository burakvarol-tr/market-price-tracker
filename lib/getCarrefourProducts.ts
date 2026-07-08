import type { LivePriceProduct, TrackedProduct } from "@/lib/getPrice";

const CARREFOUR_URLS: Record<string, string> = {
  "30510027":
    "https://www.carrefoursa.com/bonheur-100-elma-visne-1-l-p-30510027",
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

function parseCarrefourPriceFromHtml(html: string, productName: string) {
  const text = stripHtml(html);

  const titleIndex = text
    .toLocaleLowerCase("tr-TR")
    .indexOf(productName.toLocaleLowerCase("tr-TR"));

  const searchArea =
    titleIndex >= 0 ? text.slice(titleIndex, titleIndex + 250) : text;

  const directMatch =
    searchArea.match(/InStock\s+([0-9]{1,4},[0-9]{2})\s*TL/i) ||
    text.match(/InStock\s+([0-9]{1,4},[0-9]{2})\s*TL/i) ||
    searchArea.match(/([0-9]{1,4},[0-9]{2})\s*TL/i) ||
    text.match(/([0-9]{1,4},[0-9]{2})\s*TL/i);

  const firstPrice = directMatch?.[1] || null;
  const currentPrice = firstPrice ? parseTurkishPrice(firstPrice) : null;

  return {
    currentPrice,
    priceText:
      currentPrice !== null
        ? `${currentPrice.toFixed(2).replace(".", ",")} TL`
        : "-",
    inStock: /InStock/i.test(searchArea) || /InStock/i.test(text),
  };
}

function parseCarrefourImageFromHtml(html: string): string | null {
  const imageMatch =
    html.match(
      /https:\/\/[^"'\\\s<>]+carrefoursa[^"'\\\s<>]+\.(?:jpg|jpeg|png|webp)/i
    ) || html.match(/https:\/\/[^"'\\\s<>]+\.(?:jpg|jpeg|png|webp)/i);

  if (imageMatch?.[0]) {
    return imageMatch[0].replace(/\\u002F/g, "/").replace(/\\/g, "");
  }

  return null;
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
          error: `Carrefour HTTP ${res.status}`,
          url,
        },
      };
    }

    const html = await res.text();
    const parsedPrice = parseCarrefourPriceFromHtml(html, product.name);
    const imageUrl = parseCarrefourImageFromHtml(html);

    return {
      ...product,
      currentPrice: parsedPrice.currentPrice,
      priceText: parsedPrice.priceText,
      inStock: parsedPrice.inStock && parsedPrice.currentPrice !== null,
      imageUrl,
      raw: {
        source: "carrefour_html",
        url,
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
