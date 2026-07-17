import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build links dynamically based on who is logged in
  const links: { to: string; label: string }[] = [];

  // Always visible
  links.push({ to: '/', label: 'Home' });
  links.push({ to: '/checkout', label: 'Checkout' });
  links.push({ to: '/orders', label: 'Orders' });
  links.push({ to: '/map', label: 'Map' });

  // Owner‑only links
  if (user?.role === 'ROLE_OWNER') {
    links.push({ to: '/owner/bags', label: 'My Bags' });
    links.push({ to: '/dashboard/5', label: 'Dashboard' }); // change ID later if needed
  }

  // Login / Register only for guests
  if (!user) {
    links.push({ to: '/login', label: 'Login' });
    links.push({ to: '/register', label: 'Register' });
  }

  const linkClasses = (path: string) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo / Title */}
        <div className="shrink-0">
          <Link to="/" className="block">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Smart AI Food Rescue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Personalized sustainable food recommendations
            </p>
          </Link>
        </div>

        {/* Desktop nav – hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100/80 p-1.5">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClasses(link.to)}>
              {link.label}
            </Link>
          ))}
          {/* Logout button shown only when logged in */}
          {user && (
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-all duration-200"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={linkClasses(link.to)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900 transition-all duration-200 text-left"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}