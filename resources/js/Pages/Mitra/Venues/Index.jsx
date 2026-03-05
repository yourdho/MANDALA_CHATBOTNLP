import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function MitraVenuesIndex({ venues }) {
    const statusColors = {
        open: { bg: 'bg-[#F2D800]/10', text: 'text-[#F2D800]', label: 'Buka' },
        closed: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Tutup' },
        maintenance: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Maintenance' },
    };

    const handleDelete = (id, name) => {
        if (confirm(`Hapus venue "${name}"?`)) {
            router.delete(route('mitra.venues.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-bold text-xl text-slate-100 leading-tight">Kelola Venue</h2>
                    <Link
                        href={route('mitra.venues.create')}
                        className="rounded-full bg-gradient-to-r from-[#F2D800] to-[#F2D800] px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#1A1818] shadow-lg shadow-[#F2D800]/20 hover:scale-105 transition-all"
                    >
                        + Tambah
                    </Link>
                </div>
            }
        >
            <Head title="Kelola Venue" />

            <div className="py-8 sm:py-12 px-4 sm:px-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {venues.length === 0 ? (
                        <div className="bg-[#231F1F] rounded-2xl border border-slate-700/50 p-10 sm:p-16 text-center">
                            <p className="text-slate-500 text-sm sm:text-lg mb-4">Belum ada venue.</p>
                            <Link href={route('mitra.venues.create')}
                                className="inline-block rounded-full bg-gradient-to-r from-[#F2D800] to-[#F2D800] px-5 py-2.5 text-sm font-bold text-[#1A1818]">
                                Tambah Venue Pertama
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {venues.map((venue, index) => (
                                <motion.div
                                    key={venue.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="bg-[#231F1F] rounded-2xl p-4 sm:p-6 border border-slate-700/50 shadow-lg flex flex-col"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="text-xs text-slate-400">{venue.category}</span>
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[venue.status]?.bg} ${statusColors[venue.status]?.text}`}>
                                            {statusColors[venue.status]?.label}
                                        </span>
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug flex-1">{venue.name}</h4>
                                    <p className="text-xs sm:text-sm text-slate-400 mb-1 truncate">{venue.address}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F2D800] to-[#F2D800]">
                                            Rp {Number(venue.price_per_hour).toLocaleString('id-ID')}/Jam
                                        </p>
                                        <span className="text-xs text-slate-500">{venue.bookings_count} booking</span>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                                        <Link
                                            href={route('mitra.venues.edit', venue.id)}
                                            className="flex-1 text-center text-xs sm:text-sm font-semibold py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(venue.id, venue.name)}
                                            className="flex-1 text-center text-xs sm:text-sm font-semibold py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
