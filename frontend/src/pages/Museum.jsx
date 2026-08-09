import { MUSEUM_ITEMS } from "../data/museumItems";
import { MuseumCard } from "../components/museum/MuseumCard";
import "./Museum.css";

export default function Museum() {
  return (
    <div className="museum container">
      <section className="museum-header">
        <p className="eyebrow">Museu Digital</p>
        <h1 className="display museum-title">
          Cada equipamento carrega uma <span className="text-accent">era — e um risco ambiental diferente.</span>
        </h1>
        <p className="text-dim museum-lede">
          Explore marcos da tecnologia pessoal e entenda como cada geração de eletrônicos deve
          ser descartada corretamente hoje.
        </p>
      </section>

      <section className="museum-grid">
        {MUSEUM_ITEMS.map((item, i) => (
          <MuseumCard key={item.slug} item={item} index={i} />
        ))}
      </section>
    </div>
  );
}
