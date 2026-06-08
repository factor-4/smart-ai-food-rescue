import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';

interface DailySale {
  date: string;
  count: number;
}

interface PopularBag {
  bagId: number;
  orderCount: number;
}

interface DashboardData {
  sales: DailySale[];
  totalRevenue: number;
  popularBags: PopularBag[];
}

export default function DashboardPage({ restaurantId }: { restaurantId: number }) {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', restaurantId],
    queryFn: () =>
      axios.get(`/api/dashboard/${restaurantId}`).then((res) => res.data),
  });

  // Loading state
  if (isLoading) {
    return <p className="p-4">Loading dashboard…</p>;
  }

  // Error state
  if (isError) {
    return <p className="p-4 text-red-500">Failed to load dashboard data.</p>;
  }

  // Success – show revenue
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Restaurant Dashboard</h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">Total Revenue (last 7 days)</p>
        <p className="text-3xl font-bold text-green-900">
          €{data?.totalRevenue.toFixed(2)}
        </p>
      </div>
    </div>
  );
}