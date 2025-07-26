import { DEFAULT_LIMIT } from "@/lib/constants";
import { UserSubscriptionsView } from "@/modules/subscriptions/ui/view/user-subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";

const SubscriptionsPage = async () => {
  void trpc.subscriptions.getSubscribers.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <UserSubscriptionsView />
    </HydrateClient>
  );
};

export default SubscriptionsPage;
