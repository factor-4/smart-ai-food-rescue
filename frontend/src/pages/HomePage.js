import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { RecommendationCarousel } from '../components/RecommendationCarousel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import CardModal from '../components/CardModal';
import { UtensilsCrossed, Leaf, ChefHat, ImageOff, Search } from 'lucide-react';
export default function HomePage({ user }) {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode(token) : null;
    const customerId = payload?.userId;
    const { data: impact } = useQuery({
        queryKey: ['impact', customerId],
        queryFn: () => axios.get(`/api/orders/impact/${customerId}`).then((res) => res.data),
        enabled: !!customerId,
    });
    const { data: bags } = useQuery({
        queryKey: ['bags-browse'],
        queryFn: () => axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
    });
    const [search, setSearch] = useState('');
    const filteredBags = bags?.filter((bag) => {
        const q = search.toLowerCase();
        return (bag.name.toLowerCase().includes(q) ||
            bag.restaurantName.toLowerCase().includes(q));
    });
    return (_jsxs("div", { className: "mx-auto max-w-6xl space-y-16 px-4 sm:px-6", children: [_jsxs("section", { className: "relative overflow-hidden rounded-3xl px-8 py-16 shadow-inner bg-cover bg-center", style: { backgroundImage: "url('/images/hero.png')" }, children: [_jsx("div", { className: "absolute inset-0 bg-black/40" }), _jsx("div", { className: "absolute top-8 right-12 text-white/20", children: _jsx(UtensilsCrossed, { size: 48 }) }), _jsx("div", { className: "absolute bottom-8 left-8 text-white/20", children: _jsx(Leaf, { size: 40 }) }), _jsx("div", { className: "absolute top-1/2 right-0 w-24 h-24 bg-green-300/20 rounded-full blur-xl" }), _jsx("div", { className: "absolute bottom-1/4 left-0 w-16 h-16 bg-orange-300/20 rounded-full blur-lg" }), _jsx("div", { className: "absolute top-10 left-1/3 w-2 h-2 bg-white/40 rounded-full" }), _jsx("div", { className: "absolute bottom-10 right-1/4 w-3 h-3 bg-white/30 rounded-full" }), _jsx("div", { className: "absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full" }), _jsx("div", { className: "absolute -right-16 -top-16 h-72 w-72 rounded-full border-8 border-orange-200/40" }), _jsx("div", { className: "absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-green-100/30" }), _jsxs("div", { className: "relative z-10 max-w-2xl space-y-6", children: [_jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800", children: [_jsx(Leaf, { size: 14 }), "Rescued meals, not wasted food"] }), _jsxs("h1", { className: "text-4xl font-extrabold text-white sm:text-5xl", children: ["Welcome back, ", user.username] }), _jsx("p", { className: "text-lg leading-relaxed text-white/90", children: "Every bag you grab is a meal saved. Our AI matches you with surplus food from local restaurants \u2013 fresh, discounted, and ready for pickup." }), _jsxs("div", { className: "flex flex-wrap gap-8 text-sm text-white/80", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-3xl font-bold text-orange-300", children: "200+" }), _jsx("span", { children: "Bags rescued weekly" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-3xl font-bold text-orange-300", children: "30+" }), _jsx("span", { children: "Partner restaurants" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-3xl font-bold text-orange-300", children: "500kg" }), _jsx("span", { children: "CO\u2082 saved this month" })] })] })] })] }), _jsxs("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "Recommended for you" }), _jsx("p", { className: "text-sm text-slate-500", children: "Personalized picks based on your taste" })] }), _jsx("span", { className: "hidden sm:inline-block text-amber-500 opacity-60", children: _jsx(ChefHat, { size: 24 }) })] }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4", children: _jsx(RecommendationCarousel, { userId: user.id }) })] }), _jsxs("section", { children: [_jsxs("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-800", children: "Available Bags" }), _jsxs("div", { className: "relative w-full sm:w-72", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search by name or restaurant\u2026", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" })] })] }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: filteredBags?.map((bag) => (_jsx(BagCard, { bag: bag, customerId: customerId }, bag.id))) }), filteredBags?.length === 0 && (_jsx("p", { className: "text-center text-slate-500 py-10", children: "No bags found. Try a different search term." }))] }), _jsxs("section", { children: [_jsx("h2", { className: "mb-8 text-center text-2xl font-bold text-slate-800", children: "How it works" }), _jsxs("div", { className: "grid gap-8 md:grid-cols-3", children: [_jsx(StepCard, { step: "1", title: "Browse nearby bags", description: "Use the map to see surplus bags from restaurants around you." }), _jsx(StepCard, { step: "2", title: "Place your order", description: "Reserve a bag instantly with live stock and dynamic pricing." }), _jsx(StepCard, { step: "3", title: "Pick up & enjoy", description: "Collect your meal at the scheduled time and reduce food waste." })] })] }), _jsxs("section", { className: "rounded-3xl bg-green-50 p-8 text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-green-900", children: "Your impact so far" }), _jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-3", children: [_jsx(ImpactStat, { value: impact?.mealsSaved ?? 0, label: "Meals saved" }), _jsx(ImpactStat, { value: `€${impact?.moneySaved?.toFixed(2) ?? '0.00'}`, label: "Saved on groceries" }), _jsx(ImpactStat, { value: `${impact?.co2PreventedKg ?? 0} kg`, label: "CO\u2082 prevented" })] })] })] }));
}
function BagCard({ bag, customerId }) {
    const [showCardModal, setShowCardModal] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const queryClient = useQueryClient();
    const orderMutation = useMutation({
        mutationFn: (paymentMethodId) => axios.post('/api/orders', {
            idempotencyKey: crypto.randomUUID(),
            userId: customerId,
            bagId: bag.id,
            quantity: 1,
            paymentMethodId,
        }),
        onSuccess: () => {
            setShowCardModal(false);
            setOrderError(null);
            queryClient.invalidateQueries({ queryKey: ['orders', customerId] });
        },
        onError: (err) => {
            setOrderError(err?.response?.data?.message || 'Order failed');
        },
    });
    const handleOrder = () => {
        if (bag.quantity < 1)
            return;
        setShowCardModal(true);
    };
    const price = bag.discountedPrice ?? bag.originalPrice;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col", children: [_jsx("div", { className: "mb-3 h-40 w-full rounded-lg bg-slate-100 overflow-hidden", children: bag.imageUrl ? (_jsx("img", { src: bag.imageUrl, alt: bag.name, className: "h-full w-full object-cover", loading: "lazy" })) : (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx(ImageOff, { className: "h-8 w-8 text-slate-300" }) })) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-slate-800 truncate", children: bag.name }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: bag.restaurantName }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-bold text-green-700", children: ["\u20AC", price.toFixed(2)] }), _jsxs("p", { className: "text-xs text-slate-400", children: [bag.quantity, " left"] })] })] }), _jsx("button", { onClick: handleOrder, disabled: bag.quantity < 1 || orderMutation.isPending, className: "mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: bag.quantity < 1 ? 'Sold Out' : orderMutation.isPending ? 'Placing…' : 'Order' }), orderError && (_jsx("p", { className: "mt-2 text-xs text-red-500", children: orderError }))] }), showCardModal && (_jsx(CardModal, { open: showCardModal, title: `Order ${bag.name}`, amount: `€${price.toFixed(2)}`, bagName: bag.name, restaurantName: bag.restaurantName, imageUrl: bag.imageUrl, onClose: () => setShowCardModal(false), onPay: (paymentMethodId) => orderMutation.mutate(paymentMethodId) }))] }));
}
function StepCard({ step, title, description }) {
    return (_jsxs("div", { className: "group rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:border-green-300 hover:shadow-md", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800", children: step }), _jsx("h3", { className: "mb-2 text-lg font-semibold text-slate-800", children: title }), _jsx("p", { className: "text-sm leading-relaxed text-slate-600", children: description })] }));
}
function ImpactStat({ value, label }) {
    return (_jsxs("div", { children: [_jsx("p", { className: "text-4xl font-extrabold text-green-700", children: value }), _jsx("p", { className: "text-sm text-slate-600", children: label })] }));
}
