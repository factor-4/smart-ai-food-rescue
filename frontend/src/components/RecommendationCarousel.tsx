import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

interface BagResponse {
  id: number;
  name: string;
  originalPrice: number;
  discountedPrice?: number;
  imageUrl?: string;
}

export function RecommendationCarousel({ userId }: { userId: number }) {
  // 1. Fetch recommended bag IDs
  const { data: bagIds, isLoading: idsLoading } = useQuery<number[]>({
    queryKey: ["recommendations", userId],
    queryFn: () =>
      api
        .post(`/api/recommendations/${userId}`, { query: "recommend food" })
        .then((r) => r.data.recommendations ?? []),
    enabled: !!userId,
  });

  // 2. Fetch all bags (for image/price details) – cached for 10 minutes
  const { data: allBags, isLoading: bagsLoading } = useQuery<BagResponse[]>({
    queryKey: ["bags-for-carousel"],
    queryFn: () =>
      api.get("/api/bags?size=1000").then((res) => res.data.content ?? res.data),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 3. Match recommended IDs to full bag objects
  const recommendedBags = bagIds
    ?.map((id) => allBags?.find((bag) => bag.id === id))
    .filter(Boolean) as BagResponse[] | undefined;

  const handleClick = async (bagId: number) => {
    try {
      await api.post("/mcp/tools/call", {
        name: "record_click",
        arguments: {
          user_id: userId,
          bag_id: bagId,
          context: "recommendation",
        },
      });
    } catch (error) {
      console.error("Failed to record click:", error);
    }
  };

  // Still loading – show a skeleton row of placeholder cards
  if (idsLoading || bagsLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[200px] max-w-[200px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm shrink-0 animate-pulse"
          >
            <div className="mb-2 h-28 w-full rounded-lg bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="mt-1 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  // Both queries finished, but no recommendations – show a friendly empty state
  if (!recommendedBags || recommendedBags.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        No personalized recommendations yet. Keep browsing!
      </div>
    );
  }

  // Success – render the real carousel
  return (
    <div className="relative">
      {/* Left fade overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent pointer-events-none z-10 rounded-l-xl" />
      {/* Right fade overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-50 via-amber-50/80 to-transparent pointer-events-none z-10 rounded-r-xl" />

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scroll-px-4 px-4">
        {recommendedBags.map((bag) => (
          <div
            key={bag.id}
            onClick={() => handleClick(bag.id)}
            className="min-w-[200px] max-w-[200px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm shrink-0 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="mb-2 h-28 w-full rounded-lg bg-slate-100 overflow-hidden">
              {bag.imageUrl ? (
                <img
                  src={bag.imageUrl}
                  alt={bag.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl text-slate-300">
                  🥬
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-slate-800 truncate">{bag.name}</p>
            <p className="mt-1 text-sm font-bold text-green-700">
              €
              {bag.discountedPrice != null
                ? bag.discountedPrice.toFixed(2)
                : bag.originalPrice.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}