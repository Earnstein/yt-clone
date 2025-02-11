import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { Youtube } from "lucide-react";
import Link from "next/link";
import SearchInput from "./search-input";

export const HomeNavbar = () => {
  return (
    <nav className="flex fixed top-0 right-0 left-0 z-50 items-center px-2 pr-5 h-16 bg-white">
      <div className="flex gap-4 items-center w-full">
        {/*Menu and Logo*/}
        <div className="flex flex-shrink-0 items-center">
          <SidebarTrigger />
          <Link href="/">
            <div className="flex gap-1 items-center p-4">
              <Youtube className="text-rose-500 size-8" />
              <p className="text-xl font-semibold tracking-tight">Youtube</p>
            </div>
          </Link>
        </div>

        {/*Search*/}
        <div className="flex flex-1 justify-center items-center mx-auto max-w-[720px]">
          <SearchInput />
        </div>

        {/*Auth Button*/}
        <div className="flex flex-shrink-0 gap-4 items-center">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
