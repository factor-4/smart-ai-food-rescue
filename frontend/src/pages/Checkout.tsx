import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useBagStock } from '../hooks/useBagStock';
import { useBagPrice } from '../hooks/useBagPrice';
import { useOrderNotifications } from '../hooks/useOrderNotifications';

interface BagResponse {
  id: number;
  name: string;
  discountedPrice?: number;
  originalPrice: number;
  quantity: number;
}

export default function Checkout() {
  const token = useAuthStore((s) => s.token);
  const userId = token ? (jwtDecode<{ userId: number }>(token)).userId : null;

  const [selectedBagId, setSelectedBagId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { lastNotification } = useOrderNotifications(userId);

  const { data: bags, isLoading } = useQuery<BagResponse[]>({
    queryKey: ['bags'],
    queryFn: () => axios.get('/api/bags').then((res) => res.data.content ?? res.data),
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      axios.post('/api/orders', {
        idempotencyKey: crypto.randomUUID(),
        userId,
        bagId: selectedBagId,
        quantity,
      }),
  });

  if (isLoading) return <p className="p-4">Loading bags…</p>;
  if (!userId) return <p className="p-4">Please log in first.</p>;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {lastNotification && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <p className="text-blue-800 font-medium">
            📦 Order #{lastNotification.orderId}: {lastNotification.message}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Status: {lastNotification.newStatus}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Select a bag</label>
        {bags?.map((bag) => (
          <BagCard
            key={bag.id}
            bag={bag}
            isSelected={selectedBagId === bag.id}
            onSelect={() => setSelectedBagId(bag.id)}
          />
        ))}
      </div>

      {selectedBagId && (
        <div className="space-y-4 bg-gray-50 border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded p-2 w-20 text-sm"
            />
            <Button
              onClick={() => orderMutation.mutate()}
              disabled={orderMutation.isPending}
              className="w-full sm:w-auto"
            >
              {orderMutation.isPending ? 'Placing order…' : 'Place Order'}
            </Button>
          </div>

          {orderMutation.isSuccess && (
            <p className="text-green-600 text-sm">
              ✅ Order placed! ID: {orderMutation.data?.data?.id}
            </p>
          )}
          {orderMutation.isError && (
            <p className="text-red-600 text-sm">
              Error: {orderMutation.error?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BagCard({
  bag,
  isSelected,
  onSelect,
}: {
  bag: BagResponse;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { quantity, status, connected: stockConnected } = useBagStock(bag.id, bag.quantity ?? 0);
  const { currentDiscount, connected: priceConnected } = useBagPrice(bag.id);

  const liveDiscountedPrice = currentDiscount !== null
    ? bag.originalPrice * (1 - currentDiscount)
    : bag.discountedPrice ?? bag.originalPrice;

  const discountPercentage = currentDiscount !== null
    ? Math.round(currentDiscount * 100)
    : null;

  const isLive = stockConnected && priceConnected;

  return (
    <Card
      className={`cursor-pointer border-2 transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm sm:text-base truncate">{bag.name}</p>
            <p className="text-xs sm:text-sm mt-1">
              Price:{' '}
              {discountPercentage ? (
                <>
                  <span className="line-through text-gray-400 mr-1">
                    €{bag.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-bold">
                    €{liveDiscountedPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 text-xs ml-1">
                    (-{discountPercentage}%)
                  </span>
                </>
              ) : (
                <span>€{liveDiscountedPrice.toFixed(2)}</span>
              )}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs">
            <span>{isLive ? '🟢 Live' : '🔴 Offline'}</span>
            <span className="font-medium">Stock: {quantity}</span>
            {quantity > 0 && quantity < 3 && (
              <span className="text-orange-500 font-bold">⚠️ Low</span>
            )}
            {status === 'SOLD_OUT' && (
              <span className="text-red-600 font-bold">SOLD OUT</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}