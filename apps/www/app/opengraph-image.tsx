import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og/load-font";

export const alt = "Clay Curry - Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME = "Clay Curry";
const TITLE = "Software Engineer";
const DOMAIN = "claycurry.com";
const ACCENT = "#4FE3C2";

export default async function Image() {
  const poppinsBold = await loadGoogleFont(
    "Poppins",
    `${NAME}${TITLE}${DOMAIN}`,
    700,
  );

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
      {/* Accent line at top */}
      <div
        style={{
          width: "100%",
          height: "10px",
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}88, transparent)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          {NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#888888",
            marginTop: "16px",
          }}
        >
          {TITLE}
        </div>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          display: "flex",
          padding: "0 80px 40px",
        }}
      >
        <div
          style={{
            fontSize: 20,
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
      ],
    },
  );
}
