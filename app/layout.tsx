import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Lucas Miranda — Anima Estudio',
  description: 'Direção de arte, design, vídeo, motion, editorial e imagem para marcas em movimento.',
  icons: {
    icon: '/favicon.svg',
    apple: '/anima-icon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
