import {  ExternalLink, Mail, UtensilsCrossed, ShoppingBag, PackageCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid gap-10 md:grid-cols-3">
                    <div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                            Rescue surplus food from local restaurants, save money, and help the planet — one bag at a time.
                        </p>
                    </div>

                    {/* How it works */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            How it works
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-3">
                                <ShoppingBag className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                                <span>Browse surplus bags near you on the map.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <UtensilsCrossed className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                                <span>Order instantly with live stock and dynamic pricing.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <PackageCheck className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                                <span>Pick up at the scheduled time and enjoy.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Links
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li>
                                <a
                                    href="https://github.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-green-700 transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    GitHub repository
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:hello@smartfood.local"
                                    className="flex items-center gap-2 hover:text-green-700 transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    hello@smartfood.local
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} Smart Food Rescue. Built with Spring Boot, React, and a multi-agent AI backend.
                </div>
            </div>
        </footer>
    );
}