import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

async function getFeaturedProjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(6);
  return data ?? [];
}

export default async function Home() {
  const projects = await getFeaturedProjects();
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Anima Estudio / Lucas Miranda</div>
            <h1>Direção de arte para marcas que querem ser lembradas.</h1>
            <p className="hero-copy">{site.statement}</p>
          </div>
          <div className="hero-meta">
            <div className="scroll-cue">Role para explorar ↓</div>
            <p className="hero-note">Marcas, campanhas, imagem e experiências visuais com intenção.</p>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Art Direction</span><strong>✳</strong><span>Branding</span><strong>✳</strong><span>Campaigns</span><strong>✳</strong><span>Motion</span><strong>✳</strong><span>Digital</span><strong>✳</strong>
          <span>Art Direction</span><strong>✳</strong><span>Branding</span><strong>✳</strong><span>Campaigns</span><strong>✳</strong><span>Motion</span><strong>✳</strong><span>Digital</span><strong>✳</strong>
        </div>
      </div>

      <section className="section" id="trabalhos">
        <div className="container">
          <div className="section-head">
            <h2>Selected work</h2>
            <span>{projects.length ? `${projects.length} projetos` : 'Publique seus primeiros projetos no admin'}</span>
          </div>
          {projects.length ? (
            <div className="project-list">
              {projects.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}
            </div>
          ) : (
            <div className="project-card-media" style={{ aspectRatio: '16/7', display: 'grid', placeItems: 'center', padding: 30 }}>
              <div style={{ textAlign: 'center', maxWidth: 540 }}>
                <div className="eyebrow">Admin → Projetos</div>
                <p style={{ fontSize: 32, letterSpacing: '-.05em', marginBottom: 14 }}>O layout está pronto. Agora entram os seus trabalhos.</p>
                <Link className="project-link" href="/admin">Abrir painel</Link>
              </div>
            </div>
          )}
          <div style={{ marginTop: 48 }}><Link className="project-link" href="/trabalhos">Ver todos os trabalhos</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <p className="about-copy">Não faço só design. Dou forma às ideias.</p>
          <div className="about-side">
            <p className="small-copy">O Anima Estudio reúne direção de arte, design, imagem e motion em um processo pensado para transformar estratégia em linguagem visual.</p>
            <div className="expertise">
              {['Direção de arte', 'Branding', 'Campanhas', 'Motion', 'Digital', 'Imagem'].map((item) => <div className="expertise-item" key={item}>{item}</div>)}
            </div>
            <Link className="project-link" href="/sobre">Conhecer o estúdio</Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-grid">
          <div>
            <div className="eyebrow">Tem um projeto?</div>
            <h2>Vamos criar algo que mereça ser visto.</h2>
          </div>
          <a className="cta-button" href={`mailto:${site.email}`}>Falar comigo →</a>
        </div>
      </section>
    </main>
  );
}
