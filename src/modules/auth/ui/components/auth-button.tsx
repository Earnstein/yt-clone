"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ClapperboardIcon,
  HomeIcon,
  UserCircleIcon,
  UserIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export const AuthButton = () => {
  // const { isLoaded } = useUser();
  const pathname = usePathname();

  // if (!isLoaded)
  //   return (
  //     <ClerkLoading>
  //       <Skeleton className="size-9 rounded-full" />
  //     </ClerkLoading>
  //   );

  return (
    <Suspense
      fallback={
        <ClerkLoading>
          <Skeleton className="size-9 rounded-full" />
        </ClerkLoading>
      }
    >
      <ErrorBoundary fallback={<div>Error</div>}>
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Profile"
                href="/users/current"
                labelIcon={<UserIcon className="size-4" />}
              />
              <UserButton.Link
                label={pathname === "/studio" ? "Home" : "Studio"}
                href={pathname === "/studio" ? "/" : "/studio"}
                labelIcon={
                  pathname === "/studio" ? (
                    <HomeIcon className="size-4" />
                  ) : (
                    <ClapperboardIcon className="size-4" />
                  )
                }
              />
              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="px-4 py-2 text-sm font-medium text-blue-600 rounded-full shadow-none hover:text-blue-500 border-blue-500/20"
            >
              <UserCircleIcon />
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </ErrorBoundary>
    </Suspense>
  );
};
