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

const LikedSectionSkeleton = () => {
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

const LikedSectionSuspense = () => {
  const utils = trpc.useUtils();

  const [results, resultsQuery] =
    trpc.playlist.getLiked.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const removeFromLiked = trpc.playlist.removeFromLiked.useMutation({
    onMutate: async ({ videoId }) => {
      //cancel outgoing request
      await utils.playlist.getLiked.cancel();

      // get the playlist items
      const liked = utils.playlist.getLiked.getInfiniteData({
        limit: DEFAULT_LIMIT,
      });

      const previousLiked = liked?.pages.flatMap((page) => page.items);

      //if the playlist is not found, return the previous playlist items
      if (!previousLiked) {
        return { previousLiked };
      }

      const deletedLiked = previousLiked.filter((item) => item.id !== videoId);
      utils.playlist.getLiked.setInfiniteData(
        {
          limit: DEFAULT_LIMIT,
        },
        {
          pages: [
            {
              items: deletedLiked,
              nextCursor: liked?.pages[0]?.nextCursor ?? null,
            },
          ],
          pageParams: [null],
        }
      );

      return { previousLiked };
    },
    onSuccess: ({ success }) => {
      toast.dismiss();
      if (!success) {
        toast.error("Failed to remove video");
        return;
      }

      toast.success("Removed");
      utils.playlist.getHistory.invalidate();
    },
    onError: (error, _, context) => {
      toast.dismiss();
      if (context?.previousLiked) {
        utils.playlist.getLiked.setInfiniteData(
          {
            limit: DEFAULT_LIMIT,
          },
          {
            pages: [
              {
                items: context.previousLiked,
                nextCursor: results.pages[0]?.nextCursor ?? null,
              },
            ],
            pageParams: [null],
          }
        );
      }
      toast.error(error.message || "Failed to remove from liked");
    },
  });

  const videos = results.pages.flatMap((page) => page.items);

  if (videos.length === 0) {
    return (
      <div className="text-sm text-center text-muted-foreground">
        You haven&apos;t watched any videos yet.
      </div>
    );
  }

  const handleRemoveFromHistory = (videoId: string) => {
    removeFromLiked.mutate({ videoId });
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
            isPending={removeFromLiked.isPending}
          />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {videos.map((video) => (
          <VideoGridCard
            key={video.id}
            video={video}
            onRemove={() => handleRemoveFromHistory(video.id)}
            isPending={removeFromLiked.isPending}
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

export const LikedSection = () => {
  return (
    <Suspense fallback={<LikedSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <LikedSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
