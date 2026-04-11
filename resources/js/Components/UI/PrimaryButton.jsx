export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F2D800]/40 focus:ring-offset-2 focus:ring-offset-[#1A1818] ' +
                (disabled
                    ? 'bg-[#F2D800]/30 text-[#1A1818]/60 cursor-not-allowed opacity-70'
                    : 'bg-[#F2D800] text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#F2D800]/20') +
                ' ' + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
