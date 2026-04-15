import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentStatusCard({
    status = 'pending',
    bookingReference,
    paymentReference,
    amount,
    paymentMethod,
    paidAt,
    expiryTime,
    message,
    onRetry,
    onCheckStatus,
    onViewBooking,
    onChangeMethod
}) {
    // Normalization & Helpers
    const currentStatus = String(status).toLowerCase();
    const isSuccess = currentStatus === 'paid' || currentStatus === 'success';
    const isPending = currentStatus === 'pending';
    const isFailed = currentStatus === 'failed';
    const isExpired = currentStatus === 'expired';
    const isCanceled = currentStatus === 'canceled';
    
    // Status config mapping
    const getStatusConfig = () => {
        if (isSuccess) return {
            color: 'bg-emerald-500', 
            textColor: 'text-emerald-500', 
            label: 'Pembayaran Diterima', 
            icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            bgHaze: 'bg-emerald-50'
        };
        if (isFailed) return {
            color: 'bg-rose-500', 
            textColor: 'text-rose-500', 
            label: 'Transaksi Gagal', 
            icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            bgHaze: 'bg-rose-50'
        };
        if (isExpired) return {
            color: 'bg-stone-500', 
            textColor: 'text-stone-500', 
            label: 'Waktu Habis', 
            icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            bgHaze: 'bg-stone-50'
        };
        if (isCanceled) return {
            color: 'bg-slate-400', 
            textColor: 'text-slate-500', 
            label: 'Dibatalkan', 
            icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
            bgHaze: 'bg-slate-50'
        };
        // Defaults to Pending
        return {
            color: 'bg-amber-500', 
            textColor: 'text-amber-600', 
            label: 'Menunggu Konfirmasi', 
            icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            bgHaze: 'bg-amber-50'
        };
    };

    const cnf = getStatusConfig();

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col w-72 max-w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white"
        >
            {/* dynamic Banner */}
            <div className={`p-4 flex items-center justify-start gap-3 border-b border-slate-100 ${cnf.bgHaze} ${cnf.textColor}`}>
                {cnf.icon}
                <span className="font-black text-xs uppercase tracking-widest leading-none pt-0.5">
                    {cnf.label}
                </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {/* Details Section */}
                {(bookingReference || amount) && (
                    <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {bookingReference && (
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ref ID</span>
                                <span className="font-mono text-[11px] font-bold text-slate-700">{bookingReference}</span>
                            </div>
                        )}
                        {amount && (
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominal</span>
                                <span className="text-xs font-black text-slate-900">{amount}</span>
                            </div>
                        )}
                        {paymentMethod && (
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode</span>
                                <span className="text-xs font-bold text-slate-700">{paymentMethod}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Conditional Time Notes */}
                {isPending && expiryTime && (
                    <div className="flex justify-center items-center gap-1.5 text-rose-500 font-bold bg-rose-50 border border-rose-100 py-1.5 rounded-lg text-[10px] tracking-wide">
                        Kadaluarsa: {expiryTime}
                    </div>
                )}
                {isSuccess && paidAt && (
                    <div className="text-center text-[9px] font-semibold text-slate-400 tracking-wide mt-1">
                        Lunas pada: {paidAt}
                    </div>
                )}

                {/* Main Message Body */}
                <p className="text-xs text-slate-600 font-medium text-center leading-relaxed mt-1">
                    {message || (isSuccess 
                        ? 'Jadwal Anda telah dikunci! Tidak sabar melihat aksi Anda di arena.' 
                        : (isFailed ? 'Maaf, terjadi kendala. Saldo tidak terpotong.' 
                            : (isExpired ? 'Waktu tagihan telah habis, silakan booking ulang jika masih ingin bermain.'
                                : (isCanceled ? 'Booking Anda telah dicancel.' : 'Kami sedang menunggu sistem membaca dana masuk.')))
                    )}
                </p>

                {/* Action Buttons Section */}
                <div className="mt-3 flex flex-col gap-2 w-full">
                    
                    {/* Success Flow Actions */}
                    {isSuccess && onViewBooking && (
                        <button onClick={onViewBooking} className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest italic py-3.5 rounded-xl transition-all shadow-md active:scale-95">
                            Lihat E-Ticket <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                    )}

                    {/* Pending Flow Actions */}
                    {isPending && (
                        <>
                            {onCheckStatus && (
                                <button onClick={onCheckStatus} className="w-full bg-[#1e293b] text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 shadow-sm active:scale-95 transition-all">
                                    Refresh / Cek Ulang
                                </button>
                            )}
                            {onChangeMethod && (
                                <button onClick={onChangeMethod} className="w-full bg-white hover:bg-slate-50 text-slate-500 font-bold border border-slate-200 text-[10px] uppercase tracking-wider py-2.5 rounded-xl active:scale-95 transition-all">
                                    Ganti Metode Bayar
                                </button>
                            )}
                        </>
                    )}

                    {/* Failure / Expired Flows */}
                    {(isFailed || isExpired) && (
                        <>
                            {onRetry && (
                                <button onClick={onRetry} className="w-full bg-[#FACC15] hover:bg-[#eab308] text-slate-900 shadow-md font-black italic text-[10px] uppercase tracking-widest py-3 rounded-xl active:scale-95 transition-all flex items-center gap-2 justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Booking Ulang
                                </button>
                            )}
                            {onChangeMethod && (
                                <button onClick={onChangeMethod} className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl active:scale-95 transition-all">
                                    Pilih Metode Lain
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
