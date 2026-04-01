import Link from "next/link";

type Product = {
  name: string;
  sku: string;
  price: number;
};

const products: Product[] = [
  { name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml", sku: "13002151", price: 10.5 },
  { name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml", sku: "13002152", price: 10.5 },
  { name: "Üstad %100 Organik Meyve Suyu Elma 1 L", sku: "13002977", price: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L", sku: "13002973", price: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L", sku: "13002976", price: 119 },
];

export default function ReportPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        padding: "30px 20px",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>
          Fiyat Değişim Paneli
        </h1>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ color: "#94a3b8" }}>
            <tr>
              <th style={th}>Ürün</th>
              <th style={th}>Fiyat</th>
              <th style={th}>Detay</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.sku}>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.price.toFixed(2)} ₺</td>
                <td style={td}>
                  <Link href={`/report/${p.sku}`} style={{ color: "#60a5fa" }}>
                    Aç
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const th = { textAlign: "left", padding: 10 };
const td = { padding: 10, borderTop: "1px solid #1f2937" };