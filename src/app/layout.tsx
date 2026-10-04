import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./trials.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iakshit.space"),
  title: "Akshit Yadav — Software Engineer",
  description:
    "Full-stack engineer building fast web, mobile, and AI-powered products — React, Next.js, React Native, Spring Boot, Kafka, and Kubernetes.",
  openGraph: {
    title: "Akshit Yadav — Software Engineer",
    description:
      "Full-stack engineer building fast web, mobile, and AI-powered products.",
    url: "https://iakshit.space",
    siteName: "Akshit Yadav",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
