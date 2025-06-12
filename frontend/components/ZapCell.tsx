import { X } from "lucide-react";

export const ZapCell = ({
  name,
  index,
  onClick,
  onDelete, // new optional delete handler
}: {
  name?: string;
  index: number;
  onClick: () => void;
  onDelete?: () => void;
}) => {
  return (
    <div className="relative w-[300px] p-6 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all cursor-pointer">
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering onClick
            onDelete();
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Zap content */}
      <div
        className="flex items-center space-x-3 text-lg text-gray-800"
        onClick={onClick}
      >
        <span className="text-blue-600 font-bold">{index}.</span>
        <span className="font-medium truncate">{name || "Untitled Zap"}</span>
      </div>
    </div>
  );
};
