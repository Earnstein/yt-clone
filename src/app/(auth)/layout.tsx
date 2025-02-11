import React from "react";

interface Props {
  children: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {children}
    </div>
  );
};

export default AuthLayout;
