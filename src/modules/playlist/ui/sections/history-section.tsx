"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const HistorySectionSkeleton = () => {
  return (
    <Fragment>
      <div className="hidden flex-col gap-y-4 md:flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </Fragment>
  );
};

const HistorySectionSuspense = () => {
  const [results, resultsQuery] =
    trpc.playlist.getHistory.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const videos = results.pages.flatMap((page) => page.items);

  if (videos.length === 0) {
    return (
      <div className="text-sm text-center text-muted-foreground">
        You haven&apos;t watched any videos yet.
      </div>
    );
  }

  return (
    <Fragment>
      <div className="hidden flex-col gap-y-4 md:flex">
        {videos.map((video) => (
          <VideoRowCard key={video.id} video={video} size="compact" />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {videos.map((video) => (
          <VideoGridCard key={video.id} video={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        ifFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </Fragment>
  );
};

export const HistorySection = () => {
  return (
    <Suspense fallback={<HistorySectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <HistorySectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
