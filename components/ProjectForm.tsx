"use client";
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/slugify';
import type { Project, ProjectFormat, ProjectMediaMode } from '@/lib/types';

const EMPTY = { title:'', slug:'', category:'Direção de arte', format:'auto' as ProjectFormat, media_mode:'single' as ProjectMediaMode, year:new Date().getFullYear().toString(), client:'', role:'', intro:'', challenge:'', direction:'', result:'', cover_url:'', gallery_urls:[] as string[], video_url:'', credits:'', featured:false, published:false, sort_order:'0' };

type FormState = Omit<typeof EMPTY, 'format'> & { format: ProjectFormat };

export default function ProjectForm({ project }: { project?: Project }) {
  const initial: FormState = useMemo(() => project ? ({
    ...EMPTY,
    ...project,
    media_mode: project.media_mode ?? 'single',
    client: project.client ?? '',
    role: project.role ?? '',
    intro: project.intro ?? '',
    challenge: project.challenge ?? '',
    direction: project.direction ?? '',
    result: project.result ?? '',
    video_url: project.video_url ?? '',
    credits: project.credits ?? '',
    year: project.year?.toString() ?? '',
    gallery_urls: project.gallery_urls ?? [],
    sort_order: project.sort_order.toString()
  }) : EMPTY, [project]);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) { setForm(s => ({ ...s, [key]: value })); }
  async function uploadFiles(files: FileList | null, mode: 'cover'|'gallery') {
    if (!files?.length) return;
    setBusy(true); setError('');
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const safe = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-')}`;
      const path = `projects/${crypto.randomUUID()}/${safe}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (error) { setError(error.message); setBusy(false); return; }
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    if (mode === 'cover') set('cover_url', urls[0]);
    else set('gallery_urls', [...form.gallery_urls, ...urls]);
    setBusy(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    const supabase = createClient();
    const payload = { title:form.title, slug:form.slug || slugify(form.title), category:form.category, format:form.format, media_mode:form.media_mode, year:form.year ? Number(form.year) : null, client:form.client || null, role:form.role || null, intro:form.intro || null, challenge:form.challenge || null, direction:form.direction || null, result:form.result || null, cover_url:form.cover_url, gallery_urls:form.gallery_urls, video_url:form.video_url || null, credits:form.credits || null, featured:form.featured, published:form.published, sort_order:Number(form.sort_order) || 0 };
    const query = project ? supabase.from('portfolio_projects').update(payload).eq('id', project.id) : supabase.from('portfolio_projects').insert(payload);
    const { error } = await query;
    if (error) { setError(error.message); setBusy(false); return; }
    setMessage('Projeto salvo.');
    if (!project) { window.location.href = '/admin'; return; }
    setBusy(false);
  }

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-card admin-form-grid">
      <div className="admin-field"><label>Título *</label><input required value={form.title} onChange={e => set('title', e.target.value)} onBlur={() => !form.slug && set('slug', slugify(form.title))} /></div>
      <div className="admin-field"><label>Ano</label><input inputMode="numeric" value={form.year} onChange={e => set('year', e.target.value)} /></div>
    </div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} /></div><div className="admin-field"><label>Ordem</label><input inputMode="numeric" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} /></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Categoria</label><input value={form.category} onChange={e => set('category', e.target.value)} /></div><div className="admin-field"><label>Apresentação</label><select value={form.media_mode} onChange={e => set('media_mode', e.target.value as ProjectMediaMode)}><option value="single">Peça única</option><option value="gallery">Galeria</option><option value="carousel">Carrossel</option><option value="video">Vídeo / Motion</option></select></div><div className="admin-field"><label>Formato principal</label><select value={form.format} onChange={e => set('format', e.target.value as FormState['format'])}><option value="auto">Automático</option><option value="9:16">9:16 — Motion vertical</option><option value="3:4">3:4 — Social 1080×1440</option><option value="1:1">1:1 — Quadrado</option><option value="16:9">16:9 — Horizontal</option></select></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Cliente</label><input value={form.client} onChange={e => set('client', e.target.value)} /></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Meu papel</label><input value={form.role} onChange={e => set('role', e.target.value)} /></div><div className="admin-field"><label>Créditos</label><input value={form.credits} onChange={e => set('credits', e.target.value)} /></div></div>
    <div className="admin-card admin-field"><label>Resumo / introdução</label><textarea value={form.intro} onChange={e => set('intro', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Contexto</label><textarea value={form.challenge} onChange={e => set('challenge', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Direção</label><textarea value={form.direction} onChange={e => set('direction', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Resultado</label><textarea value={form.result} onChange={e => set('result', e.target.value)} /></div>
    <div className="admin-card admin-form"><div className="admin-field"><label>Capa *</label><input type="file" accept="image/*" onChange={e => uploadFiles(e.target.files, 'cover')} /><input placeholder="ou cole uma URL pública" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} /><small style={{ color:'#858179' }}>{form.cover_url ? 'Capa definida.' : 'Recomendado: 1600px+ de largura.'}</small></div><div className="admin-field"><label>Galeria</label><input type="file" accept="image/*" multiple onChange={e => uploadFiles(e.target.files, 'gallery')} />{form.gallery_urls.length > 0 && <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>{form.gallery_urls.map(url => <img key={url} src={url} alt="" style={{ width:'100%', aspectRatio:1, objectFit:'cover' }} />)}</div>}</div><div className="admin-field"><label>Vídeo (MP4/WebM/MOV ou embed)</label><input placeholder="https://.../video.mp4 ou https://www.youtube.com/embed/..." value={form.video_url} onChange={e => set('video_url', e.target.value)} /></div></div>
    <div className="admin-card admin-checks"><label className="admin-check"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Destaque na home</label><label className="admin-check"><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} /> Publicado</label></div>
    {error && <div className="error">{error}</div>}{message && <div className="notice">{message}</div>}
    <div className="admin-form-actions"><button type="button" className="admin-button ghost" onClick={() => window.location.href='/admin'}>Cancelar</button><button className="admin-button" disabled={busy}>{busy ? 'Salvando…' : 'Salvar projeto'}</button></div>
  </form>;
}
