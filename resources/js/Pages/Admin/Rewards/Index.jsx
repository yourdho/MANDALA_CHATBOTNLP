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
        <AuthenticatedLayout>
            <Head title="Manajemen Reward | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Loyalty Exchange Terminal</p>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Loyalty <span className="text-[#38BDF8]">Rewards</span>
                    </h1>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-4 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all"
                >
                    + Buat Promo Baru
                </button>
            </div>
            <Head title="Manajemen Reward | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rewards.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden group transition-all`}
                            style={{ background: 'var(--bg-card)', borderColor: r.is_active ? 'var(--border)' : 'var(--danger)', opacity: r.is_active ? 1 : 0.6 }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                                    {r.discount_type === 'percentage' ? '🏷️' : '💵'}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.is_active ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                                    {r.is_active ? 'Active Status' : 'System Disabled'}
                                </span>
                            </div>

                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2" style={{ color: 'var(--text-primary)' }}>{r.title}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{r.description || 'No descriptive record available.'}</p>

                            <div className="space-y-4 mb-8 p-6 rounded-3xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span style={{ color: 'var(--text-secondary)' }}>Redeem Threshold</span>
                                    <span className="text-[#38BDF8]">{r.points_required} PTS</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span style={{ color: 'var(--text-secondary)' }}>Tactical Value</span>
                                    <span style={{ color: 'var(--text-primary)' }}>
                                        {r.discount_type === 'percentage'
                                            ? `${parseFloat(r.discount_value)}% DISKONS ${r.max_discount ? `(MAX. RP ${parseInt(r.max_discount).toLocaleString()})` : ''}`
                                            : `RP ${parseInt(r.discount_value).toLocaleString()} OFF`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span style={{ color: 'var(--text-secondary)' }}>Inventory Quota</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{r.quota} UNITS</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={() => toggleStatus(r)}
                                    className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border transition-all"
                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                >
                                    {r.is_active ? 'Abort Mission' : 'Reactivate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm"
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
                            className="rounded-[3rem] w-full max-w-2xl shadow-3xl relative z-10 overflow-hidden border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        >
                            <form onSubmit={submit} className="p-12 space-y-8">
                                <h3 className="text-4xl font-black italic uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    Buat <span className="text-[#38BDF8]">Promo Baru</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Judul Promo</label>
                                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black text-sm uppercase italic transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                        {errors.title && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Poin Dibutuhkan</label>
                                        <input type="number" value={data.points_required} onChange={e => setData('points_required', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Kuota Voucher</label>
                                        <input type="number" value={data.quota} onChange={e => setData('quota', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Tipe Diskon</label>
                                        <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                            <option value="fixed">IDR OFF</option>
                                            <option value="percentage">PERCENTAGE OFF</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Nilai Diskon</label>
                                        <input type="number" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Berlaku Sampai</label>
                                        <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>Maks Diskon (Optional)</label>
                                        <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value)}
                                            className="w-full border-2 rounded-2xl p-4 font-black transition-all focus:border-[#38BDF8] focus:ring-0"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-10">
                                    <button type="button" onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                                        style={{ color: 'var(--text-primary)' }}>Abort</button>
                                    <button type="submit" disabled={processing}
                                        className="flex-[2] py-5 bg-[#38BDF8] text-slate-900 rounded-2xl shadow-xl shadow-[#38BDF8]/20 font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all">
                                        Deploy Promo Package
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}

