import type { MarketName } from "./getPrice";

type CatalogItem = {
  productUrl?: string;
  imageUrl?: string;
};

const A101_BASE = "https://www.a101.com.tr";
const SOK_BASE = "https://www.sokmarket.com.tr";
const BIZIM_BASE = "https://www.bizimtoptan.com.tr";
const CARREFOUR_BASE = "https://www.carrefoursa.com";

export const PRODUCT_CATALOG: Record<string, CatalogItem> = {
  "13002152": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-sihirli-ejderha-meyveli-icecek-200-ml_p-13002152` },
  "13002151": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-safari-meyveleri-meyveli-icecek-200-ml-_p-13002151` },
  "13002601": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-karpuz-cilek-meyveli-icecek-200-ml_p-13002601` },
  "13001966": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-visne-meyve-nektari-200-ml_p-13001966` },
  "13001960": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-seftali-meyve-nektari-200-ml_p-13001960` },
  "13001952": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-karisik-meyve-nektari-200-ml_p-13001952` },
  "13001955": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-kayisi-meyve-nektari-200-ml_p-13001955` },
  "13001964": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-visne-meyve-nektari-1-l_p-13001964` },
  "13001953": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-kayisi-meyve-nektari-1-l_p-13001953` },
  "13001958": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-seftali-meyve-nektari-1-l_p-13001958` },
  "13001667": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-ananas-meyve-aromali-icecek-1-l_p-13001667` },
  "13001951": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-karisik-meyve-nektari-1-l_p-13001951` },
  "13002505": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-sari-meyveli-meyve-suyu-100-6x200-ml_p-13002505` },
  "13002974": { productUrl: `${A101_BASE}/kapida/su-icecek/ustad-organik-100-portakal-suyu-1-l-_p-13002974` },
  "18002851": { productUrl: `${A101_BASE}/kapida/sos-salata-sirke/galle-nar-eksisi-100-250-ml_p-18002851` },
  "13002291": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-cilekli-meyveli-icecek-1-l_p-13002291` },
  "13002275": { productUrl: `${A101_BASE}/kapida/su-icecek/dooy-bogurtlen-meyveli-icecek-1-l_p-13002275` },
  "13003074": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-karisik-meyveli-icecek-elma-cilek-bogurtlen-1-l_p-13003074` },
  "13003075": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-karisik-meyveli-icecek-elma-muz-cilek-1-l_p-13003075` },
  "13003076": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-karisik-meyveli-icecek-karpuz-cilek-limon-1-l_p-13003076` },
  "13003004": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-limonata-karpuz-aromali-200-ml_p-13003004` },
  "13003003": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-limonata-kavun-aromali-200-ml_p-13003003` },
  "13003002": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-limonata-cilek-aromali-200-ml_p-13003002` },
  "13003005": { productUrl: `${A101_BASE}/kapida/su-icecek/togo-limonata-kivi-aromali-200-ml_p-13003005` },
  "20001516": { productUrl: `${A101_BASE}/kapida/meyve-sebze/ceviz-file-500-g_p-20001516` },
  "20000792": {
    productUrl: `${A101_BASE}/kapida/meyve-sebze/sarimsak-file-200-g_p-20000792`,
    imageUrl: "https://cdn2.a101.com.tr/dbmk89vnr/CALL/Image/get/eYmRe6QFa8_500x500.png",
  },

  "6130": { productUrl: `${SOK_BASE}/mis-meyve-nektari-visne-200-ml-p-6130` },
  "6129": { productUrl: `${SOK_BASE}/mis-meyve-nektari-kayisi-200-ml-p-6129` },
  "8722": { productUrl: `${SOK_BASE}/mis-meyve-nektari-karisik-200-ml-p-8722` },
  "6062": { productUrl: `${SOK_BASE}/mis-meyve-nektari-seftali-1-l-p-6062` },
  "7209": { productUrl: `${SOK_BASE}/mis-meyve-nektari-kayisi-1-l-p-7209` },
  "8627": { productUrl: `${SOK_BASE}/mis-meyve-nektari-visne-1-l-p-8627` },
  "5811": { productUrl: `${SOK_BASE}/mis-meyve-nektari-karisik-1-l-p-5811` },
  "267699": { productUrl: `${SOK_BASE}/mis-portakalli-mandalinali-ananasli-icecek-200-ml-p-267699` },
  "269541": { productUrl: `${SOK_BASE}/mis-elmali-cilek-ejder-meyve-havuclu-icecek-200-ml-p-269541` },
  "4587": { productUrl: `${SOK_BASE}/folife-smoothie-yesil-250-ml-p-4587` },
  "4337": { productUrl: `${SOK_BASE}/folife-smoothie-kirmizi-250-ml-p-4337` },

  "fullmix-portakalli-mandalinali-ananasli-icecek-200-ml": { productUrl: `${BIZIM_BASE}/fullmix-portakalli-mandalinali-ananasli-icecek-200-ml` },
  "fullmix-cilekli-ejder-meyveli-havuclu-icecek-200-ml": { productUrl: `${BIZIM_BASE}/fullmix-cilekli-ejder-meyveli-havuclu-icecek-200-ml` },
  "halk-narita-kayisi-meyveli-icecek-200-ml-27li": { productUrl: `${BIZIM_BASE}/halk-narita-kayisi-meyveli-icecek-200-ml-27li` },
  "halk-narita-visne-meyveli-icecek-200-ml-27li": { productUrl: `${BIZIM_BASE}/halk-narita-visne-meyveli-icecek-200-ml-27li` },
  "halk-narita-seftali-meyveli-icecek-200-ml-27li": { productUrl: `${BIZIM_BASE}/halk-narita-seftali-meyveli-icecek-200-ml-27li` },
  "halk-narita-karisik-meyveli-icecek-200-ml-27li": { productUrl: `${BIZIM_BASE}/halk-narita-karisik-meyveli-icecek-200-ml-27li` },

  "30509958": { productUrl: `${CARREFOUR_BASE}/bonheur-100-elma-suyu-1-l-p-30509958` },
  "30510027": { productUrl: `${CARREFOUR_BASE}/bonheur-100-elma-visne-1-l-p-30510027` },
  "30510076": { productUrl: `${CARREFOUR_BASE}/bonheur-100-seftali-elma-suyu-1-l-p-30510076` },
  "30510077": { productUrl: `${CARREFOUR_BASE}/bonheur-100-karisik-meyve-suyu-1-l-p-30510077` },
  "30511967": { productUrl: `${CARREFOUR_BASE}/bonheur-limonata-1-l-p-30511967` },
  "30512090": { productUrl: `${CARREFOUR_BASE}/bonheur-limonata-sekersiz-nane-aromali-1-l-p-30512090` },
};

export function getProductCatalogItem(sku: string): CatalogItem {
  return PRODUCT_CATALOG[sku] ?? {};
}

export function getProductUrl(sku: string, market?: MarketName): string | null {
  const explicit = PRODUCT_CATALOG[sku]?.productUrl;
  if (explicit) return explicit;
  if (market === "WALMART") return `https://www.walmart.com/ip/${sku}`;
  return null;
}

export function getCatalogImage(sku: string): string | null {
  return PRODUCT_CATALOG[sku]?.imageUrl ?? null;
}
