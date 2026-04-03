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

function buildMarketReportUrl(market: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://market-price-tracker-gold.vercel.app";

  return `${baseUrl}/report?market=${encodeURIComponent(market)}`;
}

function buildDetailUrl(sku: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://market-price-tracker-gold.vercel.app";

  return `${baseUrl}/report/detail?sku=${encodeURIComponent(sku)}`;
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

  const finalReportUrl = reportUrl || buildMarketReportUrl(market);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const rows = items
    .map((item) => {
      const changeColor =
        (item.changePercent ?? 0) > 0
          ? "#059669"
          : (item.changePercent ?? 0) < 0
          ? "#DC2626"
          : "#475569";

      return `
        <tr>
          <td style="padding:16px 14px;border-bottom:1px solid #E2E8F0;vertical-align:top;">
            <div style="font-size:16px;color:#0F172A;font-weight:500;">
              ${item.name}
            </div>
            <div style="font-size:13px;color:#64748B;margin-top:6px;">
              SKU: ${item.sku}
            </div>
          </td>

          <td style="padding:16px 14px;border-bottom:1px solid #E2E8F0;vertical-align:top;font-size:16px;color:#0F172A;">
            ${formatPrice(item.previousPrice)} → ${formatPrice(item.currentPrice)}
          </td>

          <td style="padding:16px 14px;border-bottom:1px solid #E2E8F0;vertical-align:top;font-size:16px;font-weight:700;color:${changeColor};">
            ${formatPercent(item.changePercent)}
          </td>

          <td style="padding:16px 14px;border-bottom:1px solid #E2E8F0;vertical-align:top;">
            <a href="${buildDetailUrl(item.sku)}" style="color:#7C3AED;text-decoration:none;font-size:16px;font-weight:700;">
              Detayı Aç
            </a>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="margin:0;padding:0;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
      <div style="max-width:1700px;margin:0 auto;padding:10px 10px 24px;">
        <div style="font-size:13px;font-weight:700;letter-spacing:0.02em;color:#64748B;margin-bottom:12px;">
          MARKET PRICE TRACKER
        </div>

        <h1 style="margin:0 0 18px;font-size:32px;line-height:1.2;color:#0F172A;font-weight:700;">
          ${market} - Fiyat Değişimi
        </h1>

        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
          ${items.length} üründe fiyat değişti.
        </p>

        <table style="width:100%;border-collapse:collapse;background:#FFFFFF;margin-bottom:26px;">
          <thead>
            <tr style="background:#F1F5F9;text-align:left;">
              <th style="padding:14px;border-bottom:1px solid #CBD5E1;font-size:16px;color:#64748B;">
                Ürün
              </th>
              <th style="padding:14px;border-bottom:1px solid #CBD5E1;font-size:16px;color:#64748B;">
                Fiyat
              </th>
              <th style="padding:14px;border-bottom:1px solid #CBD5E1;font-size:16px;color:#64748B;">
                Değişim
              </th>
              <th style="padding:14px;border-bottom:1px solid #CBD5E1;font-size:16px;color:#64748B;">
                Detay
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin:0 0 22px;">
          <a href="${finalReportUrl}" style="color:#1E3A8A;text-decoration:none;font-size:18px;font-weight:700;">
            Raporu Aç
          </a>
        </div>

        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
          Bu bildirim Market Price Tracker sistemi tarafından otomatik oluşturulmuştur.
          Rapor bağlantısı üzerinden güncel ekranı istediğiniz zaman tekrar açabilirsiniz.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: {
        name: "Market Price Tracker",
        address: user,
      },
      sender: {
        name: "Market Price Tracker",
        address: user,
      },
      replyTo: user,
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