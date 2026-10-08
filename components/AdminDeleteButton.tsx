"use client";
import { createClient } from '@/lib/supabase/client';
import { removeUnreferencedPortfolioMedia } from '@/lib/portfolio-media';

export default function AdminDeleteButton({ id }: { id: string }) {
  async function remove() {
    if (!confirm('Excluir este projeto?')) return;
    const supabase = createClient();
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select('cover_url,gallery_urls,video_url')
      .eq('id', id)
      .maybeSingle();
    if (projectError) { alert(projectError.message); return; }
    if (!project) { alert('Este projeto não foi encontrado.'); return; }
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    try {
      await removeUnreferencedPortfolioMedia([
        project.cover_url,
        ...(project.gallery_urls ?? []),
        project.video_url ?? '',
      ]);
    } catch (cleanupError) {
      const detail = cleanupError instanceof Error ? cleanupError.message : 'Erro desconhecido ao remover as mídias.';
      alert(`Projeto excluído, mas não foi possível limpar as mídias antigas: ${detail}`);
      window.location.reload();
      return;
    }
    window.location.reload();
  }
  return <button onClick={remove} style={{ background:'none', color:'#ff9c83', border:0, padding:0 }}>Excluir</button>;
}
