import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SponsorshipService from "@/services/sponsorship.service";

const initialForm = {
  label: "",
  description: "",
  perk: "",
  amount: "",
};

export default function SponsorshipTiersPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["my-sponsorship-tiers"],
    queryFn: () => SponsorshipService.getMyTiers(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      SponsorshipService.createTier({
        label: form.label.trim(),
        description: form.description.trim(),
        perk: form.perk.trim() || null,
        amount: Number(form.amount),
        currency: "SOL",
        rail: "solana",
      }),
    onSuccess: () => {
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["my-sponsorship-tiers"] });
      toast.success("Sponsorship tier created.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to create tier.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => SponsorshipService.deleteTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sponsorship-tiers"] });
      toast.success("Tier archived.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to archive tier.");
    },
  });

  const canSubmit =
    form.label.trim() &&
    form.description.trim() &&
    Number.isFinite(Number(form.amount)) &&
    Number(form.amount) > 0;

  return (
    <ProfileSection
      title="Sponsorship tiers"
      description="Create reusable amounts supporters can pick when tipping."
    >
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
        <Input
          placeholder="Coffee"
          value={form.label}
          maxLength={40}
          onChange={(event) =>
            setForm((current) => ({ ...current, label: event.target.value }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Input
          placeholder="Short description"
          value={form.description}
          maxLength={180}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="1"
          value={form.amount}
          onChange={(event) =>
            setForm((current) => ({ ...current, amount: event.target.value }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder="Optional perk"
          value={form.perk}
          maxLength={180}
          onChange={(event) =>
            setForm((current) => ({ ...current, perk: event.target.value }))
          }
          className="border-[#2b2933] bg-[#0f0d16] text-white"
        />
        <Button
          disabled={!canSubmit || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Saving..." : "Add tier"}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <Typography as="p" variant="muted">
            Loading tiers.
          </Typography>
        )}

        {!isLoading &&
          tiers
            .filter((tier) => tier.active !== false)
            .map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col gap-3 rounded-[8px] border border-[#2b2933] bg-[#15131d] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Typography as="p" variant="h6">
                    {tier.label} · {Number(tier.amount).toLocaleString()}{" "}
                    {tier.currency}
                  </Typography>
                  <Typography as="p" variant="caption" className="mt-1">
                    {tier.description}
                    {tier.perk ? ` Perk: ${tier.perk}` : ""}
                  </Typography>
                </div>
                <Button
                  variant="outline"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(tier.id)}
                >
                  Archive
                </Button>
              </div>
            ))}

        {!isLoading &&
          tiers.filter((tier) => tier.active !== false).length === 0 && (
            <Typography as="p" variant="muted">
              No sponsorship tiers yet.
            </Typography>
          )}
      </div>
    </ProfileSection>
  );
}
