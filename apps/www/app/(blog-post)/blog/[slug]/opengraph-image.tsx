import { ImageResponse } from "next/og";
import {
  getAllPostsMetadata,
  getPostMetadata,
} from "@/app/(portfolio)/blog/loader";
import { loadGoogleFont } from "@/lib/og/load-font";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOMAIN = "claycurry.com";
const ACCENT = "#39BE85";

export function generateStaticParams() {
  return getAllPostsMetadata().map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostMetadata(slug);

  const titleText = post.title;
  const subtitleText = post.subtitle ?? "";
  const tag = post.tags?.[0] ?? "";
  const date = post.publishedDate ?? "";

  const fontText = `${titleText}${subtitleText}${tag}${date}${DOMAIN}`;
  const [poppinsBold, poppinsRegular] = await Promise.all([
    loadGoogleFont("Poppins", fontText, 700),
    loadGoogleFont("Poppins", fontText, 400),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f0f0f",
        fontFamily: "Poppins",
      }}
    >
      {/* Accent bar at top */}
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: ACCENT,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            fontSize: titleText.length > 60 ? 48 : 56,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            display: "block",
            lineClamp: 2,
          }}
        >
          {titleText}
        </div>
        {subtitleText && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: "#888888",
              marginTop: "20px",
              lineHeight: 1.4,
              display: "block",
              lineClamp: 2,
            }}
          >
            {subtitleText}
          </div>
        )}
      </div>

      {/* Bottom row: tag + date + branding */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 80px 40px",
          gap: "16px",
        }}
      >
        {tag && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: ACCENT,
              border: `1px solid ${ACCENT}44`,
              borderRadius: "9999px",
              padding: "4px 16px",
            }}
          >
            {tag}
          </div>
        )}
        {date && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: "#666666",
            }}
          >
            {date}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: ACCENT,
          }}
        >
          {DOMAIN}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Poppins",
          data: poppinsBold,
          weight: 700,
        },
        {
          name: "Poppins",
          data: poppinsRegular,
          weight: 400,
        },
      ],
    },
  );
}
