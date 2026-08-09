import { motion } from "framer-motion";
import "./DeviceTimeline.css";

export function DeviceTimeline({ items = [] }) {
  return (
    <ol className="device-timeline">
      {items.map((item, i) => (
        <motion.li
          key={`${item.year}-${i}`}
          className="device-timeline-item"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <span className="mono text-accent device-timeline-year">{item.year}</span>
          <span className="device-timeline-dot" />
          <span className="text-dim device-timeline-label">{item.label}</span>
        </motion.li>
      ))}
    </ol>
  );
}
