"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { ClapperboardIcon, HomeIcon, UserCircleIcon } from "lucide-react";
import { usePathname } from "next/navigation";
export const AuthButton = () => {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  //TODO: Add auth functionality

  if (!isLoaded) return <Skeleton className="size-9 rounded-full" />;

  return (
    <>
      <SignedIn>
        <UserButton>
          {/*TODO: Add menu user profile*/}
          <UserButton.MenuItems>
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
    </>
  );
};
