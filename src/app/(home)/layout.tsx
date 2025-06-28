import { HomeLayout } from "@/modules/home/ui/layouts/home-layouts";
export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return <HomeLayout>{children}</HomeLayout>;
};

export default Layout;
