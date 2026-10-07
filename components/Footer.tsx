import Link from 'next/link';
import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-label">Anima Estudio</div>
          <div className="footer-brand">Lucas Miranda</div>
        </div>
        <div>
          <div className="footer-label">Navegação</div>
          <div className="footer-links" style={{ marginTop: 9 }}>
            <Link href="/trabalhos">Trabalhos</Link>
            <Link href="/sobre">Sobre</Link>
          </div>
        </div>
        <div>
          <div className="footer-label">Contato</div>
          <div className="footer-links" style={{ marginTop: 9 }}>
            <a href={`mailto:${site.email}`}>E-mail</a>
            <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginTop: 48, color: 'var(--muted)', fontSize: 11 }}>
        © {new Date().getFullYear()} Lucas Miranda — Anima Estudio.
      </div>
    </footer>
  );
}
