"use client";

// Carte Leaflet (chargée uniquement dans le navigateur, via LocalityMap).
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { ProjectSummary } from "@/lib/catalogShared";

const pin = L.divIcon({
  html: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 4px rgba(0,0,0,.5))"><path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="#EA4335"/><circle cx="12" cy="8" r="3.5" fill="white"/></svg>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function LocalityMapView({
  projects,
  selected,
  onSelect,
}: {
  projects: ProjectSummary[];
  selected: ProjectSummary | null;
  onSelect: (p: ProjectSummary) => void;
}) {
  const center: [number, number] = selected?.lat && selected?.lng ? [selected.lat, selected.lng] : [36.7525, 3.042];
  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ width: "100%", height: "100%", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selected?.lat && selected?.lng ? <Recenter lat={selected.lat} lng={selected.lng} /> : null}
      {projects.map((p) =>
        p.lat && p.lng ? (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pin} eventHandlers={{ click: () => onSelect(p) }}>
            <Tooltip direction="top" offset={[0, -40]} opacity={1}>
              <span className="text-xs font-bold uppercase text-[#052620]">{p.title}</span>
            </Tooltip>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
