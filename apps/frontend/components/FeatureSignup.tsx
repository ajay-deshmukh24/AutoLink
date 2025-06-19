import { CheckCircle2 } from "lucide-react";

export const FeatureSignup = ({ label }: { label: string }) => {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="text-green-600 mt-1" size={20} />
      <span className="text-sm md:text-base text-muted-foreground">
        {label}
      </span>
    </div>
  );
};
