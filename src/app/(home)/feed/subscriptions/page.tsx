import { DEFAULT_LIMIT } from "@/lib/constants";
import { SubscriptionsView } from "@/modules/home/ui/view/subscription-view";

import { HydrateClient, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";

const Page = () => {
  void trpc.home.getSubscriptionsVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default Page;
