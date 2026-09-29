import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import ThemeProvider from "./components/ThemeProvider";

const inter = Inter({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncSpace",
  description: "Collaborative project management and flow diagrams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
      >
        <ThemeProvider><SessionWrapper>{children}</SessionWrapper></ThemeProvider>
      </body>
    </html>
  );
}
