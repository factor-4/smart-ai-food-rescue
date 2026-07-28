import { RecommendationCarousel } from '../components/RecommendationCarousel';
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/api';

export default function HomePage({ user }: { user: any }) {
    // Fetch the user's real impact data
    const { data: impact } = useQuery({
        queryKey: ['impact', user.id],
        queryFn: () =>
            axios.get(`/api/orders/impact/${user.id}`).then((res) => res.data),
        enabled: !!user.id,
    });

    return (
        <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6">
            {/*  Hero Section (unchanged)  */}
            <section
                className="relative overflow-hidden rounded-3xl px-8 py-16 shadow-inner bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/hero-food.png')",
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
                {/* ... all the doodles and circles remain the same ... */}
                <div className="absolute top-8 right-12 text-5xl opacity-30 rotate-12 select-none">
                    🍴
                </div>
                <div className="absolute bottom-8 left-8 text-5xl opacity-30 -rotate-12 select-none">
                    🔪
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
                        🥬 Rescued meals, not wasted food
                    </span>
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                        Welcome back, {user.username}
                    </h1>
                    <p className="text-lg leading-relaxed text-white/90">
                        Every bag you grab is a meal saved. Our AI matches you with surplus
                        food from local restaurants – fresh, discounted, and ready for pickup.
                    </p>
                    <div className="flex flex-wrap gap-8 text-sm text-white/80">
                        {/* Hero stats remain static – update later if you want dynamic global stats */}
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

            {/*  How It Works */}
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

            {/* ───── Impact Stats (NOW DYNAMIC) ───── */}
            <section className="rounded-3xl bg-green-50 p-8 text-center">
                <h2 className="text-2xl font-bold text-green-900">
                    Your impact so far
                </h2>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <ImpactStat
                        value={impact?.mealsSaved ?? 0}
                        label="Meals saved"
                    />
                    <ImpactStat
                        value={`€${impact?.moneySaved?.toFixed(2) ?? '0.00'}`}
                        label="Saved on groceries"
                    />
                    <ImpactStat
                        value={`${impact?.co2PreventedKg ?? 0} kg`}
                        label="CO₂ prevented"
                    />
                </div>
            </section>

            {/* ───── Recommendation Carousel (unchanged) ───── */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Recommended for you
                        </h2>
                        <p className="text-sm text-slate-500">
                            Personalized picks based on your taste
                        </p>
                    </div>
                    <span className="hidden sm:inline-block text-2xl opacity-40">✨</span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-4">
                    <RecommendationCarousel userId={user.id} />
                </div>
            </section>
        </div>
    );
}

// Reusable Step Card 
function StepCard({
    step,
    title,
    description,
}: {
    step: string;
    title: string;
    description: string;
}) {
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

//  Impact Stat (unchanged)
function ImpactStat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="text-4xl font-extrabold text-green-700">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
        </div>
    );
}