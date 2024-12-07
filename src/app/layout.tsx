import type { Metadata } from "next";
import localFont from "next/font/local";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { auth } from "@trigger.dev/sdk/v3";
import { RefreshOnFocus } from "@/components/refresh-on-focus";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
});

export const metadata: Metadata = {
  title: "docuhunt",
  description: "docuhunt",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const triggerPublicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: true,
      },
    },
  });

  return (
    <html lang="en">
      <Providers triggerPublicToken={triggerPublicToken}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} antialiased`}
        >
          {children}
        </body>
        <RefreshOnFocus />
        <Toaster position="top-right" />
      </Providers>
    </html>
  );
}
