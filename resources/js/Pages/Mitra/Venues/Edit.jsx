import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const KATEGORI_USAHA = ['Futsal', 'Mini Soccer', 'Barbershop'];
const KATEGORI_NON_JAM = ['Barbershop'];


export default function MitraVenueEdit({ venue }) {
    const [form, setForm] = useState({
        name: venue.name || '', category: venue.category || '',
        address: venue.address || '', description: venue.description || '',
        price_per_hour: venue.price_per_hour || '', status: venue.status || 'open',
    });

    // Existing images from server
    const [existingImages, setExistingImages] = useState(venue.image_urls || []);
    const [removedPaths, setRemovedPaths] = useState([]);
    // New uploads
    const [newImages, setNewImages] = useState([]); // { file, preview }
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        const total = existingImages.length + newImages.length + files.length;
        const allowed = Math.min(files.length, 6 - existingImages.length - newImages.length);
        const previews = files.slice(0, allowed).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setNewImages(prev => [...prev, ...previews]);
    };

    const removeExisting = (path) => {
        setRemovedPaths(prev => [...prev, path]);
        setExistingImages(prev => prev.filter(img => img.path !== path));
    };

    const removeNew = (idx) => {
        setNewImages(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData();
        data.append('_method', 'PUT');
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        newImages.forEach(img => data.append('new_images[]', img.file));
        removedPaths.forEach(p => data.append('removed_images[]', p));

        router.post(route('mitra.venues.update', venue.id), data, {
            forceFormData: true,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    const totalImages = existingImages.length + newImages.length;

    return (
        <AuthenticatedLayout header={<h2 className="font-black text-xl text-white">Edit Venue</h2>}>
            <Head title="Edit Venue" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[#231F1F] rounded-2xl border border-[#2e2a2a] p-5 sm:p-6">

                    <form onSubmit={submit} className="space-y-5">
                        <Field label="Nama Venue" error={errors.name}>
                            <input name="name" value={form.name} onChange={handleChange} className={inp} required autoFocus />
                        </Field>

                        <Field label="Kategori Usaha" error={errors.category}>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={inp + ' cursor-pointer'}
                                required
                            >
                                <option value="" disabled>-- Pilih kategori --</option>
                                {KATEGORI_USAHA.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Alamat Lengkap" error={errors.address}>
                            <textarea name="address" value={form.address} onChange={handleChange} className={inp} rows={3} required />
                        </Field>

                        <Field label="Deskripsi (opsional)" error={errors.description}>
                            <textarea name="description" value={form.description} onChange={handleChange} className={inp} rows={4} />
                        </Field>

                        <Field label={KATEGORI_NON_JAM.includes(form.category) ? 'Harga (Rp)' : 'Harga per Jam (Rp)'} error={errors.price_per_hour}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold select-none">Rp</span>
                                <input name="price_per_hour" type="number" value={form.price_per_hour} onChange={handleChange} className={inp + ' pl-10'} min={0} required />
                            </div>
                        </Field>

                        <Field label="Status" error={errors.status}>
                            <select name="status" value={form.status} onChange={handleChange} className={inp} required>
                                <option value="open">Buka</option>
                                <option value="closed">Tutup</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </Field>

                        {/* Photo Management */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Foto Venue <span className="text-slate-500 font-normal">({totalImages}/6)</span>
                            </label>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {/* Existing */}
                                {existingImages.map((img, idx) => (
                                    <div key={img.path} className="relative rounded-xl overflow-hidden aspect-video bg-[#1A1818]">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeExisting(img.path)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors">
                                            ✕
                                        </button>
                                        {idx === 0 && newImages.length === 0 && (
                                            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#F2D800] text-[#1A1818] px-1.5 py-0.5 rounded">Cover</span>
                                        )}
                                    </div>
                                ))}

                                {/* New previews */}
                                {newImages.map((img, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-video bg-[#1A1818]">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeNew(idx)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors">
                                            ✕
                                        </button>
                                        <span className="absolute top-1 left-1 text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">Baru</span>
                                    </div>
                                ))}

                                {/* Add more button */}
                                {totalImages < 6 && (
                                    <button type="button" onClick={() => fileRef.current.click()}
                                        className="aspect-video rounded-xl border-2 border-dashed border-[#2e2a2a] hover:border-[#F2D800]/30 flex items-center justify-center text-slate-600 hover:text-[#F2D800] transition-all">
                                        <span className="text-2xl">+</span>
                                    </button>
                                )}
                            </div>

                            {totalImages === 0 && (
                                <button type="button" onClick={() => fileRef.current.click()}
                                    className="w-full rounded-xl border-2 border-dashed border-[#2e2a2a] hover:border-[#F2D800]/30 py-8 flex flex-col items-center gap-2 text-slate-500 hover:text-[#F2D800] transition-all">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <span className="text-sm font-medium">Upload Foto Venue</span>
                                </button>
                            )}

                            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" disabled={processing}
                                className="rounded-full bg-[#F2D800] px-6 py-2.5 text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.02] transition-all shadow-lg shadow-[#F2D800]/20 disabled:opacity-60">
                                {processing ? 'Menyimpan...' : 'Update Venue'}
                            </button>
                            <button type="button" onClick={() => history.back()}
                                className="text-sm text-slate-400 hover:text-white transition-colors">Batal</button>
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
