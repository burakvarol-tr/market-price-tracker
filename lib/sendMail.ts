import nodemailer from "nodemailer";

export async function sendPriceChangeEmailByMarket(
  market: string,
  items: any[]
) {
  try {
    if (!items.length) {
      return { success: false, skipped: true, reason: "No changed items" };
    }

    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const to = process.env.MAIL_TO;

    if (!user || !pass || !to) {
      return {
        success: false,
        skipped: true,
        reason: "MAIL_USER / MAIL_PASS / MAIL_TO eksik",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://market-price-tracker-gold.vercel.app";

    const reportLink = `${baseUrl}/report?market=${encodeURIComponent(
      market
    )}&changed=${encodeURIComponent(items.map((i) => i.sku).join(","))}`;

    const productRows = items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb;">${item.name}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${item.previousPrice} TL → ${item.currentPrice} TL</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${item.changePercent ?? "-"}%</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">
              <a href="${baseUrl}/report/detail?sku=${item.sku}">Detay</a>
            </td>
          </tr>
        `
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;color:#111827;">
        <h2>${market} - Fiyat Değişimi</h2>
        <p>${items.length} üründe fiyat değişti.</p>

        <table style="border-collapse:collapse;width:100%;max-width:900px;">
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Ürün</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Fiyat</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Değişim</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Detay</th>
          </tr>
          ${productRows}
        </table>

        <p style="margin-top:20px;">
          <a href="${reportLink}" style="display:inline-block;padding:10px 16px;background:#2563EB;color:#fff;text-decoration:none;border-radius:8px;">
            Raporu Aç
          </a>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Price Tracker" <${user}>`,
      to,
      subject: `${market} - ${items.length} ürün fiyat değişti`,
      html,
    });

    return {
      success: true,
      skipped: false,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("sendPriceChangeEmailByMarket error:", error);

    return {
      success: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Unknown mail error",
    };
  }
}