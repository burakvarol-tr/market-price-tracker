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

  const changedProducts = products.filter(
    (item) =>
      item.previous?.price != null &&
      item.latest?.price != null &&
      item.previous.price !== item.latest.price
  );

  const lastChangedDates = products
    .map((item) => item.lastChangedAt)
    .filter(Boolean) as string[];

  const globalLastChangedAt =
    lastChangedDates.length > 0
      ? lastChangedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.25), transparent 35%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "white",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            padding: 28,
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(59,130,246,0.18)",
              color: "#bfdbfe",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            MARKET PRICE TRACKER
          </div>

          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1, fontWeight: 800 }}>
            Premium Fiyat Takip Paneli
          </h1>

          <p style={{ color: "#cbd5e1", fontSize: 18, marginTop: 14 }}>
            A101 ürünlerinin son fiyatlarını, değişimlerini ve son değişim tarihlerini tek
            ekranda gör.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link
              href="/report"
              style={{
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 700,
              }}
            >
              Tüm ürün raporunu aç
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard title="Toplam Ürün" value={String(products.length)} />
          <StatCard title="Değişen Ürün" value={String(changedProducts.length)} />
          <StatCard title="Son Değişim" value={formatDate(globalLastChangedAt)} />
          <StatCard
            title="Son Kontrol"
            value={formatDate(
              products
                .map((item) => item.latest?.checkedAt)
                .filter(Boolean)
                .sort((a, b) => new Date(String(b)).getTime() - new Date(String(a)).getTime())[0] ||
                null
            )}
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Son Kayıtlı Ürünler</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  <th style={thStyle}>Ürün</th>
                  <th style={thStyle}>SKU</th>
                  <th style={thStyle}>Son Fiyat</th>
                  <th style={thStyle}>Son Değişim</th>
                  <th style={thStyle}>Rapor</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.sku}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.sku}</td>
                    <td style={tdStyle}>{formatPrice(item.lastPrice)}</td>
                    <td style={tdStyle}>{formatDate(item.lastChangedAt)}</td>
                    <td style={tdStyle}>
                      <Link
                        href={`/report/${item.sku}`}
                        style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}
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
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: 20,
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 14,
  color: "#e2e8f0",
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  padding: 14,
  borderTop: "1px solid rgba(255,255,255,0.06)",
  color: "white",
};