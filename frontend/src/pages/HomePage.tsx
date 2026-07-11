import { RecommendationCarousel } from '../components/RecommendationCarousel';

export default function HomePage({ user }: { user: any }) {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6">
      {/* ───── Hero Section ───── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#f5f0e8] px-8 py-16 shadow-inner">
        {/* Decorative food illustration (CSS) */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border-8 border-orange-200/60" />
        <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-green-100/50" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
            🥬 Rescued meals, not wasted food
          </span>

          <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">
            Welcome back, {user.username}
          </h1>

          <p className="text-lg leading-relaxed text-slate-600">
            Every bag you grab is a meal saved. Our AI matches you with surplus
            food from local restaurants – fresh, discounted, and ready for pickup.
          </p>

          <div className="flex flex-wrap gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-600">200+</span>
              <span>Bags rescued weekly</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-600">30+</span>
              <span>Partner restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-600">500kg</span>
              <span>CO₂ saved this month</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-800">
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <StepCard
            step="1"
            title="Browse nearby bags"
            description="Use the map to see surplus bags from restaurants around you."
          />
          <StepCard
            step="2"
            title="Place your order"
            description="Reserve a bag instantly with live stock and dynamic pricing."
          />
          <StepCard
            step="3"
            title="Pick up & enjoy"
            description="Collect your meal at the scheduled time and reduce food waste."
          />
        </div>
      </section>

      {/* ───── Impact Stats ───── */}
      <section className="rounded-3xl bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-green-900">
          Your impact so far
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <ImpactStat value="12" label="Meals saved" />
          <ImpactStat value="€48.50" label="Saved on groceries" />
          <ImpactStat value="30 kg" label="CO₂ prevented" />
        </div>
      </section>

      {/* ───── Recommendation Carousel ───── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Recommended for you
          </h2>
          <p className="text-sm text-slate-500">
            Personalized picks based on your taste
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-1">
          <RecommendationCarousel userId={user.id} />
        </div>
      </section>
    </div>
  );
}

// ───── Reusable Step Card ─────
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

// ───── Impact Stat ─────
function ImpactStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-extrabold text-green-700">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}