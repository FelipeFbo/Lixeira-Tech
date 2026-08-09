import { useState } from "react";
import { WorldMap } from "../components/map/WorldMap";
import { CountryPanel } from "../components/map/CountryPanel";
import { WORLD_EWASTE_DATA, BRAZIL_ID } from "../data/worldEwasteData";
import "./WorldPanorama.css";

export default function WorldPanorama() {
  const [selectedId, setSelectedId] = useState(BRAZIL_ID);

  const countries = Object.entries(WORLD_EWASTE_DATA)
    .map(([id, c]) => ({ id: Number(id), ...c }))
    .sort((a, b) => b.generationKt - a.generationKt);

  return (
    <div className="panorama container">
      <section className="panorama-header">
        <p className="eyebrow">Panorama Mundial</p>
        <h1 className="display panorama-title">
          O lixo eletrônico é global. <span className="text-accent">O impacto, nem sempre é visível.</span>
        </h1>
        <p className="text-dim panorama-lede">
          Passe o mouse ou toque em um país para ver quanto e-lixo ele gera, quanto recicla
          formalmente, e como isso se compara ao Brasil e à média mundial.
        </p>
      </section>

      <section className="panorama-map-section">
        <div className="panorama-map-wrap">
          <WorldMap onSelectCountry={setSelectedId} selectedId={selectedId} />
        </div>
        <CountryPanel countryId={selectedId} onClose={() => setSelectedId(null)} />
      </section>

      <section className="panorama-ranking">
        <p className="eyebrow">Maiores geradores (kt/ano, estimativa)</p>
        <div className="panorama-ranking-list">
          {countries.map((c, i) => (
            <button
              key={c.id}
              className={`panorama-ranking-row ${selectedId === c.id ? "is-active" : ""} ${c.id === BRAZIL_ID ? "is-brazil" : ""}`}
              onClick={() => setSelectedId(c.id)}
            >
              <span className="mono panorama-ranking-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="panorama-ranking-name">{c.name}</span>
              <span className="panorama-ranking-bar-track">
                <span
                  className="panorama-ranking-bar-fill"
                  style={{ width: `${(c.generationKt / countries[0].generationKt) * 100}%` }}
                />
              </span>
              <span className="mono text-dim panorama-ranking-value">
                {c.generationKt.toLocaleString("pt-BR")} kt
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
