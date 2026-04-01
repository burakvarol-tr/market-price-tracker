import Link from "next/link";
import { getAllProductsWithHistory } from "@/lib/firestorePrices";

function formatPrice(price?: number | null) {
  if (price == null) return "-";
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price / 100) + " ₺"
  );
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("tr-TR");
}

export default async function HomePage() {
  const products = await getAllProductsWithHistory();

  // 🔥 EN SON DEĞİŞEN ÜRÜN (senin istediğin)
  const lastChangedProduct = products
    .filter((p) => p.lastChangedAt)
    .sort(
      (a, b) =>
        new Date(b.lastChangedAt || "").getTime() -
        new Date(a.lastChangedAt || "").getTime()
    )[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "28px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
            Fiyat Takip Paneli
          </h1>

          <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>
            Ürünlerin son fiyatını ve değişimlerini hızlıca gör.
          </p>

          <Link
            href="/report"
            style={{
              display: "inline-block",
              marginTop: 14,
              background: "#2563eb",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Tüm raporu aç
          </Link>
        </div>

        {/* 🔥 EN SON DEĞİŞEN ÜRÜN */}
        {lastChangedProduct && (
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "#111827",
              border: "1px solid #1f2937",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              SON DEĞİŞEN ÜRÜN
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
              {lastChangedProduct.name}
            </div>

            <div style={{ marginTop: 6, fontSize: 14 }}>
              {formatPrice(lastChangedProduct.lastPrice)}
            </div>

            <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8" }}>
              {formatDate(lastChangedProduct.lastChangedAt)}
            </div>
          </div>
        )}

        {/* TABLO */}
        <div
          style={{
            background: "#111827",
            borderRadius: 14,
            border: "1px solid #1f2937",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ color: "#94a3b8", fontSize: 12 }}>
                <th style={th}>Ürün</th>
                <th style={th}>Fiyat</th>
                <th style={th}>Son Değişim</th>
                <th style={th}>Detay</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.sku}>
                  <td style={tdStrong}>{item.name}</td>

                  <td style={td}>{formatPrice(item.lastPrice)}</td>

                  <td style={td}>
                    {formatDate(item.lastChangedAt)}
                  </td>

                  <td style={td}>
                    <Link
                      href={`/report/${item.sku}`}
                      style={{
                        color: "#60a5fa",
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      Aç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderTop: "1px solid #1f2937",
  fontSize: 13,
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 600,
};