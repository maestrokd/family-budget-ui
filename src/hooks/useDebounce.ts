import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of the provided value. The returned value updates
 * only after the specified delay has elapsed since the last change.
 *
 * @param value The input value to debounce
 * @param delay Delay in milliseconds (default: 400ms)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
