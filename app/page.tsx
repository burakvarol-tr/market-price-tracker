import { getA101Products } from "@/lib/getPrice";
import { sendPriceChangeEmail } from "@/lib/sendMail";
import {
  readPricesFromFirestore,
  savePricesToFirestore,
} from "@/lib/firestorePrices";

export default async function Home() {
  const products = [
    { name: "Üstad %100 Organik Meyve Suyu Elma 1 L", sku: "13002977" },
    { name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L", sku: "13002976" },
    { name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L", sku: "13002973" },
    { name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml", sku: "13002152" },
    { name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml", sku: "13002151" },
    { name: "Dooy Karpuz Çilek Meyveli İçecek 200 ml", sku: "13002601" },
    { name: "Dooy Şeftali Kayısı Kavun Meyveli İçecek 200 ml", sku: "13002602" },
    { name: "Dooy Atom Aromalı İçecek 7x200 ml", sku: "13002902" },
    { name: "Dooy Elma Çilek Böğürtlen Aromalı İçecek 7x200 ml", sku: "13002903" },
    { name: "Dooy Elma Muz Çilek Aromalı İçecek 7x200 ml", sku: "13002900" },
    { name: "Dooy Vişne Meyve Nektarı 200 ml", sku: "13001966" },
    { name: "Dooy Kayısı Meyve Nektarı 200 ml", sku: "13001955" },
    { name: "Dooy Şeftali Meyve Nektarı 200 ml", sku: "13001960" },
    { name: "Dooy Karışık Meyve Nektarı 200 ml", sku: "13001952" },
    { name: "Dooy Vişne Meyve Nektarı 1 L", sku: "13001964" },
    { name: "Dooy Sarı Meyveli Meyve Suyu %100 6x200 ml", sku: "13002505" },
    { name: "Dooy Kayısı Meyve Nektarı 1 L", sku: "13001953" },
    { name: "Dooy Şeftali Meyve Nektarı 1 L", sku: "13001958" },
    { name: "Dooy Ananas Meyve Aromalı İçecek 1 L", sku: "13001667" },
    { name: "Dooy Karışık Meyve Nektarı 1 L", sku: "13001951" },
  ];

  const pricedProducts = await getA101Products(products);
  const oldPrices = await readPricesFromFirestore();

  const updatedPrices: Record<string, string> = {};
  const changedProducts: {
    name: string;
    sku: string;
    oldPrice: string;
    newPrice: string;
  }[] = [];

  const productsWithChange = pricedProducts.map((product) => {
    const oldPrice = oldPrices[product.sku];
    const currentPrice = product.price;

    let change = "—";

    if (oldPrice && oldPrice !== currentPrice) {
      change = `Değişti (${oldPrice} → ${currentPrice})`;

      changedProducts.push({
        name: product.name,
        sku: product.sku,
        oldPrice,
        newPrice: currentPrice,
      });
    } else if (oldPrice) {
      change = "Aynı";
    }

    updatedPrices[product.sku] = currentPrice;

    return {
      ...product,
      change,
    };
  });

  if (changedProducts.length > 0) {
    await sendPriceChangeEmail(changedProducts);
  }

  await savePricesToFirestore(updatedPrices);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 24 }}>Market Price Tracker</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #333",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Ürün Adı</th>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Fiyat</th>
            <th style={thStyle}>Stok</th>
            <th style={thStyle}>Değişim</th>
          </tr>
        </thead>
        <tbody>
          {productsWithChange.map((product) => (
            <tr key={product.sku + product.name}>
              <td style={tdStyle}>{product.name}</td>
              <td style={tdStyle}>{product.sku}</td>
              <td style={tdStyle}>{product.price}</td>
              <td style={tdStyle}>{product.stock}</td>
              <td style={tdStyle}>{product.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #333",
  padding: "12px",
  textAlign: "left" as const,
};

const tdStyle = {
  border: "1px solid #333",
  padding: "12px",
};