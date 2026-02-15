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

const chirp = localFont({
  src: [
    { path: "../public/fonts/chirp-regular-web.woff", weight: "400" },
    { path: "../public/fonts/chirp-medium-web.woff", weight: "500" },
    { path: "../public/fonts/chirp-bold-web.woff", weight: "700" },
    { path: "../public/fonts/chirp-heavy-web.woff", weight: "800" },
  ],
  variable: "--font-chirp",
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
        height: 2744,
        url: "/og-image.png",
        width: 4032,
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
        url: "/og-image.png",
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
    var colors = {cyan:'%2338BDF8',orange:'%23F97316',red:'%23EF4444',green:'%234FE3C2',gray:'%2394A3B8'};
    var c = colors[t] || colors.green;
    var l = document.querySelector('link[rel="icon"]');
    if (l) l.href = 'data:image/svg+xml,' + '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="%230F172A" stroke="' + c + '" stroke-width="2"/><text x="32" y="38" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="%23E2E8F0" letter-spacing="0.5">CC</text></svg>';
  } catch(e) {}
})()`,
          }}
        />
      </head>
      <body
        className={`${anders.variable} ${chirp.variable} ${poppins.className} ${geistMono.variable} ${tourney.variable} font-sans antialiased w-full`}
      >
        <CompositeProviders>
          <div className="grid-background" aria-hidden="true" />
          {children}
        </CompositeProviders>
      </body>
    </html>
  );
}

function CompositeProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ClickCountProvider>
        <ChatProvider>{children}</ChatProvider>
      </ClickCountProvider>
      <Toaster theme="dark" position="bottom-right" />
      <Analytics />
    </>
  );
}
