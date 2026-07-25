import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { ImageUpload } from '../components/ImageUpload';
import CreateRestaurantForm from '../components/CreateRestaurantForm';
import BagForm from '../components/BagForm';
import ConfirmModal from '../components/ConfirmModal';
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
    const { data: bags, isLoading, isError, refetch: refetchBags } = useQuery<BagResponse[]>({
        queryKey: ['bags', restaurant.id],
        queryFn: () => axios.get(`/api/restaurants/${restaurant.id}/bags`).then((res) => res.data.content ?? res.data),
    });

    const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
    const [showBagForm, setShowBagForm] = useState(false);
    const [editingBag, setEditingBag] = useState<BagResponse | null>(null);

    // ---- Custom delete confirmation state ----
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const handleDeleteRequest = (bagId: number, bagName: string) => {
        setDeleteTarget({ id: bagId, name: bagName });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`/api/restaurants/${restaurant.id}/bags/${deleteTarget.id}`);
            refetchBags();
        } catch (err) {
            alert('Failed to delete bag');
        } finally {
            setDeleteTarget(null);
        }
    };

    if (isLoading) return <p>Loading bags for {restaurant.name}…</p>;
    if (isError) return <p className="text-red-500">Failed to load bags for {restaurant.name}.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{restaurant.name}</h2>
                <button
                    onClick={() => { setEditingBag(null); setShowBagForm(true); }}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                    + Add Bag
                </button>
            </div>

            {showBagForm && (
                <div className="mb-6">
                    <BagForm
                        restaurantId={restaurant.id}
                        initialData={
                            editingBag
                                ? {
                                    id: editingBag.id,
                                    name: editingBag.name,
                                    originalPrice: editingBag.originalPrice,
                                    discountedPrice: editingBag.discountedPrice,
                                    quantity: editingBag.quantity,
                                }
                                : undefined
                        }
                        onSave={() => {
                            setShowBagForm(false);
                            setEditingBag(null);
                            refetchBags();
                        }}
                        onCancel={() => {
                            setShowBagForm(false);
                            setEditingBag(null);
                        }}
                    />
                </div>
            )}

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

                            {/* Edit / Delete buttons */}
                            <div className="flex flex-col gap-1 ml-2">
                                <button
                                    onClick={() => { setEditingBag(bag); setShowBagForm(true); }}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteRequest(bag.id, bag.name)}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom delete confirmation modal */}
            {deleteTarget && (
                <ConfirmModal
                    open={!!deleteTarget}
                    title="Delete Bag"
                    message={`Are you sure you want to delete "${deleteTarget.name}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}