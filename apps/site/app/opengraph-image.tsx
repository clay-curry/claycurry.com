import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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
        padding: "80px 100px",
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
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 72,
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
            fontSize: 36,
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
            backgroundColor: "#38bdf8",
            color: "#0d1117",
            fontSize: 24,
            fontWeight: 600,
            padding: "12px 28px",
            borderRadius: 50,
          }}
        >
          claycurry.com
        </div>
      </div>

      {/* Right circle with initials */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "3px solid #38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#38bdf8",
            letterSpacing: "0.05em",
          }}
        >
          CC
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
