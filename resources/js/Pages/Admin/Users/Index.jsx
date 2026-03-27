import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function UserAdminIndex({ users }) {
    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Personnel Registry Terminal</p>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Daftar <span className="text-[#38BDF8]">Pengguna</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>
                        {users.length} PILOTS REGISTERED
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="rounded-[2.5rem] p-0 overflow-hidden border shadow-sm transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em] border-b"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Pilot Profile</th>
                                    <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Comm Link</th>
                                    <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Clearance Level</th>
                                    <th className="px-6 py-6 md:px-10 md:py-10 whitespace-nowrap">Enlistment Date</th>
                                    <th className="px-6 py-6 md:px-10 md:py-10 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {users.map((u, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={u.id}
                                        className="transition-all group hover:bg-slate-500/5"
                                    >
                                        <td className="px-6 py-6 md:px-10 md:py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-black italic text-2xl md:text-3xl text-[#38BDF8] border"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <span className="text-xl md:text-2xl font-black italic uppercase tracking-tighter group-hover:text-[#38BDF8] transition-colors leading-none"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 md:px-10 md:py-10">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.2em]">{u.phone || 'NO COMM LINK'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 md:px-10 md:py-10">
                                            <RoleBadge role={u.role || 'user'} />
                                        </td>
                                        <td className="px-6 py-6 md:px-10 md:py-10">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black italic tracking-tighter mb-2 uppercase leading-none" style={{ color: 'var(--text-primary)' }}>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleTimeString().slice(0, 5)} ZULU</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 md:px-10 md:py-10 text-right">
                                            <button className="px-6 py-2.5 md:px-8 md:py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all"
                                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                                Detail File
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                        {users.map((u, i) => (
                            <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[#38BDF8] font-black italic text-xl">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black italic uppercase leading-tight" style={{ color: 'var(--text-primary)' }}>{u.name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Enlisted: {new Date(u.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <RoleBadge role={u.role || 'user'} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">Email</p>
                                        <p className="text-[10px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">WhatsApp</p>
                                        <p className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{u.phone || '-'}</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest"
                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                    View Full Profile File
                                </button>
                            </motion.div>
                        ))}
                    </div>
                    {users.length === 0 && (
                        <div className="py-40 text-center" style={{ background: 'var(--bg-base)' }}>
                            <span className="text-9xl font-black italic text-[#38BDF8] opacity-10 uppercase tracking-tighter">Zero Host</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-12" style={{ color: 'var(--text-secondary)' }}>No personnel records found in the current sector.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RoleBadge({ role }) {
    const s = {
        admin: 'text-[#38BDF8] border-[#38BDF8]/20 bg-[#38BDF8]/5 shadow-sm',
        user: 'text-[var(--text-secondary)] border-[var(--border)] bg-[var(--bg-base)]',
    }[role] || 'text-[var(--text-secondary)] border-[var(--border)] bg-[var(--bg-base)]';

    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-xl border ${s} inline-flex items-center gap-2.5 transition-all`}>
            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-[#38BDF8] animate-pulse' : 'bg-slate-600'}`} />
            {role === 'admin' ? 'HQ OPERATOR' : 'FIELD PILOT'}
        </span>
    );
}

