import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function Icon() {
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
          width: 132,
          height: 132,
          borderRadius: 40,
          background: "linear-gradient(180deg, #ffffff 0%, #eef5ff 100%)",
          boxShadow: "0 20px 50px rgba(91, 119, 169, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: 28,
            background:
              "linear-gradient(135deg, rgba(125, 161, 232, 0.16), rgba(250, 201, 166, 0.16))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "#334155",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.06em",
          }}
        >
          <span>F</span>
          <div
            style={{
              width: 58,
              height: 12,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #8bb7ff 0%, #f8c7a4 50%, #9ed8c0 100%)",
            }}
          />
        </div>
      </div>
    </div>,
    size,
  );
}
