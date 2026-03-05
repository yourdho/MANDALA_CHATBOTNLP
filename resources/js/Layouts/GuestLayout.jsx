import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center font-sans relative overflow-hidden pt-6 sm:justify-center sm:pt-0 theme-transition"
            style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>

            {/* Background glow effects */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
                    style={{ backgroundColor: 'var(--glow-color)' }} />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none"
                    style={{ backgroundColor: 'var(--glow-color)' }} />
            </div>

            {/* Header: logo + toggle */}
            <div className="mb-8 flex items-center justify-between w-full max-w-md px-4 sm:px-0">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/images/janjee-logo.svg" alt="Janjee" className="h-10 w-10" />
                    <span className="text-3xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>
                        Janjee
                    </span>
                </Link>
                <ThemeToggle />
            </div>

            {/* Card */}
            <div className="w-full overflow-hidden px-6 py-8 shadow-2xl sm:max-w-md sm:rounded-2xl border theme-transition"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow)',
                }}>
                {children}
            </div>
        </div>
    );
}
