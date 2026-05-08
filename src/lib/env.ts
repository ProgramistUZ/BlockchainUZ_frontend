import { z } from "zod";

// `NEXT_PUBLIC_*` vars are inlined at build time, so we cannot loop over
// process.env — each value must be referenced literally.
const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_CHAOS: process.env.NEXT_PUBLIC_CHAOS,
};

const booleanFlag = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080/api"),
  NEXT_PUBLIC_USE_MOCKS: booleanFlag,
  NEXT_PUBLIC_APP_NAME: z.string().default("BlockchainUZ"),
  /** Injects occasional 500s into MSW handlers so you can demo error states. */
  NEXT_PUBLIC_CHAOS: booleanFlag,
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment configuration.\n${issues}\n\n` +
      `Check your .env.local — see README.md → Environment variables.`,
  );
}

export const env = parsed.data;
