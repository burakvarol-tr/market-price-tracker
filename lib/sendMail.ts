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
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;">${item.name}</td>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;">${item.sku}</td>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;">${formatPrice(item.previousPrice)}</td>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;font-weight:700;color:#0F172A;">${formatPrice(item.currentPrice)}</td>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;font-weight:700;color:${
            (item.changePercent ?? 0) > 0 ? "#059669" : (item.changePercent ?? 0) < 0 ? "#DC2626" : "#475569"
          };">${formatPercent(item.changePercent)}</td>
          <td style="padding:14px 12px;border:1px solid #E5E7EB;">${item.inStock ? "Var" : "Yok"}</td>
        </tr>
      `
    )
    .join("");

  const firstDetailUrl =
    items.length > 0
      ? `${
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://market-price-tracker-gold.vercel.app"
        }/report/detail?sku=${encodeURIComponent(items[0].sku)}`
      : "";

  const html = `
    <div style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:#0F172A;">
      <div style="max-width:1000px;margin:0 auto;background:#FFFFFF;padding:28px 24px;">
        <div style="font-size:13px;font-weight:700;letter-spacing:0.04em;color:#64748B;margin-bottom:10px;">
          MARKET PRICE TRACKER
        </div>

        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0F172A;">
          ${market} - Fiyat Değişimi
        </h1>

        <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#475569;">
          Toplam <strong>${items.length}</strong> ürün için fiyat değişimi tespit edildi.
        </p>

        <table style="width:100%;border-collapse:collapse;background:#FFFFFF;margin-bottom:18px;">
          <thead>
            <tr style="background:#F1F5F9;text-align:left;">
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">Ürün</th>
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">SKU</th>
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">Eski Fiyat</th>
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">Yeni Fiyat</th>
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">Değişim</th>
              <th style="padding:14px 12px;border:1px solid #E5E7EB;">Stok</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        ${
          firstDetailUrl
            ? `
          <div style="margin:14px 0 10px;">
            <a href="${firstDetailUrl}" style="color:#7C3AED;text-decoration:none;font-size:14px;font-weight:700;">
              Detayı Aç
            </a>
          </div>
        `
            : ""
        }

        <div style="margin:22px 0 0;">
          <a href="${finalReportUrl}" style="color:#1E3A8A;text-decoration:none;font-size:16px;font-weight:700;">
            Raporu Aç
          </a>
        </div>

        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748B;">
          Bu bildirim Market Price Tracker sistemi tarafından otomatik oluşturulmuştur.
          Rapor bağlantısı üzerinden güncel ekranı istediğiniz zaman tekrar açabilirsiniz.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Market Price Tracker" <${user}>`,
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