import Typography from "@/components/typography";

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
        <div
          key={item.label}
          className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4"
        >
          <Typography as="p" variant="caption">
            {item.label}
          </Typography>
          <Typography as="p" variant="h4" className="mt-1">
            {item.value}
          </Typography>
          {item.description && (
            <Typography as="p" variant="caption" className="mt-1">
              {item.description}
            </Typography>
          )}
        </div>
      ))}
    </div>
  );
}
