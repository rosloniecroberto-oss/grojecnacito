import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

export function useAnalytics(route: string) {
  useEffect(() => {
    if (!window.gtag) {
      return;
    }

    window.gtag('config', 'G-E3X2JV2NVD', {
      page_path: route === 'home' ? '/' : `/${route}`,
    });
  }, [route]);
}
