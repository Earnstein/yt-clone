import { LikedSection } from "../sections/liked-section";

export const LikedView = () => {
  return (
    <div className="max-w-screen-md mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h1 className="text-2xl font-bold">Liked Videos</h1>
        <p className="text-sm text-muted-foreground">
          Videos you liked recently
        </p>
      </div>
      <LikedSection />
    </div>
  );
};
