import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';

import './globals.css';

/* Sans técnica humanista: numerales claros, buena lectura en cuerpo chico y
   jerarquía tranquila. Sin identidad monoespaciada y sin grotesca dura. */
const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MADRYN — Inteligencia industrial territorial',
  description:
    'Señales explicables con evidencia y acción sugerida, sobre datos públicos argentinos de energía, minería y territorio.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-AR" className={`${plexSans.variable} h-full`}>
      <body className="font-sans flex min-h-full flex-col">{children}</body>
    </html>
  );
}
