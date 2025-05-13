import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { cn, getFullName } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  MessageSquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TCommentsGetAll } from "../../types";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";
interface CommentItemProps {
  comment: TCommentsGetAll["items"][number];
  variant?: "comment" | "reply";
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  variant = "comment",
}) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const { user } = useUser();
  const utils = trpc.useUtils();
  const { openSignIn } = useClerk();
  const { mutate: deleteComment, isPending } = trpc.comments.delete.useMutation(
    {
      onSuccess: () => {
        toast.success("Comment deleted");
        utils.comments.getMany.invalidate();
      },
      onError: (error) => {
        toast.error("Something went wrong");
        if (error.data?.code === "UNAUTHORIZED") {
          toast.error("You are not authorized to delete this comment");
          openSignIn({ redirectUrl: "/sign-in" });
        }
      },
    }
  );

  const likeMutation = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You are not authorized to like this comment");
        openSignIn({ redirectUrl: "/sign-in" });
      }
    },
  });

  const dislikeMutation = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("You are not authorized to dislike this comment");
        openSignIn({ redirectUrl: "/sign-in" });
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-2", isPending && "opacity-50")}>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            imageUrl={comment.user.imageUrl}
            name={getFullName(comment.user) || "user"}
            size="sm"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <p className="flex items-center gap-2 mb-0.5">
              <span> {getFullName(comment.user)}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </p>
          </Link>
          <p className="text-sm text-muted-foreground">{comment.comment}</p>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  likeMutation.mutate({ commentId: comment.id });
                }}
                disabled={likeMutation.isPending || dislikeMutation.isPending}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  dislikeMutation.mutate({ commentId: comment.id });
                }}
                disabled={likeMutation.isPending || dislikeMutation.isPending}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
              {variant === "comment" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => setIsReplyOpen((prev) => !prev)}
                >
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>
        {comment.userId !== user?.id && variant === "comment" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right">
              <DropdownMenuItem onClick={() => setIsReplyOpen((prev) => !prev)}>
                <MessageSquareIcon className="size-4" />
                Reply
              </DropdownMenuItem>
              {user?.id === comment.userId && (
                <DropdownMenuItem
                  onClick={() => {
                    deleteComment({ id: comment.id });
                  }}
                  disabled={isPending}
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            videoId={comment.videoId}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
            avatarSize="sm"
            variant="reply"
            parentId={comment.id}
            onCancel={() => setIsReplyOpen(false)}
          />
        </div>
      )}
      {comment.replyCount > 0 && variant === "comment" && (
        <div className="mt-4 pl-14">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setIsRepliesOpen((prev) => !prev)}
          >
            {isRepliesOpen ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
            {comment.replyCount}{" "}
            {comment.replyCount === 1 ? "reply" : "replies"}
          </Button>
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies
          videoId={comment.videoId}
          parentId={comment.id}
          limit={2}
        />
      )}
    </div>
  );
};
