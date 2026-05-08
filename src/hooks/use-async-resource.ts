"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** Manually re-run the loader without resetting data (keeps previous data visible). */
  refresh: () => void;
};

export function useAsyncResource<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);
  const runId = useRef(0);

  const run = useCallback(
    (options: { resetData: boolean }) => {
      const id = ++runId.current;
      if (options.resetData) {
        setData(null);
      }
      setError(null);
      setLoading(true);
      load()
        .then((next) => {
          if (cancelledRef.current || runId.current !== id) return;
          setData(next);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (cancelledRef.current || runId.current !== id) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        });
    },
    [load],
  );

  useEffect(() => {
    cancelledRef.current = false;
    run({ resetData: true });
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => {
    run({ resetData: false });
  }, [run]);

  return { data, error, loading, refresh };
}
