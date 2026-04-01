import nodemailer from "nodemailer";

type ChangedProduct = {
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
};

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

  const htmlRows = changedProducts
    .map((product) => {
      const reportLink = `${appUrl}/report/${product.sku}`;

      return `
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">${product.name}</td>
          <td style="border:1px solid #ddd;padding:8px;">${product.sku}</td>
          <td style="border:1px solid #ddd;padding:8px;">${product.oldPrice} ₺</td>
          <td style="border:1px solid #ddd;padding:8px;">${product.newPrice} ₺</td>
          <td style="border:1px solid #ddd;padding:8px;">
            <a href="${reportLink}" target="_blank">Fiyat geçmişini gör</a>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>A101 Fiyat Değişikliği Tespit Edildi</h2>
      <p>Aşağıdaki ürünlerde fiyat değişikliği bulundu:</p>

      <table style="border-collapse:collapse;width:100%;margin-top:12px;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Ürün</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">SKU</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Eski Fiyat</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Yeni Fiyat</th>
            <th style="border:1px solid #ddd;padding:8px;text-align:left;">Rapor</th>
          </tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "A101 Fiyat Değişikliği Bildirimi",
    html,
  });
}