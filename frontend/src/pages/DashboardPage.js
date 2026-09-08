import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, } from 'chart.js';
import LazyLine from '../components/charts/LazyLine';
import LazyBar from '../components/charts/LazyBar';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
export default function DashboardPage({ restaurantId }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard', restaurantId],
        queryFn: () => axios.get(`/api/dashboard/${restaurantId}`).then((res) => res.data),
    });
    if (isLoading)
        return _jsx("p", { className: "p-4", children: "Loading dashboard\u2026" });
    if (isError)
        return _jsx("p", { className: "p-4 text-red-500", children: "Failed to load dashboard data." });
    const lineData = {
        labels: data?.sales?.map((s) => s.date) ?? [],
        datasets: [
            {
                label: 'Orders',
                data: data?.sales?.map((s) => s.count) ?? [],
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                tension: 0.2,
                fill: false,
                pointRadius: 5,
            },
        ],
    };
    const barData = {
        labels: data?.popularBags?.map((b) => `Bag #${b.bagId}`) ?? [],
        datasets: [
            {
                label: 'Orders',
                data: data?.popularBags?.map((b) => b.orderCount) ?? [],
                backgroundColor: '#f97316',
                barThickness: 25,
                maxBarThickness: 25,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                offset: true,
            },
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-8", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Restaurant Dashboard" }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-green-700", children: "Total Revenue (last 7 days)" }), _jsxs("p", { className: "text-3xl font-bold text-green-900", children: ["\u20AC", data?.totalRevenue.toFixed(2)] })] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Daily Sales" }), data?.sales?.length ? (_jsx("div", { style: { height: 300 }, children: _jsx(LazyLine, { data: lineData, options: chartOptions }) })) : (_jsx("p", { className: "text-gray-500", children: "No sales data for the past 7 days." }))] }), _jsxs("div", { className: "bg-white border rounded-lg p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Top Bags" }), data?.popularBags?.length ? (_jsx("div", { style: { height: 300 }, children: _jsx(LazyBar, { data: barData, options: chartOptions }) })) : (_jsx("p", { className: "text-gray-500", children: "No orders yet." }))] })] }));
}
