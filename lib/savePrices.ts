import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "prices.json");

export function readPrices(): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data || "{}");
}

export function savePrices(newData: Record<string, string>) {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
}