export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="eyebrow">Anima Estudio</div>
          <div className="foot-title">Lucas Miranda</div>
        </div>
        <div className="eyebrow">Direção de arte / Design</div>
        <div className="eyebrow">© {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}
