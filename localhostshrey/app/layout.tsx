import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "localhostshrey",
  description: "localhostshrey — design engineer based in India",
  metadataBase: new URL("https://localhostshrey.in/"),
  authors: [{ name: "localhostshrey" }],
  keywords: [
    "portfolio",
    "design engineer",
    "India",
    "software engineer",
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
  ],
  creator: "localhostshrey",
  publisher: "localhostshrey",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://localhostshrey.in/",
    title: "localhostshrey",
    description: "localhostshrey — design engineer based in India",
  },
  twitter: {
    card: "summary_large_image",
    title: "localhostshrey",
    description: "localhostshrey — design engineer based in India",
    creator: "@bytesizedshrey",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
