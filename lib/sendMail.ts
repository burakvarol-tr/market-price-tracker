import nodemailer from "nodemailer";

type MailItem = {
  sku: string;
  name: string;
  market: string;
  previousPrice: number | null;
  currentPrice: number | null;
  changePercent: number | null;
};

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(2)} TL`;
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function buildReportUrl(baseUrl: string, market: string, items: MailItem[]) {
  const changed = items.map((item) => item.sku).join(",");

  return `${baseUrl}/report?market=${encodeURIComponent(
    market
  )}&changed=${encodeURIComponent(changed)}`;
}

function buildDetailUrl(baseUrl: string, sku: string) {
  return `${baseUrl}/report/detail?sku=${encodeURIComponent(sku)}`;
}

function getChangeColor(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#64748B";
  }

  if (value > 0) return "#059669";
  if (value < 0) return "#DC2626";
  return "#64748B";
}

function buildHtml(baseUrl: string, market: string, items: MailItem[]) {
  const reportUrl = buildReportUrl(baseUrl, market, items);

  const rows = items
    .map((item) => {
      const percent = item.changePercent ?? 0;
      const color = getChangeColor(percent);

      return `
        <tr>
          <td style="padding:10px;border-top:1px solid #E5E7EB;">
            ${item.name}
            <div style="font-size:12px;color:#64748B;">SKU: ${item.sku}</div>
          </td>

          <td style="padding:10px;border-top:1px solid #E5E7EB;">
            ${formatPrice(item.previousPrice)} → ${formatPrice(
        item.currentPrice
      )}
          </td>

          <td style="padding:10px;border-top:1px solid #E5E7EB;">
            <span style="color:${color};font-weight:700;">
              ${formatPercent(percent)}
            </span>
          </td>

          <td style="padding:10px;border-top:1px solid #E5E7EB;">
            <a
              href="${buildDetailUrl(baseUrl, item.sku)}"
              style="color:#7C3AED;font-weight:700;text-decoration:none;"
            >
              Detayı Aç
            </a>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial;padding:20px;background:#F8FAFC;">
      
      <div style="
        max-width:720px;
        margin:auto;
        background:#FFFFFF;
        padding:20px;
        border-radius:12px;
      ">
        
        <div style="font-size:12px;color:#64748B;font-weight:700;margin-bottom:10px;">
          MARKET PRICE TRACKER
        </div>

        <h2 style="margin:0 0 10px 0;color:#0F172A;">
          ${market} - Fiyat Değişimi
        </h2>

        <p style="color:#475569;margin-bottom:20px;">
          ${items.length} üründe fiyat değişti.
        </p>

        <table style="
          width:100%;
          border-collapse:collapse;
          font-size:14px;
        ">
          <tr style="background:#F8FAFC;">
            <th style="padding:10px;text-align:left;color:#64748B;">Ürün</th>
            <th style="padding:10px;text-align:left;color:#64748B;">Fiyat</th>
            <th style="padding:10px;text-align:left;color:#64748B;">Değişim</th>
            <th style="padding:10px;text-align:left;color:#64748B;">Detay</th>
          </tr>

          ${rows}
        </table>

        <div style="margin-top:18px;">
          <a
            href="${reportUrl}"
            style="
              color:#1E3A8A;
              font-weight:700;
              text-decoration:none;
              font-size:14px;
            "
          >
            Raporu Aç
          </a>
        </div>

        <p style="margin-top:20px;font-size:12px;color:#64748B;">
          Bu bildirim Market Price Tracker sistemi tarafından otomatik oluşturulmuştur.
          Rapor bağlantısı üzerinden güncel ekranı istediğiniz zaman tekrar açabilirsiniz.
        </p>

      </div>
    </div>
  `;
}

export async function sendPriceChangeEmailByMarket(
  market: string,
  items: MailItem[]
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

    const html = buildHtml(baseUrl, market, items);

    const info = await transporter.sendMail({
      from: `"Market Price Tracker" <${user}>`,
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