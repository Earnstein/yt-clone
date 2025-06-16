"use client";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";

interface SuggestionsSectionProps {
  videoId: string;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  videoId,
}) => {
  const [data] = trpc.suggestions.getSuggestions.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {data.pages.map((page) => (
        <div key={page.nextCursor?.updatedAt.toISOString()}>
          {page.items.map((item) => (
            <div key={item.id}>{item.title}</div>
          ))}
        </div>
      ))}
    </div>
  );
};
