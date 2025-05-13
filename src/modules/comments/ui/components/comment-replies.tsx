import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import { CommentItem } from "./comment-item";

interface CommentRepliesProps {
  videoId: string;
  parentId: string;
  limit?: number;
}

export const CommentReplies: React.FC<CommentRepliesProps> = ({
  videoId,
  parentId,
  limit = DEFAULT_LIMIT,
}) => {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.comments.getMany.useInfiniteQuery(
    {
      videoId: videoId,
      parentId: parentId,
      limit: limit,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  if (isError) return <div>Error</div>;
  if (data?.pages[0].items.length === 0) return null;
  return (
    <div className="px-14">
      <div className="flex flex-col gap-4 mt-2">
        {data?.pages
          .flatMap((page) => page.items)
          .filter((comment) => comment.parentId === parentId)
          .map((comment) => (
            <CommentItem key={comment.id} comment={comment} variant="reply" />
          ))}
      </div>
      {hasNextPage && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <CornerDownRightIcon className="size-4 mr-2" />
          Load more replies
        </Button>
      )}
    </div>
  );
};
