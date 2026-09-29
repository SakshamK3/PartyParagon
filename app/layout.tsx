import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Party Paragon | Premium Party Supplies Wholesale",
  description:
    "India's leading B2B wholesale supplier of party decorations, balloons, foil balloons, cake stands, backdrops, entry gates, and event supplies. Minimum order quantities available.",
  keywords:
    "party supplies wholesale, B2B party decorations, balloons bulk, foil balloons wholesale, cake stands, backdrops, entry gates, India",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Party Paragon | Premium Party Supplies Wholesale",
    description:
      "India's leading B2B wholesale supplier of party decorations and event supplies.",
    type: "website",
    siteName: "Party Paragon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
