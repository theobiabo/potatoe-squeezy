import { router } from './trpc';
import { accountRouter } from './routers/account';
import { publicRouter } from './routers/public';
import { transactionsRouter } from './routers/transactions';

export const appRouter = router({
  account: accountRouter,
  public: publicRouter,
  transactions: transactionsRouter,
});

export type AppRouter = typeof appRouter;
