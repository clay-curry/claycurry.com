/**
 * API Route: Dynamic Open Graph Image Generator
 *
 * Generates dynamic Open Graph (OG) images for social media sharing.
 * Fetches the page at the given path, extracts OG metadata, and renders
 * a styled image with the title, description, and section information.
 *
 * Endpoint:
 * - GET /api/og?path=<path> - Generate an OG image for the specified page path
 *
 * The generated images are 1200x630 pixels (standard OG image dimensions)
 * and use Inter and Geist Mono fonts loaded dynamically from Google Fonts.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 * @see https://vercel.com/docs/functions/og-image-generation
 */
import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import openGraphScraper from "open-graph-scraper-lite";

/** Standard Open Graph image width in pixels */
const WIDTH = 1200;
/** Standard Open Graph image height in pixels */
const HEIGHT = 630;

/** Base URL for fetching page content (localhost in dev, production URL otherwise) */
const HOST =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3000`
    : `https://claycurry.com`;

/**
 * GET /api/og
 *
 * Generates a dynamic Open Graph image for social media previews.
 * Fetches the target page, extracts OG metadata, and renders a styled image.
 *
 * @param req - The incoming request with `path` query parameter
 * @returns An ImageResponse with the generated OG image, or an error response
 *
 * @example
 * // Request
 * GET /api/og?path=/blog/my-post
 *
 * // Returns a 1200x630 PNG image with the post's title and description
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  let path = requestUrl.searchParams.get("path")?.replace(/\/+$/, "") ?? "";

  if (path === "") path = "/";

  const { body, statusCode } = await get(`${HOST}${path}`);

  if (statusCode === 404) {
    return NextResponse.error();
  }
  if (statusCode !== 200 || !body) {
    return NextResponse.error();
  }

  const ogs = await openGraphScraper({ html: body });

  if (!ogs.result.success) {
    return NextResponse.error();
  }

  const regex = /(.*?) - (.*?)?$/;
  let title = ogs.result.ogTitle ?? "";
  let description = ogs.result.ogDescription ?? "";
  let section = "";
  const matches = regex.exec(title);
  if (matches) {
    title = matches[1] ?? ogs.result.ogTitle ?? "";
    section =
      matches[2]
        .toLocaleUpperCase()
        // For some reasons, regular dashes can not be rendered, so we're using en dashes instead
        .replace("-", "–") ?? "";
  }

  if (!title) {
    return NextResponse.error();
  }

  // Avoid stray words at the last line.
  if (description.split(" ").length > 2) {
    description =
      description.split(" ").slice(0, -1).join(" ") +
      "\xa0" + // &nbsp;
      description.split(" ").at(-1);
  }

  const [inter, geistMono] = await Promise.all([
    loadGoogleFont(
      "Inter",
      `${title + description}…` /* Used for truncating */,
    ),
    loadGoogleFont("Geist Mono", section),
  ]);

  return new ImageResponse(
    <div
      style={{
        fontSize: 40,
        background: `url("${HOST}/og-background.jpg")`,
        width: "100%",
        height: "100%",
        display: "flex",
        fontFamily: "Inter",
      }}
    >
      <div tw="absolute flex h-full w-full flex-col justify-between p-[32px] pt-[394px] pr-[40px]">
        <div tw="flex flex-col h-full border-1 border-t border-gray-800 p-8">
          {section && (
            <div
              tw="flex text-[20px] leading-[20px] font-medium tracking-[2px] text-gray-400"
              style={{
                fontFamily: "Geist Mono",
              }}
            >
              {section}
            </div>
          )}
          <div
            tw="mt-4 text-[60px] leading-[60px] font-medium text-white"
            style={{
              display: "block",
              lineClamp: 1,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              tw="mt-4 text-[24px] leading-[40px] font-medium text-gray-400"
              style={{
                display: "block",
                lineClamp: 1,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control":
          process.env.NODE_ENV === "development"
            ? "no-cache, no-store"
            : "public, no-transform, s-maxage=31536000, max-age=600",
      },
      fonts: [
        {
          name: "Inter",
          data: inter,
          weight: 400,
        },
        {
          name: "Geist Mono",
          data: geistMono,
          weight: 400,
        },
      ],
    },
  );
}

/**
 * Fetches the HTML content of a URL.
 *
 * @param url - The URL to fetch
 * @returns An object containing the response body and status code
 */
async function get(url: string) {
  const res = await fetch(url);
  const body = await res.text();
  return { body, statusCode: res.status };
}

/**
 * Dynamically loads a Google Font subset for the given text.
 *
 * Uses the Google Fonts CSS API to fetch only the glyphs needed for the
 * provided text, minimizing download size for OG image generation.
 *
 * @param font - The font family name (e.g., "Inter", "Geist Mono")
 * @param text - The text content that will be rendered (used for subsetting)
 * @param weight - The font weight (default: 400)
 * @returns ArrayBuffer containing the font data
 * @throws Error if the font fails to load
 */
async function loadGoogleFont(
  font: string,
  text: string,
  weight: number = 400,
) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}
