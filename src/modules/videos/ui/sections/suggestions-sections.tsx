"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";

interface SuggestionsSectionProps {
  videoId: string;
  isManual?: boolean;
}

const SuggestionsSectionError = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          Oh snap! An error just occurred
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          We couldn&apos;t load the suggestions right now. Please try refreshing
          the page.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          router.refresh();
        }}
      >
        Refresh
      </Button>
    </div>
  );
};

const SuggestionsSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>

      <div className="block md:hidden space-y-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

export const SuggestionsSectionSuspense: React.FC<SuggestionsSectionProps> = ({
  videoId,
  isManual = false,
}) => {
  const [suggestions, query] =
    trpc.suggestions.getSuggestions.useSuspenseInfiniteQuery(
      { videoId, limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );
  const videos = suggestions.pages.flatMap((page) => page.items);
  return (
    <>
      <div className="hidden md:block space-y-3">
        {videos.map((video) => (
          <VideoRowCard key={video.id} video={video} size="compact" />
        ))}
      </div>

      <div className="block md:hidden space-y-10">
        {videos.map((video) => (
          <VideoGridCard key={video.id} video={video} />
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        ifFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        isManual={isManual}
      />
    </>
  );
};

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  videoId,
  isManual = false,
}) => {
  return (
    <Suspense fallback={<SuggestionsSkeleton />}>
      <ErrorBoundary fallback={<SuggestionsSectionError />}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};
