import { Gift, Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissionCardProps {
  icon: "gift" | "compass" | "heart";
  title: string;
  description: string;
}

export default function MissionCard({
  icon,
  title,
  description,
}: MissionCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "gift":
        return <Gift className="h-8 w-8" />;
      case "compass":
        return <Compass className="h-8 w-8" />;
      case "heart":
        return <Heart className="h-8 w-8" />;
      default:
        return null;
    }
  };

  return (
    <div className="group flex flex-col items-center text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 group-hover:border-red-500 group-hover:text-red-500">
        {getIcon()}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-4 text-muted-foreground">{description}</p>
    </div>
  );
}
