import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { cn, getFullName } from "@/lib/utils";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { TGetOneUserOutput } from "../../types";

interface UserProfileInfoProps {
  user: TGetOneUserOutput;
}
export const UserProfileInfoSkeleton = () => {
  return (
    <div className="py-6">
      {/* Mobile */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="size-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:items-center md:gap-4">
        <Skeleton className="size-40 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-1" />
          <Skeleton className="h-10 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();
  const fullName = getFullName(user);

  const { isPending, onSubscribe } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  });
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={fullName}
            size="lg"
            imageUrl={user.imageUrl}
            className="size-[60px]"
            onClick={() => {
              if (userId === user.id) {
                clerk.openUserProfile();
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{fullName}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>&bull;</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>
        {userId === user.id ? (
          <div className="mt-4">
            <Link prefetch href="/studio">
              <Button variant="secondary" className="w-full mt-3 rounded-full">
                Go to Studio
              </Button>
            </Link>
          </div>
        ) : (
          <SubscriptionButton
            onClick={onSubscribe}
            disabled={!isLoaded || isPending}
            isSubscribed={user.viewerSubscribed}
            className="flex-none mt-3"
          />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex md:items-center  md:gap-4">
        <UserAvatar
          name={fullName}
          size="xl"
          imageUrl={user.imageUrl}
          className={cn(
            userId === user.id &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300"
          )}
          onClick={() => {
            if (userId === user.id) {
              clerk.openUserProfile();
            }
          }}
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{fullName}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} subscribers</span>
            <span>&bull;</span>
            <span>{user.videoCount} videos</span>
          </div>

          {userId === user.id ? (
            <Link prefetch href="/studio">
              <Button variant="secondary" className="mt-3 rounded-full">
                Go to Studio
              </Button>
            </Link>
          ) : (
            <SubscriptionButton
              onClick={onSubscribe}
              disabled={!isLoaded || isPending}
              isSubscribed={user.viewerSubscribed}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};
