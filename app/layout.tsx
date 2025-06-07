import './globals.css';
import type { Metadata } from 'next';
import { inter, manrope } from './fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'DéfiGo - Quand tu réussis, tout le monde gagne',
  description: 'Défie-toi, engage-toi, aide une asso. DéfiGo est une plateforme où vous pouvez vous fixer des objectifs, déposer une somme, et réussir ou aider une association.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body className={`${inter.variable} ${manrope.variable} font-sans bg-muted`}>
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