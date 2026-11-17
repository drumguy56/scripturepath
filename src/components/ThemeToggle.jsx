import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { THEME_DARK, THEME_DEFAULT, THEME_LIGHT } from '@/lib/theme';

const OPTIONS = [
  { value: THEME_LIGHT, label: 'Light', Icon: Sun },
  { value: THEME_DARK, label: 'Dark', Icon: Moon },
];

// Both choices are always on screen, with words — a single icon button hides
// which theme you are in and which one you would switch to.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes cannot know the stored theme until it runs in the browser, so
  // render the default until then rather than flashing the wrong selection.
  useEffect(() => setMounted(true), []);
  const active = mounted ? theme : THEME_DEFAULT;

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="inline-flex items-center rounded-full border border-border bg-secondary/70 p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] transition-colors ${
              isActive
                ? 'border border-border bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {/* One label: clipped on narrow screens, so the name stays "Light"/"Dark". */}
            <span className="sr-only sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
