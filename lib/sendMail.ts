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
          <td style="padding:12px 12px;border-top:1px solid #E5E7EB;vertical-align:top;">
            <div style="font-size:15px;font-weight:700;color:#0F172A;line-height:1.35;">
              ${item.name}
            </div>
            <div style="margin-top:4px;font-size:12px;color:#64748B;">
              SKU: ${item.sku}
            </div>
          </td>

          <td style="padding:12px 12px;border-top:1px solid #E5E7EB;vertical-align:top;font-size:14px;color:#334155;white-space:nowrap;">
            ${formatPrice(item.previousPrice)} → ${formatPrice(item.currentPrice)}
          </td>

          <td style="padding:12px 12px;border-top:1px solid #E5E7EB;vertical-align:top;white-space:nowrap;">
            <span style="font-size:14px;font-weight:800;color:${color};">
              ${formatPercent(percent)}
            </span>
          </td>

          <td style="padding:12px 12px;border-top:1px solid #E5E7EB;vertical-align:top;white-space:nowrap;">
            <a
              href="${buildDetailUrl(baseUrl, item.sku)}"
              style="color:#4F46E5;font-weight:700;text-decoration:none;"
            >
              Detayı Aç
            </a>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="margin:0;padding:20px 10px;background:#F8FAFC;">
      <div style="
        max-width:760px;
        margin:0 auto;
        background:#FFFFFF;
        border:1px solid #E5E7EB;
        border-radius:16px;
        padding:18px;
        font-family:Arial,sans-serif;
      ">
        <div style="
          font-size:12px;
          color:#64748B;
          font-weight:800;
          letter-spacing:0.06em;
          margin-bottom:14px;
        ">
          MARKET PRICE TRACKER
        </div>

        <h1 style="
          margin:0 0 14px 0;
          font-size:22px;
          line-height:1.2;
          color:#0F172A;
          font-weight:800;
        ">
          ${market} fiyat değişimi
        </h1>

        <p style="
          margin:0 0 18px 0;
          color:#52637A;
          font-size:15px;
          line-height:1.6;
        ">
          Takip edilen ürünlerde fiyat değişimi tespit edildi.
        </p>

        <div style="
          border:1px solid #E5E7EB;
          border-radius:12px;
          overflow:hidden;
          background:#FFFFFF;
        ">
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <colgroup>
              <col style="width:48%;" />
              <col style="width:28%;" />
              <col style="width:12%;" />
              <col style="width:12%;" />
            </colgroup>

            <thead>
              <tr style="background:#F1F5F9;">
                <th style="padding:12px 12px;text-align:left;color:#475569;font-size:13px;font-weight:700;">Ürün</th>
                <th style="padding:12px 12px;text-align:left;color:#475569;font-size:13px;font-weight:700;">Fiyat</th>
                <th style="padding:12px 12px;text-align:left;color:#475569;font-size:13px;font-weight:700;">Değişim</th>
                <th style="padding:12px 12px;text-align:left;color:#475569;font-size:13px;font-weight:700;">Detay</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <div style="margin-top:16px;">
          <a
            href="${reportUrl}"
            style="color:#4F46E5;font-weight:700;text-decoration:none;font-size:14px;"
          >
            Raporu Aç
          </a>
        </div>
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