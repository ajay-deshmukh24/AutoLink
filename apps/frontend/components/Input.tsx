"use client";

export const Input = ({
  label,
  placeholder,
  onChange,
  value,
  type = "text",
}: {
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  type?: "text" | "password";
}) => {
  return (
    <div>
      <div className="text-sm pb-1 pt-2">
        * <label htmlFor="">{label}</label>
      </div>
      <input
        className="border rounded px-2 py-2 w-full border-black"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};
