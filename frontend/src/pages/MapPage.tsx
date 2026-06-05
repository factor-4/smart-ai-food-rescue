import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { BagMap } from '../components/BagMap';

interface BagWithLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  discountedPrice: number;
}

export default function MapPage() {
  const { data: bags, isLoading, isError } = useQuery<BagWithLocation[]>({
    queryKey: ['bags-map'],
    queryFn: () =>
      axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
  });

  if (isLoading) return <p className="p-4">Loading map…</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load bags.</p>;

  const geoBags = (bags ?? []).filter((b) => b.latitude && b.longitude);

  return (
    <div className="w-full h-screen">
      <h1 className="text-2xl font-bold p-4">Nearby Rescue Bags</h1>
      <BagMap bags={geoBags} />
    </div>
  );
}