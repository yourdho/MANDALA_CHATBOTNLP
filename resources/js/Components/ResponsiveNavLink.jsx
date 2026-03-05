import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'flex w-full items-start ps-4 pe-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none ' +
                (active
                    ? 'bg-[#F2D800]/10 text-[#F2D800] border-l-2 border-[#F2D800]'
                    : 'border-l-2 border-transparent text-slate-400 hover:bg-[#F2D800]/5 hover:text-[#F2D800] hover:border-[#F2D800]/30') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
