import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DTP Marketplace — Direct Trade Protocol Simulation",
  description:
    "A live simulation of the Direct Trade Protocol — direct B2B food commodity trading that eliminates broker fees and settlement delays. Start with $10,000 in play money.",
  openGraph: {
    title: "DTP Marketplace",
    description: "Trade food commodities direct. See exactly what you save vs legacy brokered trade.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
