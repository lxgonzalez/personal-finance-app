import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          width: 136,
          height: 136,
          borderRadius: 42,
          background: "linear-gradient(180deg, #ffffff 0%, #eef5ff 100%)",
          boxShadow: "0 20px 50px rgba(91, 119, 169, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            background: "linear-gradient(135deg, #8bb7ff 0%, #f8c7a4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.08em",
          }}
        >
          F
        </div>
      </div>
    </div>,
    size,
  );
}
