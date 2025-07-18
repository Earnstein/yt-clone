import { PlaylistSection } from "../sections/playlist-section";

interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView: React.FC<PlaylistViewProps> = async ({
  playlistId,
}) => {
  return (
    <div className="max-w-screen-md mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistSection playlistId={playlistId} />
    </div>
  );
};
