import { ImageResponse } from "next/og";

export const alt = "Clay Curry";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d1117",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Left content */}
      <div
        style={{

          width: 600,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",

          justifyContent: "center",

        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#38bdf8",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Clay Curry
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 500,
            color: "#22d3ee",
            marginTop: 8,
          }}
        >
          Software Engineer
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            marginBottom: 20,
            backgroundColor: "#38bdf8",
            color: "#0d1117",
            fontSize: 64,
            fontWeight: 800,
            padding: "12px 28px",
            borderRadius: 80,
          }}
        >
          claycurry.com
        </div>
      </div>

      {/* Right circle with initials */}
      <div
        style={{

          width: 600,
          height: 630,


          display: "flex",
          flexDirection: "column",
          alignItems: "center",

          justifyContent: "center",

        }}
      >


        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "3px solid #38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 800,
              color: "#38bdf8",
              letterSpacing: "0.05em",
            }}
          >
            CC
          </div>
        </div>
      </div>

    </div>,
    {
      ...size,
    },
  );
}
