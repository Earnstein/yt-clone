import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";

interface Props {
  children: React.ReactNode;
}

export const StudioLayout: React.FC<Props> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="flex pt-16 min-h-screen">
          <StudioSidebar />
          <main className="overflow-y-auto flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
