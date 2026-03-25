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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Manajemen <span className="text-[#38BDF8]">Fasilitas</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-[#38BDF8]/30">
                            {facilities.length} Unit Aktif
                        </span>
                        <Link
                            href={route('admin.facilities.create')}
                            className="bg-slate-900 text-white hover:bg-[#38BDF8] hover:shadow-lg hover:shadow-[#38BDF8]/30 transition-all font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-widest border border-transparent"
                        >
                            + Tambah Lapangan
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Fasilitas | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {facilities.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group flex flex-col"
                        >
                            <div className="h-56 -mx-8 -mt-8 bg-slate-100 relative overflow-hidden mb-8 border-b border-slate-50">
                                {f.images?.[0] ? (
                                    <img src={f.images[0]} alt={f.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 font-['Permanent_Marker'] italic text-6xl">M</div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#38BDF8] border border-white/50 shadow-sm">
                                    ID: {f.id.toString().padStart(3, '0')}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-3xl font-['Permanent_Marker'] italic uppercase tracking-tight text-slate-900 leading-none mb-2">{f.name}</h4>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                            {f.category}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[#38BDF8] font-black text-2xl italic tracking-tight mb-8">
                                    Rp {parseInt(f.price_per_hour).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-1 not-italic">/ Jam</span>
                                </p>

                                <div className="mt-auto flex gap-3 pt-6 border-t border-slate-50">
                                    <Link
                                        href={route('admin.facilities.edit', f.id)}
                                        className="flex-1 bg-slate-50 text-slate-600 hover:bg-[#FACC15] hover:text-amber-900 hover:shadow-lg hover:shadow-[#FACC15]/30 text-[10px] font-black py-4 rounded-xl uppercase tracking-widest text-center transition-all border border-slate-100"
                                    >
                                        Edit Harga/Jam
                                    </Link>
                                    <button onClick={() => handleDelete(f.id)} className="px-6 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all border border-red-100 text-[10px] font-black uppercase tracking-widest">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {facilities.length === 0 && (
                        <div className="col-span-full py-24 text-center rounded-[3rem] bg-white border border-slate-100 shadow-sm">
                            <span className="text-5xl opacity-50 block mb-6">🏟️</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Belum ada aset lapangan terdaftar.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
