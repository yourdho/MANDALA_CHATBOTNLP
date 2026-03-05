import { useTheme } from './ThemeContext';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2D800] ${isDark
                    ? 'bg-[#2e2a2a] border-[#3e3a3a]'
                    : 'bg-amber-100 border-amber-200'
                } ${className}`}
        >
            {/* Track icons */}
            <span className="absolute left-1.5 text-[11px]">🌙</span>
            <span className="absolute right-1.5 text-[11px]">☀️</span>

            {/* Thumb */}
            <span
                className={`absolute inline-flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-all duration-300 ${isDark
                        ? 'translate-x-1 bg-[#F2D800]'
                        : 'translate-x-[30px] bg-amber-400'
                    }`}
            />
        </button>
    );
}
