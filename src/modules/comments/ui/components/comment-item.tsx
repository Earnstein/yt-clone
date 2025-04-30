import { UserAvatar } from "@/components/user-avatar";
import { getFullName } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { TCommentsGetAll } from "../../types";
interface CommentItemProps {
  comment: TCommentsGetAll["items"][number];
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </div>
  );
};
