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
  EllipsisVerticalIcon,
  MessageSquareIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TCommentsGetAll } from "../../types";
interface CommentItemProps {
  comment: TCommentsGetAll["items"][number];
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
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
          {/* TODO: Reactions */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuItem onClick={() => {}}>
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
      </div>
    </div>
  );
};
