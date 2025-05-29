export const ZapCell = ({
  name,
  index,
  onClick,
}: {
  name?: string;
  index: number;
  onClick: () => void;
}) => {
  return (
    <div
      className="w-[300px] p-6 bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 text-lg text-gray-800">
        <span className="text-blue-600 font-bold">{index}.</span>
        <span className="font-medium truncate">{name || "Untitled Zap"}</span>
      </div>
    </div>
  );
};
