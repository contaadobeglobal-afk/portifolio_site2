'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('on');
      }),
      { threshold: 0.08 }
    );

    document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => revealObserver.observe(el));

    const header = document.querySelector<HTMLElement>('.site-header');
    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
    const nav = [...document.querySelectorAll<HTMLAnchorElement>('.nav a[data-section]')];
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        nav.forEach((a) => a.classList.toggle('active', a.dataset.section === entry.target.id));
      }),
      { rootMargin: '-42% 0px -48% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));

    return () => {
      revealObserver.disconnect();
      spy.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
