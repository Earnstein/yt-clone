import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";
import { TGetOneVideoOutput } from "../../types";

interface VideoReactionProps {
  likeCount: number;
  dislikeCount: number;
  viewerReaction: TGetOneVideoOutput["viewerReaction"];
  videoId: string;
}

//TODO: implement videoreaction
export const VideoReactions: React.FC<VideoReactionProps> = ({
  dislikeCount,
  likeCount,
  viewerReaction,
  videoId,
}) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const likeMutation = trpc.videoReactions.like.useMutation({
    onMutate: async (likeVideoInput) => {
      // Stop any in-flight fetches to avoid race conditions
      await utils.videos.getOne.cancel({ id: likeVideoInput.videoId });

      // Save current video data for rollback if needed
      const prevData = utils.videos.getOne.getData({
        id: likeVideoInput.videoId,
      });

      // Update local cache optimistically
      utils.videos.getOne.setData({ id: likeVideoInput.videoId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          // Toggle like count up/down based on previous state
          likeCount:
            old.viewerReaction === "like"
              ? old.likeCount - 1
              : old.likeCount + 1,
          // Remove dislike if switching from dislike to like
          dislikeCount:
            old.viewerReaction === "dislike"
              ? old.dislikeCount - 1
              : old.dislikeCount,
          // Toggle like state on/off
          viewerReaction: old.viewerReaction === "like" ? null : "like",
        };
      });

      return { prevData };
    },
    onError: (error, __, context) => {
      // Restore previous data on error
      if (context?.prevData) {
        utils.videos.getOne.setData({ id: videoId }, context.prevData);
      }
      // Show login modal if unauthorized
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      } else {
        toast.error("Something went wrong");
      }
    },

    onSettled: () => {
      // Always refresh data when mutation completes
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlist.getLiked.invalidate();
    },
  });

  const dislikeMutation = trpc.videoReactions.dislike.useMutation({
    onMutate: async (dislikeVideoInput) => {
      // Stop any in-flight fetches to avoid race conditions
      await utils.videos.getOne.cancel({ id: dislikeVideoInput.videoId });

      // Save current video data for rollback if needed
      const prevData = utils.videos.getOne.getData({
        id: dislikeVideoInput.videoId,
      });

      // Update local cache optimistically
      utils.videos.getOne.setData({ id: dislikeVideoInput.videoId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          // Toggle dislike count up/down based on previous state
          dislikeCount:
            old.viewerReaction === "dislike"
              ? old.dislikeCount - 1
              : old.dislikeCount + 1,
          // Remove like if switching from like to dislike
          likeCount:
            old.viewerReaction === "like" ? old.likeCount - 1 : old.likeCount,
          // Toggle dislike state on/off
          viewerReaction: old.viewerReaction === "dislike" ? null : "dislike",
        };
      });

      return { prevData };
    },
    onError: (error, __, context) => {
      // Restore previous data on error
      if (context?.prevData) {
        utils.videos.getOne.setData({ id: videoId }, context.prevData);
      }

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      } else {
        toast.error("Something went wrong");
      }
    },

    onSettled: () => {
      // Always refresh data when mutation completes
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  return (
    <div className="flex flex-none items-center">
      <Button
        className="gap-2 pr-4 rounded-r-none rounded-l-full disabled:opacity-100"
        variant="secondary"
        onClick={() => likeMutation.mutate({ videoId })}
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likeCount}
      </Button>
      <Separator orientation="vertical" className="h-7" />

      <Button
        className="pl-4 rounded-r-full rounded-l-none disabled:opacity-100"
        variant="secondary"
        onClick={() => dislikeMutation.mutate({ videoId })}
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikeCount}
      </Button>
    </div>
  );
};
