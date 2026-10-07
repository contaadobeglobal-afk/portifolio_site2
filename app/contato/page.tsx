import { site } from '@/lib/site';

export default function ContatoPage() {
  return (
    <main>
      <section className="cta" style={{ minHeight: '70vh' }}>
        <div className="container cta-grid">
          <div>
            <div className="eyebrow">Contato</div>
            <h1>Tem um projeto?</h1>
            <p className="hero-copy" style={{ marginTop: 30 }}>Me conte o que você quer construir, onde está o desafio e o que precisa acontecer.</p>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <a className="cta-button" href={`mailto:${site.email}`}>{site.email} →</a>
          </div>
        </div>
      </section>
    </main>
  );
}
