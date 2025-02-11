import { HomeView } from "@/modules/home/ui/view/home-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}
const Page: NextPage<PageProps> = async ({ searchParams }) => {
  const { categoryId } = await searchParams;
  void trpc.categories.getAll.prefetch();
  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
