import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/Navbar';   // normal import – used on every page

// Lazy‑loaded pages – each one becomes a separate JavaScript file
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const MapPage = lazy(() => import('./pages/MapPage'));
const DashboardWrapper = lazy(() => import('./components/DashboardWrapper'));
const HomePage = lazy(() => import('./pages/HomePage'));
const OwnerBagsPage = lazy(() => import('./pages/OwnerBagsPage'));

function OwnerGuard() {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== 'ROLE_OWNER') {
    return <Navigate to="/login" replace />;
  }
  return <OwnerBagsPage />;
}

function AppContent() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-gray-900">
      <Navbar />

      <main className="mx-auto px-6 py-8">
        {/* Suspense shows a fallback while a lazy component loads */}
        <Suspense
          fallback={
            <div className="p-8 text-center text-gray-500">Loading page…</div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dashboard/:restaurantId" element={<DashboardWrapper />} />
            <Route path="/owner/bags" element={<OwnerGuard />} />
            <Route
              path="/"
              element={
                user ? (
                  <HomePage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;