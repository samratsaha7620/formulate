import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { NextAuthProvider } from "./providers";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Form Builder - Create Custom Forms',
  description: 'Build custom forms with different question types similar to Google Forms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme='light'
          enableSystem 
        >
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}