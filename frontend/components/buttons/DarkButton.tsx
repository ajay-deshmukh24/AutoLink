import { ReactNode } from "react";

export const DarkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className={
        "flex flex-col justify-center px-8 py-2 cursor-pointer hover:shadow-md text-white rounded text-center"
      }
      onClick={onClick}
      style={{ backgroundColor: "#695be8" }}
    >
      {children}
    </div>
  );
};
