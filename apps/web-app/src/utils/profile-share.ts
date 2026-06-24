import { ProfileShareKind } from "@/enums/web-app.enum";

const getOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

export const buildDeveloperProfilePath = (username: string) =>
  `/app/dev/${encodeURIComponent(username)}`;

export const buildDeveloperProfileUrl = (username: string) =>
  `${getOrigin()}${buildDeveloperProfilePath(username)}`;

export const buildTipBadgeUrl = (username: string) =>
  `${getOrigin()}/embed/tip-badge?user=${encodeURIComponent(username)}`;

export const buildReadmeBadgeMarkdown = (username: string) =>
  `[![Tip ${username} on Potatoe Squeezy](${buildTipBadgeUrl(username)})](${buildDeveloperProfileUrl(username)})`;

export const buildSocialShareText = (username: string) =>
  `Support @${username}'s open-source work on Potatoe Squeezy  ${buildDeveloperProfileUrl(username)}`;

export const getProfileShareValue = (
  username: string,
  kind: ProfileShareKind,
) => {
  if (kind === ProfileShareKind.README)
    return buildReadmeBadgeMarkdown(username);
  if (kind === ProfileShareKind.SOCIAL) return buildSocialShareText(username);
  return buildDeveloperProfileUrl(username);
};
