import nodemailer from "nodemailer";

export async function sendPriceChangeEmailByMarket(
  market: string,
  items: any[]
) {
  try {
    if (!items.length) return null;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://market-price-tracker-gold.vercel.app";

    const reportLink = `${baseUrl}/report?market=${market}&changed=${items
      .map((i) => i.sku)
      .join(",")}`;

    const productList = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.previousPrice} → ${item.currentPrice}</td>
          <td>${item.changePercent?.toFixed(2)}%</td>
          <td>
            <a href="${baseUrl}/report/detail?sku=${item.sku}">
              Detay
            </a>
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: Arial; padding:20px">
        <h2>${market} - Fiyat Değişimi</h2>

        <p>${items.length} üründe fiyat değişti</p>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Ürün</th>
            <th>Fiyat</th>
            <th>Değişim</th>
            <th>Detay</th>
          </tr>
          ${productList}
        </table>

        <br/>

        <a href="${reportLink}" 
           style="background:#2563EB;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">
           Raporu Aç
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"Price Tracker" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `${market} - ${items.length} ürün fiyat değişti`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("mail error:", error);
    return { success: false };
  }
}