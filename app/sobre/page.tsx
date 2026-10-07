import { site } from '@/lib/site';

export default function SobrePage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 90 }}>
        <div className="container about-grid">
          <p className="about-copy">Direção, design, vídeo e imagem para dar forma às ideias.</p>
          <div className="about-side">
            <p className="small-copy">Sou Lucas Miranda, diretor de arte e designer à frente do Anima Estudio. Trabalho entre identidade, campanhas, edição de vídeo, motion, digital, editorial e materiais impressos.</p>
            <p className="small-copy">Meu processo parte do problema, encontra uma linguagem e só depois escolhe a ferramenta. A inteligência artificial faz parte do processo criativo quando amplia possibilidades de pesquisa, imagem, movimento e desenvolvimento sempre guiada por conceito, composição, ritmo e decisão.</p>
            <div className="expertise">
              {['Direção de arte', 'Branding', 'Campanhas', 'Edição de vídeo', 'Motion & imagem', 'Social & digital', 'Editorial & impresso', 'IA no processo criativo'].map((item) => <div className="expertise-item" key={item}>{item}</div>)}
            </div>
            <a className="project-link" href={`mailto:${site.email}`}>Falar comigo</a>
          </div>
        </div>
      </section>
    </main>
  );
}
