import { VideoSection } from "../sections/video-section";

export const StudioView = () => {
  return (
    <div className="space-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-xl font-bold sm:text-2xl">Channel content</h1>
        <p className="text-xs text-muted-foreground">
          Manage your channel content and videos.
        </p>
      </div>
      <VideoSection />
    </div>
  );
};
