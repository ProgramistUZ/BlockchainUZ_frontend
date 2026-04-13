import type { Wallet } from "@/types/api";

// Shared wallet addresses used across fixtures
export const ADDRESSES = {
  alice: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
  bob: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  charlie: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
  dave: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
  eve: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
  frank: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
  grace: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
  heidi: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
  ivan: "0x47e179ec197488593b187f80a00eb0da91f1b9d0",
  judy: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
} as const;

export const wallets: Wallet[] = [
  {
    address: ADDRESSES.alice,
    balance: "142.583927184",
    transactionCount: 12,
    lastSeen: "2026-04-13T10:30:00Z",
  },
  {
    address: ADDRESSES.bob,
    balance: "89.127364821",
    transactionCount: 8,
    lastSeen: "2026-04-13T10:29:48Z",
  },
  {
    address: ADDRESSES.charlie,
    balance: "2531.449182736",
    transactionCount: 15,
    lastSeen: "2026-04-13T10:29:36Z",
  },
  {
    address: ADDRESSES.dave,
    balance: "0.384729103",
    transactionCount: 3,
    lastSeen: "2026-04-13T10:28:24Z",
  },
  {
    address: ADDRESSES.eve,
    balance: "47.891023456",
    transactionCount: 6,
    lastSeen: "2026-04-13T10:29:12Z",
  },
  {
    address: ADDRESSES.frank,
    balance: "518.203847192",
    transactionCount: 9,
    lastSeen: "2026-04-13T10:28:48Z",
  },
  {
    address: ADDRESSES.grace,
    balance: "3.172839405",
    transactionCount: 2,
    lastSeen: "2026-04-13T10:27:36Z",
  },
  {
    address: ADDRESSES.heidi,
    balance: "1284.918273645",
    transactionCount: 11,
    lastSeen: "2026-04-13T10:28:12Z",
  },
  {
    address: ADDRESSES.ivan,
    balance: "76.542918374",
    transactionCount: 5,
    lastSeen: "2026-04-13T10:27:24Z",
  },
  {
    address: ADDRESSES.judy,
    balance: "0.029384756",
    transactionCount: 1,
    lastSeen: "2026-04-13T10:26:48Z",
  },
];
