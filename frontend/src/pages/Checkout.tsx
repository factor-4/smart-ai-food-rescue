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

  if (isLoading) return <p>Loading bags…</p>;
  if (!userId) return <p>Please log in first.</p>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {lastNotification && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-blue-800 font-medium">
            📦 Order #{lastNotification.orderId}: {lastNotification.message}
          </p>
          <p className="text-blue-600 text-sm">
            Status: {lastNotification.newStatus}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block font-medium">Select a bag</label>
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
        <div className="space-y-2">
          <label className="block font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded p-2 w-20"
          />
          <Button
            onClick={() => orderMutation.mutate()}
            disabled={orderMutation.isPending}
          >
            {orderMutation.isPending ? 'Placing order…' : 'Place Order'}
          </Button>

          {orderMutation.isSuccess && (
            <p className="text-green-600">
              Order placed! ID: {orderMutation.data?.data?.id}
            </p>
          )}
          {orderMutation.isError && (
            <p className="text-red-600">
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

  console.log('BagCard render ', bag.id, bag.originalPrice, currentDiscount, discountPercentage);
  return (
    <Card
      className={`cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
      onClick={onSelect}
    >
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{bag.name}</p>

            <p className="text-sm">
              Price:{' '}
              {discountPercentage ? (
                <>
                  <span className="line-through text-gray-400 mr-1">
                    ${bag.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-bold">
                    ${liveDiscountedPrice.toFixed(2)}
                  </span>
                  <span className="text-green-600 text-xs ml-1">
                    ({discountPercentage}% off)
                  </span>
                </>
              ) : (
                <span>${liveDiscountedPrice.toFixed(2)}</span>
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs">
              {isLive ? '🟢 Live' : '🔴 Offline'}
            </p>

            <p className="text-sm font-medium">
              Stock: {quantity}
            </p>

            {quantity > 0 && quantity < 3 && (
              <p className="text-orange-500 text-xs font-bold">
                ⚠️ Only a few left!
              </p>
            )}

            {status === 'SOLD_OUT' && (
              <p className="text-red-600 text-xs font-bold">
                SOLD OUT
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}