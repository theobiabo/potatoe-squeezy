import { trpc } from "@/trpc/client";

interface WalletPayload {
  chain: string;
  address: string;
}

interface WalletResponse {
  id: number;
  userId: number;
  chain: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

class WalletService {
  static async getWalletAddress() {
    const response = await trpc.account.wallets.list.query();
    return response as unknown as WalletResponse[];
  }

  static async addWallet(payload: WalletPayload) {
    const response = await trpc.account.wallets.upsert.mutate(payload);
    return response as unknown as WalletResponse;
  }

  static async updateWallet(payload: WalletPayload) {
    const response = await trpc.account.wallets.upsert.mutate(payload);
    return response as unknown as WalletResponse;
  }
}

export default WalletService;
