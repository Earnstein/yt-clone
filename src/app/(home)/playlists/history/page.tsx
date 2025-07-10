import { DEFAULT_LIMIT } from "@/lib/constants";
import { HistoryView } from "@/modules/playlist/ui/views/history-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = () => {
  void trpc.playlist.getHistory.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <HistoryView />
    </HydrateClient>
  );
};

export default Page;
