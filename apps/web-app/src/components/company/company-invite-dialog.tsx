import { useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompanyInviteType, SupportedTipToken } from "@potatoe/enum";
import { formatCompanyInviteType, getDisplayName } from "@potatoe/utils";
import CustomModal from "@/components/popups/modals/custom-modal";
import Typography from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CompanyService from "@/services/company.service";
import type { DeveloperUser } from "@/types/developer-profile";

interface CompanyInviteDialogProps {
  developer: DeveloperUser;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

const inviteTypes = [
  CompanyInviteType.CONTRACT,
  CompanyInviteType.FULL_TIME,
  CompanyInviteType.BOUNTY,
  CompanyInviteType.GRANT,
  CompanyInviteType.SPONSORSHIP,
  CompanyInviteType.ADVISORY,
] as const;

export default function CompanyInviteDialog({
  developer,
  trigger,
  onSuccess,
}: CompanyInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [type, setType] = useState<CompanyInviteType>(CompanyInviteType.CONTRACT);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const displayName = getDisplayName(developer.displayName, developer.username);

  const parsedRewardAmount = useMemo(() => {
    if (!rewardAmount.trim()) return null;
    const value = Number(rewardAmount);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [rewardAmount]);

  const canSubmit =
    companyName.trim().length > 1 &&
    companyEmail.trim().length > 3 &&
    title.trim().length > 2 &&
    message.trim().length > 8;

  const mutation = useMutation({
    mutationFn: () =>
      CompanyService.createInvite({
        developerUsername: developer.username,
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        type,
        title: title.trim(),
        message: message.trim(),
        proposedRewardAmount: parsedRewardAmount,
        proposedRewardToken: parsedRewardAmount ? SupportedTipToken.SOL : null,
      }),
    onSuccess: () => {
      toast.success(`Invite sent to @${developer.username}`);
      setOpen(false);
      setTitle("");
      setMessage("");
      setRewardAmount("");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Could not send company invite yet");
    },
  });

  return (
    <>
      {trigger ? (
        <button type="button" className="contents" onClick={() => setOpen(true)}>
          {trigger}
        </button>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
          Invite developer
        </Button>
      )}

      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="company-invite-title"
      >
        <div className="space-y-5 pr-8">
          <div>
            <Typography as="h2" variant="h5" id="company-invite-title">
              Invite @{developer.username}
            </Typography>
            <Typography as="p" variant="muted" className="mt-1">
              Send a structured company opportunity, grant, bounty, or sponsorship invite.
            </Typography>
          </div>

          <div className="flex items-center gap-3 rounded-[18px] border border-[#2b2933] bg-[#15131d] p-3">
            <img
              src={
                developer.avatarUrl ||
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              }
              alt={displayName}
              className="h-10 w-10 rounded-full border border-[#2b2933] object-cover"
            />
            <div className="min-w-0">
              <Typography as="p" variant="h6" className="truncate">
                {displayName}
              </Typography>
              <Typography as="p" variant="caption" className="truncate">
                @{developer.username}
              </Typography>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <Typography as="span" variant="label">
                Company name
              </Typography>
              <Input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="border-[#2b2933] bg-[#0f0d16] text-white"
                placeholder="Acme Labs"
              />
            </label>

            <label className="space-y-2">
              <Typography as="span" variant="label">
                Work email
              </Typography>
              <Input
                type="email"
                value={companyEmail}
                onChange={(event) => setCompanyEmail(event.target.value)}
                className="border-[#2b2933] bg-[#0f0d16] text-white"
                placeholder="team@company.com"
              />
            </label>
          </div>

          <div className="space-y-2">
            <Typography as="p" variant="label">
              Invite type
            </Typography>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {inviteTypes.map((inviteType) => (
                <button
                  key={inviteType}
                  type="button"
                  onClick={() => setType(inviteType)}
                  className={
                    type === inviteType
                      ? "rounded-md border border-orange-500/50 bg-orange-500/15 px-3 py-2 text-sm font-medium text-orange-300"
                      : "rounded-md border border-[#2b2933] bg-[#15131d] px-3 py-2 text-sm font-medium text-[#c9d1d9] transition hover:bg-[#1c1925]"
                  }
                >
                  {formatCompanyInviteType(inviteType)}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 block">
            <Typography as="span" variant="label">
              Opportunity title
            </Typography>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="border-[#2b2933] bg-[#0f0d16] text-white"
              placeholder="Build a Solana payments integration"
            />
          </label>

          <label className="space-y-2 block">
            <Typography as="span" variant="label">
              Message
            </Typography>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-28 w-full rounded-md border border-[#2b2933] bg-[#0f0d16] px-3 py-2 text-sm text-white outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500/40"
              placeholder="Tell the developer why you are inviting them and what success looks like."
            />
          </label>

          <label className="space-y-2 block">
            <Typography as="span" variant="label">
              Proposed reward
            </Typography>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rewardAmount}
                onChange={(event) => setRewardAmount(event.target.value)}
                className="border-[#2b2933] bg-[#0f0d16] text-white"
                placeholder="0.5"
              />
              <span className="rounded-md border border-[#2b2933] bg-[#15131d] px-3 py-2 text-sm text-[#c9d1d9]">
                {SupportedTipToken.SOL}
              </span>
            </div>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending ? "Sending invite" : "Send invite"}
            </Button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
