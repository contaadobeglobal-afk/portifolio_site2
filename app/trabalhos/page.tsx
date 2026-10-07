import { createClient } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';

export const dynamic = 'force-dynamic';

export default async function TrabalhosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('portfolio_projects').select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  const projects = data ?? [];
  return (
    <main>
      <section className="section" style={{ paddingTop: 90 }}>
        <div className="container">
          <div className="section-head">
            <h1 style={{ margin: 0, fontSize: 'clamp(54px, 9vw, 120px)', letterSpacing: '-.08em', lineHeight: '.85' }}>Trabalhos</h1>
            <span>{projects.length} projetos</span>
          </div>
          {projects.length ? <div className="project-list">{projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}</div> : <p className="small-copy">Nenhum projeto publicado ainda.</p>}
        </div>
      </section>
    </main>
  );
}
