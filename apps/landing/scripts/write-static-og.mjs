import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateOgImage, defaultOgImageCopy } from "../src/config/generate-og-image.ts";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "public", "og", "default.png");
const sourceIcon = join(root, "public", "brand", "muziks-og-icon.png");

const png = await generateOgImage({
  title: defaultOgImageCopy.title,
  shortDescription: defaultOgImageCopy.shortDescription,
  image: sourceIcon,
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
console.log("Wrote", outPath, `(${(png.length / 1024).toFixed(1)} KB)`);
