"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface HomeVideosSectionProps {
  categoryId?: string;
}
const HomeVideosSectionSkeleton = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-10 gap-x-4 [@media(min-width:1920px)]:grid-cols-5">
      {Array.from({ length: 9 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

const HomeVideosSectionSuspense = ({ categoryId }: HomeVideosSectionProps) => {
  const [results, resultsQuery] =
    trpc.home.getHomeVideos.useSuspenseInfiniteQuery(
      {
        categoryId: categoryId ?? undefined,
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const videos = results.pages.flatMap((page) => page.items);
  return (
    <Fragment>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-10 gap-x-4 [@media(min-width:1920px)]:grid-cols-5">
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

export const HomeVideosSection: React.FC<HomeVideosSectionProps> = ({
  categoryId,
}) => {
  return (
    <Suspense fallback={<HomeVideosSectionSkeleton />} key={categoryId}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <HomeVideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};
