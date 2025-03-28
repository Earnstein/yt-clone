import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";

interface Props {
  children: React.ReactNode;
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal: React.FC<Props> = ({
  children,
  open,
  title,
  description,
  onOpenChange,
}) => {
  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{title}</CredenzaTitle>
          <CredenzaDescription
            className={`${description ? "block" : "hidden"}`}
          >
            {description}
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>{children}</CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};
