'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  return project.cover_url
    ? <img src={project.cover_url} alt={project.title} loading="lazy" decoding="async" />
    : <div className="art-3">ANIMA</div>;
}

function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const url = `${window.location.origin}/trabalhos/${slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Confira este trabalho: ${title}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      } catch {
        window.prompt('Copie o link do projeto:', url);
      }
    }

    window.setTimeout(() => setCopied(false), 1700);
  };

  return (
    <button type="button" className="project-share" onClick={handleShare} aria-label={`Compartilhar ${title}`}>
      {copied ? 'Copiado' : 'Compartilhar'}
    </button>
  );
}

export default function ProjectCard({ project, index, compact = false }: { project: CardProject; index: number; compact?: boolean }) {
  return (
    <Link
      href={`/trabalhos/${project.slug}`}
      className={`project-card ${formatClass[project.format ?? 'auto']} ${compact ? 'project-card--compact' : ''} reveal`}
      data-cursor="view"
    >
      <div className="project-card-media">
        <Media project={project} />
      </div>
      <div className="project-card-copy">
        <div>
          <div className="project-index">{String(index + 1).padStart(2, '0')}</div>
          <h3 className="project-title">{project.title}</h3>
          <div className="project-meta"><span>{project.category}</span>{project.client && <span>{project.client}</span>}{project.year && <span>{project.year}</span>}</div>
        </div>
        <div className="project-actions">
          <span className="project-link">Ver case <span aria-hidden="true">↗</span></span>
          <ShareButton slug={project.slug} title={project.title} />
        </div>
      </div>
    </Link>
  );
}
