import { ReactNode } from "react";

export const SecondaryButton = ({
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
        size === "small" ? "text-sm px-8 pt-2" : "text-xl px-18 py-3"
      } text-black cursor-pointer hover:shadow-md rounded-full`}
      onClick={onClick}
      style={{ border: "1px solid black" }}
    >
      {children}
    </div>
  );
};
