import { getProductHistory } from "@/lib/firestorePrices";

type PageProps = {
  params: Promise<{
    sku: string;
  }>;
};

export default async function ReportPage({ params }: PageProps) {
  const { sku } = await params;
  const data = await getProductHistory(sku);

  if (!data) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h1>Ürün bulunamadı</h1>
        <p>Bu SKU için kayıt yok.</p>
      </main>
    );
  }

  const product = data.product;
  const history = data.history;

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Fiyat Geçmişi</h1>

      <div style={{ marginBottom: 20 }}>
        <p><strong>Ürün:</strong> {product?.name}</p>
        <p><strong>SKU:</strong> {product?.sku}</p>
        <p><strong>Son Fiyat:</strong> {product?.lastPrice} ₺</p>
        {product?.url ? (
          <p>
            <a href={product.url} target="_blank">
              Ürün sayfasını aç
            </a>
          </p>
        ) : null}
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: 900,
        }}
      >
        <thead>
          <tr>
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
              <td style={tdStyle}>{item.price ?? "-"} ₺</td>
              <td style={tdStyle}>
                {item.discountedPrice != null ? `${item.discountedPrice} ₺` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 10,
  textAlign: "left",
  background: "#f5f5f5",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 10,
};