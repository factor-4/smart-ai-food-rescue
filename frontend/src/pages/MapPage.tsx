import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { BagMap } from '../components/BagMap';
import { useGeolocation } from '../hooks/useGeolocation';

interface BagWithLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  discountedPrice: number;
}

// Helper function to calculate distance between two GPS points (Haversine formula)
function getDistanceInKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapPage() {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();

  const { data: bags, isLoading, isError } = useQuery<BagWithLocation[]>({
    queryKey: ['bags-map'],
    queryFn: () =>
      axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
  });

  if (isLoading || geoLoading) return <p className="p-4">Loading map…</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load bags.</p>;

  let geoBags = (bags ?? []).filter((b) => b.latitude && b.longitude);

  // If we have user location, filter bags within 3 km
  if (location) {
    geoBags = geoBags.filter((bag) => {
      const distance = getDistanceInKm(
        location.lat, location.lng,
        bag.latitude, bag.longitude
      );
      return distance <= 3; // only show bags within 3 km
    });
  }

  const mapCenter = location
    ? { lat: location.lat, lng: location.lng }
    : { lat: 60.1695, lng: 24.9354 }; // default Helsinki

  return (
    <div className="w-full h-screen">
      <h1 className="text-2xl font-bold p-4">
        Nearby Rescue Bags
        {geoError && (
          <span className="text-sm text-gray-500 ml-2">
            (using default location: {geoError})
          </span>
        )}
      </h1>
      <BagMap bags={geoBags} center={mapCenter} />
    </div>
  );
}