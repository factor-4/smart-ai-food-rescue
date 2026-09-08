import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
export default function OwnerOrdersPage() {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode(token) : null;
    const ownerId = payload?.userId;
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    // 1. Fetch owner's restaurants
    const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
        queryKey: ['owner-restaurants', ownerId],
        queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
        enabled: !!ownerId,
    });
    // 2. For each restaurant, fetch PAID orders
    const { data: ordersPerRestaurant, isLoading: ordersLoading } = useQuery({
        queryKey: ['owner-paid-orders', restaurants],
        queryFn: async () => {
            if (!restaurants || restaurants.length === 0)
                return [];
            const promises = restaurants.map((r) => axios.get(`/api/orders/restaurant/${r.id}/paid`).then((res) => res.data));
            return Promise.all(promises);
        },
        enabled: !!restaurants && restaurants.length > 0,
    });
    // 3. Fetch all bags for names/images (cached)
    const { data: bags } = useQuery({
        queryKey: ['bags-for-owner-orders'],
        queryFn: () => axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
        staleTime: 1000 * 60 * 10,
    });
    const acceptMutation = useMutation({
        mutationFn: (orderId) => axios.put(`/api/orders/${orderId}/status`, { status: 'CONFIRMED' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-paid-orders'] });
        },
        onError: (err) => {
            setError(err?.response?.data?.message || 'Failed to accept order');
        },
    });
    const rejectMutation = useMutation({
        mutationFn: (orderId) => axios.put(`/api/orders/${orderId}/status`, { status: 'REJECTED' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-paid-orders'] });
        },
        onError: (err) => {
            setError(err?.response?.data?.message || 'Failed to reject order');
        },
    });
    if (!ownerId)
        return _jsx("p", { className: "p-4", children: "Please log in as a restaurant owner." });
    if (restaurantsLoading || ordersLoading)
        return _jsx("p", { className: "p-4", children: "Loading orders\u2026" });
    // Flatten all orders into a single sorted list
    const allPaidOrders = (ordersPerRestaurant || [])
        .flat()
        .sort((a, b) => b.id - a.id); // newest first
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Incoming Orders" }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700", children: [error, _jsx("button", { onClick: () => setError(null), className: "ml-2 underline", children: "Dismiss" })] })), allPaidOrders.length === 0 && (_jsx("p", { className: "text-gray-500", children: "No orders waiting for confirmation." })), allPaidOrders.map((order) => {
                const bag = bags?.find((b) => b.id === order.bagId);
                return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3", children: [_jsxs("div", { className: "flex gap-4 items-start min-w-0 flex-1", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0", children: bag?.imageUrl ? (_jsx("img", { src: bag.imageUrl, alt: bag.name, className: "h-full w-full object-cover", loading: "lazy" })) : (_jsx("div", { className: "flex h-full items-center justify-center text-slate-400", children: _jsx(ImageOff, { size: 18 }) })) }), _jsxs("div", { className: "space-y-1 min-w-0 flex-1", children: [_jsx("p", { className: "font-semibold text-sm", children: bag?.name ?? `Bag #${order.bagId}` }), bag?.restaurantName && (_jsx("p", { className: "text-xs text-gray-500", children: bag.restaurantName })), _jsxs("p", { className: "text-xs text-gray-600", children: ["Qty: ", order.quantity, " \u00B7 \u20AC", order.totalPrice.toFixed(2)] }), _jsx("p", { className: "text-xs text-gray-400", children: new Date(order.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: "flex gap-2 self-end sm:self-center", children: [_jsx("button", { onClick: () => acceptMutation.mutate(order.id), disabled: acceptMutation.isPending, className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50", children: "Accept" }), _jsx("button", { onClick: () => rejectMutation.mutate(order.id), disabled: rejectMutation.isPending, className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50", children: "Reject" })] })] }, order.id));
            })] }));
}
