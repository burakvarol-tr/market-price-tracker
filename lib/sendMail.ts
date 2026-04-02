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

function buildReportUrl(market: string, skus: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://market-price-tracker-gold.vercel.app";
  const changed = skus.join(",");
  return `${baseUrl}/report?market=${encodeURIComponent(market)}&changed=${encodeURIComponent(changed)}`;
}

function buildMailHtml(market: string, items: PriceRecord[]) {
  const reportUrl = buildReportUrl(
    market,
    items.map((x) => x.sku)
  );

  const rows = items
    .map((item) => {
      const color =
        (item.changePercent ?? 0) > 0
          ? "#16a34a"
          : (item.changePercent ?? 0) < 0
          ? "#dc2626"
          : "#6b7280";

      return `
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.sku}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${formatPrice(item.previousPrice)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;">${formatPrice(item.currentPrice)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;color:${color};font-weight:700;">${formatPercent(item.changePercent)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;padding:20px;color:#111827;">
      <h2 style="margin-bottom:8px;">${market} fiyat değişimi tespit edildi</h2>
      <p style="margin-bottom:16px;">Aşağıdaki ürünlerde fiyat değişimi var.</p>

      <table style="border-collapse:collapse;width:100%;max-width:900px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Ürün</th>
            <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">SKU</th>
            <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Eski Fiyat</th>
            <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Yeni Fiyat</th>
            <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Değişim</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <p style="margin-top:20px;">
        <a href="${reportUrl}" style="display:inline-block;padding:10px 14px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;">
          ${market} raporunu aç
        </a>
      </p>
    </div>
  `;
}

export async function sendPriceChangeEmailByMarket(
  market: string,
  items: PriceRecord[]
) {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const to = process.env.MAIL_TO;

  if (!user || !pass || !to) {
    console.warn("Mail env eksik. Mail gönderimi skip edildi.");
    return { ok: false, skipped: true };
  }

  if (!items.length) {
    return { ok: true, skipped: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const subject = `${market} fiyat değişimi: ${items.length} ürün`;
  const html = buildMailHtml(market, items);

  await transporter.sendMail({
    from: user,
    to,
    subject,
    html,
  });

  return { ok: true, skipped: false };
}