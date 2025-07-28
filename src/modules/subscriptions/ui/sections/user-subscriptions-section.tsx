"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { getFullName } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Fragment, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
  UserSubscriptionCard,
  UserSubscriptionCardSkeleton,
} from "../components/user-subscription-card";

const UserSubscriptionsSectionSkeleton = () => {
  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <UserSubscriptionCardSkeleton key={index} />
        ))}
      </div>
    </Fragment>
  );
};

const UserSubscriptionsSectionSuspense = () => {
  const utils = trpc.useUtils();
  const clerk = useClerk();

  const [results, resultsQuery] =
    trpc.subscriptions.getSubscribers.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const unsubscribe = trpc.subscriptions.delete.useMutation({
    onMutate: async (data) => {
      await utils.subscriptions.getSubscribers.cancel();
      const previousSubscribers =
        utils.subscriptions.getSubscribers.getInfiniteData();
      if (!previousSubscribers) return;

      utils.subscriptions.getSubscribers.setInfiniteData(
        { limit: DEFAULT_LIMIT },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.user.id !== data.userId),
            })),
          }
      );
      return { previousSubscribers };
    },
    onSuccess: (data) => {
      utils.home.getSubscriptionsVideos.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
      utils.subscriptions.getSubscribers.invalidate();
    },
    onError: (error, _, context) => {
      if (context?.previousSubscribers) {
        utils.subscriptions.getSubscribers.setInfiniteData(
          { limit: DEFAULT_LIMIT },
          context.previousSubscribers
        );
      }
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const subscribers = results.pages.flatMap((page) => page.items);

  if (subscribers.length === 0) {
    return (
      <div className="text-sm text-center text-muted-foreground">
        You haven&apos;t watched any videos yet.
      </div>
    );
  }

  const handleUnsubscribe = (userId: string, userName: string) => {
    return unsubscribe.mutate(
      { userId },
      {
        onSuccess: () => {
          toast.success(`You unsubscribed from ${userName}`);
        },
      }
    );
  };

  const isUnsubscribing = (userId: string) =>
    unsubscribe.variables?.userId === userId && unsubscribe.isPending;

  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        {subscribers.map((subscriber) => (
          <Link
            key={subscriber.user.id}
            href={`/users/${subscriber.user.id}`}
            className="flex gap-4 items-center w-full"
          >
            <UserSubscriptionCard
              user={subscriber.user}
              onUnsubscribe={() =>
                handleUnsubscribe(
                  subscriber.user.id,
                  getFullName(subscriber.user)
                )
              }
              disabled={isUnsubscribing(subscriber.user.id)}
            />
          </Link>
        ))}
      </div>

      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        ifFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </Fragment>
  );
};

export const UserSubscriptionsSection = () => {
  return (
    <Suspense fallback={<UserSubscriptionsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <UserSubscriptionsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};
