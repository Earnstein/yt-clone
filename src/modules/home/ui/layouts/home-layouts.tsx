import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

interface Props {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<Props> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar />
        <div className="flex pt-16 min-h-screen">
          <HomeSidebar />
          <main className="overflow-y-auto flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
