import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { Badge } from '../components/ui/badge';
import { ImageOff } from 'lucide-react';

interface OrderResponse {
  id: number;
  bagId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface BagResponse {
  id: number;
  name: string;
  restaurantName?: string;
  imageUrl?: string;
}

export default function OrderHistory() {
  const token = useAuthStore((s) => s.token);
  const userId = token ? (jwtDecode<{ userId: number }>(token)).userId : null;

  const { data: orders, isLoading } = useQuery<OrderResponse[]>({
    queryKey: ['orders', userId],
    queryFn: () => axios.get(`/api/orders?userId=${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  const { data: bags } = useQuery<BagResponse[]>({
    queryKey: ['bags-for-orders'],
    queryFn: () =>
      axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
    staleTime: 1000 * 60 * 10,
  });

  if (!userId) return <p className="p-4 text-sm">Please log in first.</p>;
  if (isLoading) return <p className="p-4 text-sm">Loading orders…</p>;

  const getBag = (bagId: number) => bags?.find((b) => b.id === bagId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders?.length === 0 && (
        <p className="text-sm text-gray-500">No orders yet.</p>
      )}
      {orders?.map((order) => {
        const bag = getBag(order.bagId);
        return (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            <div className="flex gap-4 items-start min-w-0 flex-1">
              {/* Bag thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {bag?.imageUrl ? (
                  <img
                    src={bag.imageUrl}
                    alt={bag.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <ImageOff size={18} />
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base">
                  {bag?.name ?? `Bag #${order.bagId}`}
                </p>
                {bag?.restaurantName && (
                  <p className="text-xs text-gray-500">{bag.restaurantName}</p>
                )}
                <p className="text-xs sm:text-sm text-gray-600">
                  Qty: {order.quantity} &middot; Total: €{order.totalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-FI', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <Badge
              variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}
              className="self-start sm:self-center text-xs"
            >
              {order.status}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}