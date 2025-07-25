"use client";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UserBanner, UserBannerSkeleton } from "../components/user-banner";
import {
  UserProfileInfo,
  UserProfileInfoSkeleton,
} from "../components/user-profile-info";

interface UserSectionProps {
  userId: string;
}
const UserSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <UserBannerSkeleton />
      <UserProfileInfoSkeleton />
      <Separator />
    </div>
  );
};
const UserSectionSuspense: React.FC<UserSectionProps> = ({ userId }) => {
  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
  return (
    <div className="flex flex-col gap-4">
      <UserBanner user={user} />
      <UserProfileInfo user={user} />
      <Separator />
    </div>
  );
};

export const UserSection: React.FC<UserSectionProps> = ({ userId }) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <UserSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  );
};
