import { Link, useLocation } from 'react-router-dom';


export default function Navbar() {
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