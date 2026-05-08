import "@testing-library/jest-dom/vitest";

// Stub env vars the app reads at import time so tests don't fail on validation.
Object.assign(process.env, {
  NEXT_PUBLIC_API_URL: "http://localhost:8080/api",
  NEXT_PUBLIC_USE_MOCKS: "false",
  NEXT_PUBLIC_APP_NAME: "BlockchainUZ",
  NEXT_PUBLIC_CHAOS: "false",
});
