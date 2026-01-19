import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/components/theme-provider'
import './globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

const tourney = localFont({
  src: [
    { path: '../public/fonts/Tourney-Regular.ttf', weight: '400' },
    { path: '../public/fonts/Tourney-Medium.ttf', weight: '500' },
    { path: '../public/fonts/Tourney-SemiBold.ttf', weight: '600' },
    { path: '../public/fonts/Tourney-Bold.ttf', weight: '700' },
  ],
  variable: '--font-tourney',
});

export const metadata: Metadata = {
  title: 'Clay Curry - Software Engineer',
  description: 'Portfolio of Clay Curry, a Software Engineer experienced in web technologies',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} ${tourney.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
