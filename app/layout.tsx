import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pointer from '@/components/Pointer';

export const metadata = {
  title: 'Lucas Miranda — Anima Estudio',
  description: 'Direção de arte, design, vídeo, motion, editorial, impresso e IA no processo criativo.',
  icons: { icon: '/favicon.svg', apple: '/anima-icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><Pointer /><div className="site-shell"><Header />{children}<Footer /></div></body></html>;
}
