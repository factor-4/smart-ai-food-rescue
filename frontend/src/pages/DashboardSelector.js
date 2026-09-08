import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
export default function DashboardSelector() {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode(token) : null;
    const ownerId = payload?.userId;
    const { data: restaurants, isLoading } = useQuery({
        queryKey: ['owner-restaurants', ownerId],
        queryFn: () => axios.get('/api/restaurants/my').then((res) => res.data),
        enabled: !!ownerId,
    });
    if (!ownerId)
        return _jsx("p", { className: "p-4", children: "Please log in as a restaurant owner." });
    if (isLoading)
        return _jsx("p", { className: "p-4", children: "Loading your restaurants\u2026" });
    return (_jsxs("div", { className: "max-w-xl mx-auto p-6 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Select a Restaurant" }), restaurants?.length === 0 && (_jsx("p", { className: "text-gray-500", children: "You don't have any restaurants yet." })), _jsx("div", { className: "grid gap-4", children: restaurants?.map((r) => (_jsxs(Link, { to: `/dashboard/${r.id}`, className: "block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-green-300 hover:shadow-md transition-all", children: [_jsx("p", { className: "text-lg font-semibold", children: r.name }), _jsx("p", { className: "text-sm text-slate-500", children: "View dashboard \u2192" })] }, r.id))) })] }));
}
