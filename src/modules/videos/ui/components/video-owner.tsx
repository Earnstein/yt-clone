import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { TGetOneVideoOutput } from "../../types";

interface VideoOwnerProps {
  user: TGetOneVideoOutput["user"];
  videoId: TGetOneVideoOutput["id"];
}

export const VideoOwner: React.FC<VideoOwnerProps> = ({ user, videoId }) => {
  const { userId } = useAuth();
  const isOwner = userId === user.id;
  return (
    <div className="flex gap-3 justify-between items-center min-w-0 sm:items-start sm:justify-start">
      <Link href={`/users/${user.id}`}>
        <div className="flex gap-2 items-center">
          <UserAvatar
            imageUrl={user.imageUrl}
            name={`${user.firstName} ${user.lastName}`}
            size="lg"
          />
          <div className="space-y-1 min-w-0">
            <UserInfo name={`${user.firstName} ${user.lastName}`} size="lg" />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {/* TODO: to build subscribers count */}
              {0} subscribers
            </span>
          </div>
        </div>
      </Link>
      {isOwner ? (
        <Link href={`/studio/videos/${videoId}`}>
          <Button variant="secondary" className="rounded-full">
            Edit video
          </Button>
        </Link>
      ) : (
        <SubscriptionButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-none"
        />
      )}
    </div>
  );
};
