import { getLatestPrices } from "@/lib/firestorePrices";
import { getProductCategory } from "@/lib/productCategory";

export const dynamic = "force-dynamic";

function escape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

export async function GET() {
  const items = await getLatestPrices();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const changedToday = items.filter((item) => {
    if (!item.lastChangedAt) return false;
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(item.lastChangedAt)) === today;
  });

  const rows = items
    .map((item, index) => `
      <tr>
        <td class="center">${index + 1}</td>
        <td>${escape(item.market)}</td>
        <td class="text">${escape(item.sku)}</td>
        <td>${escape(item.name)}</td>
        <td>${escape(getProductCategory(item.name))}</td>
        <td class="money">${item.currentPrice ?? ""}</td>
        <td class="money">${item.previousPrice ?? ""}</td>
        <td class="percent ${Number(item.changePercent ?? 0) < 0 ? "negative" : Number(item.changePercent ?? 0) > 0 ? "positive" : ""}">${item.changePercent ?? ""}</td>
        <td>${item.currentPrice === null ? "Okunamadı" : item.inStock ? "Stokta" : "Stok dışı"}</td>
        <td>${escape(formatDate(item.lastCheckedAt ?? item.updatedAt))}</td>
      </tr>`)
    .join("");

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
        table { border-collapse: collapse; width: 100%; }
        .brand { background: #0b63a8; color: #fff; font-size: 28px; font-weight: 700; height: 54px; }
        .subtitle { background: #0e4f87; color: #dbeafe; font-size: 14px; height: 32px; }
        .summary td { background: #eff6ff; border: 1px solid #cbd5e1; font-weight: 700; height: 34px; }
        th { background: #dbeafe; color: #1e3a5f; border: 1px solid #94a3b8; padding: 8px; font-weight: 700; }
        td { border: 1px solid #cbd5e1; padding: 7px; vertical-align: middle; }
        tr:nth-child(even) td { background: #f8fafc; }
        .center { text-align: center; }
        .text { mso-number-format: "\\@"; }
        .money { mso-number-format: "0.00 \\"TL\\""; text-align: right; }
        .percent { mso-number-format: "0.00%"; text-align: right; }
        .positive { color: #047857; font-weight: 700; }
        .negative { color: #be123c; font-weight: 700; }
      </style>
    </head>
    <body>
      <table>
        <colgroup>
          <col style="width:42px"><col style="width:90px"><col style="width:160px"><col style="width:420px"><col style="width:150px"><col style="width:110px"><col style="width:110px"><col style="width:100px"><col style="width:100px"><col style="width:170px">
        </colgroup>
        <tr><td colspan="10" class="brand">göknur</td></tr>
        <tr><td colspan="10" class="subtitle">RETAIL INTELLIGENCE · MARKET FİYAT TAKİP RAPORU</td></tr>
        <tr class="summary"><td colspan="2">Toplam ürün</td><td>${items.length}</td><td colspan="2">Bugün değişen</td><td>${changedToday.length}</td><td colspan="2">Okunamayan</td><td colspan="2">${items.filter((item) => item.currentPrice === null).length}</td></tr>
        <tr><td colspan="10"></td></tr>
        <thead>
          <tr><th>#</th><th>Market</th><th>SKU</th><th>Ürün</th><th>Kategori</th><th>Güncel Fiyat</th><th>Önceki Fiyat</th><th>Değişim %</th><th>Durum</th><th>Son Kontrol</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
  </html>`;

  const date = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${html}`, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename=goknur-market-fiyat-raporu-${date}.xls`,
      "Cache-Control": "no-store",
    },
  });
}
