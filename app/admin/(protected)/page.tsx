import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AdminDeleteButton from '@/components/AdminDeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from('portfolio_projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  return <main className="admin-main"><div className="admin-wrap"><div className="admin-headline"><div><div className="eyebrow">Conteúdo</div><h1>Projetos</h1></div><Link href="/admin/projetos/novo" className="admin-button">Novo projeto +</Link></div><div className="admin-grid">{(projects ?? []).map(p => <div className="admin-row" key={p.id}><img className="admin-thumb" src={p.cover_url} alt="" /><div><strong>{p.title}</strong><div style={{ color:'#858179', marginTop:5 }}>{p.category} · {p.format ?? 'auto'} · {p.year ?? '—'}</div></div><span className={`status ${p.published ? 'live' : 'draft'}`}>{p.published ? 'Publicado' : 'Rascunho'}{p.featured ? ' · Destaque' : ''}</span><span style={{ color:'#858179', fontFamily:'DM Mono, monospace', fontSize:11 }}>ordem {p.sort_order}</span><div style={{ display:'flex', gap:12, alignItems:'center' }}><Link href={`/admin/projetos/${p.id}`}>Editar</Link><AdminDeleteButton id={p.id} /></div></div>)}{!(projects ?? []).length && <div className="admin-card">Nenhum projeto cadastrado.</div>}</div></div></main>;
}
