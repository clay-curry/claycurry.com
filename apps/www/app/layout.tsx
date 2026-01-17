// TODO: Set up shadcn registry following MCP guidance
// - Reference: https://ui.shadcn.com/docs/mcp
// - Create components.json with proper configuration
// - Configure registry for custom components in lib/ui/

// TODO: Create feedback solicitation component (see apps/www/feedback.png)
// - Modal/dialog with "Give feedback" title
// - Textarea for user input
// - Emoji reaction buttons (sad, neutral, happy)
// - Cancel and Submit buttons
// - Consider where to trigger (footer, floating button, etc.)

import "./globals.css";
import type { Metadata } from "next";
import { getAllPostsMetadata } from "@/app/(site)/blog/loader";
import { FloatingMenu } from "@/lib/ui/blocks/floating-menu";
import { Footer } from "@/lib/ui/blocks/footer";
import { Header } from "@/lib/ui/blocks/header";
import { ThemeProvider } from "@/lib/ui/theme-provider";
import Stitch from "@/lib/ui/blocks/stitch";

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
  const posts = getAllPostsMetadata().slice(0, 2).map((post) => ({
    slug: post.slug,
    title: post.title,
    subtitle: post.subtitle,
    publishedDate: post.publishedDate,
  }));

  return (
    <html
      lang="en"
      className="html-root overflow-y-scroll"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var palette = localStorage.getItem('color-palette');
                  if (palette && ['zinc', 'stone', 'slate', 'neutral', 'gray'].includes(palette)) {
                    document.documentElement.classList.add('theme-' + palette);
                  } else {
                    document.documentElement.classList.add('theme-zinc');
                  }
                } catch (e) {
                  document.documentElement.classList.add('theme-zinc');
                }
              })();
            `,
          }}
        />
      </head>

      <body className="flex flex-col min-h-screen w-full max-w-5xl mx-auto">
        <Stitch />
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

          <main className="flex-1 min-h-[65vh] md:min-h-0">{children}</main>

          <Footer className="flex-none" />

          <FloatingMenu posts={posts} />
        </ThemeProvider>
      </body>
    </html>
  );
}
