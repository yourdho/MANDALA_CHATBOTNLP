import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 relative overflow-hidden group shadow-sm active:scale-95"
            title="Ganti Mode"
        >
            <motion.div
                initial={false}
                animate={{ y: theme === 'dark' ? 0 : 40 }}
                className="absolute inset-0 flex items-center justify-center text-xl"
            >
                🌙
            </motion.div>
            <motion.div
                initial={false}
                animate={{ y: theme === 'light' ? 0 : -40 }}
                className="absolute inset-0 flex items-center justify-center text-xl"
            >
                ☀️
            </motion.div>
        </button>
    );
}
