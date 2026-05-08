import { blockHandlers } from "./blocks";
import { transactionHandlers } from "./transactions";
import { walletHandlers } from "./wallets";

export const handlers = [
  ...blockHandlers,
  ...transactionHandlers,
  ...walletHandlers,
];
