/**
 * Navigation Hook
 *
 * Global navigation state management
 */
import { useState, useCallback, useEffect } from 'react';
// Global navigation state (simple solution without context)
let currentNavigationPage = 'dashboard';
let navigationListeners = [];
export function useNavigation() {
    const [currentPage, setCurrentPage] = useState(currentNavigationPage);
    useEffect(() => {
        const listener = (page) => {
            setCurrentPage(page);
        };
        navigationListeners.push(listener);
        return () => {
            navigationListeners = navigationListeners.filter(l => l !== listener);
        };
    }, []);
    const navigate = useCallback((page) => {
        currentNavigationPage = page;
        navigationListeners.forEach(listener => listener(page));
    }, []);
    return {
        currentPage,
        navigate,
    };
}
// Export for direct use
export const navigateTo = (page) => {
    currentNavigationPage = page;
    navigationListeners.forEach(listener => listener(page));
};
