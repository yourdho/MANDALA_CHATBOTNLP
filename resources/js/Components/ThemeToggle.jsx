import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden group shadow-lg active:scale-90 pointer-events-auto"
            title="Ganti Mode (Tactical Shift)"
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
            <div className="absolute inset-0 bg-[#38BDF8]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}

