import { MetricTile } from "@/components/workspace";

export interface ProfileStatItem {
  label: string;
  value: string | number;
  description?: string;
}

interface ProfileStatsGridProps {
  items: ProfileStatItem[];
}

export default function ProfileStatsGrid({ items }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <MetricTile
          key={item.label}
          label={item.label}
          value={item.value}
          detail={item.description}
        />
      ))}
    </div>
  );
}
