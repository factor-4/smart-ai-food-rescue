import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function RecommendationCarousel({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: ["recommendations", userId],
    queryFn: () =>
      api
        .post(`/api/recommendations/${userId}`, { query: "recommend food" })
        .then((r) => r.data.recommendations as number[]),
  });

  const handleClick = async (bagId: number) => {
    try {
      await api.post('/mcp/tools/call', {
        name: "record_click",
        arguments: {
          user_id: userId,
          bag_id: bagId,
          context: "recommendation"
        }
      });
    } catch (error) {
      console.error("Failed to record click:", error);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {data?.map((id) => (
        <div
          key={id}
          onClick={() => handleClick(id)}
          className="min-w-[200px] rounded-lg border p-4 text-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          Bag #{id}
        </div>
      ))}
    </div>
  );
}