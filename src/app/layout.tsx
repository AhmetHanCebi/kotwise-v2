import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: {
    default: 'Kotwise - Öğrenci Konaklama Platformu',
    template: '%s | Kotwise',
  },
  description:
    'Erasmus ve değişim öğrencileri için güvenilir konaklama, topluluk ve şehir rehberi platformu.',
  keywords: ['erasmus', 'öğrenci konaklama', 'değişim programı', 'ev kiralama', 'oda arkadaşı'],
  openGraph: {
    title: 'Kotwise - Öğrenci Konaklama Platformu',
    description: 'Erasmus ve değişim öğrencileri için güvenilir konaklama platformu.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F26522" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(JSON.parse(localStorage.getItem('kotwise_darkMode')||'false')){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col items-center">
        <AuthProvider>
          <ToastProvider>
            <div className="w-full max-w-[430px] min-h-dvh flex flex-col relative">
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
