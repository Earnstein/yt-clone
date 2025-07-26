import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { formatNumber, getFullName } from "@/lib/utils";
import { TGetSubscribersOutput } from "@/modules/subscriptions/types";
import { useMemo } from "react";
import { SubscriptionButton } from "./subscription-button";

interface UserSubscriptionCardProps {
  user: TGetSubscribersOutput[number]["user"];
  onUnsubscribe: (userId: string) => void;
  disabled?: boolean;
}

export const UserSubscriptionCardSkeleton = () => {
  return (
    <div className="flex gap-4 items-start w-full">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex justify-between w-full items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-[70%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <Skeleton className="w-32 h-8 rounded-full shrink-0" />
      </div>
    </div>
  );
};

export const UserSubscriptionCard = ({
  user,
  onUnsubscribe,
  disabled,
}: UserSubscriptionCardProps) => {
  const memoizedCount = useMemo(() => {
    return {
      subscriberCount: formatNumber(user.subscriberCount, {
        notation: "compact",
      }),
    };
  }, [user.subscriberCount]);

  const userName = getFullName({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return (
    <div className="flex gap-4 items-start w-full">
      <UserAvatar imageUrl={user.imageUrl} size="lg" name={userName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between w-full">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium truncate">{userName}</h3>
            <p className="text-xs text-muted-foreground">
              {memoizedCount.subscriberCount} subscribers
            </p>
          </div>
          <SubscriptionButton
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe(user.id);
            }}
            disabled={disabled}
            className="flex-none ml-2"
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};
