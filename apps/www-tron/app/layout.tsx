import type { Metadata } from 'next'
import { Geist_Mono, Poppins } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { ChatProvider } from '@/lib/providers/chat-provider'

import 'tw-animate-css'
import 'katex/dist/katex.min.css'
import './globals.css'
import './styles/code.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
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
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = localStorage.getItem('tron-theme');
    if (t && ['cyan','orange','red','green'].includes(t)) {
      document.documentElement.classList.add('theme-' + t);
    }
  } catch(e) {}
})()`,
          }}
        />
      </head>
      <body className={`${poppins.className} ${geistMono.variable} ${tourney.variable} font-sans antialiased w-full`}>
        <div className="grid-background" aria-hidden="true" />
        <ChatProvider>
          {children}
        </ChatProvider>
        <Toaster theme="dark" position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
