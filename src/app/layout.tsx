import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://iakshit.space"),
  title: "Akshit Yadav — Frontend Engineer",
  description:
    "Frontend engineer building fast web, mobile, and AI-powered products — React, Next.js, React Native, micro-frontends, and Three.js.",
  openGraph: {
    title: "Akshit Yadav — Frontend Engineer",
    description:
      "Frontend engineer building fast web, mobile, and AI-powered products.",
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
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {children}
      </body>
    </html>
  );
}
