import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import { useAuthStore } from './stores/authStore';
import DashboardWrapper from './components/DashboardWrapper';
import MapPage from './pages/MapPage';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';



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