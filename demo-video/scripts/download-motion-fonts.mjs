import { Buffer } from "node:buffer";
import console from "node:console";
import { writeFile } from "node:fs/promises";
for (const [family, slug, subset] of [
  ["Anek Devanagari", "devanagari", "devanagari"],
  ["Anek Kannada", "kannada", "kannada"],
]) {
  const css = await (
    await globalThis.fetch(
      `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:wght@800&display=swap`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        },
      },
    )
  ).text();
  const block = css.split("/*").find((s) => s.startsWith(` ${subset} */`));
  const url = block?.match(/url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(css);
  await writeFile(
    `public/fonts-anek-${slug}.woff2`,
    Buffer.from(await (await globalThis.fetch(url)).arrayBuffer()),
  );
  const license = await globalThis.fetch(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/anek${slug}/OFL.txt`,
  );
  if (!license.ok)
    throw new Error(`License download failed: ${license.status}`);
  await writeFile(`public/fonts-anek-${slug}-OFL.txt`, await license.text());
  console.log(family, url);
}
