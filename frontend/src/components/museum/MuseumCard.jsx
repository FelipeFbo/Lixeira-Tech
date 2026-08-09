import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { LineIcon } from "../ui/LineIcon";
import "./MuseumCard.css";

export function MuseumCard({ item, index = 0 }) {
  return (
    <Link to={`/museu/${item.slug}`} className="museum-card-link">
      <Card
        hover
        className="museum-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      >
        <div className="museum-card-icon">
          <LineIcon name={item.icon} size={48} animate={false} />
        </div>
        <span className="mono text-accent museum-card-year">{item.year}</span>
        <h3 className="display museum-card-name">{item.name}</h3>
        <p className="text-dim museum-card-tagline">{item.tagline}</p>
        <span className="mono museum-card-cta">explorar →</span>
      </Card>
    </Link>
  );
}
