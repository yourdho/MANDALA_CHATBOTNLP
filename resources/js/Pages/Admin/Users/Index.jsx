import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

export default function UserAdminIndex({ users }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = users.filter(u => roleFilter === 'all' || u.role === roleFilter);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
    });

    const submitRegister = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setShowRegister(false);
                reset();
            }
        });
    };

    const fetchUserDetail = async (id) => {
        try {
            const res = await axios.get(route('admin.users.show', id));
            setSelectedUser(res.data);
        } catch (err) {
            alert('Failed to rescue mission file.');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Manajemen Data Pengguna</p>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-900"
                        style={{ color: 'var(--text-primary)' }}>
                        Daftar <span className="text-[#38BDF8]">Pengguna</span>
                    </h1>
                </div>
                <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
                    {/* Role Filter Selector */}
                    <div className="flex items-center w-full lg:w-auto gap-1 p-1 rounded-2xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        {[
                            { id: 'all', label: 'Semua User' },
                            { id: 'user', label: 'Pengguna' },
                            { id: 'admin', label: 'Admin Utama' }
                        ].map((rt) => (
                            <button
                                key={rt.id}
                                onClick={() => setRoleFilter(rt.id)}
                                className={`flex-1 lg:flex-none px-4 py-3 sm:py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === rt.id ? 'bg-[#38BDF8] text-slate-900 shadow-md' : 'opacity-40 hover:opacity-100'
                                    }`}
                                style={{ color: roleFilter === rt.id ? undefined : 'var(--text-primary)' }}
                            >
                                {rt.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full lg:w-auto items-center gap-3">
                        {/* Counter */}
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest"
                                style={{ color: 'var(--text-secondary)' }}>
                                {filteredUsers.length} DATA
                            </span>
                        </div>

                        <button
                            onClick={() => setShowRegister(true)}
                            className="flex-1 lg:flex-none px-8 py-3.5 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all"
                        >
                            + Tambah Pengguna Baru
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12 pb-24">
                <div className="rounded-[2.5rem] p-0 overflow-hidden border shadow-sm transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    {/* Desktop Table */}
                    <div className="hidden lg:block w-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em] border-b"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-8 py-6 w-1/4">Profil Pengguna</th>
                                    <th className="px-6 py-6 w-1/4">Kontak</th>
                                    <th className="px-6 py-6 text-center">Role / Hak Akses</th>
                                    <th className="px-6 py-6 text-center">Tanggal / Waktu Bergabung</th>
                                    <th className="px-8 py-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {filteredUsers.map((u, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={u.id}
                                        className="transition-all group hover:bg-slate-500/5"
                                    >
                                        <td className="px-8 py-6 text-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black italic text-2xl text-[#38BDF8] border"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <span className="text-xl font-black italic uppercase tracking-tighter group-hover:text-[#38BDF8] transition-colors leading-none"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.2em]">{u.phone || 'TIDAK ADA NOMOR'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <RoleBadge role={u.role || 'user'} />
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <p className="text-sm font-black italic tracking-tighter mb-1.5 uppercase leading-none" style={{ color: 'var(--text-primary)' }}>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => fetchUserDetail(u.id)}
                                                className="px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                            >
                                                Detail User
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="lg:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                        {filteredUsers.map((u, i) => (
                            <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[#38BDF8] font-black italic text-xl">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black italic uppercase leading-tight text-white" style={{ color: 'var(--text-primary)' }}>{u.name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Gabung: {new Date(u.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <RoleBadge role={u.role || 'user'} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed transition-colors" style={{ borderColor: 'var(--border)' }}>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">Email</p>
                                        <p className="text-[10px] font-bold truncate text-slate-800 dark:text-white">{u.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#38BDF8] mb-1">WhatsApp</p>
                                        <p className="text-[10px] font-bold text-slate-800 dark:text-white" style={{ color: 'var(--text-primary)' }}>{u.phone || '-'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => fetchUserDetail(u.id)}
                                    className="w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                >
                                    Lihat Profil Pengguna
                                </button>
                            </motion.div>
                        ))}
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="py-40 text-center" style={{ background: 'var(--bg-base)' }}>
                            <span className="text-9xl font-black italic text-[#38BDF8] opacity-10 uppercase tracking-tighter">KOSONG</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-12" style={{ color: 'var(--text-secondary)' }}>Tidak ada data pengguna yang ditemukan saat ini.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MODAL REGISTER ── */}
            <AnimatePresence>
                {showRegister && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-3xl border border-white/10"
                        >
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-4">Registrasi Pengguna</p>
                                <h3 className="text-4xl font-black italic uppercase italic tracking-tighter text-slate-900 dark:text-white">Tambah Member Baru</h3>
                            </div>

                            <form onSubmit={submitRegister} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-50">Nama Lengkap</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest focus:ring-2 focus:ring-[#38BDF8]/30 transition-all" placeholder="Masukkan nama..." />
                                        {errors.name && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest ml-4 mt-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-50">Alamat Email</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest focus:ring-2 focus:ring-[#38BDF8]/30 transition-all" placeholder="email@contoh.com" />
                                        {errors.email && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest ml-4 mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-50">No. WhatsApp</label>
                                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest focus:ring-2 focus:ring-[#38BDF8]/30 transition-all" placeholder="0812..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-50">Pilih Role</label>
                                            <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest focus:ring-2 focus:ring-[#38BDF8]/30 transition-all appearance-none cursor-pointer">
                                                <option value="user">USER (PENGGUNA)</option>
                                                <option value="admin">ADMIN (PENGELOLA)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest ml-4 opacity-50">Kata Sandi</label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest focus:ring-2 focus:ring-[#38BDF8]/30 transition-all" placeholder="Masukkan password..." />
                                        {errors.password && <p className="text-rose-500 text-[8px] font-black uppercase tracking-widest ml-4 mt-1">{errors.password}</p>}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setShowRegister(false)} className="flex-1 py-4 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all italic">Batal</button>
                                    <button type="submit" disabled={processing} className="flex-[2] py-4 bg-[#38BDF8] text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-[#38BDF8]/20 disabled:opacity-50">Simpan Data →</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL DETAIL ── */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-4xl border border-white/5 overflow-hidden flex flex-col md:flex-row h-[80vh]"
                        >
                            <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-12 border-b md:border-b-0 md:border-r border-white/5 space-y-8 overflow-y-auto">
                                <div className="space-y-6">
                                    <div className="w-24 h-24 rounded-3xl bg-[#38BDF8] flex items-center justify-center text-white text-5xl font-black italic shadow-2xl">
                                        {selectedUser.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-4">{selectedUser.user.name}</h3>
                                        <RoleBadge role={selectedUser.user.role} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#38BDF8] mb-2">Informasi Kontak</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{selectedUser.user.email}</p>
                                        {selectedUser.user.phone ? (
                                            <a
                                                href={`https://wa.me/${selectedUser.user.phone.replace(/^0/, '62')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 group/wa"
                                            >
                                                <p className="text-[10px] font-black text-slate-400 group-hover/wa:text-[#38BDF8] transition-colors uppercase mt-1">WA: {selectedUser.user.phone}</p>
                                                <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full opacity-0 group-hover/wa:opacity-100 transition-all" />
                                            </a>
                                        ) : (
                                            <p className="text-[10px] font-black text-slate-400 uppercase mt-1">WA: -</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#38BDF8] mb-2">Saldo Poin</p>
                                        <p className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{selectedUser.user.points_balance || 0} <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">POIN</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                                <div className="flex-1 p-12 overflow-y-auto">
                                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-10 italic">Riwayat Aktivitas</p>

                                    <div className="space-y-4">
                                        {selectedUser.bookings.length > 0 ? selectedUser.bookings.map((b, i) => (
                                            <div key={b.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-white/5 flex items-center justify-between group transition-all hover:bg-[#38BDF8]/5">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-xs font-black italic text-slate-400 group-hover:text-[#38BDF8] transition-colors">{str_pad(b.id)}</div>
                                                    <div>
                                                        <h5 className="font-black italic uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-2">{b.facility?.name}</h5>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{b.date} • {b.time}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${b.status === 'confirmed' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                                                    b.status === 'cancelled' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' :
                                                        'text-amber-500 border-amber-500/20 bg-amber-500/5'
                                                    }`}>
                                                    {b.status === 'confirmed' ? 'Dikonfirmasi' : b.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu'}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-20 text-center opacity-30 italic uppercase text-[10px] font-black tracking-widest">Belum ada riwayat aktivitas.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="px-12 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] italic shadow-xl hover:scale-105 transition-all"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout >
    );
}

function RoleBadge({ role }) {
    const s = {
        admin: 'text-[#38BDF8] border-[#38BDF8]/20 bg-[#38BDF8]/5 shadow-sm',
        user: 'text-slate-400 border-slate-200 dark:border-white/10 dark:bg-white/5',
    }[role] || 'text-slate-400 border-slate-200 dark:border-white/10 dark:bg-white/5';

    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-xl border ${s} inline-flex items-center gap-2.5 transition-all`}>
            <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-[#38BDF8] animate-pulse' : 'bg-slate-600'}`} />
            {role === 'admin' ? 'ADMIN' : 'USER'}
        </span>
    );
}

function str_pad(val) {
    return `MA-${String(val).padStart(5, '0')}`;
}
