import { DEFAULT_LIMIT } from "@/lib/constants";
import { UserView } from "@/modules/users/ui/view/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

interface PageProps {
  params: Promise<{ userId: string }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { userId } = await params;
  void trpc.users.getOne.prefetch({ id: userId });
  void trpc.home.getHomeVideos.prefetchInfinite({
    userId,
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
};

export default Page;
