import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscription = ({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.create.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches
      if (fromVideoId) {
        await utils.videos.getOne.cancel({ id: fromVideoId });
      }

      // Snapshot the previous value
      const prevData = fromVideoId
        ? utils.videos.getOne.getData({ id: fromVideoId })
        : undefined;

      // Optimistically update the video data
      if (fromVideoId) {
        utils.videos.getOne.setData({ id: fromVideoId }, (old) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              viewerSubscribed: true,
              subscriberCount: old.user.subscriberCount + 1,
            },
          };
        });
      }

      return { prevData };
    },
    onSuccess: () => {
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
      utils.home.getSubscriptionsVideos.invalidate();
      utils.users.getOne.invalidate({ id: userId });
    },
    onError: (error, _, context) => {
      // Rollback to the previous value
      if (fromVideoId && context?.prevData) {
        utils.videos.getOne.setData({ id: fromVideoId }, context.prevData);
      }

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const unsubscribe = trpc.subscriptions.delete.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches
      if (fromVideoId) {
        await utils.videos.getOne.cancel({ id: fromVideoId });
      }

      // Snapshot the previous value
      const prevData = fromVideoId
        ? utils.videos.getOne.getData({ id: fromVideoId })
        : undefined;

      // Optimistically update the video data
      if (fromVideoId) {
        utils.videos.getOne.setData({ id: fromVideoId }, (old) => {
          if (!old) return old;
          return {
            ...old,
            user: {
              ...old.user,
              viewerSubscribed: false,
              subscriberCount: old.user.subscriberCount - 1,
            },
          };
        });
      }

      return { prevData };
    },
    onSuccess: () => {
      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
      utils.home.getSubscriptionsVideos.invalidate();
      utils.users.getOne.invalidate({ id: userId });
    },
    onError: (error, _, context) => {
      // Rollback to the previous value
      if (fromVideoId && context?.prevData) {
        utils.videos.getOne.setData({ id: fromVideoId }, context.prevData);
      }

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onSubscribe = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ userId });
    } else {
      subscribe.mutate({ userId });
    }
  };

  return {
    isPending,
    onSubscribe,
  };
};
