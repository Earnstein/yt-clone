import MuxUploader from "@mux/mux-uploader-react";

interface Props {
  endpoint?: string;
  onSuccess: () => void;
}
export const StudioUploader: React.FC<Props> = ({ endpoint, onSuccess }) => {
  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        onSuccess={() => {
          onSuccess();
        }}
      />
    </div>
  );
};
