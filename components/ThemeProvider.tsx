'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      const color = isDark ? '#0b0b0f' : '#f8f3eb';

      document.documentElement.style.backgroundColor = color;
      document.documentElement.style.setProperty('background-color', color);
      document.body.style.backgroundColor = color;
      document.body.style.setProperty('background-color', color);

      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    };

    applyTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return <>{children}</>;
}
