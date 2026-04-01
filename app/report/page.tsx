import Link from "next/link";

type Product = {
  name: string;
  sku: string;
  oldPrice?: number;
  newPrice: number;
};

type PageProps = {
  searchParams?: Promise<{
    changed?: string;
  }>;
};

const products: Product[] = [
  { name: "Dooy Safari Meyveleri Meyveli İçecek 200 ml", sku: "13002151", oldPrice: 9.5, newPrice: 10.5 },
  { name: "Dooy Sihirli Ejderha Meyveli İçecek 200 ml", sku: "13002152", oldPrice: 10.5, newPrice: 10.5 },
  { name: "Üstad %100 Organik Meyve Suyu Elma 1 L", sku: "13002977", oldPrice: 109, newPrice: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Kırmızı Meyve 1 L", sku: "13002973", oldPrice: 119, newPrice: 119 },
  { name: "Üstad %100 Organik Meyve Suyu Sarı Meyve 1 L", sku: "13002976", oldPrice: 119, newPrice: 119 },
];

function formatPrice(value?: number) {
  if (value == null) return "-";
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + " ₺"
  );
}

function getPercent(oldP?: number, newP?: number) {
  if (!oldP || !newP) return null;
  return (((newP - oldP) / oldP) * 100).toFixed(1);
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const changedSet = new Set(
    (params?.changed || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
  );

  const changedCount = products.filter((p) => changedSet.has(p.sku)).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 30%), linear-gradient(180deg, #020617 0%, #0f172a 55%, #111827 100%)",
        color: "white",
        padding: "24px 16px 40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 16,
            padding: 20,
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(30,41,59,0.92), rgba(30,64,175,0.18))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(59,130,246,0.14)",
              color: "#bfdbfe",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            PREMIUM REPORT
          </div>

          <h1
            style={{
              fontSize: 28,
              margin: 0,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Fiyat Değişim Paneli
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              marginTop: 10,
              marginBottom: 0,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Değişen ürünler bu ekranda daha belirgin gösterilir.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "#2563eb",
                padding: "10px 14px",
                borderRadius: 12,
                textDecoration: "none",
                color: "white",
                fontSize: 13,
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
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <InfoCard title="Toplam Ürün" value={String(products.length)} />
          <InfoCard title="İşaretli Ürün" value={String(changedCount)} />
          <InfoCard title="Rapor" value="Hazır" />
          <InfoCard title="Durum" value="Aktif" />
        </div>

        <div
          style={{
            overflow: "hidden",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Ürün Listesi</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 980,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(2,6,23,0.55)" }}>
                  <th style={th}>Ürün</th>
                  <th style={thCenter}>Eski</th>
                  <th style={thCenter}>Yeni</th>
                  <th style={thCenter}>Değişim</th>
                  <th style={thCenter}>Detay</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const percent = getPercent(p.oldPrice, p.newPrice);
                  const isUp = percent && Number(percent) > 0;
                  const isDown = percent && Number(percent) < 0;
                  const isChanged = changedSet.has(p.sku);

                  return (
                    <tr
                      key={p.sku}
                      style={{
                        background: isChanged ? "rgba(59,130,246,0.14)" : "transparent",
                        boxShadow: isChanged ? "inset 4px 0 0 #60a5fa" : "none",
                      }}
                    >
                      <td style={tdStrong}>{p.name}</td>

                      <td style={tdCenterMuted}>{formatPrice(p.oldPrice)}</td>

                      <td
                        style={{
                          ...tdCenter,
                          fontWeight: 700,
                          color: isUp ? "#22c55e" : isDown ? "#ef4444" : "white",
                        }}
                      >
                        {isUp ? "▲ " : isDown ? "▼ " : ""}
                        {formatPrice(p.newPrice)}
                      </td>

                      <td style={tdCenter}>
                        {percent ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              background: isUp
                                ? "rgba(34,197,94,0.14)"
                                : "rgba(239,68,68,0.14)",
                              color: isUp ? "#22c55e" : "#ef4444",
                            }}
                          >
                            {isUp ? "▲" : "▼"} %{Math.abs(Number(percent)).toFixed(1)}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>-</span>
                        )}
                      </td>

                      <td style={tdCenter}>
                        <Link
                          href={`/report/${p.sku}`}
                          style={{
                            color: "#60a5fa",
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 600,
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

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.05)",
        padding: 16,
      }}
    >
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{value}</div>
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

const thCenter: React.CSSProperties = {
  ...th,
  textAlign: "center",
};

const tdStrong: React.CSSProperties = {
  padding: "14px 16px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  fontSize: 13,
  fontWeight: 600,
  color: "white",
};

const tdCenter: React.CSSProperties = {
  padding: "14px 16px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  fontSize: 13,
  textAlign: "center",
  color: "white",
};

const tdCenterMuted: React.CSSProperties = {
  ...tdCenter,
  color: "#94a3b8",
};