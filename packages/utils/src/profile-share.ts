import { ProfileShareKind } from "@potatoe/enum";

const getOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};

const cleanOrigin = (origin?: string | null) =>
  (origin || getOrigin()).replace(/\/+$/, "");

interface ProfileShareOptions {
  appOrigin?: string | null;
  apiOrigin?: string | null;
}

export const buildDeveloperProfilePath = (username: string) =>
  `/app/dev/${encodeURIComponent(username)}`;

export const buildDeveloperProfileUrl = (
  username: string,
  appOrigin?: string | null,
) => `${cleanOrigin(appOrigin)}${buildDeveloperProfilePath(username)}`;

export const buildTipBadgeUrl = (username: string, apiOrigin?: string | null) =>
  `${cleanOrigin(apiOrigin)}/embed/tip-badge.svg?user=${encodeURIComponent(username)}`;

export const buildTipBadgeClickUrl = (
  username: string,
  apiOrigin?: string | null,
) => `${cleanOrigin(apiOrigin)}/embed/${encodeURIComponent(username)}/click`;

export const buildReadmeBadgeMarkdown = (
  username: string,
  options: ProfileShareOptions = {},
) =>
  `[![Tip ${username} on Potatoe Squeezy](${buildTipBadgeUrl(username, options.apiOrigin)})](${buildTipBadgeClickUrl(username, options.apiOrigin)})`;

export const buildSocialShareText = (
  username: string,
  options: ProfileShareOptions = {},
) =>
  `Support @${username}'s open-source work on Potatoe Squeezy ${buildDeveloperProfileUrl(username, options.appOrigin)}`;

export const getProfileShareValue = (
  username: string,
  kind: ProfileShareKind,
  options: ProfileShareOptions = {},
) => {
  if (kind === ProfileShareKind.README) {
    return buildReadmeBadgeMarkdown(username, options);
  }

  if (kind === ProfileShareKind.SOCIAL) {
    return buildSocialShareText(username, options);
  }

  return buildDeveloperProfileUrl(username, options.appOrigin);
};
