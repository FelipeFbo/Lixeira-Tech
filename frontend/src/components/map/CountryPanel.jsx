import { motion, AnimatePresence } from "framer-motion";
import { WORLD_EWASTE_DATA, WORLD_AVERAGE, BRAZIL_ID } from "../../data/worldEwasteData";
import "./CountryPanel.css";

export function CountryPanel({ countryId, onClose }) {
  const country = countryId ? WORLD_EWASTE_DATA[countryId] : null;
  const brazil = WORLD_EWASTE_DATA[BRAZIL_ID];

  return (
    <AnimatePresence>
      {country && (
        <motion.aside
          className="country-panel"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="country-panel-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>

          <p className="eyebrow">Panorama Mundial</p>
          <h3 className="display country-panel-title">{country.name}</h3>

          <div className="country-panel-stats">
            <div className="country-panel-stat">
              <span className="mono fs-mono-lg text-accent">
                {country.generationKt.toLocaleString("pt-BR")} kt
              </span>
              <p className="text-dim">gerados por ano</p>
            </div>
            <div className="country-panel-stat">
              <span className="mono fs-mono-lg">{country.perCapitaKg} kg</span>
              <p className="text-dim">por habitante/ano</p>
            </div>
            <div className="country-panel-stat">
              <span className="mono fs-mono-lg text-support-cyan">{country.recyclingRatePct}%</span>
              <p className="text-dim">taxa de reciclagem formal</p>
            </div>
            <div className="country-panel-stat">
              <span className="mono fs-mono-lg">{(country.population / 1_000_000).toFixed(0)}M</span>
              <p className="text-dim">habitantes</p>
            </div>
          </div>

          <p className="country-panel-funfact">{country.funFact}</p>

          {countryId !== BRAZIL_ID && (
            <div className="country-panel-compare">
              <p className="eyebrow">Comparado ao Brasil</p>
              <CompareBar label="Per capita" a={country.perCapitaKg} b={brazil.perCapitaKg} unit=" kg" />
              <CompareBar
                label="Reciclagem"
                a={country.recyclingRatePct}
                b={brazil.recyclingRatePct}
                unit="%"
              />
            </div>
          )}

          <div className="country-panel-compare">
            <p className="eyebrow">Comparado à média mundial</p>
            <CompareBar label="Per capita" a={country.perCapitaKg} b={WORLD_AVERAGE.perCapitaKg} unit=" kg" />
            <CompareBar
              label="Reciclagem"
              a={country.recyclingRatePct}
              b={WORLD_AVERAGE.recyclingRatePct}
              unit="%"
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function CompareBar({ label, a, b, unit }) {
  const max = Math.max(a, b) * 1.15 || 1;
  return (
    <div className="compare-bar-row">
      <span className="text-dim fs-body-sm">{label}</span>
      <div className="compare-bar-track">
        <motion.div
          className="compare-bar-fill compare-bar-fill-a"
          initial={{ width: 0 }}
          whileInView={{ width: `${(a / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="mono fs-body-sm">{a}{unit}</span>
    </div>
  );
}
