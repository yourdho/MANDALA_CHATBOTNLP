import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-[#2e2a2a] bg-[#231F1F] text-white placeholder-slate-500 px-3 py-2 text-sm shadow-sm transition focus:border-[#F2D800] focus:ring-1 focus:ring-[#F2D800] focus:outline-none ' +
                className
            }
            ref={input}
        />
    );
});
