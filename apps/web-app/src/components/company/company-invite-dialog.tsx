import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
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
import { cn } from "@/lib/utils";

interface CompanyInviteDialogProps {
  developer: DeveloperUser;
  trigger?: ReactNode;
  onSuccess?: () => void;
}

interface ModalTriggerProps {
  trigger: ReactNode;
  onOpen: () => void;
}

const inviteTypes = [
  CompanyInviteType.CONTRACT,
  CompanyInviteType.FULL_TIME,
  CompanyInviteType.BOUNTY,
  CompanyInviteType.GRANT,
  CompanyInviteType.SPONSORSHIP,
  CompanyInviteType.ADVISORY,
] as const;

function ModalTrigger({ trigger, onOpen }: ModalTriggerProps) {
  if (
    isValidElement<{
      onClick?: (event: MouseEvent<HTMLElement>) => void;
    }>(trigger)
  ) {
    return cloneElement(trigger, {
      onClick: (event: MouseEvent<HTMLElement>) => {
        trigger.props.onClick?.(event);
        if (!event.isPropagationStopped()) onOpen();
      },
    });
  }

  return (
    <button type="button" className="contents" onClick={onOpen}>
      {trigger}
    </button>
  );
}

export default function CompanyInviteDialog({
  developer,
  trigger,
  onSuccess,
}: CompanyInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [type, setType] = useState<CompanyInviteType>(
    CompanyInviteType.CONTRACT,
  );
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
        <ModalTrigger trigger={trigger} onOpen={() => setOpen(true)} />
      ) : (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          Invite developer
        </Button>
      )}

      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="company-invite-title"
      >
        <div className="space-y-4 pr-8">
          <div className="space-y-1">
            <Typography
              as="h2"
              variant="h5"
              id="company-invite-title"
              className="text-content-primary"
            >
              Invite @{developer.username}
            </Typography>
            <Typography
              as="p"
              variant="muted"
              className="text-content-secondary"
            >
              Send a structured company opportunity, grant, bounty, or
              sponsorship invite.
            </Typography>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-inset p-3">
            <img
              src={
                developer.avatarUrl ||
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              }
              alt={displayName}
              className="size-10 rounded-full border border-line bg-surface object-cover"
            />
            <div className="min-w-0">
              <Typography
                as="p"
                variant="h6"
                className="truncate text-content-primary"
              >
                {displayName}
              </Typography>
              <Typography
                as="p"
                variant="caption"
                className="truncate text-content-tertiary"
              >
                @{developer.username}
              </Typography>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <Typography
                as="span"
                variant="label"
                className="text-content-tertiary"
              >
                Company name
              </Typography>
              <Input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
                placeholder="Acme Labs"
              />
            </label>

            <label className="space-y-2">
              <Typography
                as="span"
                variant="label"
                className="text-content-tertiary"
              >
                Work email
              </Typography>
              <Input
                type="email"
                value={companyEmail}
                onChange={(event) => setCompanyEmail(event.target.value)}
                className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
                placeholder="team@company.com"
              />
            </label>
          </div>

          <div className="space-y-2">
            <Typography
              as="p"
              variant="label"
              className="text-content-tertiary"
            >
              Invite type
            </Typography>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {inviteTypes.map((inviteType) => (
                <button
                  key={inviteType}
                  type="button"
                  onClick={() => setType(inviteType)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    type === inviteType
                      ? "border-action-primary/50 bg-action-primary/15 text-content-primary"
                      : "border-line bg-surface-inset text-content-secondary hover:border-line-strong hover:bg-surface-raised hover:text-content-primary",
                  )}
                >
                  {formatCompanyInviteType(inviteType)}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <Typography
              as="span"
              variant="label"
              className="text-content-tertiary"
            >
              Opportunity title
            </Typography>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
              placeholder="Build a Solana payments integration"
            />
          </label>

          <label className="block space-y-2">
            <Typography
              as="span"
              variant="label"
              className="text-content-tertiary"
            >
              Message
            </Typography>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-line bg-surface-inset px-3 py-2 text-sm text-content-primary outline-none transition-[border-color,box-shadow] placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus"
              placeholder="Tell the developer why you are inviting them and what success looks like."
            />
          </label>

          <label className="block space-y-2">
            <Typography
              as="span"
              variant="label"
              className="text-content-tertiary"
            >
              Proposed reward
            </Typography>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rewardAmount}
                onChange={(event) => setRewardAmount(event.target.value)}
                className="border-line bg-surface-inset text-content-primary placeholder:text-content-tertiary focus-visible:border-focus focus-visible:ring-focus"
                placeholder="0.5"
              />
              <span className="rounded-xl border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-content-secondary">
                {SupportedTipToken.SOL}
              </span>
            </div>
          </label>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-line bg-surface-inset text-content-primary hover:border-line-strong hover:bg-surface-raised hover:text-content-primary focus-visible:ring-focus"
            >
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
