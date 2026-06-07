import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/lib/toast";
import { CustomCursor } from "@/components/shared/custom-cursor";

const figtreeSans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samayak · Admin Panel",
  description: "Academic Operations Platform — Admin Panel",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Samayak Admin",
  },
};

export const viewport = {
  themeColor: "#256199",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtreeSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&amp;display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full">
        <SessionProvider>
          <ToastProvider>
            <CustomCursor />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
