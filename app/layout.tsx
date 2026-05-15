import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACT Prep",
  description: "Practice ACT questions from your scraped database",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
