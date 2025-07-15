import { DEFAULT_LIMIT } from "@/lib/constants";
import { StudioView } from "@/modules/studio/ui/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";
export const dynamic = "force-dynamic";

const page = async () => {
  void trpc.studio.getAllVideos.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  void trpc.categories.getAll.prefetch();
  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default page;
