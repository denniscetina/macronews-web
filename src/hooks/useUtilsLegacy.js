"use client";

import { useCallback, useEffect, useState } from "react";
//import { useSiteContext } from "@/lib/SiteContext";

export default function useUtils() {
  //const { appState } = useSiteContext();

  const [device, setDevice] = useState("desktop");
  const [observer, setObserver] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [hasScrolledOneScreen, setHasScrolledOneScreen] = useState(false);

  const decodeTitle = useCallback((title) => {
    if (typeof document === "undefined") return title;
    const txt = document.createElement("textarea");
    txt.innerHTML = title;
    return txt.value;
  }, []);
/*
  const convertToRelative = useCallback(
    (url) => url.replace(appState.cta-rooms.url, ""),
    [appState.cta-rooms.url],
  );
*/
  const isExternal = useCallback((url) => {
    if (typeof location === "undefined") return false;
    const getDomain = (link) => link.replace(/^https?:\/\//, "").split("/")[0];
    return getDomain(location.href) !== getDomain(url);
  }, []);

  const getDate = useCallback((date, full = false) => {
    const [day, fullDate] = date.split("|");
    return full && fullDate ? fullDate : day;
  }, []);

  const isDevice = useCallback((width) => {
    const breakpoints = { mobile: 768, tablet: 1024, desktop: 1440 };
    if (width < breakpoints.mobile) {
      setDevice("mobile");
    } else if (width < breakpoints.tablet) {
      setDevice("tablet");
    } else if (width < breakpoints.desktop) {
      setDevice("desktop");
    } else {
      setDevice("desktop-xl");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setViewportHeight(window.innerHeight);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setHasScrolledOneScreen(scrollY >= viewportHeight * 0.9);
  }, [scrollY, viewportHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!observer) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          isDevice(entry.contentRect.width);
        }
      });
      setObserver(resizeObserver);
      return;
    }

    const resizeHandler = () => isDevice(window.innerWidth);

    isDevice(window.innerWidth);
    observer.observe(document.documentElement);
    window.addEventListener("resize", resizeHandler);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeHandler);
    };
  }, [observer, isDevice]);

  return {
    device,
    scrollY,
    decodeTitle,
    //convertToRelative,
    getDate,
    isExternal,
    viewportHeight,
    hasScrolledOneScreen,
  };
}