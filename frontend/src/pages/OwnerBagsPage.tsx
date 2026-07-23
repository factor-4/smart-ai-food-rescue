import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { ImageUpload } from '../components/ImageUpload';
import CreateRestaurantForm from '../components/CreateRestaurantForm';
import { useState } from 'react';

interface RestaurantResponse {
    id: number;
    name: string;
}

interface BagResponse {
    id: number;
    name: string;
    originalPrice: number;
    discountedPrice: number;
    quantity: number;
    status: string;
    imageUrl: string | null;
}

export default function OwnerBagsPage() {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode<{ userId: number }>(token) : null;
    const ownerId = payload?.userId;

    const { data: restaurants, isLoading: restaurantsLoading, refetch: refetchRestaurants } = useQuery<RestaurantResponse[]>({
        queryKey: ['owner-restaurants', ownerId],
        queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
        enabled: !!ownerId,
    });

    if (!ownerId) return <p className="p-4">Please log in as a restaurant owner.</p>;
    if (restaurantsLoading) return <p className="p-4">Loading your restaurants…</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">My Bags</h1>
            <div className="flex justify-end">
                <CreateRestaurantForm onCreated={() => refetchRestaurants()} />
            </div>
            {restaurants?.length === 0 && (
                <p className="text-gray-500">You don't have any restaurants yet.</p>
            )}
            {restaurants?.map((restaurant) => (
                <RestaurantBagList key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
    );
}

function RestaurantBagList({ restaurant }: { restaurant: RestaurantResponse }) {
    const { data: bags, isLoading, isError } = useQuery<BagResponse[]>({
        queryKey: ['bags', restaurant.id],
        queryFn: () => axios.get(`/api/restaurants/${restaurant.id}/bags`).then((res) => res.data.content ?? res.data),
    });

    const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});

    if (isLoading) return <p>Loading bags for {restaurant.name}…</p>;
    if (isError) return <p className="text-red-500">Failed to load bags for {restaurant.name}.</p>;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">{restaurant.name}</h2>
            <div className="grid gap-4">
                {bags?.map((bag) => {
                    const displayedImageUrl = imageUrls[bag.id] !== undefined ? imageUrls[bag.id] : bag.imageUrl;

                    return (
                        <div key={bag.id} className="border rounded-lg p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <p className="font-medium">{bag.name}</p>
                                <p className="text-sm text-gray-600">
                                    Price: €{bag.discountedPrice.toFixed(2)} | Qty: {bag.quantity}
                                </p>
                            </div>

                            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                                {displayedImageUrl ? (
                                    <img
                                        src={displayedImageUrl}
                                        alt={bag.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs">No image</span>
                                )}
                            </div>

                            <ImageUpload
                                restaurantId={restaurant.id}
                                bagId={bag.id}
                                onUploaded={(newUrl) => {
                                    setImageUrls((prev) => ({ ...prev, [bag.id]: newUrl }));
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}