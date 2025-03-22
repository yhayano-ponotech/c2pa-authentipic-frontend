import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'C2PA対応画像処理アプリ',
  description: '画像のC2PA情報の読み取り、追加、検証を行うWebアプリケーション',
  openGraph: {
    title: 'C2PA対応画像処理アプリ',
    description: '画像のC2PA情報の読み取り、追加、検証を行うWebアプリケーション',
    images: [
      {
        url: '/ogp-image.png',
        width: 1200,
        height: 630,
        alt: 'C2PA対応画像処理アプリ',
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'C2PA対応画像処理アプリ',
    description: '画像のC2PA情報の読み取り、追加、検証を行うWebアプリケーション',
    images: ['/ogp-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}