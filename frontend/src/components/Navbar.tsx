import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const links: { to: string; label: string }[] = [];
    links.push({ to: '/', label: 'Home' });
    links.push({ to: '/orders', label: 'Orders' });
    links.push({ to: '/map', label: 'Map' });



    if (user?.role === 'ROLE_OWNER') {
        links.push({ to: '/owner/orders', label: 'Manage Orders' });
        links.push({ to: '/owner/bags', label: 'My Bags' });
        links.push({ to: '/dashboard', label: 'Dashboard' });
    }

    if (!user) {
        links.push({ to: '/login', label: 'Login' });
        links.push({ to: '/register', label: 'Register' });
    }

    const isActive = (path: string) =>
        location.pathname === path
            ? 'text-green-700 font-semibold'
            : 'text-slate-600 hover:text-green-700';

    return (
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
                <Link to="/" className="flex items-center gap-2.5">
                    <img src="/images/logo.png" alt="Smart Food Rescue" className="h-8 w-auto" />
                    <span className="text-lg font-semibold text-slate-800">Smart Food Rescue</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`text-sm transition-colors duration-200 ${isActive(link.to)}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {user && (
                        <button
                            onClick={() => { logout(); window.location.href = '/'; }}
                            className="ml-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Logout
                        </button>
                    )}
                </nav>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4">
                    <nav className="flex flex-col gap-2 pt-4">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`text-sm py-1.5 ${isActive(link.to)}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <button
                                onClick={() => { logout(); window.location.href = '/'; setMobileMenuOpen(false); }}
                                className="text-sm py-1.5 text-slate-500 hover:text-slate-700 text-left"
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