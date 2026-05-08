import { describe, expect, it } from "vitest";
import { classifySearch, routeForSearch } from "./search";

describe("classifySearch", () => {
  it("treats blank input as empty", () => {
    expect(classifySearch("")).toEqual({ kind: "empty" });
    expect(classifySearch("   ")).toEqual({ kind: "empty" });
  });

  it("recognises plain integers as block numbers", () => {
    expect(classifySearch("42")).toEqual({ kind: "block", value: 42 });
    expect(classifySearch("  18946231 ")).toEqual({
      kind: "block",
      value: 18946231,
    });
  });

  it("rejects negative numbers and non-integers", () => {
    expect(classifySearch("-1").kind).toBe("invalid");
    expect(classifySearch("1.5").kind).toBe("invalid");
  });

  it("recognises 40-char hex addresses", () => {
    const addr = "0x" + "a".repeat(40);
    expect(classifySearch(addr)).toEqual({ kind: "address", value: addr });
  });

  it("lowercases 64-char hashes for canonical lookup", () => {
    const hash = "0x" + "A".repeat(64);
    expect(classifySearch(hash)).toEqual({
      kind: "hash",
      value: "0x" + "a".repeat(64),
    });
  });

  it("marks mismatched hex lengths as invalid", () => {
    expect(classifySearch("0xabc").kind).toBe("invalid");
    expect(classifySearch("0x" + "a".repeat(41)).kind).toBe("invalid");
    expect(classifySearch("not-a-hash").kind).toBe("invalid");
  });
});

describe("routeForSearch", () => {
  it("routes block numbers", () => {
    expect(routeForSearch({ kind: "block", value: 7 })).toBe("/blocks/7");
  });

  it("routes addresses", () => {
    const addr = "0x" + "b".repeat(40);
    expect(routeForSearch({ kind: "address", value: addr })).toBe(
      `/wallets/${addr}`,
    );
  });

  it("defers 64-char hashes to server-side resolution", () => {
    expect(
      routeForSearch({ kind: "hash", value: "0x" + "c".repeat(64) }),
    ).toBeNull();
  });

  it("returns null for unresolvable inputs", () => {
    expect(routeForSearch({ kind: "empty" })).toBeNull();
    expect(routeForSearch({ kind: "invalid" })).toBeNull();
  });
});
