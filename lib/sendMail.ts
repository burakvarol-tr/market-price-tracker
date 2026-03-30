import nodemailer from "nodemailer";

type ChangedProduct = {
  name: string;
  sku: string;
  oldPrice: string;
  newPrice: string;
};

export async function sendPriceChangeEmail(changedProducts: ChangedProduct[]) {
  if (changedProducts.length === 0) return;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.EMAIL_TO;

  if (!user || !pass || !to) {
    throw new Error(".env.local içindeki mail bilgileri eksik.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const text = changedProducts
    .map(
      (p) =>
        `${p.name}\nSKU: ${p.sku}\nEski fiyat: ${p.oldPrice}\nYeni fiyat: ${p.newPrice}`
    )
    .join("\n\n------------------\n\n");

  await transporter.sendMail({
    from: `"Price Tracker" <${user}>`,
    to,
    subject: "A101 fiyat değişim bildirimi",
    text,
  });
}