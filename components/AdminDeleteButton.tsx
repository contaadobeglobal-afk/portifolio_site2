"use client";
import { createClient } from '@/lib/supabase/client';

export default function AdminDeleteButton({ id }: { id: string }) {
  async function remove() {
    if (!confirm('Excluir este projeto?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    window.location.reload();
  }
  return <button onClick={remove} style={{ background:'none', color:'#ff9c83', border:0, padding:0 }}>Excluir</button>;
}
