'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
    isNavbarHidden: boolean;
    hideNavbar: () => void;
    showNavbar: () => void;
}

const NavbarContext = createContext<NavbarContextType>({
    isNavbarHidden: false,
    hideNavbar: () => { },
    showNavbar: () => { },
});

export function NavbarProvider({ children }: { children: ReactNode }) {
    const [isNavbarHidden, setIsNavbarHidden] = useState(false);

    const hideNavbar = () => setIsNavbarHidden(true);
    const showNavbar = () => setIsNavbarHidden(false);

    return (
        <NavbarContext.Provider value={{ isNavbarHidden, hideNavbar, showNavbar }}>
            {children}
        </NavbarContext.Provider>
    );
}

export function useNavbar() {
    return useContext(NavbarContext);
}
