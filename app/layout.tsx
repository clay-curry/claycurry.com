import "./globals.css";
import type { Metadata } from "next";
import { Footer } from "@/lib/ui/blocks/footer";
import { Header } from "@/lib/ui/blocks/header";
import { ThemeProvider } from "@/lib/ui/theme-provider";
import { cn } from "@/lib/utils";

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
      <body className="w-full max-w-5xl min-h-[100vh] m-auto">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          {
          /* Root layout 
            - header stays at top
            - main content grows to fill space
            – footer stays below content
            - footer sticks to bottom if content is short 
          */
          }
          <div className={cn(
            "flex flex-col justify-between items-center", 
            "w-full h-[100vh]",
            "text-foreground antialiased"
          )}>
              <div className="w-full max-w-5xl">
                  <Header className="w-full"/>
                  {children}
              </div>
              <Footer className={cn(
                  "w-full border-t border-border bg-background px-4 py-6 mt-20 mb-5 text-sm"
              )}/>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}