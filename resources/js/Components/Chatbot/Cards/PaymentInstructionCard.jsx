import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PaymentInstructionCard({
    amount,
    paymentMethod,
    paymentReference,
    expiryTime,
    instructionLines = [],
    actionUrl,
    status = 'PENDING',
    onCheckStatus,
    onChangeMethod,
    onCopyReference,
    loading = false
}) {
    const [copied, setCopied] = useState(false);

    // Fallback format Rupiah
    const formatRp = (value) => {
        if (!value) return 'Rp 0';
        if (typeof value === 'string' && value.toLowerCase().includes('rp')) return value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(value);
    };

    const handleCopy = () => {
        if (!paymentReference) return;
        navigator.clipboard.writeText(paymentReference);
        setCopied(true);
        if (onCopyReference) onCopyReference();
        setTimeout(() => setCopied(false), 2000);
    };

    const isQris = String(paymentMethod).toUpperCase() === 'QRIS' || String(paymentMethod).toUpperCase() === 'EWALLET';
    const isVirtualAccount = String(paymentMethod).toUpperCase() === 'TRANSFER' || String(paymentMethod).toUpperCase().includes('VIRTUAL');

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex flex-col w-72 max-w-full border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-white relative"
        >
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
                    <span className="w-6 h-6 border-4 border-slate-200 border-t-[#38BDF8] rounded-full animate-spin"></span>
                </div>
            )}

            {/* Header: Payment Highlight */}
            <div className="bg-slate-900 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent"></div>
                
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] italic mb-1.5 leading-none">
                    Total Pembayaran
                </span>
                <span className="relative z-10 text-2xl font-black text-white tracking-tight">
                    {formatRp(amount)}
                </span>
                
                <div className="relative z-10 mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-500/30">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    {status === 'PENDING' ? 'Menunggu Pembayaran' : status}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex flex-col gap-4">
                
                {/* Expiry Bar */}
                {expiryTime && (
                    <div className="flex justify-between items-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Batas Waktu</span>
                        <span className="text-sm font-black text-rose-600">{expiryTime}</span>
                    </div>
                )}

                {/* Payment Reference Specifics */}
                {isVirtualAccount && paymentReference && (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{paymentMethod || 'Nomor Rekening / VA'}</span>
                        <button 
                            onClick={handleCopy}
                            title="Klik untuk menyalin"
                            className={`w-full group px-4 py-3 border-2 rounded-xl flex items-center justify-between transition-all ${copied ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-sky-50'}`}
                        >
                            <span className={`font-mono text-[15px] font-black tracking-[0.1em] ${copied ? 'text-emerald-700' : 'text-slate-800'}`}>
                                {paymentReference}
                            </span>
                            <div className={`p-1.5 rounded-lg shadow-sm transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:bg-sky-500 group-hover:text-white'}`}>
                                {copied ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                )}
                            </div>
                        </button>
                        <span className={`text-[9px] text-center font-medium transition-colors ${copied ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {copied ? 'Nomor berhasil disalin!' : 'Ketuk untuk menyalin'}
                        </span>
                    </div>
                )}

                {/* QRIS Logic Specifics */}
                {isQris && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-32 h-32 bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative">
                            <span className="text-xl">📳</span>
                            <span className="text-slate-400 text-[10px] font-bold font-mono mt-1 uppercase">QRIS / E-Wallet</span>
                        </div>
                    </div>
                )}

                {/* Instruction Lines */}
                {instructionLines && instructionLines.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-1">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Cara Pembayaran</h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 pl-3 list-decimal font-medium">
                            {instructionLines.map((line, idx) => (
                                <li key={idx} className="pl-1 leading-relaxed">{line}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Primary Action Button (If actionUrl present) */}
                {actionUrl && (
                    <a 
                        href={actionUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="mt-1 w-full flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#0f7a6d] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_4px_14px_0_rgba(18,140,126,0.39)] transition-all active:scale-95"
                    >
                        <span>Cek Info E-Wallet</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                )}

                {/* Secondary Actions */}
                <div className="flex flex-col gap-2 mt-2">
                    <button 
                        onClick={onCheckStatus}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.15em] italic py-3 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                        <MockRefeshIcon />
                        Cek Status Pembayaran
                    </button>
                    
                    <button 
                        onClick={onChangeMethod}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95"
                    >
                        Ubah Metode Bayar
                    </button>
                </div>

            </div>
        </motion.div>
    );
}

const MockRefeshIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
);
