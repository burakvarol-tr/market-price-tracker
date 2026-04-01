import Link from "next/link";
import { getAllProductsWithHistory } from "@/lib/firestorePrices";

type PageProps = {
  searchParams?: Promise<{
    changed?: string;
  }>;
};

function formatPrice(price?: number | null) {
  if (price == null) return "-";
  return `${(price / 100).toFixed(2)} ₺`;
}

function getPercent(oldPrice?: number | null, newPrice?: number | null) {
  if (!oldPrice || !newPrice) return null;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const changedSet = new Set(
    (params?.changed || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
  );

  const products = await getAllProductsWithHistory();

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.20), transparent 35%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
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
            PREMIUM REPORT
          </div>

          <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.1 }}>
            Tüm Ürünler Fiyat Değişim Paneli
          </h1>

          <p style={{ color: "#cbd5e1", fontSize: 16, marginTop: 12 }}>
            Tüm ürünler burada listelenir. Mailden gelen değişen ürünler öne çıkarılır.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link
              href="/"
              style={{
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 700,
              }}
            >
              Ana sayfaya dön
            </Link>
          </div>
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
            <h2 style={{ margin: 0, fontSize: 22 }}>Ürün Listesi</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th style={thStyle}>Ürün</th>
                  <th style={thStyle}>SKU</th>
                  <th style={thStyle}>Eski Fiyat</th>
                  <th style={thStyle}>Yeni Fiyat</th>
                  <th style={thStyle}>Değişim</th>
                  <th style={thStyle}>Tarih</th>
                  <th style={thStyle}>Link</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const oldPrice = item.previous?.price ?? null;
                  const newPrice = item.latest?.price ?? item.lastPrice ?? null;
                  const percent = getPercent(oldPrice, newPrice);
                  const isChanged = changedSet.has(item.sku);
                  const isUp = oldPrice != null && newPrice != null && newPrice > oldPrice;
                  const isDown = oldPrice != null && newPrice != null && newPrice < oldPrice;

                  return (
                    <tr
                      key={item.sku}
                      style={{
                        background: isChanged
                          ? "linear-gradient(90deg, rgba(37,99,235,0.22), rgba(16,185,129,0.10))"
                          : "transparent",
                      }}
                    >
                      <td style={tdStyleStrong}>{item.name}</td>
                      <td style={tdStyle}>{item.sku}</td>
                      <td style={tdStyle}>{formatPrice(oldPrice)}</td>
                      <td
                        style={{
                          ...tdStyle,
                          color: isUp ? "#22c55e" : isDown ? "#ef4444" : "white",
                          fontWeight: 800,
                        }}
                      >
                        {isUp ? "⬆ " : isDown ? "⬇ " : ""}
                        {formatPrice(newPrice)}
                      </td>
                      <td style={tdStyle}>
                        {percent == null ? (
                          "-"
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: isUp
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(239,68,68,0.15)",
                              color: isUp ? "#22c55e" : "#ef4444",
                              fontWeight: 800,
                            }}
                          >
                            {percent > 0 ? "+" : ""}
                            {percent.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {item.latest?.checkedAt
                          ? new Date(item.latest.checkedAt).toLocaleString("tr-TR")
                          : "-"}
                      </td>
                      <td style={tdStyle}>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}
                          >
                            Ürünü aç
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: 14,
  color: "#cbd5e1",
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  padding: 14,
  borderTop: "1px solid rgba(255,255,255,0.06)",
  color: "white",
};

const tdStyleStrong: React.CSSProperties = {
  ...tdStyle,
  fontWeight: 700,
};