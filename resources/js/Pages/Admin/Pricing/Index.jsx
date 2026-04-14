import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PricingIndex({ settings = {} }) {
    const settingsForm = useForm({
        // Main Bank (Global)
        main_bank_name: settings.main_bank_name || '',
        main_bank_number: settings.main_bank_number || '',
        main_bank_owner: settings.main_bank_owner || '',
        main_qris: settings.main_qris || '',

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
                        {/* KONFIGURASI BANK UTAMA (GLOBAL) */}
                        <div className="p-10 rounded-[3.5rem] bg-black/30 border-2 border-[#38BDF8]/20 shadow-inner group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                            
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-[#38BDF8] text-slate-900 rounded-3xl shadow-xl shadow-[#38BDF8]/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Main <span className="text-[#38BDF8]">Bank HQ</span></h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#38BDF8]/50 mt-1">Rekening Utama Pusat Mandala Arena</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8]/60 ml-2">Nama Bank Utama</label>
                                    <input className="w-full bg-slate-900/50 border-white/5 rounded-2xl px-6 py-4 text-xs font-black italic focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all" placeholder="Misal: BANK MANDIRI"
                                        value={settingsForm.data.main_bank_name} onChange={e => settingsForm.setData('main_bank_name', e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8]/60 ml-2">Nomor Rekening Pusat</label>
                                    <input className="w-full bg-slate-900/50 border-white/5 rounded-2xl px-6 py-4 text-xl font-black italic tracking-[0.1em] focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all" placeholder="123-445-XXX"
                                        value={settingsForm.data.main_bank_number} onChange={e => settingsForm.setData('main_bank_number', e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8]/60 ml-2">Pemilik Rekening (HQ)</label>
                                    <input className="w-full bg-slate-900/50 border-white/5 rounded-2xl px-6 py-4 text-xs font-black italic focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all" placeholder="A.N MANDALA ARENA"
                                        value={settingsForm.data.main_bank_owner} onChange={e => settingsForm.setData('main_bank_owner', e.target.value)} />
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 ml-2 italic">Master QRIS (General)</label>
                                <div className="flex gap-6 items-center">
                                    <input className="flex-1 bg-slate-900/50 border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black italic focus:ring-emerald-500 focus:border-emerald-500 transition-all" placeholder="URL Gambar QRIS Utama..."
                                        value={settingsForm.data.main_qris} onChange={e => settingsForm.setData('main_qris', e.target.value)} />
                                    <div className="w-20 h-20 bg-white rounded-2xl flex-shrink-0 p-1.5 border-4 border-white/5 group-hover:border-emerald-500/30 transition-all shadow-2xl">
                                        {settingsForm.data.main_qris ? (
                                            <img src={settingsForm.data.main_qris} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-black opacity-20 text-center uppercase leading-tight">NO MASTER QR</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

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
