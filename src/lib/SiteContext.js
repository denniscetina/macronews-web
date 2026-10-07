"use client";

import { createContext, useContext, useEffect, useState } from "react";
import wpData from "@/assets/window__REACT__WP.json";

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [appState, setAppState] = useState(wpData.state);
  const [isOpened, setIsOpened] = useState(false);
  const [activeTab, setActiveTab] = useState("links");
  const [introShown, setIntroShown] = useState(false);
  const [scrollLenis, setScrollLenis] = useState(0);
  const [lenisInstance, setLenisInstance] = useState(null);

  const routing = wpData.routing;

  const toggleIsOpened = (open = "false") => {
    if (open === "false") {
      setIsOpened(false);
      document.querySelector("html").style.overflow = "hidden";
    } else if (open === "true") {
      document.querySelector("html").style.overflow = "auto";
      setIsOpened(true);
    } else if (open === "toggle") {
      setIsOpened((prev) => {
        if (!prev) {
          document.querySelector("html").style.overflow = "hidden";
        } else {
          document.querySelector("html").style.overflow = "auto";
        }
        return !prev;
      });
    }
  };

  const toggleScroll = (scroll = false) => {
    if (!lenisInstance) return;
    if (scroll === false) {
      lenisInstance.stop();
    } else {
      lenisInstance.start();
    }
  };

  const setIntroComplete = () => {
    setIntroShown(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("introShown", "true");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = sessionStorage.getItem("introShown");
      if (value) setIntroShown(true);
    }
  }, []);

  useEffect(() => {
    let instance = null;
    import("lenis").then((mod) => {
      const Lenis = mod.default;
      instance = new Lenis();
      setLenisInstance(instance);

      const raf = (time) => {
        instance.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      instance.on("scroll", (e) => {
        setScrollLenis(e.animatedScroll);
      });
    });

    return () => {
      if (instance) instance.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lenisInstance) return;
    if (isOpened) {
      lenisInstance.stop();
    } else {
      lenisInstance.start();
      setActiveTab("links");
    }
  }, [isOpened, lenisInstance]);

  useEffect(() => {
    if (!lenisInstance) return;
    if (!introShown) {
      lenisInstance.stop();
    } else {
      lenisInstance.start();
    }
  }, [introShown, lenisInstance]);

  const value = {
    appState,
    setAppState,
    routing,
    isOpened,
    toggleIsOpened,
    activeTab,
    setActiveTab,
    introShown,
    setIntroComplete,
    scrollLenis,
    lenisInstance,
    toggleScroll,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSiteContext() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSiteContext must be used within SiteProvider");
  }
  return context;
}

export default SiteContext;