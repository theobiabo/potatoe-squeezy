import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import { Button } from "@/components/ui/button";
import GatedContentService from "@/services/gated-content.service";

interface SponsorGatedContentProps {
  username: string;
}

export default function SponsorGatedContent({
  username,
}: SponsorGatedContentProps) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["public-gated-content", username],
    queryFn: () => GatedContentService.getPublic(username),
    enabled: Boolean(username),
  });

  const unlock = async (id: string) => {
    try {
      const response = await GatedContentService.requestAccess(id);
      window.open(response.accessUrl, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          "A qualifying tip is required to unlock this.",
      );
    }
  };

  if (isLoading || items.length === 0) {
    return null;
  }

  return (
    <ProfileSection
      title="Sponsor-gated content"
      description="Unlock creator resources after a qualifying verified tip."
    >
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Typography as="p" variant="h6">
                {item.title}
              </Typography>
              {item.description && (
                <Typography as="p" variant="caption" className="mt-1">
                  {item.description}
                </Typography>
              )}
              <Typography as="p" variant="caption" className="mt-1">
                Requires {Number(item.minAmount).toLocaleString()}{" "}
                {item.currency}
              </Typography>
            </div>
            <Button variant="outline" onClick={() => unlock(item.id)}>
              Unlock
            </Button>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
