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

  const lastChangedProduct = products
    .filter((p) => p.lastChangedAt)
    .sort(
      (a, b) =>
        new Date(b.lastChangedAt || "").getTime() -
        new Date(a.lastChangedAt || "").getTime()
    )[0];

  const lastCheckedAt = products
    .map((item) => item.latest?.checkedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(String(b)).getTime() - new Date(String(a)).getTime())[0] || null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 30%), linear-gradient(180deg, #020617 0%, #0f172a 55%, #111827 100%)",
        color: "white",
        padding: "28px 16px 40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(30,41,59,0.92), rgba(30,64,175,0.22))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 26,
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(59,130,246,0.16)",
              color: "#bfdbfe",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            MARKET PRICE TRACKER
          </div>

          <h1
            style={{
              fontSize: 34,
              margin: 0,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Premium Fiyat Takip Paneli
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              marginTop: 12,
              marginBottom: 0,
              fontSize: 15,
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            A101 ürünlerinin son fiyatlarını, son değişim zamanını ve detay raporlarını
            tek ekranda gör.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <Link
              href="/report"
              style={{
                display: "inline-block",
                background: "#2563eb",
                padding: "11px 16px",
                borderRadius: 12,
                textDecoration: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Tüm ürün raporunu aç
            </Link>

            {lastChangedProduct ? (
              <Link
                href={`/report/${lastChangedProduct.sku}`}
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "11px 16px",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Son değişen ürünü aç
              </Link>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: 18,
              minHeight: 150,
            }}
          >
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
              SON DEĞİŞEN ÜRÜN
            </div>

            {lastChangedProduct ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
                  {lastChangedProduct.name}
                </div>

                <div style={{ marginTop: 12, fontSize: 28, fontWeight: 800 }}>
                  {formatPrice(lastChangedProduct.lastPrice)}
                </div>

                <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
                  Son değişim: {formatDate(lastChangedProduct.lastChangedAt)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: "#94a3b8" }}>
                Henüz fiyat değişimi kaydı yok.
              </div>
            )}
          </div>

          <StatCard title="Toplam Ürün" value={String(products.length)} subtitle="Takipte olan ürün" />
          <StatCard title="Son Kontrol" value={formatDate(lastCheckedAt)} subtitle="Sistemin son veri çekimi" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <MiniCard
            title="Meyve Suyu Grubu"
            value={String(products.filter((x) => x.name.toLowerCase().includes("meyve suyu")).length)}
          />
          <MiniCard
            title="İçecek Grubu"
            value={String(products.filter((x) => x.name.toLowerCase().includes("içecek")).length)}
          />
          <MiniCard
            title="Detay Rapor"
            value="Hazır"
          />
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Takipteki Ürünler</h2>
            <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 13 }}>
              Ürünlerin son fiyatını ve en son değişim zamanını hızlıca gör.
            </p>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(2,6,23,0.55)" }}>
                <th style={th}>Ürün</th>
                <th style={th}>Son Fiyat</th>
                <th style={th}>Son Değişim</th>
                <th style={th}>Detay</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.sku}>
                  <td style={tdStrong}>{item.name}</td>
                  <td style={td}>{formatPrice(item.lastPrice)}</td>
                  <td style={td}>{formatDate(item.lastChangedAt)}</td>
                  <td style={td}>
                    <Link
                      href={`/report/${item.sku}`}
                      style={{
                        color: "#60a5fa",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 600,
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

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        minHeight: 150,
      }}
    >
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
      <div style={{ marginTop: 10, fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>
        {subtitle}
      </div>
    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 700,
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  fontSize: 13,
  color: "white",
};

const tdStrong: React.CSSProperties = {
  ...td,
  fontWeight: 600,
};