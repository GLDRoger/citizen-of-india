// Writes public/monuments/<name>.svg: filled "poster" variants of the monument
// line drawings for CSS background-clip: text. Run with `npm run export:monuments`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const INK = "#6b3f14";
const SOURCES = ["monument-frame", "monuments-more", "monuments"];

// Transpile the TSX modules to CommonJS in a scratch directory inside
// node_modules so relative imports and `react` keep resolving.
const scratch = join(root, "node_modules/.cache/monuments-export");
mkdirSync(scratch, { recursive: true });
for (const name of SOURCES) {
  const src = readFileSync(join(root, "src/components/ui", `${name}.tsx`), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  writeFileSync(join(scratch, `${name}.js`), outputText);
}
const { Monument, monumentNames } = require(join(scratch, "monuments.js"));

const outDir = join(root, "public/monuments");
mkdirSync(outDir, { recursive: true });

for (const name of monumentNames) {
  const markup = renderToStaticMarkup(
    React.createElement(Monument, { name, style: { color: INK }, strokeWidth: 1.6 }),
  );
  const inner = markup
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replaceAll("currentColor", INK);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#fbdcae"/><stop offset="1" stop-color="#f09a4a"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="240" fill="url(#bg)"/>` +
    `<g fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${inner}</g>` +
    `</svg>\n`;
  writeFileSync(join(outDir, `${name}.svg`), svg);
  console.log(`${name}.svg ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}

rmSync(scratch, { recursive: true, force: true });
