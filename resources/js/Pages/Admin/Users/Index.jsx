import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function UserAdminIndex({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-base justify-between gap-6 px-4">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic tracking-tight text-slate-900 uppercase leading-none">
                        Daftar <span className="text-[#38BDF8]">Pengguna</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-black px-4 py-2 rounded-full border border-[#38BDF8]/30 uppercase tracking-[0.2em]">
                            {users.length} Akun Aktif
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Pengguna | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="bg-white rounded-[2.5rem] p-0 overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-200">
                                <tr>
                                    <th className="px-10 py-8 whitespace-nowrap">Profil User</th>
                                    <th className="px-10 py-8 whitespace-nowrap">Kontak Info</th>
                                    <th className="px-10 py-8 whitespace-nowrap">Tipe Akses</th>
                                    <th className="px-10 py-8 whitespace-nowrap">Tanggal Registrasi</th>
                                    <th className="px-10 py-8 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {users.map((u, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={u.id}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center font-['Permanent_Marker'] italic text-2xl text-[#38BDF8]">
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <span className="font-['Permanent_Marker'] italic tracking-tight text-slate-900 text-2xl uppercase leading-none group-hover:text-[#38BDF8] transition-colors">
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{u.email}</p>
                                                <p className="text-[9px] text-[#38BDF8] uppercase tracking-[0.2em] leading-none">{u.phone || 'Nomor Belum Diinput'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <RoleBadge role={u.role || 'user'} />
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <p className="text-slate-600 text-xs font-black italic tracking-tighter mb-1 uppercase leading-none">{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(u.created_at).toLocaleTimeString().slice(0, 5)} WIB</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="bg-slate-50 text-slate-500 text-[9px] font-black px-5 py-3 rounded-xl uppercase tracking-widest border border-slate-200 hover:border-[#38BDF8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all shadow-sm">
                                                Detail
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="py-24 text-center rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                                <span className="text-5xl opacity-50 block mb-6">👥</span>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada user yang terdaftar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RoleBadge({ role }) {
    const s = {
        admin: 'text-[#38BDF8] border-[#38BDF8]/20 bg-[#38BDF8]/5 shadow-sm',
        user: 'text-slate-500 border-slate-200 bg-slate-50',
    }[role] || 'text-slate-500 border-slate-200 bg-slate-50';

    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border ${s} inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-[#38BDF8]' : 'bg-slate-400'}`} />
            {role}
        </span>
    );
}
