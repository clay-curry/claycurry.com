import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ChatProvider } from "@/lib/providers/chat-provider";
import { ClickCountProvider } from "@/lib/providers/click-count-provider";
import { SITE_ORIGIN } from "@/lib/site-url";

import "tw-animate-css";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./styles/code.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const tourney = localFont({
  src: [{ path: "../public/fonts/Tourney-Regular.ttf", weight: "600" }],
  variable: "--font-tourney",
});

const anders = localFont({
  src: [{ path: "../public/fonts/Anders.ttf", weight: "100" }],
  variable: "--font-anders",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Clay Curry - Software Engineer",
  description:
    "Portfolio of Clay Curry, a Software Engineer experienced in web technologies",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Clay Curry - Software Engineer",
    description:
      "Portfolio of Clay Curry, a Software Engineer experienced in web technologies",
    type: "website",
    url: "/",
    images: [
      {
        alt: "Clay Curry - Software Engineer",
        height: 630,
        url: "/opengraph-image",
        width: 1200,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clay Curry - Software Engineer",
    description:
      "Portfolio of Clay Curry, a Software Engineer experienced in web technologies",
    images: [
      {
        alt: "Clay Curry - Software Engineer",
        url: "/twitter-image",
      },
    ],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var m = localStorage.getItem('tron-mode');
    if (m === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    var t = localStorage.getItem('tron-theme');
    if (t && ['cyan','orange','red','green','gray'].includes(t)) {
      document.documentElement.classList.add('theme-' + t);
    }
  } catch(e) {}
})()`,
          }}
        />
      </head>
      <body
        className={`${anders.variable} ${poppins.className} ${geistMono.variable} ${tourney.variable} font-sans antialiased w-full`}
      >
        <div className="grid-background" aria-hidden="true" />
        <ClickCountProvider>
          <ChatProvider>{children}</ChatProvider>
        </ClickCountProvider>
        <Toaster theme="dark" position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
