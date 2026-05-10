import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAsyncResource } from "./use-async-resource";

describe("useAsyncResource", () => {
  it("starts in a loading state with no data", () => {
    const load = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useAsyncResource(load, []));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("resolves to data and clears loading", async () => {
    const load = vi.fn(async () => ({ hello: "world" }));
    const { result } = renderHook(() => useAsyncResource(load, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ hello: "world" });
    expect(result.current.error).toBeNull();
  });

  it("surfaces errors as Error instances", async () => {
    const load = vi.fn(async () => {
      throw "boom";
    });
    const { result } = renderHook(() => useAsyncResource(load, []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
  });

  it("refresh keeps previous data visible while reloading", async () => {
    let counter = 0;
    const load = vi.fn(async () => ({ n: ++counter }));
    const { result } = renderHook(() => useAsyncResource(load, []));
    await waitFor(() => expect(result.current.data).toEqual({ n: 1 }));

    await act(async () => {
      result.current.refresh();
    });

    // Data remains visible while new request flies (no reset to null).
    await waitFor(() => expect(result.current.data).toEqual({ n: 2 }));
    expect(load).toHaveBeenCalledTimes(2);
  });
});
