import Link from 'next/link';
import { site } from '@/lib/site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="wordmark" href="/">ANIMA</Link>
        <nav className="nav" aria-label="Principal">
          <Link href="/#work" data-section="work">Trabalhos</Link>
          <Link href="/#about" data-section="about">Sobre</Link>
          <Link href="/#contact" data-section="contact">Contato</Link>
          <a className="nav-cta" data-cursor="cta" href={site.whatsapp} target="_blank" rel="noreferrer">Vamos conversar ↗</a>
        </nav>
      </div>
    </header>
  );
}
