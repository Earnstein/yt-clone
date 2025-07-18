"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  PlaylistGridCard,
  PlaylistGridCardSkeleton,
} from "../components/playlist-grid-card";
import {
  PlaylistRowCard,
  PlaylistRowCardSkeleton,
} from "../components/playlist-row-card";

interface PlaylistSectionProps {
  playlistId: string;
}
const PlaylistSectionSkeleton = () => {
  return (
    <Fragment>
      <div className="hidden flex-col gap-y-4 md:flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaylistRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <PlaylistGridCardSkeleton key={index} />
        ))}
      </div>
    </Fragment>
  );
};
const PlaylistSectionSuspense: React.FC<PlaylistSectionProps> = ({
  playlistId,
}) => {
  const [playlist, resultsQuery] =
    trpc.playlist.getPlaylistVideos.useSuspenseInfiniteQuery(
      {
        playlistId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const playlistVideos = playlist.pages.flatMap((page) => page.items);

  return (
    <Fragment>
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">{playlistVideos[0].name}</h1>
        <p className="text-sm text-muted-foreground">
          {playlistVideos[0].description ?? "Videos in your playlist"}
        </p>
      </div>
      <div className="hidden flex-col gap-y-4 md:flex">
        {playlistVideos.map((playlist) => (
          <PlaylistRowCard
            key={playlist.video.id}
            playlist={playlist}
            size="compact"
            // onRemove={() => handleRemoveFromHistory(video.id)}
            // isPending={removeFromHistoryMutation.isPending}
          />
        ))}
      </div>
      <div className="flex flex-col gap-y-4 md:hidden">
        {playlistVideos.map((playlist) => (
          <PlaylistGridCard
            key={playlist.video.id}
            playlist={playlist}
            // onRemove={() => handleRemoveFromHistory(video.id)}
            // isPending={removeFromHistoryMutation.isPending}
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

export const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  playlistId,
}) => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <PlaylistSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};
