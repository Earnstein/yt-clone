"use client";

import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CommentsSectionProps {
  videoId: string;
}

const CommentsSectionSuspense: React.FC<CommentsSectionProps> = ({
  videoId,
}) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({
    videoId,
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-medium">{comments.length} Comments</h2>
        <CommentForm videoId={videoId} />
      </div>
    </div>
  );
};

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Error loading comments</div>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
