import { DEFAULT_LIMIT } from "@/lib/constants";
import { PlaylistView } from "@/modules/playlist/ui/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";

const Page = () => {
  void trpc.playlist.getPlaylists.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <PlaylistView />
    </HydrateClient>
  );
};

export default Page;
