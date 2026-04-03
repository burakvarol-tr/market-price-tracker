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

function getChangeColor(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#64748B";
  }

  if (value > 0) return "#059669";
  if (value < 0) return "#DC2626";
  return "#64748B";
}

function getChangeBadgeBg(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "#E2E8F0";
  }

  if (value > 0) return "#ECFDF5";
  if (value < 0) return "#FEF2F2";
  return "#E2E8F0";
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

function buildRows(baseUrl: string, items: MailItem[]) {
  return items
    .map((item) => {
      const changeColor = getChangeColor(item.changePercent);
      const badgeBg = getChangeBadgeBg(item.changePercent);

      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#0F172A;font-weight:600;">
            ${item.name}
            <div style="margin-top:4px;font-size:12px;color:#64748B;font-weight:500;">
              SKU: ${item.sku}
            </div>
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#475569;">
            ${formatPrice(item.previousPrice)}
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#0F172A;font-weight:700;">
            ${formatPrice(item.currentPrice)}
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;">
            <span style="
              display:inline-block;
              padding:6px 10px;
              border-radius:999px;
              font-size:12px;
              font-weight:700;
              color:${changeColor};
              background:${badgeBg};
            ">
              ${formatPercent(item.changePercent)}
            </span>
          </td>

          <td style="padding:14px 12px;border-bottom:1px solid #E5E7EB;">
            <a
              href="${buildDetailUrl(baseUrl, item.sku)}"
              style="
                display:inline-block;
                padding:8px 12px;
                border-radius:999px;
                text-decoration:none;
                font-size:12px;
                font-weight:700;
                color:#1D4ED8;
                background:#EFF6FF;
              "
            >
              Detayı Aç
            </a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function buildHtml(baseUrl: string, market: string, items: MailItem[]) {
  const reportUrl = buildReportUrl(baseUrl, market, items);
  const changedCount = items.length;

  return `
    <div style="margin:0;padding:0;background:#F4F7FB;">
      <div style="max-width:900px;margin:0 auto;padding:28px 16px;">
        
        <div style="
          background:linear-gradient(135deg,#FFFFFF 0%,#F8FBFF 55%,#EEF4FF 100%);
          border:1px solid #E5EAF2;
          border-radius:28px;
          padding:32px;
          box-shadow:0 12px 35px rgba(15,23,42,0.05);
        ">
          <div style="
            display:inline-block;
            padding:7px 12px;
            border-radius:999px;
            border:1px solid #D7E2F0;
            background:#FFFFFF;
            color:#375A8C;
            font-size:12px;
            font-weight:700;
            letter-spacing:0.08em;
          ">
            MARKET PRICE TRACKER
          </div>

          <h1 style="
            margin:18px 0 8px 0;
            font-size:34px;
            line-height:1.15;
            color:#0F172A;
            font-weight:800;
          ">
            ${market} fiyat değişim bildirimi
          </h1>

          <p style="
            margin:0;
            font-size:16px;
            line-height:1.8;
            color:#5B6B80;
          ">
            Takip edilen ürünlerde fiyat değişimi tespit edildi.
            Aşağıda özet tabloyu görebilir, rapor ekranından tüm detaylara ulaşabilirsin.
          </p>

          <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap;">
            <div style="
              display:inline-block;
              padding:10px 14px;
              border-radius:18px;
              background:#FFFFFF;
              border:1px solid #E5EAF2;
              color:#5B6B80;
              font-size:13px;
              font-weight:600;
            ">
              Market: ${market}
            </div>

            <div style="
              display:inline-block;
              padding:10px 14px;
              border-radius:18px;
              background:#FFFFFF;
              border:1px solid #E5EAF2;
              color:#5B6B80;
              font-size:13px;
              font-weight:600;
            ">
              Değişen ürün: ${changedCount}
            </div>
          </div>

          <div style="margin-top:24px;">
            <a
              href="${reportUrl}"
              style="
                display:inline-block;
                padding:13px 18px;
                border-radius:999px;
                background:linear-gradient(135deg,#3563E9 0%,#2D5BDE 100%);
                color:#FFFFFF;
                text-decoration:none;
                font-size:14px;
                font-weight:700;
                box-shadow:0 12px 28px rgba(53,99,233,0.20);
              "
            >
              Raporu Aç
            </a>
          </div>
        </div>

        <div style="
          margin-top:18px;
          background:#FFFFFF;
          border:1px solid #E5EAF2;
          border-radius:28px;
          overflow:hidden;
          box-shadow:0 10px 30px rgba(15,23,42,0.04);
        ">
          <div style="padding:22px 24px;border-bottom:1px solid #EEF2F6;">
            <div style="font-size:24px;color:#0F172A;font-weight:800;">
              Değişen Ürünler
            </div>
            <div style="margin-top:6px;font-size:14px;color:#6B788A;line-height:1.7;">
              Eski fiyat, yeni fiyat ve değişim oranı aşağıda listelenmiştir.
            </div>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#F8FAFD;">
                  <th style="padding:14px 12px;text-align:left;font-size:13px;color:#5F7083;border-bottom:1px solid #E5E7EB;">Ürün</th>
                  <th style="padding:14px 12px;text-align:left;font-size:13px;color:#5F7083;border-bottom:1px solid #E5E7EB;">Eski Fiyat</th>
                  <th style="padding:14px 12px;text-align:left;font-size:13px;color:#5F7083;border-bottom:1px solid #E5E7EB;">Yeni Fiyat</th>
                  <th style="padding:14px 12px;text-align:left;font-size:13px;color:#5F7083;border-bottom:1px solid #E5E7EB;">Değişim</th>
                  <th style="padding:14px 12px;text-align:left;font-size:13px;color:#5F7083;border-bottom:1px solid #E5E7EB;">Detay</th>
                </tr>
              </thead>
              <tbody>
                ${buildRows(baseUrl, items)}
              </tbody>
            </table>
          </div>
        </div>

        <div style="
          margin-top:16px;
          padding:18px 22px;
          border-radius:22px;
          background:#FFFFFF;
          border:1px solid #E5EAF2;
          color:#6B788A;
          font-size:13px;
          line-height:1.8;
          box-shadow:0 8px 24px rgba(15,23,42,0.03);
        ">
          Bu bildirim Market Price Tracker sistemi tarafından otomatik oluşturulmuştur.
          Linke tıklayarak güncel rapor ekranına istediğiniz zaman tekrar ulaşabilirsiniz.
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