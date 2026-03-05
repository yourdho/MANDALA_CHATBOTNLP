export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 px-6 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/30 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1A1818] disabled:opacity-50 disabled:cursor-not-allowed ${disabled && 'opacity-50 cursor-not-allowed scale-100'} ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
