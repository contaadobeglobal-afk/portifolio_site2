import Link from 'next/link';
import type { Project } from '@/lib/types';

type CardProject = Project & { demo?: boolean; demo_art?: 'art-1' | 'art-2' | 'art-3' };

const formatClass: Record<Project['format'], string> = {
  auto: 'project-card--auto',
  '9:16': 'project-card--916',
  '3:4': 'project-card--34',
  '1:1': 'project-card--11',
  '16:9': 'project-card--169',
};

function Media({ project }: { project: CardProject }) {
  if (project.demo) {
    const art = project.demo_art ?? 'art-1';
    const label = art === 'art-1' ? 'MOTION' : art === 'art-2' ? 'SOCIAL' : 'MOTION / IMAGE';
    return <div className={art}>{label}</div>;
  }

  if (project.media_mode === 'video' && project.video_url && /\.(mp4|webm|mov)(\?.*)?$/i.test(project.video_url)) {
    return <video src={project.video_url} muted autoPlay loop playsInline preload="metadata" aria-label={project.title} />;
  }

  return project.cover_url ? <img src={project.cover_url} alt={project.title} loading="lazy" /> : <div className="art-3">ANIMA</div>;
}

export default function ProjectCard({ project, index, compact = false }: { project: CardProject; index: number; compact?: boolean }) {
  return (
    <Link
      href={`/trabalhos/${project.slug}`}
      className={`project-card ${formatClass[project.format ?? 'auto']} ${compact ? 'project-card--compact' : ''} reveal`}
      data-cursor="view"
    >
      <div className="project-card-media">
        <span className="project-format">{project.format === 'auto' ? 'Formato livre' : project.format}</span>
        <Media project={project} />
      </div>
      <div className="project-card-copy">
        <div>
          <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
          <h3 className="project-title">{project.title}</h3>
          <div className="project-meta"><span>{project.category}</span>{project.client && <span>{project.client}</span>}{project.year && <span>{project.year}</span>}</div>
        </div>
        <span className="project-link">Ver case <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}
