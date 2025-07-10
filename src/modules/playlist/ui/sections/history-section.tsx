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
import { toast } from "sonner";

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
  const utils = trpc.useUtils();
  const removeFromHistoryMutation = trpc.playlist.removeFromHistory.useMutation(
    {
      onMutate: () => {
        toast.loading("Removing from history...");
      },
      onSuccess: ({ success }) => {
        toast.dismiss();
        if (!success) {
          toast.error("Failed to remove from history");
          return;
        }

        toast.success("Removed from history");
        utils.playlist.getHistory.invalidate();
      },
      onError: () => {
        toast.dismiss();
        toast.error("Failed to remove from history");
      },
    }
  );

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

  const handleRemoveFromHistory = (videoId: string) => {
    removeFromHistoryMutation.mutate({ videoId });
  };

  return (
    <Fragment>
      <div className="hidden flex-col gap-y-4 md:flex">
        {videos.map((video) => (
          <VideoRowCard
            key={video.id}
            video={video}
            size="compact"
            onRemove={() => handleRemoveFromHistory(video.id)}
            isPending={removeFromHistoryMutation.isPending}
          />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {videos.map((video) => (
          <VideoGridCard
            key={video.id}
            video={video}
            onRemove={() => handleRemoveFromHistory(video.id)}
            isPending={removeFromHistoryMutation.isPending}
          />
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
