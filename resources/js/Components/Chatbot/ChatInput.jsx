import React from 'react';

/**
 * ChatInput — Text input bar at the bottom of the chatbot window.
 * Handles form submission and shows a "redirecting" disabled state.
 */
export default function ChatInput({ value, onChange, onSubmit, isLoading, isRedirecting }) {
    return (
        <div className="p-5 bg-white border-t border-slate-100">
            <form
                onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pl-5"
            >
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={isRedirecting ? 'Mengarahkan Kakak...' : 'Tanya Mandala Bot...'}
                    disabled={isRedirecting}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-medium placeholder:text-slate-300 text-slate-700 outline-none py-2"
                    aria-label="Pesan ke Mandala Bot"
                />
                <button
                    type="submit"
                    disabled={!value.trim() || isLoading || isRedirecting}
                    className="w-10 h-10 bg-[#38BDF8] text-white rounded-xl flex items-center justify-center hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-30 shadow-md shadow-[#38BDF8]/20"
                    aria-label="Kirim pesan"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
