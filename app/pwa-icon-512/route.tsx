import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 25%, #fff8e8 0%, #f5ecdb 42%, #dfeeff 100%)",
      }}
    >
      <div
        style={{
          width: 360,
          height: 360,
          borderRadius: 112,
          background: "linear-gradient(180deg, #ffffff 0%, #eef5ff 100%)",
          boxShadow: "0 38px 95px rgba(91, 119, 169, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#334155",
          fontSize: 220,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.06em",
        }}
      >
        F
      </div>
    </div>,
    {
      width: 512,
      height: 512,
    },
  );
}
