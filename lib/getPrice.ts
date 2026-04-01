export type A101ProductInput = {
  sku: string;
  name: string;
  url?: string;
};

export type A101ProductResult = {
  sku: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  priceText?: string;
  discountedPriceText?: string;
  url?: string;
};

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export async function getA101Products(
  productList: A101ProductInput[]
): Promise<A101ProductResult[]> {
  const results = await Promise.all(
    productList.map(async (item) => {
      const endpoint = `https://rio.a101.com.tr/dbmk89vnr/CALL/Store/getProductBySku/VS032?sku=${item.sku}&channel=SLOT&__culture=tr-TR&__platform=web&data=e30%3D&__isbase64=true`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${item.sku} için A101 isteği başarısız oldu: ${response.status}`);
      }

      const data = await response.json();

      const product = data?.product || data?.data?.product || data;

      if (!product) {
        throw new Error(`${item.sku} için ürün verisi bulunamadı`);
      }

      const normalPrice =
        parsePrice(product?.price?.normal) ??
        parsePrice(product?.price?.normalStr) ??
        parsePrice(product?.price);

      const discountedPrice =
        parsePrice(product?.price?.discounted) ??
        parsePrice(product?.price?.discountedStr);

      if (normalPrice === null) {
        throw new Error(`${item.sku} için fiyat okunamadı`);
      }

      return {
        sku: item.sku,
        name: item.name || product?.name || "İsimsiz ürün",
        price: normalPrice,
        discountedPrice,
        priceText:
          product?.price?.normalStr ??
          (normalPrice != null ? `${normalPrice} ₺` : null) ??
          undefined,
        discountedPriceText:
          product?.price?.discountedStr ??
          (discountedPrice != null ? `${discountedPrice} ₺` : null) ??
          undefined,
        url: item.url || product?.url || undefined,
      };
    })
  );

  return results;
}