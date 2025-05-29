import './globals.css';
import type { Metadata } from 'next';
import { inter, montserrat } from './fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Bet Yourself - Le seul pari où tu gagnes à réussir',
  description: 'Défie-toi, engage-toi, aide une asso. Bet Yourself est une plateforme où vous pouvez vous fixer des objectifs, déposer une mise, et réussir ou aider une association.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}