import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function MasterPricingIndex({ price_schedules = [], additional_items = [] }) {
    const scheduleForm = useForm({
        sport_type: '',
        session_name: '',
        start_time: '',
        end_time: '',
        price: '',
    });

    const itemForm = useForm({
        name: '',
        price: '',
    });

    const submitSchedule = (e) => {
        e.preventDefault();
        scheduleForm.post(route('admin.pricing.schedules.store'), {
            onSuccess: () => scheduleForm.reset()
        });
    };

    const deleteSchedule = (id) => {
        if (confirm('Hapus jadwal harga ini?')) {
            router.delete(route('admin.pricing.schedules.destroy', id), { preserveScroll: true });
        }
    };

    const submitItem = (e) => {
        e.preventDefault();
        itemForm.post(route('admin.pricing.items.store'), {
            onSuccess: () => itemForm.reset()
        });
    };

    const deleteItem = (id) => {
        if (confirm('Hapus item ini?')) {
            router.delete(route('admin.pricing.items.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Harga & Addon" />

            <div className="max-w-7xl mx-auto space-y-12 mb-24 text-white p-4 md:p-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">Master <span className="text-[#38BDF8]">Pricing</span></h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic opacity-60">Konfigurasi Pusat Harga Lapangan dan Add-on Pendukung</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center">
                            <span className="text-[8px] font-black opacity-30 uppercase tracking-widest italic">Total Addons</span>
                            <span className="text-2xl font-black italic text-[#38BDF8]">{additional_items.length}</span>
                        </div>
                        <div className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center">
                            <span className="text-[8px] font-black opacity-30 uppercase tracking-widest italic">Total Tiers</span>
                            <span className="text-2xl font-black italic text-[#FACC15]">{price_schedules.length}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* SCHEDULES CRUD */}
                    <div className="lg:col-span-12 xl:col-span-8 bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#38BDF8] opacity-20 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <span className="p-2 bg-[#38BDF8]/10 rounded-xl text-[#38BDF8] text-sm">#01</span>
                            Jadwal <span className="text-[#38BDF8]">Harga Dinamis (Timeline)</span>
                        </h2>

                        <form onSubmit={submitSchedule} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12 bg-black/40 p-6 rounded-[2rem] border border-white/5 items-end">
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-[8px] font-black uppercase text-[#38BDF8] ml-2">Kategori Sport</label>
                                <input className="w-full bg-slate-800/80 border-none rounded-xl text-xs font-bold focus:ring-[#38BDF8]" placeholder="Mini Soccer" required
                                    value={scheduleForm.data.sport_type} onChange={e => scheduleForm.setData('sport_type', e.target.value)} />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-[8px] font-black uppercase text-[#38BDF8] ml-2">Nama Sesi</label>
                                <input className="w-full bg-slate-800/80 border-none rounded-xl text-xs font-bold focus:ring-[#38BDF8]" placeholder="Night Prime" required
                                    value={scheduleForm.data.session_name} onChange={e => scheduleForm.setData('session_name', e.target.value)} />
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-[8px] font-black uppercase text-[#38BDF8] ml-2">Range Waktu</label>
                                <div className="flex gap-1 items-center">
                                    <input type="time" className="w-full bg-slate-800/80 border-none rounded-xl text-[10px] p-2"
                                        value={scheduleForm.data.start_time} onChange={e => scheduleForm.setData('start_time', e.target.value)} />
                                    <span className="opacity-20">-</span>
                                    <input type="time" className="w-full bg-slate-800/80 border-none rounded-xl text-[10px] p-2"
                                        value={scheduleForm.data.end_time} onChange={e => scheduleForm.setData('end_time', e.target.value)} />
                                </div>
                            </div>
                            <div className="md:col-span-1 space-y-2">
                                <label className="text-[8px] font-black uppercase text-[#38BDF8] ml-2">Harga (RP)</label>
                                <input type="number" className="w-full bg-slate-800/80 border-none rounded-xl text-xs font-bold focus:ring-[#38BDF8]" placeholder="350000" required
                                    value={scheduleForm.data.price} onChange={e => scheduleForm.setData('price', e.target.value)} />
                            </div>
                            <button type="submit" disabled={scheduleForm.processing} className="w-full h-[38px] bg-[#38BDF8] text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl shadow-[#38BDF8]/10">
                                TERBITKAN HARGA
                            </button>
                        </form>

                        <div className="overflow-hidden rounded-[2rem] border border-white/5">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/40 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-5 underline underline-offset-4 decoration-[#38BDF8]/40">Kategori</th>
                                        <th className="px-6 py-5 underline underline-offset-4 decoration-[#38BDF8]/40">Sesi</th>
                                        <th className="px-6 py-5 underline underline-offset-4 decoration-[#38BDF8]/40">Timeline</th>
                                        <th className="px-6 py-5 underline underline-offset-4 decoration-[#38BDF8]/40 text-right">Price Value</th>
                                        <th className="px-6 py-5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black/20">
                                    {price_schedules.map(p => (
                                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                            <td className="px-6 py-5 font-black uppercase italic text-[#38BDF8]">{p.sport_type}</td>
                                            <td className="px-6 py-5 font-bold uppercase text-[11px] opacity-70 italic">{p.session_name}</td>
                                            <td className="px-6 py-5 text-[10px] font-mono opacity-40">{p.start_time ? `${p.start_time.substring(0, 5)} - ${p.end_time.substring(0, 5)}` : 'ANYTIME'}</td>
                                            <td className="px-6 py-5 text-right font-black italic tracking-tighter text-[#FACC15] text-lg">RP {Number(p.price).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-5 text-center">
                                                <button onClick={() => deleteSchedule(p.id)} className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/row:opacity-100">
                                                    ✕ Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {price_schedules.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-[10px] font-black uppercase opacity-20 tracking-widest italic">Belum Ada Timeline Harga Terdeteksi</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ADDITIONAL ITEMS CRUD */}
                    <div className="lg:col-span-12 xl:col-span-4 bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group h-fit">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 text-sm">#02</span>
                            Global <span className="text-emerald-500">Add-Ons (Master)</span>
                        </h2>

                        <form onSubmit={submitItem} className="space-y-4 mb-10 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-emerald-500 ml-2">Nama Add-on</label>
                                <input className="w-full bg-slate-800/80 border-none rounded-xl text-xs font-bold focus:ring-emerald-500" placeholder="Jasa Wasit Pro" required
                                    value={itemForm.data.name} onChange={e => itemForm.setData('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-emerald-500 ml-2">Harga Satuan (RP)</label>
                                <input type="number" className="w-full bg-slate-800/80 border-none rounded-xl text-xs font-bold focus:ring-emerald-500" placeholder="50000" required
                                    value={itemForm.data.price} onChange={e => itemForm.setData('price', e.target.value)} />
                            </div>
                            <button type="submit" disabled={itemForm.processing} className="w-full py-4 bg-emerald-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl shadow-emerald-500/10 mt-2">
                                REGISTER ITEM +
                            </button>
                        </form>

                        <div className="space-y-3">
                            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em] italic mb-4">Inventory List</p>
                            {additional_items.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl group/item hover:border-emerald-500/30 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase italic text-white group-hover/item:text-emerald-500 transition-colors uppercase truncate max-w-[150px]">{a.name}</span>
                                        <span className="text-lg font-black italic tracking-tighter text-emerald-400">RP {Number(a.price).toLocaleString('id-ID')}</span>
                                    </div>
                                    <button onClick={() => deleteItem(a.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-black">
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {additional_items.length === 0 && (
                                <div className="p-10 text-center border border-dashed border-white/5 rounded-[2rem] opacity-20 text-[10px] font-black uppercase italic tracking-widest">
                                    No Add-ons Available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
