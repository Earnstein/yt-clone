import { DEFAULT_LIMIT } from "@/lib/constants";
import { TrendingView } from "@/modules/home/ui/view/trending-view";
import { HydrateClient, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";

const Page = async () => {
  void trpc.home.getTrendingVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
};

export default Page;
