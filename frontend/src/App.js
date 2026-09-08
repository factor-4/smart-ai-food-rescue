import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/Navbar';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './lib/stripe';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const MapPage = lazy(() => import('./pages/MapPage'));
const DashboardWrapper = lazy(() => import('./components/DashboardWrapper'));
const HomePage = lazy(() => import('./pages/HomePage'));
const OwnerBagsPage = lazy(() => import('./pages/OwnerBagsPage'));
const DashboardSelector = lazy(() => import('./pages/DashboardSelector'));
const OwnerOrdersPage = lazy(() => import('./pages/OwnerOrdersPage'));
function OwnerGuard() {
    const user = useAuthStore((state) => state.user);
    if (!user || user.role !== 'ROLE_OWNER') {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(OwnerBagsPage, {});
}
function DashboardSelectorGuard() {
    const user = useAuthStore((s) => s.user);
    if (!user || user.role !== 'ROLE_OWNER')
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(DashboardSelector, {});
}
function OwnerGuardOrders() {
    const user = useAuthStore((s) => s.user);
    if (!user || user.role !== 'ROLE_OWNER')
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(OwnerOrdersPage, {});
}
function AppContent() {
    const user = useAuthStore((state) => state.user);
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-gray-900", children: [_jsx(Navbar, {}), _jsx("main", { className: "mx-auto px-6 py-8", children: _jsx(Suspense, { fallback: _jsx("div", { className: "p-8 text-center text-gray-500", children: "Loading page\u2026" }), children: _jsx(Elements, { stripe: stripePromise, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/orders", element: _jsx(OrderHistory, {}) }), _jsx(Route, { path: "/map", element: _jsx(MapPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardSelectorGuard, {}) }), _jsx(Route, { path: "/dashboard/:restaurantId", element: _jsx(DashboardWrapper, {}) }), _jsx(Route, { path: "/owner/bags", element: _jsx(OwnerGuard, {}) }), _jsx(Route, { path: "/owner/orders", element: _jsx(OwnerGuardOrders, {}) }), _jsx(Route, { path: "/", element: user ? (_jsx(HomePage, { user: user })) : (_jsx(Navigate, { to: "/login", replace: true })) })] }) }) }) })] }));
}
function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AppContent, {}) }));
}
export default App;
