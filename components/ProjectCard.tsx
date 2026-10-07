import Link from 'next/link';
import type { Project } from '@/lib/types';

const formatClass: Record<Project['format'], string> = {
  'auto': 'project-card--auto',
  '9:16': 'project-card--916',
  '3:4': 'project-card--34',
  '1:1': 'project-card--11',
  '16:9': 'project-card--169',
};

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link href={`/trabalhos/${project.slug}`} className={`project-card ${formatClass[project.format ?? 'auto']}`}>
      <div className="project-card-media">
        <span className="project-format">{project.format === 'auto' ? 'Formato livre' : project.format}</span>
        <img src={project.cover_url} alt={project.title} loading="lazy" />
      </div>
      <div className="project-card-copy">
        <div>
          <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
          <h3 className="project-title">{project.title}</h3>
          <div className="project-meta">
            <span>{project.category}</span>
            {project.client && <span>{project.client}</span>}
            {project.year && <span>{project.year}</span>}
          </div>
        </div>
        <span className="project-link">Ver case <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}
