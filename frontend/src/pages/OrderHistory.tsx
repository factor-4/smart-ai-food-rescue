import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { Badge } from '../components/ui/badge';

interface OrderResponse {
  id: number;
  bagId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function OrderHistory() {
  const token = useAuthStore((s) => s.token);
  const userId = token ? (jwtDecode<{ userId: number }>(token)).userId : null;

  const { data: orders, isLoading } = useQuery<OrderResponse[]>({
    queryKey: ['orders', userId],
    queryFn: () => axios.get(`/api/orders?userId=${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  if (!userId) return <p className="p-4 text-sm">Please log in first.</p>;
  if (isLoading) return <p className="p-4 text-sm">Loading orders…</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders?.length === 0 && (
        <p className="text-sm text-gray-500">No orders yet.</p>
      )}

      {orders?.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <p className="font-semibold text-sm sm:text-base">
              Order #{order.id}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Bag #{order.bagId} × {order.quantity}
            </p>
            <p className="text-xs sm:text-sm">
              Total: €{order.totalPrice.toFixed(2)}
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

          <Badge
            variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}
            className="self-start sm:self-center text-xs"
          >
            {order.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}