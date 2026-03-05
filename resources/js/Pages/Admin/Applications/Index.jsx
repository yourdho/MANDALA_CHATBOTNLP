import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const STATUS = {
    pending: { label: 'Pending', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    approved: { label: 'Disetujui', bg: 'bg-[#F2D800]/10', text: 'text-[#F2D800]', border: 'border-[#F2D800]/20' },
    rejected: { label: 'Ditolak', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function AdminApplicationsIndex({ applications, counts, status }) {
    const flash = usePage().props.flash;
    const [activeModal, setActiveModal] = useState(null); // { type: 'approve'|'reject'|'schedule', app }
    const [form, setForm] = useState({ jadwal_temu: '', catatan: '' });

    const filterTab = (val) => router.get(route('admin.applications.index'), { status: val }, { preserveState: true });

    const openModal = (type, app) => {
        setForm({ jadwal_temu: app.jadwal_raw ?? '', catatan: app.catatan ?? '' });
        setActiveModal({ type, app });
    };
    const closeModal = () => setActiveModal(null);

    const handleAction = () => {
        const { type, app } = activeModal;
        const routes = {
            approve: route('admin.applications.approve', app.id),
            reject: route('admin.applications.reject', app.id),
            schedule: route('admin.applications.schedule', app.id),
        };
        router.patch(routes[type], form, { onSuccess: closeModal });
    };

    const tabs = [
        { key: 'all', label: 'Semua', count: counts.all },
        { key: 'pending', label: 'Pending', count: counts.pending },
        { key: 'approved', label: 'Disetujui', count: counts.approved },
        { key: 'rejected', label: 'Ditolak', count: counts.rejected },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-black text-xl text-white">Kelola Pengajuan Mitra</h2>}
        >
            <Head title="Pengajuan Mitra - Admin" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-5 rounded-xl bg-[#F2D800]/10 border border-[#F2D800]/20 px-4 py-3 text-sm text-[#F2D800]">
                        {flash.success}
                    </div>
                )}

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => filterTab(t.key)}
                            className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${status === t.key
                                    ? 'bg-[#F2D800]/10 text-[#F2D800] border-[#F2D800]/20'
                                    : 'bg-[#231F1F] text-slate-400 border-[#2e2a2a] hover:border-[#F2D800]/20 hover:text-[#F2D800]'
                                }`}
                        >
                            {t.label}
                            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{t.count}</span>
                        </button>
                    ))}
                </div>

                {/* Applications list */}
                {applications.length === 0 ? (
                    <div className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-12 text-center">
                        <p className="text-slate-500 text-sm">Tidak ada pengajuan.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applications.map((app, i) => (
                            <motion.div key={app.id}
                                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-4 sm:p-5">

                                {/* Top row */}
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base">{app.nama_tempat}</h4>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {app.nama_pemilik} &bull; {app.no_hp}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Akun: {app.user_name} ({app.user_email})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${STATUS[app.status]?.bg} ${STATUS[app.status]?.text} ${STATUS[app.status]?.border}`}>
                                            {STATUS[app.status]?.label}
                                        </span>
                                        <span className="text-[10px] text-slate-600">{app.created_at}</span>
                                    </div>
                                </div>

                                {/* QRIS/Rekening */}
                                <div className="mt-3 bg-[#1A1818] rounded-xl px-3 py-2">
                                    <p className="text-[10px] text-slate-500 mb-0.5">QRIS / Rekening</p>
                                    <p className="text-xs text-slate-300 break-all">{app.qris_rekening}</p>
                                </div>

                                {/* Jadwal temu */}
                                {app.jadwal_temu && (
                                    <p className="mt-2 text-xs text-slate-400">
                                        Jadwal temu: <span className="text-white font-medium">{app.jadwal_temu}</span>
                                    </p>
                                )}
                                {app.catatan && (
                                    <p className="mt-1 text-xs text-slate-500">Catatan: {app.catatan}</p>
                                )}

                                {/* Actions */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {app.status === 'pending' && (
                                        <>
                                            <ActionBtn color="yellow" onClick={() => openModal('approve', app)}>Setujui</ActionBtn>
                                            <ActionBtn color="red" onClick={() => openModal('reject', app)}>Tolak</ActionBtn>
                                        </>
                                    )}
                                    <ActionBtn color="gray" onClick={() => openModal('schedule', app)}>Atur Jadwal Temu</ActionBtn>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-5 w-full max-w-md shadow-2xl">
                        <h3 className="text-white font-bold text-base mb-4">
                            {activeModal.type === 'approve' ? 'Setujui Pengajuan' :
                                activeModal.type === 'reject' ? 'Tolak Pengajuan' :
                                    'Atur Jadwal Temu'}
                        </h3>

                        <p className="text-sm text-slate-400 mb-4">{activeModal.app.nama_tempat} — {activeModal.app.nama_pemilik}</p>

                        {(activeModal.type === 'approve' || activeModal.type === 'schedule') && (
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Jadwal Temu (opsional)</label>
                                <input type="datetime-local" value={form.jadwal_temu}
                                    onChange={(e) => setForm({ ...form, jadwal_temu: e.target.value })}
                                    className="w-full rounded-xl border border-[#2e2a2a] bg-[#1A1818] text-white px-3 py-2 text-sm focus:border-[#F2D800] focus:outline-none" />
                            </div>
                        )}

                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Catatan (opsional)</label>
                            <textarea value={form.catatan} rows={3}
                                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                placeholder="Pesan untuk pemohon..."
                                className="w-full rounded-xl border border-[#2e2a2a] bg-[#1A1818] text-white placeholder-slate-600 px-3 py-2 text-sm focus:border-[#F2D800] focus:outline-none resize-none" />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={closeModal}
                                className="flex-1 rounded-full border border-[#2e2a2a] py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                                Batal
                            </button>
                            <button onClick={handleAction}
                                className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${activeModal.type === 'reject'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                                        : 'bg-[#F2D800] text-[#1A1818] hover:bg-[#ffe800]'
                                    }`}>
                                {activeModal.type === 'approve' ? 'Setujui' :
                                    activeModal.type === 'reject' ? 'Tolak' : 'Simpan'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function ActionBtn({ children, onClick, color }) {
    const colors = {
        yellow: 'border-[#F2D800]/25 text-[#F2D800] hover:bg-[#F2D800]/10',
        red: 'border-red-500/25 text-red-400 hover:bg-red-500/10',
        gray: 'border-[#2e2a2a] text-slate-400 hover:text-white hover:border-slate-600',
    };
    return (
        <button onClick={onClick}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${colors[color]}`}>
            {children}
        </button>
    );
}
