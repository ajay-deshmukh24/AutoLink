import { ReactNode } from "react";

export const PrimaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      className={`${
        size == "small" ? "text-sm px-8 py-2" : "text-xl px-10 py-4"
      } text-white cursor-pointer hover:shadow-md rounded-full`}
      onClick={onClick}
      style={{ backgroundColor: "#ff4f00" }}
    >
      {children}
    </div>
  );
};
