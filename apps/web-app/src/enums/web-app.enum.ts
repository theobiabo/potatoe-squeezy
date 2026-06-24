export enum SupportedTipToken {
  SOL = "SOL",
}

export enum SupportedTipNetwork {
  SOLANA = "solana",
}

export enum ProfileShareKind {
  LINK = "link",
  README = "readme",
  SOCIAL = "social",
}

export const DEFAULT_TIP_AMOUNTS = [0.05, 0.1, 0.25, 0.5] as const;
