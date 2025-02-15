import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";

interface Props {
  isManual?: boolean;
  hasNextPage: boolean;
  ifFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll: React.FC<Props> = ({
  isManual = false,
  hasNextPage,
  ifFetchingNextPage,
  fetchNextPage,
}) => {
  const { isIntersecting, targetRef } = useIntersectionObserver({
    rootMargin: "100px",
    threshold: 0.5,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !ifFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    ifFetchingNextPage,
    fetchNextPage,
    isManual,
  ]);

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <div ref={targetRef} />
      {hasNextPage ? (
        <Button
          onClick={fetchNextPage}
          disabled={!hasNextPage || ifFetchingNextPage}
        >
          {ifFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};
