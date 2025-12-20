import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Clay Curry",
  description: 
  "Clay Curry is a software engineer specializing in software assembly, federated programming, and " + 
  "DevOps — building scalable systems that lower the barrier to contribution and accelerate delivery.",
  metadataBase: new URL("https://claycurry.com")
};


export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <>
      <html 
        lang="en" 
        className="html-root overflow-y-scroll px-1"
        suppressHydrationWarning
      >
        <head />
        <body
          className={
            // `${geistSans.variable} ${geistMono.variable} ` +
            `mx-0 flex flex-col items-center ` + 
            `justify-start min-h-screen w-full text-foreground antialiased`
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div
              className="flex flex-col flex-1 w-full max-w-5xl"
            >
              <Header/>
              <main className="min-h-[85vh]">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
