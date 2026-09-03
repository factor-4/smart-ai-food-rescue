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
    return <Navigate to="/login" replace />;
  }
  return <OwnerBagsPage />;
}

function DashboardSelectorGuard() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'ROLE_OWNER') return <Navigate to="/login" replace />;
  return <DashboardSelector />;
}

function OwnerGuardOrders() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'ROLE_OWNER') return <Navigate to="/login" replace />;
  return <OwnerOrdersPage />;
}

function AppContent() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-gray-900">
      <Navbar />

      <main className="mx-auto px-6 py-8">
        <Suspense
          fallback={
            <div className="p-8 text-center text-gray-500">Loading page…</div>
          }
        >
          
          <Elements stripe={stripePromise}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/dashboard" element={<DashboardSelectorGuard />} />
              <Route path="/dashboard/:restaurantId" element={<DashboardWrapper />} />
              <Route path="/owner/bags" element={<OwnerGuard />} />
              <Route path="/owner/orders" element={<OwnerGuardOrders />} />
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
          </Elements>
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