import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';

interface BagLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  discountedPrice: number;
}

interface BagMapProps {
  bags: BagLocation[];
  center: { lat: number; lng: number };
}

// Helper component to move the map view when props change
function ChangeView({ center }: { center: LatLngExpression }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function BagMap({ bags, center }: BagMapProps) {
  const defaultCenter: LatLngExpression = [center.lat, center.lng];


  // In a later step,  use geolocation to update center
  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={defaultCenter} />
      {bags.map((bag) => (
        <Marker key={bag.id} position={[bag.latitude, bag.longitude]}>
          <Popup>
            <div>
              <strong>{bag.name}</strong><br />
              Discounted: €{bag.discountedPrice.toFixed(2)}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}