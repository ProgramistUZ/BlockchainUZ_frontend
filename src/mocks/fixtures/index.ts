import { generateFixtures } from "./generate";

// Generated once at module load. Deterministic thanks to the seeded PRNG.
export const fixtures = generateFixtures();

export const { blocks, transactions, wallets, addressBook } = fixtures;
