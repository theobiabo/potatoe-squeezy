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

const tierTemplates = [
  {
    label: "Buy me a coffee",
    description: "A small thank-you for open-source work.",
    amount: "0.05",
    perk: "A thank-you in the project feed.",
  },
  {
    label: "Support a feature",
    description: "Help fund the next useful improvement.",
    amount: "0.25",
    perk: "Progress updates as the feature ships.",
  },
  {
    label: "Sponsor a sprint",
    description: "Back a focused block of project work.",
    amount: "1",
    perk: "A sponsor mention in the release notes.",
  },
] as const;

const tierFields = [
  {
    name: "label",
    placeholder: "Coffee",
    maxLength: 40,
    ariaLabel: "Sponsorship tier label",
  },
  {
    name: "description",
    placeholder: "Short description",
    maxLength: 180,
    ariaLabel: "Sponsorship tier description",
  },
  {
    name: "amount",
    type: "number",
    min: "0",
    step: "0.01",
    placeholder: "1",
    ariaLabel: "Sponsorship tier amount",
  },
] as const;

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
  const activeTiers = tiers.filter((tier) => tier.active !== false);

  const applyTemplate = (template: (typeof tierTemplates)[number]) => {
    setForm({ ...template });
  };

  return (
    <ProfileSection
      title="Sponsorship tiers"
      description="Create reusable amounts supporters can pick when tipping."
      className="border-line bg-surface-raised shadow-none"
    >
      <div className="mb-3">
        <Typography
          as="p"
          variant="label"
          className="mb-2 text-content-tertiary"
        >
          Quick start
        </Typography>
        <div className="grid gap-2 sm:grid-cols-3">
          {tierTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template)}
              className="group rounded-xl border border-line bg-surface-inset p-3 text-left outline-none transition-colors hover:border-action-primary/50 hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="block text-sm font-semibold text-content-primary group-hover:text-action-primary">
                {template.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-content-secondary">
                {template.amount} SOL
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        role="group"
        aria-label="Create sponsorship tier"
        className="rounded-xl border border-line bg-surface-inset p-3"
      >
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_120px]">
          {tierFields.map(({ name, ariaLabel, ...field }) => (
            <Input
              key={name}
              {...field}
              aria-label={ariaLabel}
              value={form[name]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
              className="border-line bg-surface-raised text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
            />
          ))}
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Optional perk"
            value={form.perk}
            maxLength={180}
            aria-label="Sponsorship tier perk"
            onChange={(event) =>
              setForm((current) => ({ ...current, perk: event.target.value }))
            }
            className="border-line bg-surface-raised text-content-primary placeholder:text-content-tertiary focus-visible:border-action-primary focus-visible:ring-focus"
          />
          <Button
            disabled={!canSubmit || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="bg-action-primary text-action-primary-foreground hover:bg-action-primary/90 focus-visible:ring-focus"
          >
            {createMutation.isPending ? "Saving..." : "Add tier"}
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface-inset">
        {isLoading ? (
          <Typography
            as="p"
            variant="muted"
            className="px-3.5 py-4 text-content-secondary"
          >
            Loading tiers.
          </Typography>
        ) : activeTiers.length === 0 ? (
          <Typography
            as="p"
            variant="muted"
            className="px-3.5 py-4 text-content-secondary"
          >
            No sponsorship tiers yet.
          </Typography>
        ) : (
          <div className="divide-y divide-line">
            {activeTiers.map((tier) => (
              <article
                key={tier.id}
                className="flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Typography
                    as="p"
                    variant="h5"
                    className="text-content-primary"
                  >
                    {tier.label} · {Number(tier.amount).toLocaleString()}{" "}
                    {tier.currency}
                  </Typography>
                  <Typography
                    as="p"
                    variant="caption"
                    className="mt-1 text-content-secondary"
                  >
                    {tier.description}
                    {tier.perk ? ` Perk: ${tier.perk}` : ""}
                  </Typography>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(tier.id)}
                  className="border-line bg-surface-raised text-content-secondary hover:bg-surface-inset hover:text-content-primary focus-visible:ring-focus"
                >
                  Archive
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </ProfileSection>
  );
}
