import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProjectForm from '@/components/ProjectForm';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('portfolio_projects').select('*').eq('id', id).maybeSingle();
  if (!project) notFound();
  return <main className="admin-main"><div className="admin-wrap"><div className="admin-headline"><div><div className="eyebrow">Editar</div><h1>{project.title}</h1></div></div><ProjectForm project={project} /></div></main>;
}
