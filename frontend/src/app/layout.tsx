import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VaultCI | AI Trust Layer",
  description: "Agentic coding pipeline trust layer for the Qdrant Hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <AnimatedBackground />
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
