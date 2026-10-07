'use client';

import { useEffect, useRef } from 'react';

export default function Pointer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let frame = 0;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      d.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      r.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      frame = requestAnimationFrame(tick);
    };

    const setHover = (kind: 'link' | 'cta' | null) => {
      d.dataset.state = kind ?? '';
      r.dataset.state = kind ?? '';
    };

    const bindings: Array<[HTMLElement, () => void, () => void]> = [];
    document.querySelectorAll<HTMLElement>('a, button, [data-cursor="view"]').forEach((el) => {
      const enter = () => setHover(el.dataset.cursor === 'cta' ? 'cta' : 'link');
      const leave = () => setHover(null);
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      bindings.push([el, enter, leave]);
    });

    window.addEventListener('mousemove', move);
    tick();

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(frame);
      bindings.forEach(([el, enter, leave]) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  return <><div ref={dot} className="pointer-dot" aria-hidden="true" /><div ref={ring} className="pointer-ring" aria-hidden="true"><span>View</span></div></>;
}
