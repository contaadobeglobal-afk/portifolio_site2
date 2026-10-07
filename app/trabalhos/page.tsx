import { createClient } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import { demoProjects } from '@/lib/demo';

export const dynamic = 'force-dynamic';

export default async function TrabalhosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('portfolio_projects').select('*').eq('published', true).order('featured', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);
  const projects = data?.length ? data : demoProjects;
  return <main><section className="section" style={{ paddingTop: 90 }}><div className="container"><div className="section-head"><h1 style={{ margin: 0, fontSize: 'clamp(54px, 9vw, 120px)', letterSpacing: '-.08em', lineHeight: '.85' }}>Trabalhos</h1><span>{projects.length} projetos</span></div><div className="project-list">{projects.map((p,i)=><ProjectCard key={p.id} project={p} index={i} />)}</div></div></section></main>;
}
