import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { ImageUpload } from '../components/ImageUpload';
import CreateRestaurantForm from '../components/CreateRestaurantForm';
import BagForm from '../components/BagForm';
import ConfirmModal from '../components/ConfirmModal';
import { useState } from 'react';
export default function OwnerBagsPage() {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode(token) : null;
    const ownerId = payload?.userId;
    const { data: restaurants, isLoading: restaurantsLoading, refetch: refetchRestaurants } = useQuery({
        queryKey: ['owner-restaurants', ownerId],
        queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
        enabled: !!ownerId,
    });
    if (!ownerId)
        return _jsx("p", { className: "p-4", children: "Please log in as a restaurant owner." });
    if (restaurantsLoading)
        return _jsx("p", { className: "p-4", children: "Loading your restaurants\u2026" });
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-8", children: [_jsx("h1", { className: "text-2xl font-bold", children: "My Bags" }), _jsx("div", { className: "flex justify-end", children: _jsx(CreateRestaurantForm, { onCreated: () => refetchRestaurants() }) }), restaurants?.length === 0 && (_jsx("p", { className: "text-gray-500", children: "You don't have any restaurants yet." })), restaurants?.map((restaurant) => (_jsx(RestaurantBagList, { restaurant: restaurant }, restaurant.id)))] }));
}
function RestaurantBagList({ restaurant }) {
    const { data: bags, isLoading, isError, refetch: refetchBags } = useQuery({
        queryKey: ['bags', restaurant.id],
        queryFn: () => axios.get(`/api/restaurants/${restaurant.id}/bags`).then((res) => res.data.content ?? res.data),
    });
    const [imageUrls, setImageUrls] = useState({});
    const [showBagForm, setShowBagForm] = useState(false);
    const [editingBag, setEditingBag] = useState(null);
    // ---- Custom delete confirmation state ----
    const [deleteTarget, setDeleteTarget] = useState(null);
    const handleDeleteRequest = (bagId, bagName) => {
        setDeleteTarget({ id: bagId, name: bagName });
    };
    const confirmDelete = async () => {
        if (!deleteTarget)
            return;
        try {
            await axios.delete(`/api/restaurants/${restaurant.id}/bags/${deleteTarget.id}`);
            refetchBags();
        }
        catch (err) {
            alert('Failed to delete bag');
        }
        finally {
            setDeleteTarget(null);
        }
    };
    if (isLoading)
        return _jsxs("p", { children: ["Loading bags for ", restaurant.name, "\u2026"] });
    if (isError)
        return _jsxs("p", { className: "text-red-500", children: ["Failed to load bags for ", restaurant.name, "."] });
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold", children: restaurant.name }), _jsx("button", { onClick: () => { setEditingBag(null); setShowBagForm(true); }, className: "rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors", children: "+ Add Bag" })] }), showBagForm && (_jsx("div", { className: "mb-6", children: _jsx(BagForm, { restaurantId: restaurant.id, initialData: editingBag
                        ? {
                            id: editingBag.id,
                            name: editingBag.name,
                            originalPrice: editingBag.originalPrice,
                            discountedPrice: editingBag.discountedPrice,
                            quantity: editingBag.quantity,
                        }
                        : undefined, onSave: () => {
                        setShowBagForm(false);
                        setEditingBag(null);
                        refetchBags();
                    }, onCancel: () => {
                        setShowBagForm(false);
                        setEditingBag(null);
                    } }) })), _jsx("div", { className: "grid gap-4", children: bags?.map((bag) => {
                    const displayedImageUrl = imageUrls[bag.id] !== undefined ? imageUrls[bag.id] : bag.imageUrl;
                    return (_jsxs("div", { className: "border rounded-lg p-4 flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: bag.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Price: \u20AC", bag.discountedPrice.toFixed(2), " | Qty: ", bag.quantity] })] }), _jsx("div", { className: "w-24 h-24 bg-gray-100 rounded flex items-center justify-center", children: displayedImageUrl ? (_jsx("img", { src: displayedImageUrl, alt: bag.name, loading: "lazy", className: "w-full h-full object-cover rounded" })) : (_jsx("span", { className: "text-gray-400 text-xs", children: "No image" })) }), _jsx(ImageUpload, { restaurantId: restaurant.id, bagId: bag.id, onUploaded: (newUrl) => {
                                    setImageUrls((prev) => ({ ...prev, [bag.id]: newUrl }));
                                } }), _jsxs("div", { className: "flex flex-col gap-1 ml-2", children: [_jsx("button", { onClick: () => { setEditingBag(bag); setShowBagForm(true); }, className: "text-xs text-blue-600 hover:underline", children: "Edit" }), _jsx("button", { onClick: () => handleDeleteRequest(bag.id, bag.name), className: "text-xs text-red-600 hover:underline", children: "Delete" })] })] }, bag.id));
                }) }), deleteTarget && (_jsx(ConfirmModal, { open: !!deleteTarget, title: "Delete Bag", message: `Are you sure you want to delete "${deleteTarget.name}"?`, onConfirm: confirmDelete, onCancel: () => setDeleteTarget(null) }))] }));
}
