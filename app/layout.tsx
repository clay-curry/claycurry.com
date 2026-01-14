import "./globals.css";
import type { Metadata } from "next";
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
      className="html-root overflow-y-scroll px-1"
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
