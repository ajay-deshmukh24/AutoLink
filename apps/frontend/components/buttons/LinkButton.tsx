"use client";

import { ReactNode } from "react";

export const LinkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex justify-center px-2 py-2 cursor-pointer hover:bg-slate-100 font-medium text-sm rounded"
      onClick={onClick}
      style={{ backgroundColor: "#ed9df" }}
    >
      {children}
    </div>
  );
};
