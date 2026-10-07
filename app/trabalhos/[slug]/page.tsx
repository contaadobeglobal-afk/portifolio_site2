import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProjectFormat } from '@/lib/types';

export const dynamic = 'force-dynamic';

const coverClass: Record<ProjectFormat, string> = {
  auto: 'case-cover--auto',
  '9:16': 'case-cover--916',
  '3:4': 'case-cover--34',
  '1:1': 'case-cover--11',
  '16:9': 'case-cover--169',
};

function isMp4(url: string) {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url);
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from('portfolio_projects').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  if (!project) notFound();

  const { data: following } = await supabase
    .from('portfolio_projects')
    .select('id,title,slug')
    .eq('published', true)
    .neq('id', project.id)
    .gt('sort_order', project.sort_order)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  const target = following ?? (await supabase.from('portfolio_projects').select('id,title,slug').eq('published', true).neq('id', project.id).order('sort_order', { ascending: true }).limit(1).maybeSingle()).data;

  const format = (project.format ?? 'auto') as ProjectFormat;
  const formatLabel = format === 'auto' ? 'Formato livre' : format;

  return (
    <main>
      <section className="case-hero">
        <div className="container">
          <Link className="back-link" href="/trabalhos">← Todos os trabalhos</Link>
          <div className="case-top">
            <div>
              <div className="case-kicker"><span>{project.category}</span><span>/</span><span>{project.year ?? '—'}</span><span>/</span><span>{formatLabel}</span></div>
              <h1 className="case-title">{project.title}</h1>
              {project.intro && <p className="case-intro">{project.intro}</p>}
            </div>
            <div className="case-details">
              <div className="detail"><b>Cliente</b>{project.client || '—'}</div>
              <div className="detail"><b>Meu papel</b>{project.role || '—'}</div>
              <div className="detail"><b>Créditos</b>{project.credits || '—'}</div>
            </div>
          </div>
          <div className={`case-cover ${coverClass[format]}`}>
            <img src={project.cover_url} alt={project.title} />
          </div>
        </div>
      </section>

      <section className="case-body">
        {project.challenge && <div className="case-section"><h3>Contexto</h3><p>{project.challenge}</p></div>}
        {project.direction && <div className="case-section"><h3>Direção</h3><p>{project.direction}</p></div>}
        {project.result && <div className="case-section"><h3>Resultado</h3><p>{project.result}</p></div>}

        {project.video_url && (
          <div className="case-section"><h3>Motion</h3><div className="case-motion">
            {isMp4(project.video_url) ? (
              <video className={`case-native-video ${format === '9:16' ? 'case-native-video--916' : ''}`} src={project.video_url} controls playsInline preload="metadata" />
            ) : (
              <iframe className={`case-video ${format === '9:16' ? 'case-video--916' : ''}`} src={project.video_url} title={`${project.title} — vídeo`} allow="autoplay; fullscreen; picture-in-picture" />
            )}
          </div></div>
        )}

        {project.gallery_urls?.length ? (
          <div className="case-section"><h3>Galeria</h3><div className="case-gallery">
            {project.gallery_urls.map((url: string, i: number) => <img key={`${url}-${i}`} src={url} alt={`${project.title} — detalhe ${i + 1}`} loading="lazy" />)}
          </div></div>
        ) : null}

        {target && <Link href={`/trabalhos/${target.slug}`} className="next-project"><div><span>Próximo projeto</span><strong>{target.title}</strong></div><b aria-hidden="true">↗</b></Link>}
      </section>
    </main>
  );
}
