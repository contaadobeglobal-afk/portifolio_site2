"use client";
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }
  return <button onClick={handleLogout} style={{ background:'none', border:0, color:'inherit', padding:0, fontSize:12 }}>Sair</button>;
}
