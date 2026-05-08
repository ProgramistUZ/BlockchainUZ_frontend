import { describe, expect, it } from "vitest";
import {
  formatEth,
  formatInt,
  formatRelative,
  formatTimestamp,
  truncateHex,
} from "./format";

describe("truncateHex", () => {
  it("returns input untouched when short", () => {
    expect(truncateHex("0xabcd")).toBe("0xabcd");
  });

  it("keeps head + tail around an ellipsis", () => {
    const hash = "0x" + "ab".repeat(32);
    expect(truncateHex(hash, 6, 4)).toBe("0xabab…abab");
  });
});

describe("formatEth", () => {
  it("formats 1.5 according to locale", () => {
    expect(formatEth("1.5", "en-US")).toBe("1.5");
    expect(formatEth("1.5", "pl-PL")).toBe("1,5");
  });

  it("caps fraction digits", () => {
    expect(formatEth("0.123456789012", "en-US")).toBe("0.123457");
  });

  it("returns original string on non-numeric input", () => {
    expect(formatEth("nonsense")).toBe("nonsense");
  });
});

describe("formatInt", () => {
  it("groups thousands", () => {
    expect(formatInt(1234567, "en-US")).toBe("1,234,567");
    expect(formatInt(1234567, "pl-PL")).toContain("234");
  });
});

describe("formatTimestamp", () => {
  it("returns input verbatim for invalid dates", () => {
    expect(formatTimestamp("not-a-date")).toBe("not-a-date");
  });
});

describe("formatRelative", () => {
  it("speaks minutes for recent timestamps", () => {
    const now = new Date("2026-05-08T12:00:00Z");
    const twoMinAgo = new Date(now.getTime() - 2 * 60_000).toISOString();
    expect(formatRelative(twoMinAgo, "en", now)).toMatch(/2 minutes ago/);
  });

  it("returns input verbatim for invalid dates", () => {
    expect(formatRelative("whatever")).toBe("whatever");
  });
});
