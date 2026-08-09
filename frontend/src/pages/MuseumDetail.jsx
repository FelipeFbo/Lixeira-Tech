import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMuseumItem } from "../data/museumItems";
import { LineIcon } from "../components/ui/LineIcon";
import { DeviceTimeline } from "../components/museum/DeviceTimeline";
import { Card } from "../components/ui/Card";
import "./MuseumDetail.css";

export default function MuseumDetail() {
  const { slug } = useParams();
  const item = getMuseumItem(slug);

  if (!item) return <Navigate to="/museu" replace />;

  return (
    <div className="museum-detail container">
      <Link to="/museu" className="mono text-dim museum-detail-back">← voltar ao museu</Link>

      <motion.section
        className="museum-detail-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="museum-detail-icon">
          <LineIcon name={item.icon} size={72} />
        </div>
        <p className="eyebrow">{item.manufacturer} · {item.year}</p>
        <h1 className="display museum-detail-title">{item.name}</h1>
        <p className="text-dim museum-detail-tagline">{item.tagline}</p>
      </motion.section>

      <section className="museum-detail-grid">
        <Card className="museum-detail-card">
          <p className="eyebrow">Curiosidades</p>
          <ul className="museum-detail-list">
            {item.funFacts.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
        </Card>

        <Card className="museum-detail-card">
          <p className="eyebrow">Materiais presentes</p>
          <div className="museum-detail-tags">
            {item.materials.map((m) => (
              <span key={m} className="mono museum-detail-tag">{m}</span>
            ))}
          </div>
        </Card>
      </section>

      <Card className="museum-detail-disposal">
        <p className="eyebrow">Como descartar hoje</p>
        <p className="museum-detail-disposal-text">{item.disposal}</p>
      </Card>

      <section className="museum-detail-timeline-section">
        <p className="eyebrow">Evolução tecnológica</p>
        <DeviceTimeline items={item.timeline} />
      </section>
    </div>
  );
}
