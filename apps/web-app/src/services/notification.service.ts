import { trpc } from "@/trpc/client";

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
  txHash: string | null;
  createdAt: string;
  sender: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
}

class NotificationService {
  static async getUserNotifications(): Promise<UserNotification[]> {
    const response = await trpc.account.notifications.list.query();
    return response as unknown as UserNotification[];
  }

  static async clearUserNotifications() {
    const response = await trpc.account.notifications.clear.mutate();
    return response as unknown as {
      success: boolean;
      notificationsClearedAt: string;
    };
  }
}

export default NotificationService;
