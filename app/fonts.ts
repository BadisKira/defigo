import { Inter, Montserrat , Manrope} from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

export const manrope = Manrope({
  subsets: ['latin'],
  display:'swap',
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
})