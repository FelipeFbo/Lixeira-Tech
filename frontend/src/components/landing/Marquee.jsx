import "./Marquee.css";

/**
 * Faixa de texto em loop infinito — padrão recorrente em sites premium
 * de portfólio/produto (recent.design está cheio de exemplos). Usado
 * aqui como separador editorial entre seções, reforçando a mensagem
 * central do produto em movimento constante.
 */
export function Marquee({ text, repeat = 6 }) {
  const items = Array.from({ length: repeat });
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((_, i) => (
          <span className="marquee-item mono" key={i}>
            {text}
            <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
      <div className="marquee-track" aria-hidden="true">
        {items.map((_, i) => (
          <span className="marquee-item mono" key={`dup-${i}`}>
            {text}
            <span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
