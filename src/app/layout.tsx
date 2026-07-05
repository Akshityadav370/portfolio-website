import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DARK_THEMES,
  DAY_END_HOUR,
  DAY_START_HOUR,
  LIGHT_THEMES,
} from "@/data/themes";
import "./globals.css";

// Runs before paint so there is no flash: marks JS as available (scroll
// reveals), picks light/dark from the visitor's local clock (unless they've
// used the sun/moon toggle, which persists a 'mode' override), then rotates
// the theme within that pool — random on first visit, cycling after.
const bootScript = `document.documentElement.classList.add('js');try{var D=${JSON.stringify(
  DARK_THEMES,
)},L=${JSON.stringify(LIGHT_THEMES)};var m=localStorage.getItem('mode');if(m!=='dark'&&m!=='light'){var h=new Date().getHours();m=h>=${DAY_START_HOUR}&&h<${DAY_END_HOUR}?'light':'dark';}var t=m==='light'?L:D;var k='theme-i-'+m;var p=parseInt(localStorage.getItem(k),10);var i=isNaN(p)?Math.floor(Math.random()*t.length):(p+1)%t.length;localStorage.setItem(k,''+i);var d=document.documentElement;d.setAttribute('data-mode',m);d.setAttribute('data-theme',t[i]);}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {children}
      </body>
    </html>
  );
}
