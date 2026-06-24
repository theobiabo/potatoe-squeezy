import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GatedContentService from "@/services/gated-content.service";

const initialForm = {
  title: "",
  description: "",
  resourceUrl: "",
  minAmount: "",
};

export default function GatedContentPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-gated-content"],
    queryFn: () => GatedContentService.getMine(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      GatedContentService.create({
        title: form.title.trim(),
        description: form.description.trim() || null,
        resourceUrl: form.resourceUrl.trim(),
        minAmount: Number(form.minAmount),
        currency: "SOL",
        rail: "solana",
      }),
    onSuccess: () => {
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["my-gated-content"] });
      toast.success("Gated content created.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error || "Failed to create gated content.",
      );
    },
  });

  const canSubmit =
    form.title.trim() &&
    form.resourceUrl.trim() &&
    Number.isFinite(Number(form.minAmount)) &&
    Number(form.minAmount) > 0;

  return (
    <ProfileSection
      title="Sponsor-gated content"
      description="Share a link or file URL that unlocks after a qualifying recorded tip."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Content title"
          value={form.title}
          maxLength={100}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Minimum tip in SOL"
          value={form.minAmount}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              minAmount: event.target.value,
            }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Input
          placeholder="https://..."
          value={form.resourceUrl}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              resourceUrl: event.target.value,
            }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
      </div>

      <Button
        className="mt-3"
        disabled={!canSubmit || createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        {createMutation.isPending ? "Saving..." : "Add gated link"}
      </Button>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <Typography as="p" variant="muted">
            Loading gated content.
          </Typography>
        )}
        {!isLoading &&
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Typography as="p" variant="h6">
                    {item.title}
                  </Typography>
                  <Typography as="p" variant="caption" className="mt-1">
                    Unlocks at {Number(item.minAmount).toLocaleString()}{" "}
                    {item.currency}
                  </Typography>
                </div>
                <span className="text-xs text-[#8b949e]">
                  {item.active === false ? "Archived" : "Active"}
                </span>
              </div>
            </div>
          ))}
        {!isLoading && items.length === 0 && (
          <Typography as="p" variant="muted">
            No gated content yet.
          </Typography>
        )}
      </div>
    </ProfileSection>
  );
}
