export const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "13002152":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-sihirli-ejderha-meyveli-icecek-200-ml_p-13002152",
  "13002151":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-safari-meyveleri-meyveli-icecek-200-ml-_p-13002151",
  "13002601":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-karpuz-cilek-meyveli-icecek-200-ml_p-13002601",
  "13001966":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-visne-meyve-nektari-200-ml_p-13001966",
  "13001960":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-seftali-meyve-nektari-200-ml_p-13001960",
  "13001952":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-karisik-meyve-nektari-200-ml_p-13001952",
  "13001955":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-kayisi-meyve-nektari-200-ml_p-13001955",
  "13001964":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-visne-meyve-nektari-1-l_p-13001964",
  "13001953":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-kayisi-meyve-nektari-1-l_p-13001953",
  "13001958":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-seftali-meyve-nektari-1-l_p-13001958",
  "13001667":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-ananas-meyve-aromali-icecek-1-l_p-13001667",
  "13001951":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-karisik-meyve-nektari-1-l_p-13001951",
  "13002505":
    "https://www.a101.com.tr/kapida/su-icecek/dooy-sari-meyveli-meyve-suyu-100-6x200-ml_p-13002505",
  "13002974":
    "https://www.a101.com.tr/kapida/su-icecek/ustad-organik-100-portakal-suyu-1-l-_p-13002974",
};

export function getFixedProductImage(sku: string): string | null {
  return PRODUCT_IMAGE_MAP[sku] ?? null;
}