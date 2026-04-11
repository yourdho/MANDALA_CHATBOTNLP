export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-full border border-[#2e2a2a] bg-[#231F1F] px-6 py-2.5 text-sm font-bold text-slate-300 shadow-sm transition-all hover:bg-[#2a2626] hover:text-white hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F2D800]/40 focus:ring-offset-2 focus:ring-offset-[#1A1818] disabled:opacity-50 disabled:cursor-not-allowed ${disabled && 'opacity-50 cursor-not-allowed scale-100'} ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
