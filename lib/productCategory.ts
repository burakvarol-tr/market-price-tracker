export type ProductCategory =
  | "%100 Meyve Suyu"
  | "Meyve Suyu"
  | "Meyve Nektarı"
  | "Meyveli İçecek"
  | "Limonata"
  | "Smoothie"
  | "Sos"
  | "Kuruyemiş"
  | "Meyve ve Sebze"
  | "Diğer";

export function getProductCategory(name: string): ProductCategory {
  const value = name.toLocaleLowerCase("tr-TR");

  if (value.includes("smoothie")) return "Smoothie";
  if (value.includes("limonata")) return "Limonata";
  if (value.includes("nar ekşisi") || value.includes("sos")) return "Sos";
  if (value.includes("sarımsak") || value.includes("soğan") || value.includes("havuç file")) {
    return "Meyve ve Sebze";
  }
  if (value.includes("ceviz") || value.includes("fındık") || value.includes("badem")) {
    return "Kuruyemiş";
  }
  if (value.includes("%100")) return "%100 Meyve Suyu";
  if (value.includes("nektar")) return "Meyve Nektarı";
  if (
    value.includes("fullmix") ||
    value.includes("meyveli içecek") ||
    value.includes("meyve aromalı içecek") ||
    value.includes("karışık meyveli içecek") ||
    (value.includes("içecek") &&
      (value.includes("meyve") ||
        value.includes("elma") ||
        value.includes("portakal") ||
        value.includes("mandalina") ||
        value.includes("ananas") ||
        value.includes("havuç")))
  ) {
    return "Meyveli İçecek";
  }
  if (value.includes("meyve suyu") || value.includes("elma suyu")) {
    return "Meyve Suyu";
  }

  return "Diğer";
}
