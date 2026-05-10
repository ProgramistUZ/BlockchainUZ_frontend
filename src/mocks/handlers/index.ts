import { blockHandlers } from "./blocks";
import { transactionHandlers } from "./transactions";
import { walletHandlers } from "./wallets";
import { reportHandlers } from "./reports";
import { syncHandlers } from "./sync";

export const handlers = [
  ...blockHandlers,
  ...transactionHandlers,
  ...walletHandlers,
  ...reportHandlers,
  ...syncHandlers,
];
