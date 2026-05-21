import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const BISHKEK_CENTER = [42.8746, 74.5698];

const FitBounds = ({ branches, selectedId }) => {
  const map = useMap();

  useEffect(() => {
    if (!branches?.length) return;
    const points = branches.map((b) => [b.coordinates.lat, b.coordinates.lng]);
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [branches, map]);

  useEffect(() => {
    if (!selectedId) return;
    const branch = branches.find((b) => b._id === selectedId);
    if (branch) {
      map.flyTo([branch.coordinates.lat, branch.coordinates.lng], 15, { duration: 0.8 });
    }
  }, [selectedId, branches, map]);

  return null;
};

const MapPicker = ({ branches, selectedBranchId, onSelectBranch }) => {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-zinc-800">
      <MapContainer center={BISHKEK_CENTER} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds branches={branches} selectedId={selectedBranchId} />
        {branches.map((branch) => (
          <Marker
            key={branch._id}
            position={[branch.coordinates.lat, branch.coordinates.lng]}
            icon={branch._id === selectedBranchId ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelectBranch(branch),
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-zinc-900">{branch.name}</p>
                <p className="text-xs text-zinc-600">{branch.address}</p>
                {branch.phone && <p className="mt-1 text-xs text-zinc-500">{branch.phone}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
