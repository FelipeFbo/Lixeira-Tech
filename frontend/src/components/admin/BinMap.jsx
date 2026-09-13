import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./BinMap.css";

const CASCAVEL_CENTER = [-24.9555, -53.4552];
const CASCAVEL_BOUNDS = [[-25.1, -53.7], [-24.8, -53.2]];

const STATUS = {
  online: { color: "#5d8700", label: "Online" },
  maintenance: { color: "#c17a00", label: "Em manutenção" },
  offline: { color: "#d65c5c", label: "Offline" },
};

function LocationPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });
  return null;
}

export function BinMap({ bins, onPickLocation }) {
  return (
    <div className="bin-map-shell">
      <MapContainer
        className="bin-map"
        center={CASCAVEL_CENTER}
        zoom={13}
        minZoom={12}
        maxZoom={18}
        maxBounds={CASCAVEL_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        aria-label="Mapa interativo de Cascavel com as lixeiras cadastradas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onPickLocation && <LocationPicker onPick={onPickLocation} />}
        {bins.filter((bin) => Number.isFinite(Number(bin.latitude)) && Number.isFinite(Number(bin.longitude))).map((bin) => {
          const status = STATUS[bin.status] || STATUS.offline;
          return (
            <CircleMarker
              key={bin.id}
              center={[bin.latitude, bin.longitude]}
              radius={10}
              pathOptions={{ color: status.color, fillColor: status.color, fillOpacity: 0.9, weight: 3 }}
            >
              <Popup>
                <strong>{bin.name}</strong>
                <span>{bin.location}</span>
                <span>Status: {status.label}</span>
                <span>Capacidade: {bin.capacity_pct}%</span>
                <span>Última coleta: {bin.last_collected_at ? new Date(bin.last_collected_at).toLocaleDateString("pt-BR") : "—"}</span>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <p className="bin-map-hint">Clique no mapa para definir o ponto da nova lixeira em Cascavel.</p>
    </div>
  );
}
