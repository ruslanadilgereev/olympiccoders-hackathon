import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mimicry AI | AI-Powered Design Assistant",
  description: "Generate stunning UI mockups and design assets with AI. Upload your brand assets, describe what you need, and let AI create consistent, beautiful designs instantly.",
  keywords: ["AI design", "UI mockup", "design automation", "brand consistency", "AI assistant"],
  authors: [{ name: "Mimicry Team" }],
  openGraph: {
    title: "Mimicry AI | AI-Powered Design Assistant",
    description: "Generate stunning UI mockups and design assets with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
