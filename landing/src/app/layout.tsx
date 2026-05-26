import type { Metadata, Viewport } from "next";
import { SITE } from "../config/site.config";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ThemeHeadIcons from "@/components/ui/ThemeHeadIcon";
import ClientWrapper from "@/components/ui/ClientWrapper";
import NoZoom from "@/components/ui/NoZoom";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: 1440,
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Meshspire | Making Learning Easier Than Ever`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: SITE.twitterHandle,
    images: [SITE.ogImage],
  },
  icons: {
    icon: "/logos/logo_d.svg",
    apple: "/logos/logo_d.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
        <ThemeHeadIcons />
      </head>
      <body>
        <NoZoom />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          value={{ light: "light", dark: "dark" }}
        >
          <ClientWrapper>{children}</ClientWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
