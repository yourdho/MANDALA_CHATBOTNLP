import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Edit({ auth, facility, price_schedules = [], master_addons = [] }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        name: facility.name || '',
        category: facility.category || 'Mini Soccer',
        description: facility.description || '',
        price_per_hour: facility.price_per_hour || '',
        open_time: facility.open_time ?? '08:00',
        close_time: facility.close_time ?? '22:00',
        existing_images: facility.images ?? [],
        images: [],
        is_active: !!facility.is_active,
        addons: facility.addons || [],
        price_schedules: price_schedules || [],
    });

    const removeExistingImage = (index) => {
        const newImages = [...data.existing_images];
        newImages.splice(index, 1);
        setData('existing_images', newImages);
    };

    const removeNewImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    const addAddon = () => {
        setData('addons', [...data.addons, { name: '', price: 0 }]);
    };

    const removeAddon = (index) => {
        const newAddons = [...data.addons];
        newAddons.splice(index, 1);
        setData('addons', newAddons);
    };

    const updateAddon = (index, field, value) => {
        const newAddons = [...data.addons];
        newAddons[index][field] = value;
        setData('addons', newAddons);
    };

    const addPriceSchedule = () => {
        setData('price_schedules', [...data.price_schedules, { session_name: '', start_time: '', end_time: '', price: 0 }]);
    };

    const removePriceSchedule = (index) => {
        const newSchedules = [...data.price_schedules];
        newSchedules.splice(index, 1);
        setData('price_schedules', newSchedules);
    };

    const updatePriceSchedule = (index, field, value) => {
        const newSchedules = [...data.price_schedules];
        newSchedules[index][field] = value;
        setData('price_schedules', newSchedules);
    };

    const submit = (e) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            _method: 'PATCH',
        }));
        post(route('admin.facilities.update', facility.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Admin | Edit ${facility.name}`} />

            <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <Link href={route('admin.facilities.index')} className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity flex items-center gap-2 mb-4">
                        ← Back to Hangar
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-900" style={{ color: 'var(--text-primary)' }}>
                        Atur Ulang <span className="text-[#38BDF8]">{facility.name}</span>
                    </h1>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-[3rem] border-2 shadow-2xl overflow-hidden p-8 md:p-12 transition-colors duration-300"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                    <form onSubmit={submit} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Nama Fasilitas</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="NAMA FASILITAS"
                                        className="w-full border-2 rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                    {errors.name && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-4">{errors.name}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Kategori Olahraga</label>
                                    <select value={data.category} onChange={e => setData('category', e.target.value)}
                                        className="w-full border-2 rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                                        <option value="Mini Soccer">Mini Soccer</option>
                                        <option value="Padel">Padel</option>

                                        <option value="Basket">Basketball</option>
                                        <option value="Pilates">Pilates</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-4">{errors.category}</p>}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Harga Per Jam (Standar)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black italic text-[#38BDF8]">RP</span>
                                        <input type="number" value={data.price_per_hour} onChange={e => setData('price_per_hour', e.target.value)} placeholder="150000"
                                            className="w-full border-2 rounded-2xl pl-14 pr-6 py-4 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                    </div>
                                    {errors.price_per_hour && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-4">{errors.price_per_hour}</p>}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Jam Buka</label>
                                        <input type="time" value={data.open_time} onChange={e => setData('open_time', e.target.value)}
                                            className="w-full border-2 rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Jam Tutup</label>
                                        <input type="time" value={data.close_time} onChange={e => setData('close_time', e.target.value)}
                                            className="w-full border-2 rounded-2xl px-6 py-4 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Kelola Foto Fasilitas</label>

                                    {/* Existing Images */}
                                    {data.existing_images.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                            {data.existing_images.map((imgUrl, idx) => (
                                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700 group">
                                                    {imgUrl.endsWith('.mp4') || imgUrl.endsWith('.webm') ? (
                                                        <video src={imgUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={imgUrl} className="w-full h-full object-cover" />
                                                    )}
                                                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 bg-red-500/80 text-white font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">
                                                        DROP
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New Images */}
                                    {data.images.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                            {data.images.map((file, idx) => (
                                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-[#38BDF8] group">
                                                    {file.type.startsWith('video/') ? (
                                                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-80" />
                                                    )}
                                                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute inset-0 bg-red-500/80 text-white font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">
                                                        DROP NEW
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative group/upload">
                                        <input type="file" multiple accept="image/*,video/*" onChange={e => setData('images', [...data.images, ...Array.from(e.target.files)])} className="hidden" id="image-upload" />
                                        <label htmlFor="image-upload" className="w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all text-center" style={{ borderColor: 'var(--border)' }}>
                                            <span className="text-2xl mb-2">📸</span>
                                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                                                + Tambah Koleksi Foto Baru
                                            </p>
                                        </label>
                                    </div>
                                    {errors.images && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-4">{errors.images}</p>}
                                </div>
                            </div>
                        </div>

                        {/* DESKRIPSI & ADDONS GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Deskripsi Fasilitas</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Berikan informasi lengkap fasilitas..." rows={8}
                                    className="w-full border-2 rounded-[2rem] px-8 py-6 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all resize-none shadow-sm"
                                    style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                            </div>

                            {/* DYNAMIC ADDONS MANAGER */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between ml-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic" style={{ color: 'var(--text-secondary)' }}>Add-On</label>
                                    <button type="button" onClick={addAddon} className="px-4 py-2 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-[#38BDF8] hover:text-white transition-all">
                                        + Deploy Addon
                                    </button>
                                </div>

                                {master_addons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 ml-4">
                                        <p className="w-full text-[8px] font-black uppercase tracking-widest opacity-30 italic">PILIH CEPAT DARI DATA MASTER:</p>
                                        {master_addons.map((ma) => (
                                            <button key={ma.id} type="button" onClick={() => setData('addons', [...data.addons, { name: ma.name, price: Number(ma.price) }])}
                                                className="px-3 py-1.5 border-2 border-[#38BDF8]/30 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-[#38BDF8] hover:text-white transition-all">
                                                + {ma.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                                    {data.addons.map((addon, index) => (
                                        <div key={index} className="flex gap-3 items-center group">
                                            <input type="text" value={addon.name} onChange={e => updateAddon(index, 'name', e.target.value)} placeholder="Addon Name"
                                                className="flex-1 border-2 rounded-xl px-4 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                            <div className="relative w-32">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-[#38BDF8]">RP</span>
                                                <input type="number" value={addon.price} onChange={e => updateAddon(index, 'price', e.target.value)} placeholder="0"
                                                    className="w-full border-2 rounded-xl pl-8 pr-3 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                    style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                            </div>
                                            <button type="button" onClick={() => removeAddon(index)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold">✕</button>
                                        </div>
                                    ))}
                                    {data.addons.length === 0 && (
                                        <div className="p-8 border-2 border-dashed rounded-[2rem] text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest" style={{ borderColor: 'var(--border)' }}>
                                            No Extra Logistics Found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PRICE SCHEDULES MANAGER */}
                        <div className="space-y-6 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center justify-between ml-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic" style={{ color: 'var(--text-secondary)' }}>Pengaturan Jam & Harga Khusus</label>
                                <button type="button" onClick={addPriceSchedule} className="px-6 py-3 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#38BDF8] hover:text-white transition-all shadow-glow-blue/20">
                                    + Tambah Jam & Harga Khusus
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {data.price_schedules.map((ps, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-900/5 dark:bg-slate-800/20 p-6 rounded-[2rem] border-2 group" style={{ borderColor: 'var(--border)' }}>
                                        <div className="md:col-span-3">
                                            <input type="text" value={ps.session_name} onChange={e => updatePriceSchedule(index, 'session_name', e.target.value)} placeholder="Nama Sesi (Contoh: Pagi Ceria)"
                                                className="w-full border-2 rounded-xl px-4 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input type="time" value={ps.start_time} onChange={e => updatePriceSchedule(index, 'start_time', e.target.value)}
                                                className="w-full border-2 rounded-xl px-4 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input type="time" value={ps.end_time} onChange={e => updatePriceSchedule(index, 'end_time', e.target.value)}
                                                className="w-full border-2 rounded-xl px-4 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                        </div>
                                        <div className="md:col-span-3 relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#38BDF8]">RP</span>
                                            <input type="number" value={ps.price} onChange={e => updatePriceSchedule(index, 'price', e.target.value)} placeholder="0"
                                                className="w-full border-2 rounded-xl pl-10 pr-4 py-3 font-black italic uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all shadow-sm"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end">
                                            <button type="button" onClick={() => removePriceSchedule(index)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-bold shadow-lg">✕</button>
                                        </div>
                                    </div>
                                ))}
                                {data.price_schedules.length === 0 && (
                                    <div className="p-12 border-2 border-dashed rounded-[3rem] text-center opacity-30 italic text-[11px] font-black uppercase tracking-[0.3em]" style={{ borderColor: 'var(--border)' }}>
                                        Belum ada pengaturan jam & harga khusus.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
                            <Link href={route('admin.facilities.index')} className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-center transition-all hover:bg-slate-100" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                                BATALKAN PERUBAHAN
                            </Link>
                            <button type="submit" disabled={processing} className="flex-[2] py-5 bg-[#38BDF8] text-slate-900 rounded-2xl shadow-xl shadow-[#38BDF8]/20 font-black uppercase text-[10px] tracking-[0.4em] hover:scale-[1.02] disabled:opacity-50 transition-all italic">
                                {processing ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN DATA →'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
