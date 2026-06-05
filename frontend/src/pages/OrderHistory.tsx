import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import {useAuthStore} from '../stores/authStore';
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
  // Get userId from token
  const token = useAuthStore((s) => s.token);
  const userId = token ? (jwtDecode<{ userId: number }>(token)).userId : null;

  // Fetch orders only when userId is available
  const { data: orders, isLoading } = useQuery<OrderResponse[]>({
    queryKey: ['orders', userId],
    queryFn: () => axios.get(`/api/orders?userId=${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  if (!userId) return <p>Please log in first.</p>;
  if (isLoading) return <p>Loading orders…</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders?.length === 0 && <p>No orders yet.</p>}
      {orders?.map((order) => (
        <div key={order.id} className="border rounded p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">Order #{order.id}</p>
            <p className="text-sm text-gray-500">Bag #{order.bagId} × {order.quantity}</p>
            <p className="text-sm">Total: ${order.totalPrice}</p>
          </div>
          <Badge variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}