import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

// Daftar kategori yang tersedia di fitur aplikasi
const KATEGORI_USAHA = [
    'Futsal',
    'Mini Soccer',
    'Barbershop',
];

// Kategori yang tidak menggunakan sistem per jam
const KATEGORI_NON_JAM = ['Barbershop'];

export default function MitraVenueCreate() {
    const [form, setForm] = useState({
        name: '', category: '', address: '', description: '', price_per_hour: '',
    });
    const [images, setImages] = useState([]); // { file, preview }
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef();

    const isNonJam = KATEGORI_NON_JAM.includes(form.category);
    const priceLabel = isNonJam ? 'Harga (Rp)' : 'Harga per Jam (Rp)';
    const pricePlaceholder = isNonJam ? 'Contoh: 50000' : 'Contoh: 150000';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCategoryChange = (e) => {
        setForm({ ...form, category: e.target.value, price_per_hour: '' });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setImages(prev => [...prev, ...previews].slice(0, 6));
        // reset input agar bisa pilih file yang sama lagi
        e.target.value = '';
    };

    const removeImage = (idx) => {
        setImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const submit = (e) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        const data = new FormData();
        data.append('name', form.name);
        data.append('category', form.category);
        data.append('address', form.address);
        data.append('description', form.description || '');
        data.append('price_per_hour', form.price_per_hour);
        images.forEach(img => data.append('images[]', img.file));

        router.post(route('mitra.venues.store'), data, {
            forceFormData: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-black text-xl text-white">Tambah Venue Baru</h2>}>
            <Head title="Tambah Venue" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-5 sm:p-6">

                    <form onSubmit={submit} className="space-y-5">
                        {/* Nama Venue */}
                        <Field label="Nama Venue" error={errors.name}>
                            <input name="name" value={form.name} onChange={handleChange}
                                placeholder="Contoh: Arena Futsal Maju" className={inp} required autoFocus />
                        </Field>

                        {/* Kategori Usaha — dropdown */}
                        <Field label="Kategori Usaha" error={errors.category}>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleCategoryChange}
                                className={inp + ' cursor-pointer'}
                                required
                            >
                                <option value="" disabled>-- Pilih kategori usaha --</option>
                                {KATEGORI_USAHA.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </Field>

                        {/* Alamat */}
                        <Field label="Alamat Lengkap" error={errors.address}>
                            <textarea name="address" value={form.address} onChange={handleChange}
                                placeholder="Alamat lengkap lokasi venue" className={inp} rows={3} required />
                        </Field>

                        {/* Deskripsi */}
                        <Field label="Deskripsi (opsional)" error={errors.description}>
                            <textarea name="description" value={form.description} onChange={handleChange}
                                placeholder="Fasilitas, keunggulan, info penting..." className={inp} rows={4} />
                        </Field>

                        {/* Harga — label berubah sesuai kategori */}
                        <Field label={priceLabel} error={errors.price_per_hour}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">Rp</span>
                                <input
                                    name="price_per_hour"
                                    type="number"
                                    value={form.price_per_hour}
                                    onChange={handleChange}
                                    placeholder={pricePlaceholder}
                                    className={inp + ' pl-10'}
                                    min={0}
                                    required
                                />
                            </div>
                            {isNonJam && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Harga tetap per kunjungan / sesi
                                </p>
                            )}
                        </Field>

                        {/* Upload Foto */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Foto Venue <span className="text-slate-500 font-normal">(maks. 6 foto, maks. 3MB/foto)</span>
                            </label>

                            {/* Preview grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative rounded-xl overflow-hidden aspect-video bg-[#1A1818]">
                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors">
                                                ✕
                                            </button>
                                            {idx === 0 && (
                                                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#F2D800] text-[#1A1818] px-1.5 py-0.5 rounded">
                                                    Cover
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {images.length < 6 && (
                                        <button type="button" onClick={() => fileRef.current.click()}
                                            className="aspect-video rounded-xl border-2 border-dashed border-[#2e2a2a] hover:border-[#F2D800]/30 flex items-center justify-center text-slate-600 hover:text-[#F2D800] transition-all">
                                            <span className="text-2xl">+</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {images.length === 0 && (
                                <button type="button" onClick={() => fileRef.current.click()}
                                    className="w-full rounded-xl border-2 border-dashed border-[#2e2a2a] hover:border-[#F2D800]/30 py-8 flex flex-col items-center gap-2 text-slate-500 hover:text-[#F2D800] transition-all">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <span className="text-sm font-medium">Upload Foto Venue</span>
                                    <span className="text-xs text-slate-600">JPG, PNG, WEBP</span>
                                </button>
                            )}

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={handleImages}
                            />
                            {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images}</p>}
                            {'images.*' in errors && <p className="mt-1 text-xs text-red-400">{errors['images.*']}</p>}
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" disabled={processing}
                                className="rounded-full bg-[#F2D800] px-6 py-2.5 text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] transition-all shadow-lg shadow-[#F2D800]/20 disabled:opacity-60">
                                {processing ? 'Menyimpan...' : 'Simpan Venue'}
                            </button>
                            <button type="button" onClick={() => history.back()}
                                className="text-sm text-slate-400 hover:text-white transition-colors">
                                Batal
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}

const inp = 'w-full rounded-xl border border-[#2e2a2a] bg-[#1A1818] text-white placeholder-slate-600 px-3 py-2.5 text-sm focus:border-[#F2D800] focus:ring-1 focus:ring-[#F2D800] focus:outline-none';

function Field({ label, hint, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{label}</label>
            {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
            {children}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
