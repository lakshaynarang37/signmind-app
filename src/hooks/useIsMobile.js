import { useEffect, useState } from "react";

const getMatches = (breakpoint) => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
};

const useIsMobile = (breakpoint = 1023) => {
  const [isMobile, setIsMobile] = useState(() => getMatches(breakpoint));

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
