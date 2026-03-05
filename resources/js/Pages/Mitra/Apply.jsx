import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const KATEGORI_VENUE = [
    'Futsal',
    'Mini Soccer',
    'Barbershop',
];


export default function Apply({ existing }) {
    const { errors } = usePage().props;
    const [form, setForm] = useState({
        nama_tempat: '',
        kategori_venue: '',
        nama_pemilik: '',
        no_hp: '',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('mitra.apply.store'), form);
    };

    const statusMap = {
        pending: { label: 'Menunggu Review Admin', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' },
        approved: { label: 'Disetujui', color: 'text-[#F2D800]', border: 'border-[#F2D800]/20', bg: 'bg-[#F2D800]/10' },
        rejected: { label: 'Ditolak', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' },
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-black text-xl text-white">Daftar Mitra</h2>}
        >
            <Head title="Daftar Mitra - Janjee" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">

                {/* If already applied */}
                {existing && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 rounded-2xl border p-5 ${statusMap[existing.status]?.bg} ${statusMap[existing.status]?.border}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-bold text-white">Pengajuan Kamu</p>
                                <p className={`text-sm font-semibold mt-0.5 ${statusMap[existing.status]?.color}`}>
                                    {statusMap[existing.status]?.label}
                                </p>
                            </div>
                        </div>
                        {existing.jadwal_temu && (
                            <p className="mt-3 text-xs text-slate-400">
                                Jadwal temu: <span className="text-white font-medium">{existing.jadwal_temu}</span>
                            </p>
                        )}
                        {existing.catatan && (
                            <p className="mt-1.5 text-xs text-slate-400">
                                Catatan: <span className="text-slate-300">{existing.catatan}</span>
                            </p>
                        )}
                        {existing.status === 'rejected' && (
                            <p className="mt-3 text-xs text-slate-500">
                                Pengajuan kamu ditolak. Kamu bisa mengajukan kembali di bawah.
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Show form only if no active/pending application */}
                {(!existing || existing.status === 'rejected') && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-5 sm:p-6">

                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            Isi form di bawah untuk mendaftarkan bisnis kamu sebagai Mitra Janjee.
                            Tim kami akan menghubungi kamu untuk konfirmasi dan jadwal temu.
                        </p>

                        {errors?.general && (
                            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FormField
                                label="Nama Tempat Usaha"
                                name="nama_tempat"
                                value={form.nama_tempat}
                                onChange={handleChange}
                                placeholder="Contoh: Arena Futsal Maju"
                                error={errors?.nama_tempat}
                            />

                            {/* Kategori Venue Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                    Kategori Venue
                                </label>
                                <select
                                    name="kategori_venue"
                                    value={form.kategori_venue}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[#2e2a2a] bg-[#1A1818] text-white px-3 py-2.5 text-sm focus:border-[#F2D800] focus:ring-1 focus:ring-[#F2D800] focus:outline-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>-- Pilih jenis venue --</option>
                                    {KATEGORI_VENUE.map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                                {errors?.kategori_venue && (
                                    <p className="mt-1 text-xs text-red-400">{errors.kategori_venue}</p>
                                )}
                            </div>
                            <FormField
                                label="Nama Pemilik"
                                name="nama_pemilik"
                                value={form.nama_pemilik}
                                onChange={handleChange}
                                placeholder="Nama lengkap pemilik usaha"
                                error={errors?.nama_pemilik}
                            />
                            <FormField
                                label="Nomor HP yang Bisa Dihubungi"
                                name="no_hp"
                                value={form.no_hp}
                                onChange={handleChange}
                                placeholder="Contoh: 0812-3456-7890"
                                type="tel"
                                error={errors?.no_hp}
                            />

                            <div className="pt-2">
                                <button type="submit"
                                    className="w-full rounded-full bg-[#F2D800] px-6 py-3 text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] transition-all shadow-lg shadow-[#F2D800]/20">
                                    Kirim Pengajuan
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', error }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-[#2e2a2a] bg-[#1A1818] text-white placeholder-slate-600 px-3 py-2.5 text-sm focus:border-[#F2D800] focus:ring-1 focus:ring-[#F2D800] focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
