import nodemailer from "nodemailer";
import type { PriceRecord } from "./firestorePrices";

function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "-";
  return `${price.toFixed(2)} TL`;
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export async function sendPriceChangeEmailByMarket(
  market: string,
  items: PriceRecord[],
  reportUrl?: string
) {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const to = process.env.MAIL_TO;

  if (!user || !pass || !to) {
    return {
      success: false,
      message: "MAIL_USER / MAIL_PASS / MAIL_TO eksik",
    };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.sku}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${formatPrice(item.previousPrice)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;font-weight:700;">${formatPrice(item.currentPrice)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${formatPercent(item.changePercent)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.inStock ? "Var" : "Yok"}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h2 style="margin:0 0 12px;">${market} fiyat değişim bildirimi</h2>
      <p style="margin:0 0 16px;">
        Toplam <strong>${items.length}</strong> ürün için fiyat değişimi tespit edildi.
      </p>

      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#ffffff;">
        <thead>
          <tr style="background:#f8fafc;text-align:left;">
            <th style="padding:10px;border:1px solid #e5e7eb;">Ürün</th>
            <th style="padding:10px;border:1px solid #e5e7eb;">SKU</th>
            <th style="padding:10px;border:1px solid #e5e7eb;">Eski Fiyat</th>
            <th style="padding:10px;border:1px solid #e5e7eb;">Yeni Fiyat</th>
            <th style="padding:10px;border:1px solid #e5e7eb;">Değişim</th>
            <th style="padding:10px;border:1px solid #e5e7eb;">Stok</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      ${
        reportUrl
          ? `
        <div style="margin-top:20px;">
          <a
            href="${reportUrl}"
            style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;"
          >
            Raporu Aç
          </a>
        </div>
      `
          : ""
      }

      <p style="margin-top:18px;color:#64748b;font-size:13px;">
        Bu bağlantı mailin atıldığı andaki değişim kaydını açar.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: user,
      to,
      subject: `${market} fiyat değişimi (${items.length} ürün)`,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Mail gönderilemedi",
    };
  }
}