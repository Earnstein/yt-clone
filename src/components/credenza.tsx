"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BaseProps {
  children: React.ReactNode;
}

interface RootCredenzaProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CredenzaProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const CredenzaContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

const useCredenzaContext = () => {
  const context = React.useContext(CredenzaContext);
  if (!context) {
    throw new Error(
      "Credenza components cannot be rendered outside the Credenza Context"
    );
  }
  return context;
};

const Credenza = ({ children, ...props }: RootCredenzaProps) => {
  const isDesktop = useIsMobile();
  const Credenza = isDesktop ? Drawer : Dialog;

  return (
    <CredenzaContext.Provider value={{ isDesktop }}>
      <Credenza {...props} {...(!isDesktop && { autoFocus: true })}>
        {children}
      </Credenza>
    </CredenzaContext.Provider>
  );
};

const CredenzaTrigger = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaTrigger = isDesktop ? DrawerTrigger : DialogTrigger;

  return (
    <CredenzaTrigger className={className} {...props}>
      {children}
    </CredenzaTrigger>
  );
};

const CredenzaClose = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaClose = isDesktop ? DrawerClose : DialogClose;

  return (
    <CredenzaClose className={className} {...props}>
      {children}
    </CredenzaClose>
  );
};

const CredenzaContent = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaContent = isDesktop ? DrawerContent : DialogContent;

  return (
    <CredenzaContent className={className} {...props}>
      {children}
    </CredenzaContent>
  );
};

const CredenzaDescription = ({
  className,
  children,
  ...props
}: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaDescription = isDesktop ? DrawerDescription : DialogDescription;

  return (
    <CredenzaDescription className={className} {...props}>
      {children}
    </CredenzaDescription>
  );
};

const CredenzaHeader = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaHeader = isDesktop ? DrawerHeader : DialogHeader;

  return (
    <CredenzaHeader className={className} {...props}>
      {children}
    </CredenzaHeader>
  );
};

const CredenzaTitle = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaTitle = isDesktop ? DrawerTitle : DialogTitle;

  return (
    <CredenzaTitle className={className} {...props}>
      {children}
    </CredenzaTitle>
  );
};

const CredenzaBody = ({ className, children, ...props }: CredenzaProps) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

const CredenzaFooter = ({ className, children, ...props }: CredenzaProps) => {
  const { isDesktop } = useCredenzaContext();
  const CredenzaFooter = isDesktop ? DrawerFooter : DialogFooter;

  return (
    <CredenzaFooter className={className} {...props}>
      {children}
    </CredenzaFooter>
  );
};

export {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
};
