'use client';
import { useState } from 'react';

export default function ProjectCarousel({ items, title, format }: { items: string[]; title: string; format: string }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const go = (direction: number) => setActive((active + direction + items.length) % items.length);
  return <div className="case-carousel" aria-label={`Galeria de ${title}`}>
    <div className="case-carousel-stage">
      {items.map((url, index) => <button type="button" className={`carousel-frame ${index === active ? 'is-main' : ''}`} key={`${url}-${index}`} onClick={() => setActive(index)} aria-label={`Ver imagem ${index+1} de ${items.length}`}>
        <img src={url} alt={`${title} — ${index+1}`} loading={index === active ? 'eager' : 'lazy'} />
      </button>)}
    </div>
    <div className="case-carousel-meta"><span>{String(active+1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span><span>{format} · carrossel</span><div className="case-carousel-controls"><button type="button" onClick={() => go(-1)} aria-label="Imagem anterior">←</button><button type="button" onClick={() => go(1)} aria-label="Próxima imagem">→</button></div></div>
    <div className="case-carousel-mobile-dots">{items.map((_,i)=><button key={i} className={i===active?'active':''} onClick={()=>setActive(i)} aria-label={`Ir para imagem ${i+1}`} />)}</div>
  </div>;
}
