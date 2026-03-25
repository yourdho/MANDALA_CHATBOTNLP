import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function RewardIndex({ rewards }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        title: '',
        description: '',
        points_required: 0,
        discount_type: 'fixed',
        discount_value: 0,
        max_discount: '',
        valid_until: '',
        quota: 10,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.rewards.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const toggleStatus = (reward) => {
        const url = route('admin.rewards.update', reward.id);
        console.log('[DEBUG] PATCH URL:', url);
        router.patch(url, {
            title: reward.title,
            description: reward.description,
            points_required: reward.points_required,
            discount_type: reward.discount_type,
            discount_value: reward.discount_value,
            max_discount: reward.max_discount,
            valid_until: new Date(reward.valid_until).toISOString().split('T')[0],
            quota: reward.quota,
            is_active: !reward.is_active
        }, {
            preserveScroll: true
        });
    };

    const handleDelete = (id) => {
        const url = route('admin.rewards.destroy', id);
        console.log('[DEBUG] DELETE URL:', url);
        if (confirm('Apakah Anda yakin ingin menghapus promo ini?')) {
            router.delete(url, {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Loyalty <span className="text-[#38BDF8]">Rewards</span>
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-slate-900 text-white hover:bg-[#38BDF8] transition-all font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-widest"
                    >
                        + Buat Promo Baru
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Reward | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rewards.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-white rounded-[2.5rem] p-8 border ${r.is_active ? 'border-slate-100' : 'border-red-100 opacity-60'} shadow-xl shadow-slate-200/50 relative overflow-hidden group`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-2xl">
                                    {r.discount_type === 'percentage' ? '🏷️' : '💰'}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {r.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            <h3 className="text-2xl font-['Permanent_Marker'] italic uppercase text-slate-900 mb-2">{r.title}</h3>
                            <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{r.description || 'Tidak ada deskripsi.'}</p>

                            <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Poin Butuh</span>
                                    <span className="text-[#38BDF8] font-black">{r.points_required} PTS</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Potongan</span>
                                    <span className="text-slate-900 font-black">
                                        {r.discount_type === 'percentage'
                                            ? `${parseFloat(r.discount_value)}% ${r.max_discount ? `(Max. Rp ${parseInt(r.max_discount).toLocaleString()})` : ''}`
                                            : `Rp ${parseInt(r.discount_value).toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-400">Sisa Kuota</span>
                                    <span className="text-slate-900 font-black">{r.quota} Unit</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-50">
                                <button
                                    onClick={() => toggleStatus(r)}
                                    className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    {r.is_active ? 'Matikan' : 'Aktifkan'}
                                </button>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="px-4 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px]"
                                >
                                    🗑️
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal Create */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden"
                        >
                            <form onSubmit={submit} className="p-12 space-y-8">
                                <h3 className="text-3xl font-['Permanent_Marker'] italic uppercase text-slate-900">Buat <span className="text-[#38BDF8]">Promo Baru</span></h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Judul Promo</label>
                                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                        {errors.title && <p className="text-red-500 text-[9px] font-bold">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Poin Dibutuhkan</label>
                                        <input type="number" value={data.points_required} onChange={e => setData('points_required', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kuota Voucher</label>
                                        <input type="number" value={data.quota} onChange={e => setData('quota', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tipe Diskon</label>
                                        <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800">
                                            <option value="fixed">Potongan Harga (Rp)</option>
                                            <option value="percentage">Persentase (%)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nilai Diskon</label>
                                        <input type="number" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Berlaku Sampai</label>
                                        <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Maks Diskon (Opsional)</label>
                                        <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800" />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Batal</button>
                                    <button type="submit" disabled={processing} className="flex-[2] py-4 bg-[#38BDF8] text-white rounded-2xl shadow-lg shadow-[#38BDF8]/20 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#38BDF8]/90">Simpan Promo ⚡</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
