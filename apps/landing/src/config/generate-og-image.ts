import { getAverageColor } from "fast-average-color-node";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "@/src/config/og-site";

export type GenerateOgImageInput = {
  title: string;
  shortDescription: string;
  /** URL ou caminho aceito por `getAverageColor`. */
  image: string;
  /** Hex opcional (ex. `0066B2`) quando a extração automática falhar. */
  accentHex?: string;
};

type AverageColor = {
  hex: string;
  isDark: boolean;
};

const BRAND_FALLBACK_COLOR: AverageColor = { hex: "#0066B2", isDark: true };

const INTER_REGULAR_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.5/files/inter-latin-400-normal.woff";
const INTER_BOLD_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.5/files/inter-latin-700-normal.woff";

let fontsPromise:
  | Promise<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]>
  | undefined;

async function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(INTER_REGULAR_URL).then((r) => r.arrayBuffer()),
      fetch(INTER_BOLD_URL).then((r) => r.arrayBuffer()),
    ]).then(([regular, bold]) => [
      { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
    ]);
  }
  return fontsPromise;
}

function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/^#/, "").trim();
  if (cleaned.length === 3) {
    return `#${cleaned
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  return cleaned.length === 6 ? `#${cleaned}` : BRAND_FALLBACK_COLOR.hex;
}

function isHexDark(hex: string): boolean {
  const value = hex.replace(/^#/, "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function colorFromAccent(accentHex?: string): AverageColor | null {
  if (!accentHex) return null;
  const hex = normalizeHex(accentHex);
  if (hex === BRAND_FALLBACK_COLOR.hex && accentHex.length < 3) return null;
  return { hex, isDark: isHexDark(hex) };
}

async function resolveAverageColor(
  image: string,
  accentHex?: string,
): Promise<AverageColor> {
  const fromAccent = colorFromAccent(accentHex);
  if (fromAccent) return fromAccent;

  try {
    const color = await getAverageColor(image, { mode: "speed" });
    if (color.error || !color.hex) {
      return BRAND_FALLBACK_COLOR;
    }
    return { hex: color.hex, isDark: color.isDark };
  } catch {
    return BRAND_FALLBACK_COLOR;
  }
}

async function loadImageDataUrl(image: string): Promise<string | null> {
  try {
    const response = await fetch(image);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Gera PNG 800×420 para Open Graph: cor dominante da imagem → gradiente,
 * layout via satori (HTML/CSS → SVG) e rasterização com Resvg.
 */
export async function generateOgImage({
  title,
  shortDescription,
  image,
  accentHex,
}: GenerateOgImageInput): Promise<Uint8Array> {
  const [backgroundColor, imageDataUrl, fonts] = await Promise.all([
    resolveAverageColor(image, accentHex),
    loadImageDataUrl(image),
    loadFonts(),
  ]);

  const textColor = backgroundColor.isDark ? "#ffffff" : "#0a0a0a";
  const mutedTextColor = backgroundColor.isDark
    ? "rgba(255,255,255,0.72)"
    : "rgba(10,10,10,0.65)";
  const gradient = `linear-gradient(135deg, ${backgroundColor.hex}E6 0%, ${backgroundColor.hex}66 45%, ${backgroundColor.hex}1A 100%)`;

  // Satori aceita árvore `{ type, props }` em runtime; tipos do pacote exigem ReactNode.
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "row",
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          background: gradient,
          fontFamily: "Inter",
          padding: "48px",
          boxSizing: "border-box",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "space-between",
                paddingRight: "32px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "13px",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: mutedTextColor,
                          },
                          children: "Muziks",
                        },
                      },
                      {
                        type: "h1",
                        props: {
                          style: {
                            margin: 0,
                            fontSize: "42px",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            color: textColor,
                            maxWidth: "420px",
                          },
                          children: title,
                        },
                      },
                      {
                        type: "p",
                        props: {
                          style: {
                            margin: 0,
                            fontSize: "20px",
                            lineHeight: 1.45,
                            color: mutedTextColor,
                            maxWidth: "440px",
                          },
                          children: shortDescription,
                        },
                      },
                    ],
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "14px",
                      color: mutedTextColor,
                    },
                    children: "muziks.com.br · Política antes do volume.",
                  },
                },
              ],
            },
          },
          imageDataUrl
            ? {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "200px",
                    height: "200px",
                    borderRadius: "28px",
                    overflow: "hidden",
                    border: `2px solid ${backgroundColor.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}`,
                    boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
                    flexShrink: 0,
                    alignSelf: "center",
                  },
                  children: {
                    type: "img",
                    props: {
                      src: imageDataUrl,
                      width: 200,
                      height: 200,
                      style: {
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      },
                    },
                  },
                },
              }
            : {
                type: "div",
                props: { style: { width: 0, height: 0 } },
              },
        ],
      },
    } as Parameters<typeof satori>[0],
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts,
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_IMAGE_WIDTH },
  });

  return resvg.render().asPng();
}

export const defaultOgImageCopy = {
  title: "Muziks — música compartilhada com regras claras",
  shortDescription:
    "Player democrático para bares e espaços. O público vota, o dono mantém a curadoria.",
} as const;
