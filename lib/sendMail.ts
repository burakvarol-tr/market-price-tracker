import nodemailer from "nodemailer";

type ChangedProduct = {
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
};

function formatPrice(price: number) {
  return `${(price / 100).toFixed(2)} ₺`;
}

function getChangePercent(oldPrice: number, newPrice: number) {
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
  const reportLink = `${appUrl}/report`;

  const htmlRows = changedProducts
    .map((product) => {
      const percent = getChangePercent(product.oldPrice, product.newPrice);
      const arrow = product.newPrice > product.oldPrice ? "⬆️" : "⬇️";
      const percentText = `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;

      return `
        <tr>
          <td style="border:1px solid #e5e7eb;padding:12px;">${product.name}</td>
          <td style="border:1px solid #e5e7eb;padding:12px;">${product.sku}</td>
          <td style="border:1px solid #e5e7eb;padding:12px;">${formatPrice(product.oldPrice)}</td>
          <td style="border:1px solid #e5e7eb;padding:12px;color:${
            product.newPrice > product.oldPrice ? "#16a34a" : "#dc2626"
          };font-weight:700;">${arrow} ${formatPrice(product.newPrice)}</td>
          <td style="border:1px solid #e5e7eb;padding:12px;font-weight:700;color:${
            product.newPrice > product.oldPrice ? "#16a34a" : "#dc2626"
          };">${percentText}</td>
        </tr>
      `;
    })
    .join("");

  const changedSkuList = changedProducts.map((x) => x.sku).join(",");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:24px;">
      <div style="max-width:900px;margin:0 auto;background:#ffffff;border-radius:18px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8);border-radius:16px;padding:24px;color:white;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;">A101 Fiyat Değişim Raporu</h2>
          <p style="margin:0;opacity:0.9;">Değişen ürünleri ve tüm ürün listesini tek ekranda görüntüleyebilirsin.</p>
        </div>

        <table style="border-collapse:collapse;width:100%;margin-top:12px;font-size:14px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Ürün</th>
              <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">SKU</th>
              <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Eski Fiyat</th>
              <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Yeni Fiyat</th>
              <th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Değişim</th>
            </tr>
          </thead>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>

        <div style="margin-top:24px;">
          <a
            href="${reportLink}?changed=${encodeURIComponent(changedSkuList)}"
            target="_blank"
            style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:700;"
          >
            Tüm ürünleri premium raporda aç
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