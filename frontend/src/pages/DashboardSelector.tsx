import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';

interface RestaurantResponse {
  id: number;
  name: string;
}

export default function DashboardSelector() {
  const token = useAuthStore((s) => s.token);
  const payload = token ? jwtDecode<{ userId: number }>(token) : null;
  const ownerId = payload?.userId;

  const { data: restaurants, isLoading } = useQuery<RestaurantResponse[]>({
    queryKey: ['owner-restaurants', ownerId],
    queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
    enabled: !!ownerId,
  });

  if (!ownerId) return <p className="p-4">Please log in as a restaurant owner.</p>;
  if (isLoading) return <p className="p-4">Loading your restaurants…</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Select a Restaurant</h1>
      {restaurants?.length === 0 && (
        <p className="text-gray-500">You don't have any restaurants yet.</p>
      )}
      <div className="grid gap-4">
        {restaurants?.map((r) => (
          <Link
            key={r.id}
            to={`/dashboard/${r.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-green-300 hover:shadow-md transition-all"
          >
            <p className="text-lg font-semibold">{r.name}</p>
            <p className="text-sm text-slate-500">View dashboard →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}