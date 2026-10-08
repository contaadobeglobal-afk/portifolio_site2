import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProjectCarousel from '@/components/ProjectCarousel';
import ProjectShareButton from '@/components/ProjectShareButton';
import type { ProjectFormat } from '@/lib/types';
import { demoProjects } from '@/lib/demo';

export const dynamic = 'force-dynamic';
const coverClass: Record<ProjectFormat,string> = { auto:'r169','9:16':'r916','3:4':'r34','1:1':'r11','16:9':'r169' };
function isVideo(url:string){return /\.(mp4|webm|mov)(\?.*)?$/i.test(url)}

export default async function ProjectPage({ params }: { params: Promise<{slug:string}> }) {
  const {slug}=await params;
  const supabase=await createClient();
  const {data:dbProject,error:projectError}=await supabase.from('portfolio_projects').select('*').eq('slug',slug).eq('published',true).maybeSingle();
  if(projectError) throw new Error(`Não foi possível carregar o projeto: ${projectError.message}`);
  const project = dbProject ?? demoProjects.find((item)=>item.slug===slug);
  if(!project) notFound();

  const isDemo = 'demo' in project && project.demo;
  let next: {slug:string; title:string} | undefined;
  if (isDemo) {
    const index = demoProjects.findIndex((item)=>item.slug===project.slug);
    next = demoProjects.length > 1 ? demoProjects[(index + 1) % demoProjects.length] : undefined;
  } else {
    const {data:orderedProjects,error:orderedProjectsError}=await supabase.from('portfolio_projects').select('id,title,slug').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:true});
    if(orderedProjectsError) throw new Error(`Não foi possível carregar a ordem dos projetos: ${orderedProjectsError.message}`);
    const currentIndex=orderedProjects.findIndex((item)=>item.id===project.id);
    next = orderedProjects.length > 1 && currentIndex >= 0
      ? orderedProjects[(currentIndex + 1) % orderedProjects.length]
      : undefined;
  }

  const format=(project.format??'auto') as ProjectFormat;
  const gallery=(project.gallery_urls??[]) as string[];
  const mode=project.media_mode??'single';
  return <main className="case-view">
    <div className="container">
      <div className="case-nav"><Link className="case-back" href="/trabalhos">← Todos os trabalhos</Link><ProjectShareButton slug={project.slug} title={project.title} /></div>
      <div className="case-top"><div><div className="eyebrow">{project.category} / {project.year ?? '—'}</div><h1 className="case-title">{project.title}</h1>{project.intro&&<p className="case-intro">{project.intro}</p>}</div><div className="case-details"><div className="case-detail"><b>Cliente</b>{project.client||'—'}</div><div className="case-detail"><b>Meu papel</b>{project.role||'—'}</div><div className="case-detail"><b>Créditos</b>{project.credits||'—'}</div></div></div>
      <div className={`case-cover-preview ${coverClass[format]}`}>
        {isDemo ? <div className={project.demo_art}>{project.demo_art==='art-1'?'MOTION':project.demo_art==='art-2'?'SOCIAL':'MOTION / IMAGE'}</div> : project.video_url && isVideo(project.video_url) && project.media_mode==='video' ? <video src={project.video_url} poster={project.cover_url || undefined} controls playsInline preload="metadata" className="case-cover-video" style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : <img src={project.cover_url} alt={project.title} decoding="async" fetchPriority="high" />}
      </div>
      <div className="case-copy">
        {project.challenge&&<div className="case-text"><h3>Contexto</h3><p>{project.challenge}</p></div>}
        {project.direction&&<div className="case-text"><h3>Direção</h3><p>{project.direction}</p></div>}
        {project.result&&<div className="case-text"><h3>Resultado</h3><p>{project.result}</p></div>}
        {project.video_url && (!isVideo(project.video_url) || project.media_mode!=='video') && <div className="case-text"><h3>Vídeo / Motion</h3><div className="case-motion">{isVideo(project.video_url)?<video className={`case-native-video ${format==='9:16'?'case-native-video--916':''}`} src={project.video_url} poster={project.cover_url || undefined} controls playsInline preload="metadata" />:<iframe className={`case-video ${format==='9:16'?'case-video--916':''}`} src={project.video_url} title={`${project.title} — vídeo`} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" />}</div></div>}
        {mode==='carousel'&&gallery.length>1?<div className="case-text"><h3>Carrossel</h3><ProjectCarousel items={gallery} title={project.title} format={format==='auto'?'Formato livre':format}/></div>:gallery.length?<div className="case-text"><h3>Galeria</h3><div className="case-gallery-preview">{gallery.map((url:string,i:number)=><img key={`${url}-${i}`} src={url} alt={`${project.title} — detalhe ${i+1}`} loading="lazy" decoding="async" />)}</div></div>:null}
        {next
          ? <Link href={`/trabalhos/${next.slug}`} className="case-next"><div><span>Próximo projeto</span><strong>{next.title}</strong></div><b aria-hidden="true">↗</b></Link>
          : <Link href="/trabalhos" className="case-next"><div><span>Não há outro projeto publicado</span><strong>Ver todos os trabalhos</strong></div><b aria-hidden="true">↗</b></Link>}
      </div>
    </div>
  </main>;
}
