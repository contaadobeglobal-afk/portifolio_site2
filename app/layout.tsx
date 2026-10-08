import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pointer from '@/components/Pointer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.animaestudio.site'),
  title: 'Anima Estudio — Lucas Miranda',
  description: 'Direção de arte, design e imagem para marcas em movimento. Conheça o portfólio.',
  icons: { icon: '/favicon.svg', apple: '/anima-icon.svg' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Anima Estudio',
    title: 'Anima Estudio — Lucas Miranda',
    description: 'Direção de arte, design e imagem para marcas em movimento. Conheça o portfólio.',
    images: [
      {
        url: '/share-card.png',
        width: 1200,
        height: 630,
        alt: 'Anima Estudio — Direção de arte, design e imagem para marcas em movimento.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anima Estudio — Lucas Miranda',
    description: 'Direção de arte, design e imagem para marcas em movimento. Conheça o portfólio.',
    images: ['/share-card.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><Pointer /><div className="site-shell"><Header />{children}<Footer /></div></body></html>;
}
