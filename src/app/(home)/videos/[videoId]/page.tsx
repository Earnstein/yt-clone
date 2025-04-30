import { DEFAULT_LIMIT } from "@/lib/constants";
import { VideoView } from "@/modules/videos/ui/view/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ videoId: string }>;
};

const Page: NextPage<PageProps> = async ({ params }) => {
  const { videoId } = await params;
  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
