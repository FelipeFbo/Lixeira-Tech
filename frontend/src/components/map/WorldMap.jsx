import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "../../data/countries-110m.json";
import { WORLD_EWASTE_DATA, BRAZIL_ID } from "../../data/worldEwasteData";
import "./WorldMap.css";

const WIDTH = 960;
const HEIGHT = 500;

/**
 * Mapa-múndi em line-art puro (sem preenchimento de país, só contorno),
 * com países presentes no dataset destacados por um ponto pulsante na
 * cor de accent. Clique abre o painel lateral (CountryPanel, renderizado
 * pelo componente pai) com os dados daquele país.
 *
 * Geometria via d3-geo + topojson-client (libs "puras", sem dependência
 * de versão de React — evita conflito de peer-deps com React 19).
 */
export function WorldMap({ onSelectCountry, selectedId }) {
  const [hoveredId, setHoveredId] = useState(null);

  const { geoJson, pathGenerator, projection } = useMemo(() => {
    const geo = feature(worldTopo, worldTopo.objects.countries);
    const proj = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geo);
    return { geoJson: geo, pathGenerator: geoPath(proj), projection: proj };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="world-map-svg"
      role="img"
      aria-label="Mapa-múndi com dados de geração de lixo eletrônico por país"
    >
      <g>
        {geoJson.features.map((f) => {
          const id = Number(f.id);
          const hasData = Boolean(WORLD_EWASTE_DATA[id]);
          const isActive = hoveredId === id || selectedId === id;
          return (
            <path
              key={f.id}
              d={pathGenerator(f)}
              className={[
                "world-map-country",
                hasData ? "has-data" : "",
                isActive ? "is-active" : "",
                id === BRAZIL_ID ? "is-brazil" : "",
              ].join(" ")}
              onMouseEnter={() => hasData && setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => hasData && onSelectCountry(id)}
            />
          );
        })}
      </g>

      <g>
        {Object.entries(WORLD_EWASTE_DATA).map(([id, country]) => {
          const centroid = getCentroid(geoJson, Number(id), pathGenerator);
          if (!centroid) return null;
          const isActive = hoveredId === Number(id) || selectedId === Number(id);
          return (
            <g
              key={id}
              transform={`translate(${centroid[0]}, ${centroid[1]})`}
              className="world-map-dot-group"
              onMouseEnter={() => setHoveredId(Number(id))}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectCountry(Number(id))}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.circle
                    r={4}
                    className="world-map-dot-ring"
                    initial={{ r: 4, opacity: 0.6 }}
                    animate={{ r: 14, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
              <circle
                r={Number(id) === BRAZIL_ID ? 5.5 : 3.5}
                className={`world-map-dot ${Number(id) === BRAZIL_ID ? "is-brazil" : ""}`}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function getCentroid(geoJson, id, pathGenerator) {
  const f = geoJson.features.find((feat) => Number(feat.id) === id);
  if (!f) return null;
  return pathGenerator.centroid(f);
}
