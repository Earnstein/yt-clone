import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export const StudioSidebarHeader = () => {
  const { user } = useUser();
  const { state } = useSidebar();
  if (!user)
    return (
      <SidebarHeader className="flex items-center justify-center">
        <Skeleton className="size-[100px] sm:size-[112px] rounded-full" />
        <div className="flex flex-col gap-2 items-center mt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </SidebarHeader>
    );

  if (state === "collapsed") {
    return (
      <SidebarMenu>
        <SidebarMenuButton asChild tooltip="Your profile">
          <Link href="/users/current" className="flex items-center gap-2">
            <UserAvatar
              size="xs"
              imageUrl={user?.imageUrl ?? ""}
              name={user?.fullName ?? "user"}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenu>
    );
  }
  return (
    <>
      <Link href="/users/current" className="flex items-center gap-2">
        <UserAvatar
          size="lg"
          imageUrl={user?.imageUrl ?? ""}
          name={user?.fullName ?? "user"}
          className="size-[100px] sm:size-[112px] hover:opacity-80 transition-opacity duration-200"
        />
      </Link>

      <div className="flex flex-col gap-2 items-center mt-2">
        <h3 className="text-sm font-medium">Your profile</h3>
        <p className="text-xs text-muted-foreground">
          {user?.fullName || user?.emailAddresses[0].emailAddress}
        </p>
      </div>
    </>
  );
};
