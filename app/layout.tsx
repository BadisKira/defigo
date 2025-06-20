import './globals.css';
import type { Metadata } from 'next';
import { inter, manrope } from './fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: "deKliK – Passe à l’action, relève des défis, soutiens des causes",
  description: "deKliK t’aide à transformer tes intentions en actions. Lance des défis, bats la procrastination et soutiens des associations. Le deKliK qu’il te manquait pour avancer."
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