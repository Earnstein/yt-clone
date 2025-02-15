import { StudioLayout } from "@/modules/studio/ui/layouts/layouts";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return <StudioLayout>{children}</StudioLayout>;
};

export default Layout;
