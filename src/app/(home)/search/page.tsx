import { SearchView } from "@/modules/search/ui/view/search-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { NextPage } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    query: string;
    categoryId: string | undefined;
  }>;
}

const page: NextPage<PageProps> = async ({ searchParams }) => {
  const { query, categoryId } = await searchParams;
  void trpc.categories.getAll.prefetch();
  void trpc.search.getSearchResults.prefetchInfinite({
    query,
    categoryId,
  });
  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default page;
