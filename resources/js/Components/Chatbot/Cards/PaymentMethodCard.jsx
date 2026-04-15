import React from 'react';
import { motion } from 'framer-motion';

export default function PaymentMethodCard({ data, onAction }) {
    if (!data) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 w-64 max-w-full"
        >
            <div className="bg-slate-900 rounded-t-xl p-3 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8] italic">Pilih Pembayaran</span>
            </div>
            <div className="p-3 bg-white rounded-b-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                
                <button 
                    onClick={() => onAction('qris')}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all group"
                >
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic group-hover:text-[#38BDF8] transition-colors">QRIS</span>
                        <span className="text-[9px] text-slate-400 font-medium">Gopay, OVO, ShopeePay</span>
                    </div>
                    <span className="text-lg">📱</span>
                </button>

                <button 
                    onClick={() => onAction('transfer')}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#FACC15] hover:bg-[#FACC15]/10 transition-all group"
                >
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic group-hover:text-[#FACC15] transition-colors">Transfer VA</span>
                        <span className="text-[9px] text-slate-400 font-medium">BCA, Mandiri, BNI, BRI</span>
                    </div>
                    <span className="text-lg">🏦</span>
                </button>

                <button 
                    onClick={() => onAction('batal')}
                    className="mt-1 w-full text-center py-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-slate-700 underline decoration-slate-300 underline-offset-4"
                >
                    Batalkan Pesanan
                </button>
            </div>
        </motion.div>
    );
}
