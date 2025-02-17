import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import Image from "next/image";
import Link from "next/link";
import { StudioCreateModal } from "../studio-create-modal";
export const StudioNavbar = () => {
  return (
    <nav className="flex fixed top-0 right-0 left-0 z-50 items-center px-2 pr-5 h-16 bg-white shadow-md border-b">
      <div className="flex items-center w-full justify-between">
        {/*Menu and Logo*/}
        <div className="flex flex-shrink-0 items-center">
          <SidebarTrigger />
          <Link href="/studio">
            <div className="flex gap-1 items-center p-4">
              <Image
                src="/yt.svg"
                alt="etube"
                width={24}
                height={24}
                className="size-8"
              />{" "}
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/*Auth Button*/}
        <div className="flex flex-shrink-0 gap-4 items-center">
          <StudioCreateModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
