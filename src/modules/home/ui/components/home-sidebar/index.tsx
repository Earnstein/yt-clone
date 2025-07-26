import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SignedIn } from "@clerk/nextjs";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";
import { SubscriptionsSection } from "./subscription-section";
export const HomeSidebar = () => {
  return (
    <Sidebar className="z-40 pt-16 border-none" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />
        <SignedIn>
          <>
            <Separator />
            <SubscriptionsSection />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};
