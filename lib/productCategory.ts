export type ProductCategory =
  | "Meyve Suyu"
  | "Meyve Nektarı"
  | "Meyveli İçecek"
  | "Limonata"
  | "Smoothie"
  | "Sos"
  | "Kuruyemiş"
  | "Diğer";

export function getProductCategory(name: string): ProductCategory {
  const value = name.toLocaleLowerCase("tr-TR");

  if (value.includes("smoothie")) return "Smoothie";
  if (value.includes("limonata")) return "Limonata";
  if (value.includes("nar ekşisi") || value.includes("sos")) return "Sos";
  if (value.includes("ceviz") || value.includes("fındık") || value.includes("badem")) {
    return "Kuruyemiş";
  }
  if (value.includes("nektar")) return "Meyve Nektarı";
  if (value.includes("%100") || value.includes("meyve suyu") || value.includes("elma suyu")) {
    return "Meyve Suyu";
  }
  if (value.includes("meyveli içecek") || value.includes("meyve aromalı içecek")) {
    return "Meyveli İçecek";
  }

  return "Diğer";
}
