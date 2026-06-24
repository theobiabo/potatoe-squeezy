export function formatUsd(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

export function formatPoints(value: string | number) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function formatTokenAmount(value: string | number, token: string) {
  return `${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })} ${token}`;
}

export function getDisplayName(
  displayName: string | null | undefined,
  username: string,
) {
  return displayName?.trim() || username;
}

export function getInitials(value: string) {
  return value.trim().slice(0, 2).toUpperCase();
}
