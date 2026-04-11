import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function FacilityAdminIndex({ facilities }) {

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data fasilitas ini secara permanen?')) {
            router.delete(route('admin.facilities.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Fasilitas | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Manajemen <span className="text-[#38BDF8]">Fasilitas</span>
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: 'var(--text-secondary)' }}>
                            {facilities.length} ASSETS ACTIVE
                        </span>
                    </div>
                    <Link
                        href={route('admin.facilities.create')}
                        className="px-8 py-4 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all"
                    >
                        Tambah Fasilitas
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {facilities.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden group flex flex-col transition-all"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        >
                            <div className="h-64 -mx-8 -mt-8 bg-slate-900 relative overflow-hidden mb-8 border-b"
                                style={{ borderColor: 'var(--border)' }}>
                                {f.images?.[0] ? (
                                    f.images[0].endsWith('.mp4') || f.images[0].endsWith('.webm') ? (
                                        <video src={f.images[0]} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                                    ) : (
                                        <img src={f.images[0]} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#38BDF8] font-black italic text-8xl opacity-10">M</div>
                                )}
                                <div className="absolute top-6 right-6 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#38BDF8] border border-[#38BDF8]/30 shadow-2xl"
                                    style={{ background: 'var(--bg-card)' }}>
                                    ID: {f.id.toString().padStart(3, '0')}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-2" style={{ color: 'var(--text-primary)' }}>{f.name}</h4>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${f.is_active ? 'text-[#38BDF8]' : 'text-rose-500'}`}>
                                            {f.category} {f.is_active ? '• Active' : '• OOS'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-3xl font-black italic tracking-tighter mb-8" style={{ color: 'var(--text-primary)' }}>
                                    RP {parseInt(f.price_per_hour).toLocaleString('id-ID')} <span className="text-[10px] opacity-40 uppercase tracking-widest ml-1 not-italic">/ Hour</span>
                                </p>

                                <div className="mt-auto flex gap-4 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <Link
                                        href={route('admin.facilities.edit', f.id)}
                                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all border"
                                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                    >
                                        Edit Fasilitas
                                    </Link>
                                    <button onClick={() => handleDelete(f.id)}
                                        className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {facilities.length === 0 && (
                        <div className="col-span-full py-32 text-center rounded-[3rem] border"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <span className="text-8xl font-black italic text-[#38BDF8] opacity-10 block mb-12 uppercase tracking-tighter">Empty Fleet</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-secondary)' }}>Belum ada aset lapangan terdaftar dalam database.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

