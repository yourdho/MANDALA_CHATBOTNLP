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
                'w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-white text-sm font-bold transition-all placeholder:text-white/10 ' +
                className
            }
            ref={input}
        />
    );
});
