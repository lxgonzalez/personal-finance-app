import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "linear-gradient(135deg, #fff8eb 0%, #f5efd8 35%, #e4f0ff 100%)",
        color: "#243447",
        padding: 64,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 700,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: "#6b7c93" }}>
              FinControl
            </div>
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.04em",
              }}
            >
              Finanzas personales claras, sin ruido.
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: "#526174",
                maxWidth: 640,
              }}
            >
              Controla ingresos, gastos y categorias con una experiencia limpia,
              pastel y enfocada en decisiones rapidas.
            </div>
          </div>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 56,
              background: "rgba(255,255,255,0.72)",
              boxShadow: "0 20px 60px rgba(91, 119, 169, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 44,
                background: "linear-gradient(180deg, #8bb7ff 0%, #f8c7a4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 104,
                fontWeight: 800,
                letterSpacing: "-0.08em",
              }}
            >
              F
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            ["Categorias", "+11 base"],
            ["Seguimiento", "Ingresos y gastos"],
            ["Acceso", "Autenticacion segura"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                flex: 1,
                borderRadius: 32,
                background: "rgba(255,255,255,0.74)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 12px 32px rgba(91, 119, 169, 0.12)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: "#6b7c93" }}>
                {label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
