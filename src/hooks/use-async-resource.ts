"use client";

import { useEffect, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useAsyncResource<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          error: err instanceof Error ? err : new Error(String(err)),
          loading: false,
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
