import { Banner } from "@/components/banner";
import { TGetOneVideoOutput } from "@/modules/videos/types";
import { AlertTriangleIcon } from "lucide-react";

interface VideoBannerProps {
  status: TGetOneVideoOutput["muxStatus"];
}

export const VideoBanner: React.FC<VideoBannerProps> = ({ status }) => {
  if (status === "ready") return null;

  return (
    <Banner
      title="Video is processing"
      icon={AlertTriangleIcon}
      className="bg-yellow-500 rounded-b-xl"
      useLocalStorage={false}
      time={5000}
    />
  );
};
