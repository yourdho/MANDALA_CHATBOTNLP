import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function RewardIndex({ rewards, categories = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        id: null,
        title: '',
        description: '',
        applicable_category: 'all',
        image: null,
        points_required: 0,
        discount_type: 'fixed',
        discount_value: 0,
        max_discount: '',
        valid_until: '',
        quota: 10,
    });

    const [editingReward, setEditingReward] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showCreateModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showCreateModal]);

    const submit = (e) => {
        e.preventDefault();
        if (editingReward) {
            // Use POST with _method: PATCH for file uploads
            post(route('admin.rewards.update', editingReward.id), {
                forceFormData: true,
                onSuccess: () => {
                    setEditingReward(null);
                    setShowCreateModal(false);
                    reset();
                }
            });
        } else {
            post(route('admin.rewards.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                }
            });
        }
    };

    const openEditModal = (reward) => {
        setEditingReward(reward);
        setData({
            title: reward.title,
            description: reward.description,
            applicable_category: reward.applicable_category || 'all',
            points_required: reward.points_required,
            discount_type: reward.discount_type,
            discount_value: reward.discount_value,
            max_discount: reward.max_discount || '',
            valid_until: new Date(reward.valid_until).toISOString().split('T')[0],
            quota: reward.quota,
            image: null,
        });
        setShowCreateModal(true);
    };

    const toggleStatus = (reward) => {
        const url = route('admin.rewards.update', reward.id);
        router.post(url, {
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
                    <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-none"
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

            <div className="max-w-7xl mx-auto px-4 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {rewards.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-[2.5rem] p-6 md:p-8 border shadow-sm relative overflow-hidden group transition-all`}
                            style={{ background: 'var(--bg-card)', borderColor: r.is_active ? 'var(--border)' : 'var(--danger)', opacity: r.is_active ? 1 : 0.6 }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110"
                                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                                    {r.image_url ? (
                                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-[#38BDF8]">
                                            {r.discount_type === 'percentage' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.is_active ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                                        {r.is_active ? 'Active Status' : 'System Disabled'}
                                    </span>
                                </div>
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
                                            ? `${parseFloat(r.discount_value)}% DISKON ${r.max_discount ? `(MAX. RP ${parseInt(r.max_discount).toLocaleString('id-ID')})` : ''}`
                                            : `RP ${parseInt(r.discount_value).toLocaleString('id-ID')} OFF`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span style={{ color: 'var(--text-secondary)' }}>Applicable Scope</span>
                                    <span className="text-[#FACC15]">{r.applicable_category === 'all' ? 'SEMUA FASILITAS' : r.applicable_category.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span style={{ color: 'var(--text-secondary)' }}>Inventory Quota</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{r.quota} UNITS</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={() => openEditModal(r)}
                                    className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border transition-all hover:bg-[#38BDF8] hover:text-white"
                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                >
                                    Edit Core
                                </button>
                                <button
                                    onClick={() => toggleStatus(r)}
                                    className="flex-1 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border transition-all"
                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                >
                                    {r.is_active ? 'Abort' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    className="px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm"
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
                    <div className="fixed inset-0 z-[150] overflow-y-auto">
                        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 pb-28 sm:pb-10">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1]" 
                                onClick={() => setShowCreateModal(false)} 
                            />
                            
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="w-[95%] sm:w-full max-w-xl relative z-10 border rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                            >
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-slate-900/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 z-30"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <form onSubmit={submit}>
                                    <div className="p-6 sm:p-10 border-b" style={{ borderColor: 'var(--border)' }}>
                                        <p className="text-[9px] sm:text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-1">Configuration Terminal</p>
                                        <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                                            {editingReward ? 'Update' : 'Deploy'} <span className="text-[#38BDF8]">Promo Unit</span>
                                        </h3>
                                    </div>

                                    <div className="p-6 sm:p-10 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                            <div className="sm:col-span-2 space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Judul Promo</label>
                                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm uppercase italic transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                                {errors.title && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">{errors.title}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Poin Dibutuhkan</label>
                                                <input type="number" value={data.points_required} onChange={e => setData('points_required', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Kuota Voucher</label>
                                                <input type="number" value={data.quota} onChange={e => setData('quota', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Tipe Diskon</label>
                                                <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                    <option value="fixed">IDR OFF</option>
                                                    <option value="percentage">PERCENTAGE OFF</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Nilai Diskon</label>
                                                <input type="number" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Berlaku Sampai</label>
                                                <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Cakupan Fasilitas</label>
                                                <select value={data.applicable_category} onChange={e => setData('applicable_category', e.target.value)}
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                    <option value="all">SEMUA FASILITAS</option>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Maks Diskon</label>
                                                <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value)}
                                                    placeholder="Optional"
                                                    className="w-full border-2 rounded-xl p-3 sm:p-3.5 font-black text-xs sm:text-sm transition-all focus:border-[#38BDF8] focus:ring-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                            </div>
                                            <div className="sm:col-span-2 space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-primary)' }}>Flyer / Foto Diskon</label>
                                                <input type="file" onChange={e => setData('image', e.target.files[0])}
                                                    className="w-full border-2 border-dashed rounded-xl p-3 sm:p-4 text-xs sm:text-sm transition-all focus:border-[#38BDF8]"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                                                {editingReward?.image_url && <p className="text-[8px] text-emerald-400 uppercase font-bold">✓ Sudah ada flyer terpasang</p>}
                                                {errors.image && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest">{errors.image}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-4 pb-2 sm:pb-0">
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit" 
                                                disabled={processing}
                                                className="w-full py-4 bg-[#38BDF8] text-slate-900 rounded-2xl shadow-xl shadow-[#38BDF8]/20 font-black uppercase text-xs tracking-[0.2em] hover:bg-[#FACC15] transition-all disabled:opacity-50 relative z-30"
                                            >
                                                {processing ? 'Processing...' : 'Confirm & Deploy Promo'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
