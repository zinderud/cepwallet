/**
 * Navigation Hook
 * 
 * Global navigation state management
 */

import { useState, useCallback, useEffect } from 'react';

export type NavigationPage = 'dashboard' | 'wallet' | 'privacy' | 'transactions' | 'settings';

// Global navigation state (simple solution without context)
let currentNavigationPage: NavigationPage = 'dashboard';
let navigationListeners: ((page: NavigationPage) => void)[] = [];

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>(currentNavigationPage);

  useEffect(() => {
    const listener = (page: NavigationPage) => {
      setCurrentPage(page);
    };
    
    navigationListeners.push(listener);
    
    return () => {
      navigationListeners = navigationListeners.filter(l => l !== listener);
    };
  }, []);

  const navigate = useCallback((page: NavigationPage) => {
    currentNavigationPage = page;
    navigationListeners.forEach(listener => listener(page));
  }, []);

  return {
    currentPage,
    navigate,
  };
}

// Export for direct use
export const navigateTo = (page: NavigationPage) => {
  currentNavigationPage = page;
  navigationListeners.forEach(listener => listener(page));
};
