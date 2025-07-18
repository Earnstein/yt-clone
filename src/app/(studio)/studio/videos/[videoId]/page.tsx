import { VideoView } from "@/modules/studio/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ videoId: string }>;
};

const Page: NextPage<PageProps> = async ({ params }) => {
  const { videoId } = await params;
  void trpc.studio.getVideoById.prefetch({ id: videoId });
  void trpc.categories.getAll.prefetch();
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
