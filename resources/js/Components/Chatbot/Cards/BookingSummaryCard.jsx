import React from 'react';
import { motion } from 'framer-motion';

export default function BookingSummaryCard({
    facilityName,
    bookingDate,
    bookingTime,
    duration,
    numberOfPeople,
    estimatedPrice,
    notes,
    onConfirm,
    onEdit,
    onCancel,
    loading = false
}) {
    // Helper Format Rupiah (FallBack jika backend tidak meng-handle rp format string)
    const formatRp = (value) => {
        if (!value) return '-';
        if (typeof value === 'string' && value.includes('Rp')) return value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.3 }}
            className="flex flex-col w-72 max-w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white"
        >
            {/* Header */}
            <div className="bg-slate-900 p-4 border-b-2 border-[#38BDF8] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white text-xs font-black uppercase tracking-widest italic leading-tight">Ringkasan Booking</h3>
                    <p className="text-slate-400 text-[9px] font-medium mt-0.5">MANDALA ARENA</p>
                </div>
            </div>

            {/* List Item Details */}
            <div className="p-4 flex flex-col gap-3">
                <DetailRow label="Fasilitas" value={facilityName} highlight />
                <DetailRow label="Tanggal" value={bookingDate} />
                <DetailRow label="Waktu" value={`${bookingTime} (${duration})`} />
                
                {numberOfPeople && (
                    <DetailRow label="Jumlah Orang" value={numberOfPeople} />
                )}
                
                {notes && (
                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Catatan Tambahan</span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">{notes}</span>
                    </div>
                )}

                <div className="flex justify-between items-end mt-2 p-3 bg-[#f8fafc] rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Biaya</span>
                    <span className="text-base font-black text-[#38BDF8]">{formatRp(estimatedPrice)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 pt-1 flex flex-col gap-2 relative">
                
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}

                <button 
                    onClick={onConfirm}
                    disabled={loading}
                    className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white text-[11px] font-black uppercase tracking-[0.15em] italic py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                    Konfirmasi 
                    <svg className="w-4 h-4 text-[#38BDF8] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>

                <div className="flex gap-2">
                    <button 
                        onClick={onEdit}
                        disabled={loading}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95"
                    >
                        Ubah Jadwal
                    </button>
                    <button 
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95"
                    >
                        Batalkan
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Sub Component Helper for rows
const DetailRow = ({ label, value, highlight = false }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
            <span className={`text-xs text-right max-w-[60%] ${highlight ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                {value}
            </span>
        </div>
    );
};
