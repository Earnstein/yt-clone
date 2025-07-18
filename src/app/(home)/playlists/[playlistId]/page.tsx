import { DEFAULT_LIMIT } from "@/lib/constants";
import { PlaylistView } from "@/modules/playlist/ui/views/playlist-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ playlistId: string }>;
};
const Page: NextPage<PageProps> = async ({ params }) => {
  const { playlistId } = await params;
  void trpc.playlist.getPlaylistVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default Page;
