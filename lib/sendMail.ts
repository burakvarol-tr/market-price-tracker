import nodemailer from "nodemailer";

type ChangedProduct = {
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price) + " ₺";
}

function getPercent(oldPrice: number, newPrice: number) {
  if (!oldPrice) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export async function sendPriceChangeEmail(changedProducts: ChangedProduct[]) {
  if (!changedProducts.length) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const to = process.env.MAIL_TO || process.env.GMAIL_USER;

  const changedSkuList = changedProducts.map((x) => x.sku).join(",");
  const reportLink = `${appUrl}/report?changed=${encodeURIComponent(changedSkuList)}`;

  const rows = changedProducts
    .map((product) => {
      const percent = getPercent(product.oldPrice, product.newPrice);
      const isUp = percent > 0;
      const isDown = percent < 0;
      const isSame = percent === 0;

      const color = isSame ? "#94a3b8" : isUp ? "#22c55e" : "#ef4444";
      const arrow = isSame ? "" : isUp ? "▲" : "▼";
      const percentText = isSame ? "%0.0" : `${arrow} %${Math.abs(percent).toFixed(1)}`;

      return `
        <tr>
          <td style="padding:12px;border:1px solid #e5e7eb;">${product.name}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;">${product.sku}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;">${formatPrice(product.oldPrice)}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;color:${color};font-weight:700;">
            ${arrow ? `${arrow} ` : ""}${formatPrice(product.newPrice)}
          </td>
          <td style="padding:12px;border:1px solid #e5e7eb;color:${color};font-weight:700;">
            ${percentText}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="background:#f3f4f6;padding:24px;font-family:Arial,sans-serif;">
      <div style="max-width:900px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8);border-radius:16px;padding:24px;color:white;margin-bottom:20px;">
          <div style="font-size:12px;opacity:0.9;font-weight:700;">MARKET PRICE TRACKER</div>
          <h2 style="margin:8px 0 10px 0;">Fiyat Değişimi Tespit Edildi</h2>
          <p style="margin:0;opacity:0.92;">Değişen ürünler aşağıda listelenmiştir. Tüm ürünleri tek ekranda görmek için rapor linkini açabilirsin.</p>
        </div>

        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:12px;border:1px solid #e5e7eb;text-align:left;">Ürün</th>
              <th style="padding:12px;border:1px solid #e5e7eb;text-align:left;">SKU</th>
              <th style="padding:12px;border:1px solid #e5e7eb;text-align:left;">Eski Fiyat</th>
              <th style="padding:12px;border:1px solid #e5e7eb;text-align:left;">Yeni Fiyat</th>
              <th style="padding:12px;border:1px solid #e5e7eb;text-align:left;">Değişim</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:24px;">
          <a
            href="${reportLink}"
            target="_blank"
            style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:700;"
          >
            Tüm değişimleri raporda aç
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "A101 Fiyat Değişikliği Bildirimi",
    html,
  });
}