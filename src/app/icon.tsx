import { ImageResponse } from "next/og";

// Realtor One mark: charcoal tile + linen "R", matching the product
// family used on aanantbishthealing.com.

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          borderRadius: 6,
          color: "#D1CFC0",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
