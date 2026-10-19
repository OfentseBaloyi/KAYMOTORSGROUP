import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCarBySlug } from "@/lib/data/cars";
import { formatMileage, formatPrice, transmissionLabel } from "@/lib/format";
import { coverImage, imageUrl } from "@/lib/images";

// The preview shown when a car link is shared on WhatsApp/Facebook:
// cover photo on the left, price and logo on the right.

export const alt = "Car for sale at Kay Motors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontData = readFile(join(process.cwd(), "src/assets/fonts/BarlowCondensed-Bold.ttf"));
const logoData = readFile(join(process.cwd(), "public/brand/kay-motors-logo.png"), "base64");

/** Local seed images are read from disk; Supabase photos are fetched by URL. */
async function photoSrc(storagePath: string | undefined) {
  if (!storagePath) return null;
  if (storagePath.startsWith("/")) {
    const file = await readFile(join(process.cwd(), "public", storagePath), "base64");
    const type = storagePath.endsWith(".svg") ? "image/svg+xml" : storagePath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,${file}`;
  }
  return imageUrl(storagePath);
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [car, font, logo] = await Promise.all([getCarBySlug(slug), fontData, logoData]);
  const logoSrc = `data:image/png;base64,${logo}`;
  const fonts = [{ name: "Barlow Condensed", data: font, weight: 700 as const, style: "normal" as const }];

  if (!car) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori renders plain <img> */}
          <img src={logoSrc} width={698} height={382} />
        </div>
      ),
      { ...size, fonts },
    );
  }

  const photo = await photoSrc(coverImage(car)?.storagePath);
  const badge = car.status === "sold" ? { text: "SOLD", bg: "#9b1c1c" } : car.status === "reserved" ? { text: "RESERVED", bg: "#8a5a00" } : null;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#faf8f5", fontFamily: "Barlow Condensed" }}>
        <div style={{ display: "flex", width: 720, height: "100%", background: "#f1ede6", position: "relative" }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori renders plain <img>
            <img src={photo} width={720} height={630} style={{ objectFit: "cover", width: 720, height: 630 }} />
          )}
          {badge && (
            <div
              style={{
                position: "absolute",
                top: 32,
                left: 32,
                display: "flex",
                background: badge.bg,
                color: "#ffffff",
                fontSize: 40,
                padding: "6px 18px",
                letterSpacing: 2,
              }}
            >
              {badge.text}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 480, padding: "40px 44px", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- satori renders plain <img> */}
          <img src={logoSrc} width={240} height={131} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 34, color: "#4f5a63" }}>{car.year}</div>
            <div style={{ display: "flex", fontSize: 60, lineHeight: 1, color: "#111e25", textTransform: "uppercase" }}>
              {`${car.make} ${car.model}`}
            </div>
            {car.variant && (
              <div style={{ display: "flex", fontSize: 32, color: "#4f5a63", marginTop: 8 }}>{car.variant}</div>
            )}
            <div style={{ display: "flex", fontSize: 76, color: "#111e25", marginTop: 24 }}>{formatPrice(car.price)}</div>
            <div style={{ display: "flex", fontSize: 32, color: "#b84f0b" }}>
              {`${formatMileage(car.mileageKm)} · ${transmissionLabel[car.transmission]}`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", height: 4, background: "#ee6a14" }} />
            <div style={{ display: "flex", height: 4, background: "#111e25", marginTop: 4 }} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
