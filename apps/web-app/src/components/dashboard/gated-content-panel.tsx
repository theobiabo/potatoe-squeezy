import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Typography from "@/components/typography";
import ProfileSection from "@/components/profile/sections/profile-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GatedContentService from "@/services/gated-content.service";

const initialForm = {
  title: "",
  description: "",
  resourceUrl: "",
  minAmount: "",
};

const gatedContentFields = [
  {
    name: "title",
    placeholder: "Content title",
    maxLength: 100,
    ariaLabel: "Gated content title",
  },
  {
    name: "minAmount",
    type: "number",
    min: "0",
    step: "0.01",
    placeholder: "Minimum tip in SOL",
    ariaLabel: "Minimum tip in SOL",
  },
  {
    name: "description",
    placeholder: "Description",
    ariaLabel: "Gated content description",
  },
  {
    name: "resourceUrl",
    placeholder: "https://...",
    ariaLabel: "Gated content resource URL",
  },
] as const;

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
      className="border-line bg-surface-raised shadow-none"
    >
      <div
        role="group"
        aria-label="Create sponsor-gated content"
        className="rounded-xl border border-line bg-surface-inset p-3"
      >
        <div className="grid gap-2 md:grid-cols-2">
          {gatedContentFields.map(({ name, ariaLabel, ...field }) => (
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

        <Button
          className="mt-2 bg-action-primary text-action-primary-foreground hover:bg-action-primary/90 focus-visible:ring-focus"
          disabled={!canSubmit || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Saving..." : "Add gated link"}
        </Button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface-inset">
        {isLoading ? (
          <Typography
            as="p"
            variant="muted"
            className="px-3.5 py-4 text-content-secondary"
          >
            Loading gated content.
          </Typography>
        ) : items.length === 0 ? (
          <Typography
            as="p"
            variant="muted"
            className="px-3.5 py-4 text-content-secondary"
          >
            No gated content yet.
          </Typography>
        ) : (
          <div className="divide-y divide-line">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Typography
                    as="p"
                    variant="h5"
                    className="text-content-primary"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    as="p"
                    variant="caption"
                    className="mt-1 text-content-secondary"
                  >
                    Unlocks at {Number(item.minAmount).toLocaleString()}{" "}
                    {item.currency}
                  </Typography>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.active === false
                      ? "border-line bg-surface-raised text-content-tertiary"
                      : "border-line-success bg-surface-raised text-content-success"
                  }
                >
                  {item.active === false ? "Archived" : "Active"}
                </Badge>
              </article>
            ))}
          </div>
        )}
      </div>
    </ProfileSection>
  );
}
