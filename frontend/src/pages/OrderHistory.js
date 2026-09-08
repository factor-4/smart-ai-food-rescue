import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { Badge } from '../components/ui/badge';
import { ImageOff } from 'lucide-react';
export default function OrderHistory() {
    const token = useAuthStore((s) => s.token);
    const userId = token ? (jwtDecode(token)).userId : null;
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', userId],
        queryFn: () => axios.get(`/api/orders?userId=${userId}`).then((res) => res.data),
        enabled: !!userId,
    });
    const { data: bags } = useQuery({
        queryKey: ['bags-for-orders'],
        queryFn: () => axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
        staleTime: 1000 * 60 * 10,
    });
    if (!userId)
        return _jsx("p", { className: "p-4 text-sm", children: "Please log in first." });
    if (isLoading)
        return _jsx("p", { className: "p-4 text-sm", children: "Loading orders\u2026" });
    const getBag = (bagId) => bags?.find((b) => b.id === bagId);
    return (_jsxs("div", { className: "max-w-2xl mx-auto px-4 sm:px-0 py-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "My Orders" }), orders?.length === 0 && (_jsx("p", { className: "text-sm text-gray-500", children: "No orders yet." })), orders?.map((order) => {
                const bag = getBag(order.bagId);
                return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3", children: [_jsxs("div", { className: "flex gap-4 items-start min-w-0 flex-1", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0", children: bag?.imageUrl ? (_jsx("img", { src: bag.imageUrl, alt: bag.name, className: "h-full w-full object-cover", loading: "lazy" })) : (_jsx("div", { className: "flex h-full items-center justify-center text-slate-400", children: _jsx(ImageOff, { size: 18 }) })) }), _jsxs("div", { className: "space-y-1 min-w-0 flex-1", children: [_jsx("p", { className: "font-semibold text-sm sm:text-base", children: bag?.name ?? `Bag #${order.bagId}` }), bag?.restaurantName && (_jsx("p", { className: "text-xs text-gray-500", children: bag.restaurantName })), _jsxs("p", { className: "text-xs sm:text-sm text-gray-600", children: ["Qty: ", order.quantity, " \u00B7 Total: \u20AC", order.totalPrice.toFixed(2)] }), _jsx("p", { className: "text-xs text-gray-400", children: new Date(order.createdAt).toLocaleDateString('en-FI', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) })] })] }), _jsx(Badge, { variant: order.status === 'CONFIRMED' ? 'default' : 'secondary', className: "self-start sm:self-center text-xs", children: order.status })] }, order.id));
            })] }));
}
