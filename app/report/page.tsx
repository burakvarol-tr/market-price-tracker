import Link from "next/link";
import { getAllProductsWithHistory } from "@/lib/firestorePrices";

type PageProps = {
  searchParams?: Promise<{
    changed?: string;
  }>;
};

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
          "radial-gradient(circle at top, rgba(59,130,246,0.20), transparent 35%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "white",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            padding: 28,
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            marginBottom: 20,
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

          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1, fontWeight: 800 }}>
            Tüm Ürünler Fiyat Değişim Paneli
          </h1>

          <p style={{ color: "#cbd5e1", fontSize: 18, marginTop: 12, marginBottom: 0 }}>
            Tüm ürünleri tek ekranda gör. Değişen ürünler daha belirgin gösterilir.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 20,
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
            <h2 style={{ margin: 0, fontSize: 22 }}>Ürün Listesi</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1320 }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  <th style={thStyle}>Ürün</th>
                  <th style={thStyle}>SKU</th>
                  <th style={thStyle}>Eski Fiyat</th>
                  <th style={thStyle}>Yeni Fiyat</th>
                  <th style={thStyle}>Değişim</th>
                  <th style={thStyle}>Son Değişim</th>
                  <th style={thStyle}>Son Kontrol</th>
                  <th style={thStyle}>Detay</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const oldPrice = item.previous?.price ?? null;
                  const newPrice = item.latest?.price ?? item.lastPrice ?? null;
                  const percent = getPercent(oldPrice, newPrice);
                  const isChangedFromMail = changedSet.has(item.sku);
                  const hasPriceChanged =
                    oldPrice != null && newPrice != null && oldPrice !== newPrice;
                  const isIncrease = percent != null && percent > 0;
                  const isDecrease = percent != null && percent < 0;

                  return (
                    <tr
                      key={item.sku}
                      style={{
                        background: isChangedFromMail
                          ? "rgba(37,99,235,0.16)"
                          : hasPriceChanged
                          ? "rgba(250,204,21,0.06)"
                          : "transparent",
                        borderLeft: hasPriceChanged ? "4px solid #facc15" : "4px solid transparent",
                      }}
                    >
                      <td style={tdStyleStrong}>{item.name}</td>
                      <td style={tdStyle}>{item.sku}</td>
                      <td style={tdStyle}>{formatPrice(oldPrice)}</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 800,
                          color: isIncrease
                            ? "#ef4444"
                            : isDecrease
                            ? "#22c55e"
                            : "white",
                        }}
                      >
                        {isIncrease ? "▲ " : isDecrease ? "▼ " : ""}
                        {formatPrice(newPrice)}
                      </td>
                      <td style={tdStyle}>
                        {percent == null ? (
                          <span style={{ color: "#94a3b8" }}>-</span>
                        ) : (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontWeight: 800,
                              background: isIncrease
                                ? "rgba(239,68,68,0.15)"
                                : "rgba(34,197,94,0.15)",
                              color: isIncrease ? "#ef4444" : "#22c55e",
                            }}
                          >
                            {isIncrease ? "▲ " : "▼ "}
                            {Math.abs(percent).toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>{formatDate(item.lastChangedAt)}</td>
                      <td style={tdStyle}>{formatDate(item.latest?.checkedAt)}</td>
                      <td style={tdStyle}>
                        <Link
                          href={`/report/${item.sku}`}
                          style={{
                            color: "#93c5fd",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          Detayı aç
                        </Link>
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
  fontWeight: 700,
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