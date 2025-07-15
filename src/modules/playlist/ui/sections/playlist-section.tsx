"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  PlaylistCard,
  PlaylistCardSkeleton,
} from "../components/playlist-card";

const PlaylistSectionSkeleton = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-10 gap-x-4 sm:gap-x-6 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <PlaylistCardSkeleton key={index} />
      ))}
    </div>
  );
};

const PlaylistSectionSuspense = () => {
  const [results, resultsQuery] =
    trpc.playlist.getPlaylists.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const playlists = results.pages.flatMap((page) => page.items);
  return (
    <Fragment>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-10 gap-x-4 sm:gap-x-6 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
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

export const PlaylistSection = () => {
  return (
    <Suspense fallback={<PlaylistSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <PlaylistSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
