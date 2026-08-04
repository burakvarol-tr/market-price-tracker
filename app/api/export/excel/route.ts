import { getLatestPrices } from "@/lib/firestorePrices";
import { getProductCategory } from "@/lib/productCategory";

export const dynamic = "force-dynamic";

function escape(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const items = await getLatestPrices();
  const rows = items.map((item) => `
    <tr>
      <td>${escape(item.market)}</td>
      <td>${escape(item.sku)}</td>
      <td>${escape(item.name)}</td>
      <td>${escape(getProductCategory(item.name))}</td>
      <td>${item.currentPrice ?? ""}</td>
      <td>${item.previousPrice ?? ""}</td>
      <td>${item.changePercent ?? ""}</td>
      <td>${item.currentPrice === null ? "Okunamadı" : item.inStock ? "Stokta" : "Stok dışı"}</td>
      <td>${escape(item.lastCheckedAt ?? item.updatedAt)}</td>
    </tr>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
    <table border="1">
      <thead><tr><th>Market</th><th>SKU</th><th>Ürün</th><th>Kategori</th><th>Güncel Fiyat</th><th>Önceki Fiyat</th><th>Değişim %</th><th>Durum</th><th>Son Kontrol</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`;

  const date = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${html}`, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename=market-fiyat-raporu-${date}.xls`,
      "Cache-Control": "no-store",
    },
  });
}
