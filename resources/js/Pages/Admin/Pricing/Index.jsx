import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PricingIndex({ settings = {} }) {
    const settingsForm = useForm({
        // Category specific
        cat_mini_soccer_bank_name: settings.cat_mini_soccer_bank_name || '',
        cat_mini_soccer_bank_number: settings.cat_mini_soccer_bank_number || '',
        cat_mini_soccer_bank_owner: settings.cat_mini_soccer_bank_owner || '',
        cat_mini_soccer_qris: settings.cat_mini_soccer_qris || '',

        cat_padel_bank_name: settings.cat_padel_bank_name || '',
        cat_padel_bank_number: settings.cat_padel_bank_number || '',
        cat_padel_bank_owner: settings.cat_padel_bank_owner || '',
        cat_padel_qris: settings.cat_padel_qris || '',



        cat_basket_bank_name: settings.cat_basket_bank_name || '',
        cat_basket_bank_number: settings.cat_basket_bank_number || '',
        cat_basket_bank_owner: settings.cat_basket_bank_owner || '',
        cat_basket_qris: settings.cat_basket_qris || '',

        cat_pilates_bank_name: settings.cat_pilates_bank_name || '',
        cat_pilates_bank_number: settings.cat_pilates_bank_number || '',
        cat_pilates_bank_owner: settings.cat_pilates_bank_owner || '',
        cat_pilates_qris: settings.cat_pilates_qris || '',
    });

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Konfigurasi Pembayaran" />

            <div className="max-w-4xl mx-auto space-y-12 mb-24 text-white">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Payment <span className="text-[#38BDF8]">Configuration</span></h1>
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold opacity-60">Atur Detail Rekening & QRIS untuk Pembayaran Manual</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-[100px] -ml-32 -mb-32" />

                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 flex items-center justify-center gap-3 relative z-10 text-[#38BDF8]">
                        <span className="p-3 bg-[#38BDF8]/10 rounded-2xl">💳</span>
                        Mandala <span className="text-white">Secure Authorization Channels</span>
                    </h2>
                    <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-12 relative z-10">Konfigurasi Pembayaran Mandiri Berdasarkan Devisi Olahraga</p>

                    <form onSubmit={submitSettings} className="space-y-10 relative z-10">
                        {/* KONFIGURASI PER KATEGORI */}
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {['Mini Soccer', 'Padel', 'Basket', 'Pilates'].map((cat) => {
                                    const key = cat.toLowerCase().replace(' ', '_');
                                    return (
                                        <div key={cat} className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-8 relative overflow-hidden group hover:border-[#38BDF8]/50 transition-all flex flex-col justify-between">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-6 bg-[#38BDF8] rounded-full" />
                                                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{cat}</h4>
                                                    </div>
                                                    <span className="text-[7px] font-black py-1 px-3 bg-[#38BDF8]/10 text-[#38BDF8] rounded-lg uppercase tracking-widest border border-[#38BDF8]/20 italic">DIVISI AKTIF</span>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] ml-2">Provider Bank</label>
                                                            <input className="w-full bg-black/40 border-white/5 rounded-2xl px-6 py-4 text-xs font-black italic focus:ring-[#38BDF8] transition-all" placeholder="BCA / MANDIRI / BNI"
                                                                value={settingsForm.data[`cat_${key}_bank_name`]} onChange={e => settingsForm.setData(`cat_${key}_bank_name`, e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] ml-2">Nomor Rekening / VA</label>
                                                            <input className="w-full bg-black/40 border-white/5 rounded-2xl px-6 py-4 text-lg font-black italic tracking-widest focus:ring-[#38BDF8] transition-all" placeholder="000-000-000"
                                                                value={settingsForm.data[`cat_${key}_bank_number`]} onChange={e => settingsForm.setData(`cat_${key}_bank_number`, e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] ml-2">Atas Nama (A.N)</label>
                                                            <input className="w-full bg-black/40 border-white/5 rounded-2xl px-6 py-4 text-xs font-black italic focus:ring-[#38BDF8] transition-all" placeholder="MANDALA ARENA"
                                                                value={settingsForm.data[`cat_${key}_bank_owner`]} onChange={e => settingsForm.setData(`cat_${key}_bank_owner`, e.target.value)} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-emerald-500 ml-2 italic">QRIS Khusus {cat}</label>
                                                        <div className="flex gap-4 items-center">
                                                            <input className="flex-1 bg-black/40 border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black italic focus:ring-emerald-500 transition-all" placeholder="URL Gambar QRIS..."
                                                                value={settingsForm.data[`cat_${key}_qris`]} onChange={e => settingsForm.setData(`cat_${key}_qris`, e.target.value)} />
                                                            <div className="w-16 h-16 bg-white rounded-xl flex-shrink-0 p-1 border-2 border-white/10 group-hover:border-emerald-500/30 transition-all">
                                                                {settingsForm.data[`cat_${key}_qris`] ? (
                                                                    <img src={settingsForm.data[`cat_${key}_qris`]} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[6px] font-black opacity-20 text-center uppercase">NO QR</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-12">
                            <button type="submit" disabled={settingsForm.processing} className="w-full py-6 bg-[#38BDF8] text-slate-900 font-black rounded-[2.5rem] text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[#38BDF8]/20 hover:scale-[1.02] active:scale-95 transition-all italic">
                                {settingsForm.processing ? 'SYNCHRONIZING SECURE CHANNELS...' : 'UPDATE SEMUA KONFIGURASI OTORISASI →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
