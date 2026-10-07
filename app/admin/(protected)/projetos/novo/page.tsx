import ProjectForm from '@/components/ProjectForm';
import { createClient } from '@/lib/supabase/server';

export default async function NovoProjetoPage() {
  const supabase = await createClient();
  const { data: lastProject, error } = await supabase
    .from('portfolio_projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Não foi possível determinar a próxima posição: ${error.message}`);

  return <main className="admin-main"><div className="admin-wrap"><div className="admin-headline"><div><div className="eyebrow">Conteúdo</div><h1>Novo projeto</h1></div></div><ProjectForm nextSortOrder={(lastProject?.sort_order ?? 0) + 1} /></div></main>;
}
