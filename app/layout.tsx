import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "Middleware Chatbot",
  description: "AI chatbot with memory - Authured by Mohan Pulamolu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
