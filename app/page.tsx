import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import SiteEffects from '@/components/SiteEffects';
import { site } from '@/lib/site';
import type { Project } from '@/lib/types';
import { demoProjects, type DemoProject } from '@/lib/demo';

export const dynamic = 'force-dynamic';

type CardProject = Project | DemoProject;

async function getProjects(): Promise<CardProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);
  return data?.length ? data as Project[] : demoProjects;
}

export default async function Home() {
  const projects = await getProjects();
  const primary = projects.slice(0, 3);
  const secondary = projects.slice(3, 6);

  return <>
    <SiteEffects />
    <main>
      <section className="hero">
        <div className="container hero-grid reveal">
          <div>
            <div className="eyebrow"></div>
            <h1>
              <span>Direção de </span>
              <span>arte para </span>
              <span>marcas que </span>
              <span>querem ser </span>
              <span>lembradas.</span>
            </h1>
          </div>
          <div className="hero-foot">
            <div className="eyebrow">Role para explorar ↓</div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div className="marquee-track">
        <span>Art Direction</span><b>✳</b><span>Branding</span><b>✳</b><span>Campaigns</span><b>✳</b><span>Motion</span><b>✳</b><span>Video Editing</span><b>✳</b><span>Digital</span><b>✳</b><span>Editorial</span><b>✳</b><span>Print</span><b>✳</b><span>Creative AI</span><b>✳</b>
        <span>Art Direction</span><b>✳</b><span>Branding</span><b>✳</b><span>Campaigns</span><b>✳</b><span>Motion</span><b>✳</b><span>Video Editing</span><b>✳</b><span>Digital</span><b>✳</b><span>Editorial</span><b>✳</b><span>Print</span><b>✳</b><span>Creative AI</span><b>✳</b>
      </div></div>

      <section id="work">
        <div className="container">
          <div className="section-head reveal"><b></b><span></span></div>
          <div className="project-list">{primary.map((project, i) => <ProjectCard key={project.id} project={project} index={i} />)}</div>
          <div className="home-more-grid">{secondary.map((project, i) => <ProjectCard key={project.id} project={project} index={i + 3} compact />)}</div>
        </div>
      </section>

      <section id="about">
        <div className="container about reveal">
          <p>Direção, design, vídeo e imagem para dar forma às ideias.</p>
          <div className="side">
            <p className="small">A Anima Estudio combina direção de arte, design, edição de vídeo, motion e materiais impressos. A inteligência artificial entra no processo criativo como ferramenta de exploração, desenvolvimento e ganho de possibilidades sempre guiada pela ideia e pela direção.</p>
            <div className="skills">{['Direção de arte','Branding','Campanhas','Edição de vídeo','Motion & imagem','Social & digital','Editorial & impresso','IA no processo criativo'].map((item)=><div className="skill" key={item}>{item}</div>)}</div>
            <Link className="link" href="/sobre">Conhecer o estúdio</Link>
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="container cta-top reveal"><div><div className="eyebrow"></div><h3>Vamos criar algo que mereça ser visto.</h3></div><a data-cursor="cta" href={site.whatsapp} target="_blank" rel="noreferrer">Falar comigo →</a></div>
      </section>
    </main>
  </>;
}
