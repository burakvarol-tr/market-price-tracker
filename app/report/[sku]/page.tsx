import Link from "next/link";
import { getProductHistory } from "@/lib/firestorePrices";

type PageProps = {
  params: Promise<{
    sku: string;
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

export default async function ProductReportPage({ params }: PageProps) {
  const { sku } = await params;
  const data = await getProductHistory(sku);

  if (!data) {
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
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              padding: 28,
              borderRadius: 24,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <h1 style={{ marginTop: 0 }}>Ürün bulunamadı</h1>
            <p style={{ color: "#cbd5e1" }}>Bu SKU için kayıt yok.</p>

            <Link
              href="/report"
              style={{
                display: "inline-block",
                marginTop: 16,
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Tüm rapora dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const product = data.product;
  const history = data.history;

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            PRODUCT REPORT
          </div>

          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>
            Tek Ürün Fiyat Geçmişi
          </h1>

          <p style={{ color: "#cbd5e1", fontSize: 16, marginTop: 12 }}>
            Seçilen ürünün son fiyatını ve geçmiş kayıtlarını burada görürsün.
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
              Tüm ürün raporuna dön
            </Link>

            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                textDecoration: "none",
                padding: "14px 18px",
                borderRadius: 14,
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard title="Ürün" value={product?.name ?? "-"} />
          <StatCard title="SKU" value={product?.sku ?? sku} />
          <StatCard title="Son Fiyat" value={formatPrice(product?.lastPrice)} />
          <StatCard
            title="Kayıt Sayısı"
            value={String(history.length)}
            subtitle="Geçmiş kontrol sayısı"
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
            <h2 style={{ margin: 0, fontSize: 22 }}>Fiyat Geçmişi</h2>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <th style={thStyle}>Tarih</th>
                    <th style={thStyle}>Fiyat</th>
                    <th style={thStyle}>İndirimli Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item: any) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>
                        {item.checkedAt
                          ? new Date(item.checkedAt).toLocaleString("tr-TR")
                          : "-"}
                      </td>
                      <td style={tdStyle}>{formatPrice(item.price)}</td>
                      <td style={tdStyle}>{formatPrice(item.discountedPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14 }}>
              Not: Ürün linki kullanılmıyor. Çünkü A101 linkleri sabit değil ve bazen ana sayfaya atabiliyor.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
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
      {subtitle ? (
        <div style={{ color: "#cbd5e1", fontSize: 13, marginTop: 8 }}>{subtitle}</div>
      ) : null}
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