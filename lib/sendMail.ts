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

function buildHtml(baseUrl: string, market: string, items: MailItem[]) {
  const reportUrl = buildReportUrl(baseUrl, market, items);
  const changedCount = items.length;

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 10px;border-top:1px solid #EEF2F6;color:#0F172A;font-size:14px;font-weight:600;">
            ${item.name}
            <div style="margin-top:4px;font-size:12px;color:#64748B;font-weight:500;">
              SKU: ${item.sku}
            </div>
          </td>

          <td style="padding:12px 10px;border-top:1px solid #EEF2F6;color:#475569;font-size:14px;">
            ${formatPrice(item.previousPrice)} → ${formatPrice(item.currentPrice)}
          </td>

          <td style="padding:12px 10px;border-top:1px solid #EEF2F6;">
            <span style="
              display:inline-block;
              padding:6px 10px;
              border-radius:999px;
              background:#EEF2FF;
              color:#4338CA;
              font-size:12px;
              font-weight:700;
            ">
              ${formatPercent(item.changePercent)}
            </span>
          </td>

          <td style="padding:12px 10px;border-top:1px solid #EEF2F6;">
            <a
              href="${buildDetailUrl(baseUrl, item.sku)}"
              style="
                display:inline-block;
                padding:8px 12px;
                border-radius:999px;
                background:#EFF6FF;
                color:#1D4ED8;
                text-decoration:none;
                font-size:12px;
                font-weight:700;
              "
            >
              Detayı Aç
            </a>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="margin:0;padding:24px 10px;background:#F5F7FB;">
      <div style="
        max-width:720px;
        margin:0 auto;
        background:#FFFFFF;
        border:1px solid #E5EAF2;
        border-radius:24px;
        padding:28px;
        font-family:Arial,sans-serif;
      ">
        <div style="
          display:inline-block;
          padding:7px 12px;
          border:1px solid #D9E4F2;
          border-radius:999px;
          background:#FFFFFF;
          color:#3B5B8F;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.08em;
        ">
          MARKET PRICE TRACKER
        </div>

        <h1 style="
          margin:18px 0 8px 0;
          font-size:30px;
          line-height:1.2;
          color:#0F172A;
          font-weight:800;
        ">
          ${market} fiyat değişimi
        </h1>

        <p style="
          margin:0 0 20px 0;
          color:#5B6B80;
          font-size:15px;
          line-height:1.8;
        ">
          Takip edilen ürünlerde fiyat değişimi tespit edildi.
        </p>

        <div style="margin-bottom:22px;">
          <span style="
            display:inline-block;
            padding:9px 14px;
            border-radius:16px;
            border:1px solid #E5EAF2;
            background:#FAFCFF;
            color:#5B6B80;
            font-size:13px;
            font-weight:600;
            margin-right:8px;
          ">
            Market: ${market}
          </span>

          <span style="
            display:inline-block;
            padding:9px 14px;
            border-radius:16px;
            border:1px solid #E5EAF2;
            background:#FAFCFF;
            color:#5B6B80;
            font-size:13px;
            font-weight:600;
          ">
            Değişen ürün: ${changedCount}
          </span>
        </div>

        <div style="margin-bottom:24px;">
          <a
            href="${reportUrl}"
            style="
              display:inline-block;
              padding:13px 20px;
              border-radius:999px;
              color:#FFFFFF;
              text-decoration:none;
              font-size:14px;
              font-weight:700;
              background:#2D5BDE;
            "
          >
            Raporu Aç
          </a>
        </div>

        <div style="
          border:1px solid #E5EAF2;
          border-radius:20px;
          overflow:hidden;
        ">
          <div style="padding:18px 20px;border-bottom:1px solid #EEF2F6;background:#FFFFFF;">
            <div style="font-size:22px;color:#0F172A;font-weight:800;">
              Değişen Ürünler
            </div>
            <div style="margin-top:6px;font-size:14px;color:#6B788A;line-height:1.7;">
              Eski fiyat, yeni fiyat ve değişim oranı aşağıda listelenmiştir.
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;background:#FFFFFF;">
            <thead>
              <tr style="background:#F8FAFD;">
                <th style="padding:12px 10px;text-align:left;color:#5F7083;font-size:13px;border-bottom:1px solid #E5E7EB;">Ürün</th>
                <th style="padding:12px 10px;text-align:left;color:#5F7083;font-size:13px;border-bottom:1px solid #E5E7EB;">Fiyat</th>
                <th style="padding:12px 10px;text-align:left;color:#5F7083;font-size:13px;border-bottom:1px solid #E5E7EB;">Değişim</th>
                <th style="padding:12px 10px;text-align:left;color:#5F7083;font-size:13px;border-bottom:1px solid #E5E7EB;">Detay</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <div style="
          margin-top:16px;
          padding:16px 18px;
          border:1px solid #E5EAF2;
          border-radius:18px;
          background:#FFFFFF;
          color:#6B788A;
          font-size:13px;
          line-height:1.8;
        ">
          Bu bildirim Market Price Tracker sistemi tarafından otomatik oluşturulmuştur.
          Rapor bağlantısı üzerinden güncel ekranı istediğiniz zaman tekrar açabilirsiniz.
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
      subject: `${market} | ${items.length} üründe fiyat değişimi tespit edildi`,
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