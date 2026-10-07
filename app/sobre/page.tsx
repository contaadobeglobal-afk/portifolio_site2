import { site } from '@/lib/site';

export default function SobrePage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 90 }}>
        <div className="container about-grid">
          <p className="about-copy">Direção de arte, design e imagem com intenção.</p>
          <div className="about-side">
            <p className="small-copy">Sou Lucas Miranda, diretor de arte e designer à frente do Anima Estudio. Trabalho entre identidade, campanha, imagem, motion e digital para transformar ideias em sistemas visuais consistentes.</p>
            <p className="small-copy">Meu processo parte do problema, encontra uma linguagem e só depois escolhe a ferramenta. Tecnologia generativa pode fazer parte do caminho, mas a direção continua sendo humana: conceito, ritmo, composição e decisão.</p>
            <div className="expertise">
              {['Direção de arte', 'Branding', 'Campanhas', 'Key visual', 'Motion', 'Digital'].map((item) => <div className="expertise-item" key={item}>{item}</div>)}
            </div>
            <a className="project-link" href={`mailto:${site.email}`}>Falar comigo</a>
          </div>
        </div>
      </section>
    </main>
  );
}
