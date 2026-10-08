'use client';

import { useState } from 'react';

export default function ProjectShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/trabalhos/${slug}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Confira este trabalho: ${title}`, url });
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
  }

  return (
    <button type="button" className="project-share" onClick={handleShare} aria-label={`Compartilhar ${title}`}>
      {copied ? 'Copiado' : 'Compartilhar'}
    </button>
  );
}
