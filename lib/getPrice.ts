export type ProductItem = {
  name: string;
  sku: string;
};

export type ProductWithPrice = {
  name: string;
  sku: string;
  price: string;
  stock: string;
};

async function fetchA101Product(sku: string) {
  const url = `https://rio.a101.com.tr/dbmk89vnr/CALL/Store/getProductBySku/VS032?sku=${sku}&channel=SLOT&__culture=tr-TR&__platform=web&data=e30%3D&__isbase64=true`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "A101-User-Agent": "web-2.3.9",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`İstek başarısız: ${res.status}`);
  }

  const data = await res.json();

  return {
    price: data?.product?.price?.discountedStr || "Fiyat bulunamadı",
    stock: data?.product?.stock || "Bilinmiyor",
  };
}

export async function getA101Products(
  products: ProductItem[]
): Promise<ProductWithPrice[]> {
  const results = await Promise.all(
    products.map(async (product) => {
      try {
        const data = await fetchA101Product(product.sku);

        return {
          name: product.name,
          sku: product.sku,
          price: data.price,
          stock: data.stock,
        };
      } catch (error) {
        return {
          name: product.name,
          sku: product.sku,
          price: "Hata",
          stock: "Hata",
        };
      }
    })
  );

  return results;
}