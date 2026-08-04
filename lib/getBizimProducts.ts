import type { LivePriceProduct, TrackedProduct } from "@/lib/getPrice";

const BIZIM_URLS: Record<string, string> = {
  "fullmix-portakalli-mandalinali-ananasli-icecek-200-ml":
    "https://www.bizimtoptan.com.tr/fullmix-portakalli-mandalinali-ananasli-icecek-200-ml",
  "fullmix-cilekli-ejder-meyveli-havuclu-icecek-200-ml":
    "https://www.bizimtoptan.com.tr/fullmix-cilekli-ejder-meyveli-havuclu-icecek-200-ml",
  "halk-narita-kayisi-meyveli-icecek-200-ml-27li":
    "https://www.bizimtoptan.com.tr/halk-narita-kayisi-meyveli-icecek-200-ml-27li",
  "halk-narita-visne-meyveli-icecek-200-ml-27li":
    "https://www.bizimtoptan.com.tr/halk-narita-visne-meyveli-icecek-200-ml-27li",
  "halk-narita-seftali-meyveli-icecek-200-ml-27li":
    "https://www.bizimtoptan.com.tr/halk-narita-seftali-meyveli-icecek-200-ml-27li",
  "halk-narita-karisik-meyveli-icecek-200-ml-27li":
    "https://www.bizimtoptan.com.tr/halk-narita-karisik-meyveli-icecek-200-ml-27li",
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

function normalizeText(value: string): string {
  return value.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

function normalizeBizimPrice(
  rawPrice: number | null,
  product: TrackedProduct
): number | null {
  if (rawPrice === null) return null;

  if (
    product.priceMode === "UNIT" &&
    product.unitsPerCase &&
    product.unitsPerCase > 1 &&
    rawPrice > 100
  ) {
    return Number((rawPrice / product.unitsPerCase).toFixed(2));
  }

  return rawPrice;
}

function parseBizimPriceFromHtml(
  html: string,
  product: TrackedProduct
): {
  currentPrice: number | null;
  priceText: string;
  rawPrice: number | null;
  normalized: boolean;
  stockTextDetected: boolean;
} {
  const text = stripHtml(html);
  const normalizedText = normalizeText(text);

  const stockTextDetected =
    normalizedText.includes("stoğa girince haber ver") ||
    normalizedText.includes("stoga girince haber ver") ||
    normalizedText.includes("stokta yok") ||
    normalizedText.includes("tükendi");

  const adetFiyatiMatch =
    text.match(/Adet\s*Fiyatı\s*:\s*([0-9]{1,5},[0-9]{2})\s*TL/i) ||
    text.match(/Adet\s*Fiyati\s*:\s*([0-9]{1,5},[0-9]{2})\s*TL/i) ||
    text.match(/Adet\s*:\s*([0-9]{1,5},[0-9]{2})\s*TL/i);

  if (adetFiyatiMatch?.[1]) {
    const rawPrice = parseTurkishPrice(adetFiyatiMatch[1]);
    const currentPrice = normalizeBizimPrice(rawPrice, product);

    return {
      currentPrice,
      rawPrice,
      normalized: rawPrice !== currentPrice,
      stockTextDetected,
      priceText:
        currentPrice !== null
          ? `${currentPrice.toFixed(2).replace(".", ",")} TL`
          : "-",
    };
  }

  const packagePriceMatch = text.match(/([0-9]{1,5},[0-9]{2})\s*TL/i);

  if (packagePriceMatch?.[1]) {
    const rawPrice = parseTurkishPrice(packagePriceMatch[1]);
    const currentPrice = normalizeBizimPrice(rawPrice, product);

    return {
      currentPrice,
      rawPrice,
      normalized: rawPrice !== currentPrice,
      stockTextDetected,
      priceText:
        currentPrice !== null
          ? `${currentPrice.toFixed(2).replace(".", ",")} TL`
          : "-",
    };
  }

  return {
    currentPrice: null,
    priceText: stockTextDetected ? "Stok Yok" : "-",
    rawPrice: null,
    normalized: false,
    stockTextDetected,
  };
}

function cleanImageUrl(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/\\u002F/g, "/")
    .replace(/\\/g, "")
    .trim();
}

function isLikelyProductImage(value: string): boolean {
  const normalized = value.toLowerCase();
  const blockedTerms = [
    "logo",
    "icon",
    "favicon",
    "placeholder",
    "payment",
    "visa",
    "mastercard",
    "cargo",
    "kargo",
    "spinner",
    "loading",
    "battery",
    "pil",
  ];

  return (
    /^https?:\/\//i.test(value) &&
    /\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(value) &&
    !blockedTerms.some((term) => normalized.includes(term))
  );
}

function parseBizimImageFromHtml(html: string): string | null {
  const candidates: string[] = [];

  const ogImage = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  )?.[1];
  if (ogImage) candidates.push(ogImage);

  const twitterImage = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
  )?.[1];
  if (twitterImage) candidates.push(twitterImage);

  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) {
    if (match[1]) candidates.push(match[1]);
  }

  for (const match of html.matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)) {
    if (match[1]) candidates.push(match[1]);
  }

  for (const rawCandidate of candidates) {
    const candidate = cleanImageUrl(rawCandidate);
    if (isLikelyProductImage(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function getBizimProductBySku(
  product: TrackedProduct
): Promise<LivePriceProduct> {
  const url = BIZIM_URLS[product.sku];

  if (!url) {
    return {
      ...product,
      currentPrice: null,
      priceText: "-",
      inStock: false,
      imageUrl: null,
      raw: {
        error: `Bizim URL bulunamadı: ${product.sku}`,
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
          error: `Bizim HTTP ${res.status}`,
          url,
        },
      };
    }

    const html = await res.text();
    const parsedPrice = parseBizimPriceFromHtml(html, product);
    const imageUrl = parseBizimImageFromHtml(html);
    const inStock = parsedPrice.currentPrice !== null;

    return {
      ...product,
      currentPrice: parsedPrice.currentPrice,
      priceText: parsedPrice.priceText,
      inStock,
      imageUrl,
      raw: {
        source: "bizim_html",
        url,
        priceFound: parsedPrice.currentPrice !== null,
        rawPrice: parsedPrice.rawPrice,
        normalized: parsedPrice.normalized,
        priceMode: product.priceMode ?? null,
        unitsPerCase: product.unitsPerCase ?? null,
        stockDetected: inStock,
        stockTextDetected: parsedPrice.stockTextDetected,
        imageFound: imageUrl !== null,
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
