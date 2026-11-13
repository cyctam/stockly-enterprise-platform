import { useCallback, useEffect, useRef, useState } from "react";

export default function useAsync(asyncFn, options = {}) {
  const { immediate = true, initialData = null } = options;

  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(immediate ? "loading" : "idle");
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await asyncFn(...args);
        if (mountedRef.current) {
          setData(result);
          setStatus("success");
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setStatus("error");
        }
        throw err;
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (immediate) {
      run();
    }
  }, [immediate, run]);

  return {
    data,
    status,
    error,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    run,
    setData,
  };
}
