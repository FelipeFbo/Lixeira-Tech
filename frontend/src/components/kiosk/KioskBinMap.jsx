import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./KioskBinMap.css";

const CASCAVEL_CENTER = [-24.9555, -53.4552];
const CASCAVEL_BOUNDS = [[-25.1, -53.7], [-24.8, -53.2]];

const STATUS = {
  online: { color: "#5d8700", label: "Disponível" },
  maintenance: { color: "#e2a439", label: "Em manutenção" },
  offline: { color: "#ff7878", label: "Indisponível" },
};

export function KioskBinMap({ bins, selectedBinId, onSelect }) {
  const mappedBins = bins.filter((bin) => Number.isFinite(Number(bin.latitude)) && Number.isFinite(Number(bin.longitude)));

  return (
    <section className="kiosk-bin-selector" aria-label="Seleção de lixeira no mapa">
      <div className="kiosk-bin-selector-head">
        <span className="kiosk-label">Escolha a lixeira no mapa</span>
        <p>Toque em um marcador verde para selecionar uma unidade disponível.</p>
      </div>
      <MapContainer
        className="kiosk-bin-map"
        center={CASCAVEL_CENTER}
        zoom={13}
        minZoom={12}
        maxZoom={18}
        maxBounds={CASCAVEL_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedBins.map((bin) => {
          const status = STATUS[bin.status] || STATUS.offline;
          const isSelected = bin.id === selectedBinId;
          const available = bin.status === "online";
          return (
            <CircleMarker
              key={bin.id}
              center={[bin.latitude, bin.longitude]}
              radius={isSelected ? 14 : 10}
              pathOptions={{
                color: isSelected ? "#ffffff" : status.color,
                fillColor: status.color,
                fillOpacity: available ? 0.95 : 0.5,
                weight: isSelected ? 4 : 3,
              }}
              eventHandlers={available ? { click: () => onSelect(bin.id) } : undefined}
            >
              <Popup>
                <strong>{bin.name}</strong>
                <span>{bin.location}</span>
                <span>{status.label} · {bin.capacity}% cheia</span>
                {available && <button type="button" onClick={() => onSelect(bin.id)}>Selecionar esta lixeira</button>}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {mappedBins.length === 0 && <p className="kiosk-error">Nenhuma lixeira com localização disponível.</p>}
    </section>
  );
}
