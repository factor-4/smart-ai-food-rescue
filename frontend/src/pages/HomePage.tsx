import { RecommendationCarousel } from '../components/RecommendationCarousel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import CardModal from '../components/CardModal';
import { UtensilsCrossed, Leaf, ChefHat, ImageOff, Search } from 'lucide-react';

interface BagResponse {
    id: number;
    name: string;
    originalPrice: number;
    discountedPrice?: number;
    quantity: number;
    imageUrl?: string;
    restaurantName: string;
}

export default function HomePage({ user }: { user: any }) {
    const token = useAuthStore((s) => s.token);
    const payload = token ? jwtDecode<{ userId: number }>(token) : null;
    const customerId = payload?.userId;

    const { data: impact } = useQuery({
        queryKey: ['impact', customerId],
        queryFn: () =>
            axios.get(`/api/orders/impact/${customerId}`).then((res) => res.data),
        enabled: !!customerId,
    });

    const { data: bags } = useQuery<BagResponse[]>({
        queryKey: ['bags-browse'],
        queryFn: () =>
            axios.get('/api/bags?size=1000').then((res) => res.data.content ?? res.data),
    });

    const [search, setSearch] = useState('');

    const filteredBags = bags?.filter((bag) => {
        const q = search.toLowerCase();
        return (
            bag.name.toLowerCase().includes(q) ||
            bag.restaurantName.toLowerCase().includes(q)
        );
    });

    return (
        <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6">
            {/* Hero section */}
            <section
                className="relative overflow-hidden rounded-3xl px-8 py-16 shadow-inner bg-cover bg-center"
                style={{ backgroundImage: "url('/images/hero.png')" }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute top-8 right-12 text-white/20">
                    <UtensilsCrossed size={48} />
                </div>
                <div className="absolute bottom-8 left-8 text-white/20">
                    <Leaf size={40} />
                </div>
                <div className="absolute top-1/2 right-0 w-24 h-24 bg-green-300/20 rounded-full blur-xl" />
                <div className="absolute bottom-1/4 left-0 w-16 h-16 bg-orange-300/20 rounded-full blur-lg" />
                <div className="absolute top-10 left-1/3 w-2 h-2 bg-white/40 rounded-full" />
                <div className="absolute bottom-10 right-1/4 w-3 h-3 bg-white/30 rounded-full" />
                <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full" />
                <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border-8 border-orange-200/40" />
                <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-green-100/30" />

                <div className="relative z-10 max-w-2xl space-y-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
                        <Leaf size={14} />
                        Rescued meals, not wasted food
                    </span>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Welcome back, {user.username}
                    </h1>
                    <p className="text-lg leading-relaxed text-white/90">
                        Every bag you grab is a meal saved. Our AI matches you with surplus
                        food from local restaurants – fresh, discounted, and ready for pickup.
                    </p>
                    <div className="flex flex-wrap gap-8 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-orange-300">200+</span>
                            <span>Bags rescued weekly</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-orange-300">30+</span>
                            <span>Partner restaurants</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-orange-300">500kg</span>
                            <span>CO₂ saved this month</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recommendations */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Recommended for you</h2>
                        <p className="text-sm text-slate-500">Personalized picks based on your taste</p>
                    </div>
                    <span className="hidden sm:inline-block text-amber-500 opacity-60">
                        <ChefHat size={24} />
                    </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4">
                    <RecommendationCarousel userId={user.id} />
                </div>
            </section>

            {/* Available bags + search */}
            <section>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Available Bags</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or restaurant…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBags?.map((bag) => (
                        <BagCard key={bag.id} bag={bag} customerId={customerId!} />
                    ))}
                </div>

                {filteredBags?.length === 0 && (
                    <p className="text-center text-slate-500 py-10">
                        No bags found. Try a different search term.
                    </p>
                )}
            </section>

            {/* How it works */}
            <section>
                <h2 className="mb-8 text-center text-2xl font-bold text-slate-800">
                    How it works
                </h2>
                <div className="grid gap-8 md:grid-cols-3">
                    <StepCard step="1" title="Browse nearby bags" description="Use the map to see surplus bags from restaurants around you." />
                    <StepCard step="2" title="Place your order" description="Reserve a bag instantly with live stock and dynamic pricing." />
                    <StepCard step="3" title="Pick up & enjoy" description="Collect your meal at the scheduled time and reduce food waste." />
                </div>
            </section>

            {/* Impact stats */}
            <section className="rounded-3xl bg-green-50 p-8 text-center">
                <h2 className="text-2xl font-bold text-green-900">Your impact so far</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <ImpactStat value={impact?.mealsSaved ?? 0} label="Meals saved" />
                    <ImpactStat value={`€${impact?.moneySaved?.toFixed(2) ?? '0.00'}`} label="Saved on groceries" />
                    <ImpactStat value={`${impact?.co2PreventedKg ?? 0} kg`} label="CO₂ prevented" />
                </div>
            </section>
        </div>
    );
}

function BagCard({ bag, customerId }: { bag: BagResponse; customerId: number }) {
    const [showCardModal, setShowCardModal] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const orderMutation = useMutation({
        mutationFn: (paymentMethodId: string) =>
            axios.post('/api/orders', {
                idempotencyKey: crypto.randomUUID(),
                userId: customerId,
                bagId: bag.id,
                quantity: 1,
                paymentMethodId,
            }),
        onSuccess: () => {
            setShowCardModal(false);
            setOrderError(null);
            queryClient.invalidateQueries({ queryKey: ['orders', customerId] });
        },
        onError: (err: any) => {
            setOrderError(err?.response?.data?.message || 'Order failed');
        },
    });

    const handleOrder = () => {
        if (bag.quantity < 1) return;
        setShowCardModal(true);
    };

    const price = bag.discountedPrice ?? bag.originalPrice;

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="mb-3 h-40 w-full rounded-lg bg-slate-100 overflow-hidden">
                    {bag.imageUrl ? (
                        <img src={bag.imageUrl} alt={bag.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <ImageOff className="h-8 w-8 text-slate-300" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{bag.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{bag.restaurantName}</p>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-green-700">€{price.toFixed(2)}</p>
                        <p className="text-xs text-slate-400">{bag.quantity} left</p>
                    </div>
                </div>

                <button
                    onClick={handleOrder}
                    disabled={bag.quantity < 1 || orderMutation.isPending}
                    className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {bag.quantity < 1 ? 'Sold Out' : orderMutation.isPending ? 'Placing…' : 'Order'}
                </button>

                {orderError && (
                    <p className="mt-2 text-xs text-red-500">{orderError}</p>
                )}
            </div>

            {showCardModal && (
                <CardModal
                    open={showCardModal}
                    title={`Order ${bag.name}`}
                    amount={`€${price.toFixed(2)}`}
                    bagName={bag.name}
                    restaurantName={bag.restaurantName}
                    imageUrl={bag.imageUrl}
                    onClose={() => setShowCardModal(false)}
                    onPay={(paymentMethodId) => orderMutation.mutate(paymentMethodId)}
                />
            )}
        </>
    );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:border-green-300 hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-800">
                {step}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
    );
}

function ImpactStat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="text-4xl font-extrabold text-green-700">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    );
}