export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[#2e2a2a] bg-[#1A1818] text-[#F2D800] shadow-sm focus:ring-[#F2D800] focus:ring-offset-[#1A1818] transition-colors cursor-pointer ' +
                className
            }
        />
    );
}
