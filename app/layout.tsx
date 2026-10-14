import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "TripSplit — Split expenses, not friendships",
    template: "%s | TripSplit",
  },
  description:
    "Track shared trip expenses, split bills fairly, see who owes whom, and settle up easily with TripSplit.",

  applicationName: "TripSplit",

  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tripsplit-split-expence.vercel.app/"
  ),

  openGraph: {
    type: "website",
    siteName: "TripSplit",
    title: "TripSplit — Split expenses, not friendships",
    description:
      "Track shared trip expenses, split bills fairly, and settle up easily with friends.",
    url: "/",
  },

  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f8faf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
