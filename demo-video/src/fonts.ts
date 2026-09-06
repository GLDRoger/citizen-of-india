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

export const devanagariFont = "Citizen Anek Devanagari";
export const kannadaFont = "Citizen Anek Kannada";
await Promise.all([
  loadFont({
    family: devanagariFont,
    url: staticFile("fonts-anek-devanagari.woff2"),
    weight: "800",
  }),
  loadFont({
    family: kannadaFont,
    url: staticFile("fonts-anek-kannada.woff2"),
    weight: "800",
  }),
]);
