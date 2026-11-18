import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "TripSplit",
    short_name: "TripSplit",
    description:
      "Track shared trip expenses, split bills fairly, and settle up easily.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["finance", "utilities"],
  };
}
