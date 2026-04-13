import { blockHandlers } from "./blocks";
import { transactionHandlers } from "./transactions";
import { walletHandlers } from "./wallets";
import { authHandlers } from "./auth";

export const handlers = [
  ...blockHandlers,
  ...transactionHandlers,
  ...walletHandlers,
  ...authHandlers,
];
