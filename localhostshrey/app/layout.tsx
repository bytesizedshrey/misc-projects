import type { Metadata } from "next";
import { Pontano_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const pontanoSans = Pontano_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-scholar",
});

export const metadata: Metadata = {
  title: "Shrey",
  description: "Shrey — full stack developer based in India",
  metadataBase: new URL("https://localhostshrey.vercel.app/"),
  authors: [{ name: "Shrey" }],
  keywords: [
    "portfolio",
    "full stack developer",
    "India",
    "software engineer",
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
  ],
  creator: "Shrey",
  publisher: "Shrey",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://localhostshrey.vercel.app/",
    title: "Shrey",
    description: "Shrey — full stack developer based in India",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shrey",
    description: "Shrey — full stack developer based in India",
    creator: "@bytesizedshrey",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pontanoSans.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
