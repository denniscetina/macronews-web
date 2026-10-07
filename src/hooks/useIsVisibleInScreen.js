"use client";

import { useEffect, useState } from "react";

const useIsVisibleInScreen = (ref) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref?.current;
    if (!element || typeof window === "undefined") return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return isVisible;
};

export default useIsVisibleInScreen;