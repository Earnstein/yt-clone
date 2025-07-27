"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { getFullName } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SubscriptionSkeleton = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 items-center px-2 py-1">
                <Skeleton className="size-8 rounded-full flex-shrink-0" />
                <Skeleton className="w-full h-4 flex-1" />
              </div>
            ))}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const SubscriptionsSection = () => {
  const pathname = usePathname();
  const { data, isLoading, error } =
    trpc.subscriptions.getSubscribers.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (error) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Your Subscriptions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="px-2 py-1 text-sm text-muted-foreground">
                Cannot load subscriptions
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const subscribers = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {subscribers.map((subscriber) => (
            <SidebarMenuItem
              key={`${subscriber.creatorId}-${subscriber.viewerId}`}
            >
              <SidebarMenuButton
                tooltip={getFullName({
                  firstName: subscriber.user.firstName,
                  lastName: subscriber.user.lastName,
                })}
                asChild
                isActive={pathname === `/users/${subscriber.user.id}`}
              >
                <Link
                  href={`/users/${subscriber.user.id}`}
                  className="flex gap-4 items-center"
                >
                  <UserAvatar
                    imageUrl={subscriber.user.imageUrl}
                    size="sm"
                    name={getFullName({
                      firstName: subscriber.user.firstName,
                      lastName: subscriber.user.lastName,
                    })}
                  />
                  <span className="text-sm">
                    {getFullName({
                      firstName: subscriber.user.firstName ?? "",
                      lastName: subscriber.user.lastName ?? "",
                    })}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/subscriptions"}>
              <Link href="/subscriptions" className="flex gap-4 items-center">
                <ListIcon className="size-4" />
                <span className="text-sm">All Subscriptions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
