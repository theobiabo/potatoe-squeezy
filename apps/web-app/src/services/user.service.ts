import { trpc } from "@/trpc/client";

export interface UpdateUserProfilePayload {
  displayName?: string | null;
  email?: string | null;
  twitterUrl?: string | null;
  tippersPublic?: boolean;
  leaderboardOptIn?: boolean;
}

export interface UserRankBadge {
  name: string;
  minTips: number;
  maxTips: number | null;
}

export interface UserProfileResponse {
  user: any;
  wallet: any;
  wallets: any[];
  totalTipsReceived: string;
  totalTipsSent: string;
  totalTokensSent: string;
  sentTipCount: number;
  receivedTipCount: number;
  rankBadge: UserRankBadge | null;
}

export interface PublicTipperRecord {
  identityKey: string;
  userId: number | null;
  username: string;
  profileUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  senderType: "human" | "agent";
  senderAddress: string;
  totalAmount: string;
  tipCount: number;
  lastTippedAt: string | null;
}

export interface PublicTippersResponse {
  isPublic: boolean;
  tippers: PublicTipperRecord[];
}

class UserService {
  static async fetchUserProfile(): Promise<UserProfileResponse> {
    const response = await trpc.account.profile.get.query();
    return response as unknown as UserProfileResponse;
  }

  static async fetchUserWallets() {
    return trpc.account.wallets.list.query();
  }

  static async fetchAllPotatoeUsers() {
    return trpc.account.users.list.query();
  }

  static async updateUserProfile(data: UpdateUserProfilePayload) {
    const response = await trpc.account.profile.update.mutate(data);
    return response as unknown as UserProfileResponse;
  }

  static async fetchPublicTippers(username: string) {
    const response = await trpc.public.tippers.query({ username });
    return response as unknown as PublicTippersResponse;
  }
}
export default UserService;
