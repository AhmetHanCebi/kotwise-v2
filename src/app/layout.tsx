import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Kotwise — Erasmus Konaklama & Topluluk',
  description:
    'Erasmus ve değişim öğrencileri için güvenilir konaklama, topluluk ve şehir rehberi platformu.',
  keywords: ['erasmus', 'konaklama', 'değişim', 'öğrenci', 'topluluk', 'şehir rehberi'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.className}>
      <body className="min-h-dvh flex flex-col items-center">
        <ToastProvider>
          <div className="w-full max-w-[430px] min-h-dvh flex flex-col relative">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
