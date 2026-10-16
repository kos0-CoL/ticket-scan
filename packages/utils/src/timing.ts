export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  function debounced(...args: A) {
    lastArgs = args;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (lastArgs !== null) {
        fn(...lastArgs);
      }
      timeoutId = null;
    }, wait);
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return debounced;
}

export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let lastArgs: A | null = null;
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function throttled(...args: A) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    lastArgs = args;

    if (timeSinceLastCall >= wait) {
      // Execute immediately
      if (lastArgs !== null) {
        fn(...lastArgs);
      }
      lastCallTime = now;
      lastArgs = null;
      // Clear any existing timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (timeoutId === null) {
      // Schedule the next call
      timeoutId = setTimeout(() => {
        if (lastArgs !== null) {
          fn(...lastArgs);
        }
        lastCallTime = Date.now();
        lastArgs = null;
        timeoutId = null;
      }, wait - timeSinceLastCall);
    }
  }

  return throttled;
}