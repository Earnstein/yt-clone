"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Fragment } from "react";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();
  const [results, resultsQuery] =
    trpc.search.getSearchResults.useSuspenseInfiniteQuery(
      {
        query,
        categoryId,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const videos = results.pages.flatMap((page) => page.items);
  return (
    <Fragment>
      {isMobile ? (
        <div className="flex flex-col gap-y-10 gap-x-4">
          {videos.map((video) => (
            <VideoGridCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <VideoRowCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        ifFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </Fragment>
  );
};
