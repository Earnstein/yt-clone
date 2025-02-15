import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { Youtube } from "lucide-react";
import Link from "next/link";
import { StudioUploadModal } from "../studio-upload-modal";
export const StudioNavbar = () => {
  return (
    <nav className="flex fixed top-0 right-0 left-0 z-50 items-center px-2 pr-5 h-16 bg-white shadow-md border-b">
      <div className="flex items-center w-full justify-between">
        {/*Menu and Logo*/}
        <div className="flex flex-shrink-0 items-center">
          <SidebarTrigger />
          <Link href="/studio">
            <div className="flex gap-1 items-center p-4">
              <Youtube className="text-rose-500 size-8" />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>

        {/*Auth Button*/}
        <div className="flex flex-shrink-0 gap-4 items-center">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
