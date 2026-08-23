import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";

// Editorial display serif (variable). Body/UI stay Geist.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://selena.example"),
  title: {
    default: "Selena — Anonymous experiences, and the patterns they reveal",
    template: "%s · Selena",
  },
  description:
    "A survivor-centered space for sharing experiences anonymously, and for understanding the broader patterns among submissions to this platform.",
  robots: { index: false, follow: false }, // demo build; not for indexing
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen font-sans">
        <SkipLink />
        <Header />
        <main
          id="main"
          className="mx-auto w-full max-w-wide px-5 py-12 sm:px-8 sm:py-16"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
