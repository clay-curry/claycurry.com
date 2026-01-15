import "./globals.css";
import type { Metadata } from "next";
import { Footer } from "@/lib/ui/blocks/footer";
import { Header } from "@/lib/ui/blocks/header";
import { ThemeProvider } from "@/lib/ui/theme-provider";

export const metadata: Metadata = {
  title: "Clay Curry",
  description:
    "Clay Curry is a software engineer specializing in software assembly, federated programming, and " +
    "DevOps — building scalable systems that lower the barrier to contribution and accelerate delivery.",
  metadataBase: new URL("https://claycurry.com"),
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-light.svg",
        media: "(prefers-color-scheme: light)",
      },
    ],
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
      className="html-root overflow-y-scroll"
      suppressHydrationWarning
    >
      <head />

      <body className="flex flex-col min-h-screen w-full max-w-5xl mx-auto">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Root layout 
          - header stays at top
          - main content grows to fill space
          – footer stays below content
          - footer sticks to bottom if content is short 
          */}

          <Header className="flex-none" />

          <main className="flex-1">{children}</main>

          <Footer className="flex-none" />
        </ThemeProvider>
      </body>
    </html>
  );
}
