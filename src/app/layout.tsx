import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI News Summarizer | GenLayer",
  description: "AI-powered news summarizer built on GenLayer blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
