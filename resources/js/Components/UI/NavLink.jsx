import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none ' +
                (active
                    ? 'bg-[#F2D800]/10 text-[#F2D800] border border-[#F2D800]/20'
                    : 'text-slate-400 hover:text-[#F2D800] hover:bg-[#F2D800]/5 border border-transparent') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
