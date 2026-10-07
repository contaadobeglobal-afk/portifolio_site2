import Link from 'next/link';
import { site } from '@/lib/site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="wordmark" href="/">ANIMA</Link>
        <nav className="nav" aria-label="Principal">
          <Link href="/trabalhos">Trabalhos</Link>
          <Link href="/sobre">Sobre</Link>
          <a href={`mailto:${site.email}`}>Contato</a>
        </nav>
      </div>
    </header>
  );
}
