"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { VideoGridCard } from "../components/video-grid-card";
import { VideoRowCard } from "../components/video-row-card";

interface SuggestionsSectionProps {
  videoId: string;
  isManual?: boolean;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
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
