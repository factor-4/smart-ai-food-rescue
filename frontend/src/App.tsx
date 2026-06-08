import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import { useAuthStore } from './stores/authStore';
import { RecommendationCarousel } from './components/RecommendationCarousel';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';


function DashboardWrapper() {
  
  const { restaurantId } = useParams<{ restaurantId: string }>();
  return <DashboardPage restaurantId={Number(restaurantId)} />;
}

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/checkout', label: 'Checkout' },
    { to: '/orders', label: 'Orders' },
    { to: '/map', label: 'Map' },
    { to: '/dashboard/5', label: 'Dashboard' },   // <-- added for testing (you can change the ID later)
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Smart AI Food Rescue
          </h1>
          <p className="text-sm text-slate-500">
            Personalized sustainable food recommendations
          </p>
        </div>

        <nav className="flex items-center gap-2 rounded-xl bg-slate-100/80 p-1.5">
          {links.map((link) => {
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function HomePage({ user }: { user: any }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white p-10 shadow-lg">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700">
            Personalized recommendations
          </span>

          <h2 className="text-5xl font-bold tracking-tight leading-tight text-slate-900">
            Welcome back, {user.username}
          </h2>

          <p className="text-lg leading-8 text-slate-600">
            Discover rescued food items tailored to your preferences and manage
            your orders in one place.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Smart Matching
          </h3>
          <p className="text-sm leading-6 text-gray-600">
            AI-powered recommendations based on your activity and interests.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Fast Checkout
          </h3>
          <p className="text-sm leading-6 text-gray-600">
            Simple ordering flow with better usability and tracking.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Less Food Waste
          </h3>
          <p className="text-sm leading-6 text-gray-600">
            Help reduce surplus food waste through smarter recommendations.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-5">
          <h3 className="text-2xl font-semibold text-gray-900">
            Recommended for you
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Smooth personalized recommendations based on your recent activity.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-3">
          <RecommendationCarousel userId={user.id} />
        </div>
      </section>
    </div>
  );
}

function AppContent() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-gray-900">
      <Navbar />

      <main className="mx-auto px-6 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard/:restaurantId" element={<DashboardWrapper />} />  {/* NEW */}
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