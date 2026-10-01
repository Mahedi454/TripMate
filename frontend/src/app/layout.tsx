import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TripMate - Plan trips together",
    template: "%s | TripMate",
  },
  description:
    "TripMate is a collaborative trip planning platform where groups decide destinations, build itineraries and split costs together.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject attributes
          into <body> before React hydrates, which React cannot patch. */}
      <body
        suppressHydrationWarning
        className="min-h-dvh font-sans text-ink antialiased"
      >
        {children}
      </body>
    </html>
  );
}