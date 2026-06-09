import { RecommendationCarousel } from '../components/RecommendationCarousel';

export default function HomePage({ user }: { user: any }) {
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