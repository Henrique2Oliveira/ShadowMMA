import { usePathname } from 'expo-router';
import { useMemo } from 'react';

/**
 * Returns the current tab route name inferred from the path.
 * Examples:
 *  - /(protected)/(tabs)               -> 'index'
 *  - /(protected)/(tabs)/gallery       -> 'gallery'
 *  - /(protected)/(tabs)/combos        -> 'combos'
 *  - /(protected)/(tabs)/profile       -> 'profile'
 *  - /(protected)/(tabs)/game          -> 'game'
 */
export function useCurrentTab(): {
  tab: 'index' | 'gallery' | 'game' | 'combos' | 'profile';
  is: (name: string) => boolean;
  pathname: string;
} {
  const pathname = usePathname();

  const tab = useMemo(() => {
    // Split path and find the segment after '(tabs)'
    const parts = pathname.split('/').filter(Boolean);
    const tabsIdx = parts.findIndex((p) => p === '(tabs)');
    const next = tabsIdx >= 0 ? parts[tabsIdx + 1] : undefined;

    // When on index route, expo-router usually has no next segment
    const current = (next ?? 'index') as 'index' | 'gallery' | 'game' | 'combos' | 'profile';
    return current;
  }, [pathname]);

  return {
    tab,
    is: (name: string) => tab === name,
    pathname,
  };
}

export default useCurrentTab;
