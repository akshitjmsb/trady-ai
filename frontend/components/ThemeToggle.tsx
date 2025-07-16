import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      aria-label="Toggle Dark Mode"
      className="rounded-md px-3 py-2 text-sm font-medium bg-slate-50 text-slate-800 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-blue-500 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      type="button"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
