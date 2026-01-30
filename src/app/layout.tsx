import '@/styles/globals.css';
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import { AppLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'ExplainIt - Learn Anything Simply',
  description: 'Turn complex topics into simple explanations with AI-powered audio and PDF summaries.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
