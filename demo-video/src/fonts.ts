import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const bodyFont = "Citizen Geist";
export const displayFont = "Citizen Anek";

await Promise.all([
  loadFont({
    family: bodyFont,
    url: staticFile("fonts-geist.woff2"),
    weight: "400",
  }),
  loadFont({
    family: bodyFont,
    url: staticFile("fonts-geist.woff2"),
    weight: "700",
  }),
  loadFont({
    family: displayFont,
    url: staticFile("fonts-anek-latin.woff2"),
    weight: "600",
  }),
  loadFont({
    family: displayFont,
    url: staticFile("fonts-anek-latin.woff2"),
    weight: "700",
  }),
  loadFont({
    family: displayFont,
    url: staticFile("fonts-anek-latin.woff2"),
    weight: "800",
  }),
]);
