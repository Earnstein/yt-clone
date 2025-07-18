import { DEFAULT_LIMIT } from "@/lib/constants";
import { PlaylistsView } from "@/modules/playlist/ui/views/playlists-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = () => {
  void trpc.playlist.getPlaylists.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <PlaylistsView />
    </HydrateClient>
  );
};

export default Page;
