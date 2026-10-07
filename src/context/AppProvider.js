'use client';
import { useCallback, useEffect, useMemo } from "react";
import { createContext, useState } from 'react';
import { usePathname } from "next/navigation";
import { HeaderStateContext } from "@/components/layout/Navigation/HeaderStateContext";

// 1. Crea el contexto
export const AppContext = createContext(null);

// 2. Crea el componente proveedor
export function AppProvider({ children }) {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isIntroShown, setIsIntroShown] = useState(false);
    const [scrollHeaderActive, setScrollHeaderActiveState] = useState(false);
    const [pageHeaderActiveState, setPageHeaderActiveState] = useState({
        pathname: null,
        value: null
    });
    const pageHeaderActive = pageHeaderActiveState.pathname === pathname ? pageHeaderActiveState.value : null;
    const isHeaderActive = typeof pageHeaderActive === "boolean" ? pageHeaderActive : scrollHeaderActive;

    const setScrollHeaderActive = useCallback((value) => {
        setScrollHeaderActiveState(Boolean(value));
    }, []);

    const setPageHeaderActive = useCallback((value) => {
        setPageHeaderActiveState({
            pathname,
            value: typeof value === "boolean" ? value : null
        });
    }, [pathname]);

    const resetPageHeaderActive = useCallback(() => {
        setPageHeaderActiveState({
            pathname,
            value: null
        });
    }, [pathname]);

    const openDrawer = useCallback(() => {
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handleDrawerOpen = useCallback(() => {
        if (isDrawerOpen) {
            closeDrawer();
            return;
        }
        openDrawer();
    }, [closeDrawer, isDrawerOpen, openDrawer]);

    useEffect(() => {
        document.documentElement.style.overflow = isDrawerOpen ? "hidden" : !isIntroShown ? "hidden" : "auto";
    }, [isDrawerOpen, isIntroShown]);

    const appContextValue = useMemo(() => ({
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer,
        closeDrawer,
        handleDrawerOpen,
        isIntroShown,
        setIsIntroShown
    }), [
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        handleDrawerOpen,
        isIntroShown
    ]);

    const headerStateValue = useMemo(() => ({
        isHeaderActive,
        scrollHeaderActive,
        setScrollHeaderActive,
        pageHeaderActive,
        setPageHeaderActive,
        resetPageHeaderActive
    }), [
        isHeaderActive,
        scrollHeaderActive,
        setScrollHeaderActive,
        pageHeaderActive,
        setPageHeaderActive,
        resetPageHeaderActive
    ]);

    return (
        <AppContext.Provider value={appContextValue}>
            <HeaderStateContext.Provider value={headerStateValue}>
                {children}
            </HeaderStateContext.Provider>
        </AppContext.Provider>
    );
}
