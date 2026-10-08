"use client";
import { FormEvent, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeUnreferencedPortfolioMedia } from '@/lib/portfolio-media';
import { slugify } from '@/lib/slugify';
import { compressImage, compressVideo, MAX_MEDIA_SIZE, validateMediaSize } from '@/lib/media-compression';
import type { Project, ProjectFormat, ProjectMediaMode } from '@/lib/types';

const EMPTY = { title:'', slug:'', category:'Direção de arte', format:'auto' as ProjectFormat, media_mode:'single' as ProjectMediaMode, year:new Date().getFullYear().toString(), client:'', role:'', intro:'', challenge:'', direction:'', result:'', cover_url:'', gallery_urls:[] as string[], video_url:'', credits:'', featured:false, published:false, sort_order:'0' };

type FormState = Omit<typeof EMPTY, 'format'> & { format: ProjectFormat };
type UploadedVideo = { videoUrl: string; posterUrl: string };

export default function ProjectForm({ project, nextSortOrder = 1 }: { project?: Project; nextSortOrder?: number }) {
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
  }) : { ...EMPTY, sort_order: String(nextSortOrder) }, [nextSortOrder, project]);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [videoBusy, setVideoBusy] = useState(false);
  const savedProjectId = useRef(project?.id ?? null);
  const uploadedVideo = useRef<UploadedVideo | null>(null);
  const backgroundSaveRequested = useRef(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) { setForm(s => ({ ...s, [key]: value })); }

  async function storeMedia(file: File, folder: string) {
    const supabase = createClient();
    const path = `projects/${crypto.randomUUID()}/${folder}-${file.name}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);
    return supabase.storage.from('portfolio').getPublicUrl(path).data.publicUrl;
  }

  async function uploadFiles(files: FileList | null, mode: 'cover'|'gallery') {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      for (const [index, file] of Array.from(files).entries()) {
        validateMediaSize(file);
        setUploadStatus(`Otimizando imagem ${index + 1} de ${files.length}…`);
        const optimized = await compressImage(file, progress => {
          setUploadStatus(`Otimizando imagem ${index + 1} de ${files.length}… ${progress}%`);
        });
        const url = await storeMedia(optimized, mode);
        if (mode === 'cover') set('cover_url', url);
        else setForm(current => ({ ...current, gallery_urls: [...current.gallery_urls, url] }));
      }
      setMessage('Imagem(ns) otimizada(s) e enviada(s).');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a mídia.');
    } finally {
      setBusy(false);
      setUploadStatus('');
    }
  }

  async function uploadVideo(file: File | undefined) {
    if (!file) return;
    backgroundSaveRequested.current = false;
    setVideoBusy(true);
    setError('');
    setMessage('');
    try {
      setUploadStatus('Preparando o compressor de vídeo…');
      const optimized = await compressVideo(file, progress => {
        if (progress >= 92) {
          setUploadStatus('Gerando imagem de prévia no navegador…');
        } else if (progress >= 85) {
          setUploadStatus('Finalizando o arquivo de vídeo…');
        } else {
          setUploadStatus(`Comprimindo vídeo no navegador… ${progress}%`);
        }
      });

      setUploadStatus('Enviando prévia do vídeo…');
      const posterUrl = await storeMedia(optimized.poster, 'poster');
      const sizeMb = (optimized.video.size / (1024 * 1024)).toFixed(1);
      setUploadStatus(`Enviando vídeo (${sizeMb} MB) ao Supabase…`);
      const videoUrl = await storeMedia(optimized.video, 'video');
      uploadedVideo.current = { videoUrl, posterUrl };
      setForm(current => ({
        ...current,
        video_url: videoUrl,
        media_mode: 'video',
        cover_url: current.cover_url || posterUrl,
      }));
      const projectId = savedProjectId.current;
      if (projectId && backgroundSaveRequested.current) {
        const supabase = createClient();
        const { error } = await supabase
          .from('portfolio_projects')
          .update({ video_url: videoUrl, media_mode: 'video' })
          .eq('id', projectId);
        if (error) throw new Error(`Vídeo enviado, mas não foi possível associá-lo ao projeto: ${error.message}`);
        const { error: coverError } = await supabase
          .from('portfolio_projects')
          .update({ cover_url: posterUrl })
          .eq('id', projectId)
          .eq('cover_url', '');
        if (coverError) throw new Error(`Vídeo enviado, mas não foi possível salvar sua imagem de prévia: ${coverError.message}`);
        if (project?.video_url) await removeUnreferencedPortfolioMedia([project.video_url]);
        backgroundSaveRequested.current = false;
      }
      setMessage('Vídeo comprimido e enviado. A imagem de prévia também foi gerada.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível comprimir ou enviar o vídeo.');
    } finally {
      setVideoBusy(false);
      setUploadStatus('');
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sortOrder = Number(form.sort_order);
    if (!Number.isInteger(sortOrder) || sortOrder < 1) {
      setError('Informe uma posição inteira maior que zero.');
      return;
    }
    setBusy(true); setError(''); setMessage('');
    const supabase = createClient();
    const payload = { title:form.title, slug:form.slug || slugify(form.title), category:form.category, format:form.format, media_mode:uploadedVideo.current ? 'video' : form.media_mode, year:form.year ? Number(form.year) : null, client:form.client || null, role:form.role || null, intro:form.intro || null, challenge:form.challenge || null, direction:form.direction || null, result:form.result || null, cover_url:form.cover_url || uploadedVideo.current?.posterUrl || '', gallery_urls:form.gallery_urls, video_url:uploadedVideo.current?.videoUrl || form.video_url || null, credits:form.credits || null, featured:form.featured, published:form.published, sort_order:sortOrder };
    const existingId = savedProjectId.current;
    const query = existingId
      ? supabase.from('portfolio_projects').update(payload).eq('id', existingId).select('id').single()
      : supabase.from('portfolio_projects').insert(payload).select('id').single();
    const { data: saved, error } = await query;
    if (error) { setError(error.message); setBusy(false); return; }
    savedProjectId.current = saved.id;
    const completedUpload = uploadedVideo.current;
    if (completedUpload && payload.video_url !== completedUpload.videoUrl) {
      const { error: videoError } = await supabase
        .from('portfolio_projects')
        .update({ video_url: completedUpload.videoUrl, media_mode: 'video' })
        .eq('id', saved.id);
      if (videoError) {
        setError(`Projeto salvo, mas não foi possível associar o vídeo: ${videoError.message}`);
        setBusy(false);
        return;
      }
      if (!payload.cover_url && !form.cover_url) {
        const { error: coverError } = await supabase
          .from('portfolio_projects')
          .update({ cover_url: completedUpload.posterUrl })
          .eq('id', saved.id)
          .eq('cover_url', '');
        if (coverError) {
          setError(`Projeto salvo, mas não foi possível salvar a imagem de prévia: ${coverError.message}`);
          setBusy(false);
          return;
        }
      }
    }
    backgroundSaveRequested.current = videoBusy && !completedUpload;
    setMessage(videoBusy
      ? 'Projeto salvo. O vídeo continua sendo processado e será associado automaticamente.'
      : 'Projeto salvo.');
    if (!existingId && !videoBusy) { window.location.href = '/admin'; return; }
    if (project) {
      try {
        await removeUnreferencedPortfolioMedia([
          project.cover_url,
          ...(project.gallery_urls ?? []),
          project.video_url ?? '',
        ]);
      } catch (cleanupError) {
        setError(cleanupError instanceof Error ? cleanupError.message : 'O projeto foi salvo, mas não foi possível limpar as mídias antigas.');
      }
    }
    setBusy(false);
  }

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-card admin-form-grid">
      <div className="admin-field"><label>Título *</label><input required value={form.title} onChange={e => set('title', e.target.value)} onBlur={() => !form.slug && set('slug', slugify(form.title))} /></div>
      <div className="admin-field"><label>Ano</label><input inputMode="numeric" value={form.year} onChange={e => set('year', e.target.value)} /></div>
    </div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} /></div><div className="admin-field"><label>Posição na lista</label><input type="number" min="1" step="1" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} /><small style={{ color:'#858179' }}>Número menor aparece primeiro. Novos projetos começam no final; ajuste aqui para mudar a ordem.</small></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Categoria</label><input value={form.category} onChange={e => set('category', e.target.value)} /></div><div className="admin-field"><label>Apresentação</label><select value={form.media_mode} onChange={e => set('media_mode', e.target.value as ProjectMediaMode)}><option value="single">Peça única</option><option value="gallery">Galeria</option><option value="carousel">Carrossel</option><option value="video">Vídeo / Motion</option></select></div><div className="admin-field"><label>Formato principal</label><select value={form.format} onChange={e => set('format', e.target.value as FormState['format'])}><option value="auto">Automático</option><option value="9:16">9:16 — Motion vertical</option><option value="3:4">3:4 — Social 1080×1440</option><option value="1:1">1:1 — Quadrado</option><option value="16:9">16:9 — Horizontal</option></select></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Cliente</label><input value={form.client} onChange={e => set('client', e.target.value)} /></div></div>
    <div className="admin-card admin-form-grid"><div className="admin-field"><label>Meu papel</label><input value={form.role} onChange={e => set('role', e.target.value)} /></div><div className="admin-field"><label>Créditos</label><input value={form.credits} onChange={e => set('credits', e.target.value)} /></div></div>
    <div className="admin-card admin-field"><label>Resumo / introdução</label><textarea value={form.intro} onChange={e => set('intro', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Contexto</label><textarea value={form.challenge} onChange={e => set('challenge', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Direção</label><textarea value={form.direction} onChange={e => set('direction', e.target.value)} /></div>
    <div className="admin-card admin-field"><label>Resultado</label><textarea value={form.result} onChange={e => set('result', e.target.value)} /></div>
    <div className="admin-card admin-form">
      <div className="admin-field">
        <label>Capa *</label>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e => { void uploadFiles(e.target.files, 'cover'); e.currentTarget.value = ''; }} />
        <input placeholder="ou cole uma URL pública" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} />
        <small style={{ color:'#858179' }}>{form.cover_url ? 'Capa definida.' : 'Imagens são convertidas para WebP e limitadas a 2560px.'}</small>
        {form.cover_url && <><img src={form.cover_url} alt="Prévia da capa" loading="lazy" decoding="async" style={{ width:'100%', maxHeight:240, objectFit:'cover' }} /><button type="button" className="admin-button ghost" disabled={busy} onClick={() => set('cover_url', '')}>Remover capa</button></>}
      </div>
      <div className="admin-field">
        <label>Galeria</label>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={busy} onChange={e => { void uploadFiles(e.target.files, 'gallery'); e.currentTarget.value = ''; }} />
        {form.gallery_urls.length > 0 && <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>{form.gallery_urls.map((url, index) => <div key={url} style={{ display:'grid', gap:6 }}><img src={url} alt="" loading="lazy" decoding="async" style={{ width:'100%', aspectRatio:1, objectFit:'cover' }} /><button type="button" className="admin-button ghost" disabled={busy} onClick={() => set('gallery_urls', form.gallery_urls.filter((_, itemIndex) => itemIndex !== index))}>Remover</button></div>)}</div>}
      </div>
      <div className="admin-field">
        <label>Enviar vídeo (MP4/WebM/MOV)</label>
        <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={busy || videoBusy} onChange={e => { void uploadVideo(e.target.files?.[0]); e.currentTarget.value = ''; }} />
        <small style={{ color:'#858179' }}>O vídeo é comprimido no navegador para MP4 e recebe uma imagem de prévia.</small>
        <label>Vídeo por URL ou embed</label>
        <input placeholder="https://.../video.mp4 ou https://www.youtube.com/embed/..." value={form.video_url} disabled={videoBusy} onChange={e => { uploadedVideo.current = null; set('video_url', e.target.value); }} />
        {form.video_url && /\.(mp4|webm|mov)(\?.*)?$/i.test(form.video_url) && <div style={{ width:'100%', aspectRatio:form.format === '9:16' ? '9 / 16' : form.format === '3:4' ? '3 / 4' : form.format === '1:1' ? '1 / 1' : '16 / 9', maxHeight:320, overflow:'hidden' }}><video src={form.video_url} poster={form.cover_url || undefined} controls playsInline preload="metadata" style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>}
        {form.video_url && <button type="button" className="admin-button ghost" disabled={busy || videoBusy} onClick={() => { uploadedVideo.current = null; set('video_url', ''); }}>Remover vídeo</button>}
      </div>
      <small style={{ color:'#858179' }}>Vídeos são processados no navegador com FFmpeg/WASM e convertidos para MP4. Você pode salvar o projeto enquanto o processamento continua; mantenha esta aba aberta para o vídeo ser associado assim que terminar. O arquivo final deve caber em {Math.round(MAX_MEDIA_SIZE / 1024 / 1024)} MB para o Storage.</small>
      {uploadStatus && <div className="notice" aria-live="polite">{uploadStatus}</div>}
    </div>
    <div className="admin-card admin-checks"><label className="admin-check"><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Destaque na home</label><label className="admin-check"><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} /> Publicado</label></div>
    {error && <div className="error">{error}</div>}{message && <div className="notice">{message}</div>}
    <div className="admin-form-actions"><button type="button" className="admin-button ghost" onClick={() => window.location.href='/admin'}>Cancelar</button><button className="admin-button" disabled={busy}>{busy ? 'Processando…' : 'Salvar projeto'}</button></div>
  </form>;
}
