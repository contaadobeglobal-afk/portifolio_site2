"use client";
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('E-mail ou senha inválidos.'); setLoading(false); return; }
    window.location.href = '/admin';
  }

  return <div className="admin-shell login-wrap"><form className="login-card" onSubmit={submit}><div className="eyebrow">Anima Estudio</div><h1>Entrar no admin.</h1><p>Use o usuário de editor criado no Supabase Auth.</p><div className="admin-form"><div className="admin-field"><label>E-mail</label><input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></div><div className="admin-field"><label>Senha</label><input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></div>{error && <div className="error">{error}</div>}<button className="admin-button" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button></div></form></div>;
}
