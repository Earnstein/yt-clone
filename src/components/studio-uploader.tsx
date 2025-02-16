import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  endpoint?: string;
  onSuccess: () => void;
}
const uploaderId = "video-uploader";
export const StudioUploader: React.FC<Props> = ({ endpoint, onSuccess }) => {
  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        className="sr-only group/uploader"
        id={uploaderId}
        onSuccess={onSuccess}
      />
      <MuxUploaderDrop muxUploader={uploaderId} className="group/drop">
        <div className="flex flex-col items-center gap-6" slot="heading">
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted size-32">
            <UploadIcon className="size-10 text-muted-foreground group-hover/drop:animate-bounce transition-all duration-300" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop video files to upload</p>
            <p className="text-xs text-muted-foreground">
              Your videos will be private until you publish them.
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={uploaderId}>
            <Button type="button" className="rounded-full">
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="sr-only" />
        <MuxUploaderStatus
          muxUploader={uploaderId}
          className="text-sm"
          slot="status"
        />
        <MuxUploaderProgress
          className="text-sm"
          muxUploader={uploaderId}
          type="percentage"
        />

        <MuxUploaderProgress
          className="text-sm"
          muxUploader={uploaderId}
          type="bar"
        />
      </MuxUploaderDrop>
    </div>
  );
};
