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
          className="rounded-[24px] border border-[#2b2933] bg-[#0f0d16] p-5"
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
