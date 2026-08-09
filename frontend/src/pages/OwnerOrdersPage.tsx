import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';

interface RestaurantResponse {
  id: number;
  name: string;
}

interface OrderResponse {
  id: number;
  bagId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  userId: number;
}

interface BagResponse {
  id: number;
  name: string;
  restaurantName?: string;
  imageUrl?: string;
}

export default function OwnerOrdersPage() {
  const token = useAuthStore((s) => s.token);
  const payload = token ? jwtDecode<{ userId: number }>(token) : null;
  const ownerId = payload?.userId;
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);

  // 1. Fetch owner's restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<RestaurantResponse[]>({
    queryKey: ['owner-restaurants', ownerId],
    queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
    enabled: !!ownerId,
  });

  // 2. For each restaurant, fetch PAID orders
  const { data: ordersPerRestaurant, isLoading: ordersLoading } = useQuery({
    queryKey: ['owner-paid-orders', restaurants],
    queryFn: async () => {
      if (!restaurants || restaurants.length === 0) return [];
      const promises = restaurants.map((r) =>
        axios.get(`/api/orders/restaurant/${r.id}/paid`).then((res) => res.data)
      );
      return Promise.all(promises);
    },
    enabled: !!restaurants && restaurants.length > 0,
  });

  // 3. Fetch all bags for names/images (cached)
  const { data: bags } = useQuery<BagResponse[]>({
    queryKey: ['bags-for-owner-orders'],
    queryFn: () =>
      axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
    staleTime: 1000 * 60 * 10,
  });

  const acceptMutation = useMutation({
    mutationFn: (orderId: number) =>
      axios.put(`/api/orders/${orderId}/status`, { status: 'CONFIRMED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-paid-orders'] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to accept order');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (orderId: number) =>
      axios.put(`/api/orders/${orderId}/status`, { status: 'REJECTED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-paid-orders'] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to reject order');
    },
  });

  if (!ownerId) return <p className="p-4">Please log in as a restaurant owner.</p>;
  if (restaurantsLoading || ordersLoading) return <p className="p-4">Loading orders…</p>;

  // Flatten all orders into a single sorted list
  const allPaidOrders: OrderResponse[] = (ordersPerRestaurant || [])
    .flat()
    .sort((a: OrderResponse, b: OrderResponse) => b.id - a.id); // newest first

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Incoming Orders</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
      {allPaidOrders.length === 0 && (
        <p className="text-gray-500">No orders waiting for confirmation.</p>
      )}
      {allPaidOrders.map((order) => {
        const bag = bags?.find((b) => b.id === order.bagId);
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
                <p className="font-semibold text-sm">
                  {bag?.name ?? `Bag #${order.bagId}`}
                </p>
                {bag?.restaurantName && (
                  <p className="text-xs text-gray-500">{bag.restaurantName}</p>
                )}
                <p className="text-xs text-gray-600">
                  Qty: {order.quantity} &middot; €{order.totalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 self-end sm:self-center">
              <button
                onClick={() => acceptMutation.mutate(order.id)}
                disabled={acceptMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => rejectMutation.mutate(order.id)}
                disabled={rejectMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}