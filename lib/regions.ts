/* The data (and the boundaries file) use the official French region names as stable keys.
   The site is in English, so what the visitor reads is the established English name where there is one
   (Brittany, Normandy, Corsica, Burgundy-Franche-Comté) and the official French name otherwise
   (Nouvelle-Aquitaine, Occitanie, Pays de la Loire …) — the same way English-language property sites write them. */
const ENGLISH: Record<string, string> = {
  Bretagne: "Brittany",
  Normandie: "Normandy",
  Corse: "Corsica",
  "Bourgogne-Franche-Comté": "Burgundy-Franche-Comté",
};

export const regionLabel = (name: string) => ENGLISH[name] ?? name;
