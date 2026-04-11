import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function BlogPostEdit({ post: blog, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        title: blog.title || '',
        blog_category_id: blog.blog_category_id || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        author: blog.author || '',
        status: blog.status || 'draft',
        thumbnail: null
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.blog.update', blog.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Artikel Blog | Admin Mandala" />

            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                            Edit <span className="text-[#FACC15]">Artikel</span>
                        </h1>
                    </div>
                </div>

                <div className="bg-slate-800/10 p-6 sm:p-10 rounded-[2.5rem] border-2 shadow-2xl" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                    <form onSubmit={submit} className="space-y-8" encType="multipart/form-data">

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">Judul Artikel</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border-2 font-bold bg-transparent outline-none focus:border-[#38BDF8] transition-colors"
                                style={{ borderColor: errors.title ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                            />
                            {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">Kategori Blog</label>
                                <select
                                    value={data.blog_category_id}
                                    onChange={e => setData('blog_category_id', e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border-2 font-bold bg-slate-900 outline-none focus:border-[#38BDF8] transition-colors appearance-none"
                                    style={{ borderColor: errors.blog_category_id ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                                    required
                                >
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.blog_category_id && <p className="text-red-500 text-xs italic">{errors.blog_category_id}</p>}
                                <div className="mt-2 pl-1">
                                    <Link href={route('admin.blog_categories.index')} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-[#38BDF8] transition-colors flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                        Kelola / Tambah Kategori
                                    </Link>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]">Penulis Artikel</label>
                                <input
                                    type="text"
                                    value={data.author}
                                    onChange={e => setData('author', e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border-2 font-bold bg-transparent outline-none focus:border-[#FACC15] transition-colors"
                                    style={{ borderColor: errors.author ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                                    placeholder="Nama Penulis..."
                                    required
                                />
                                {errors.author && <p className="text-red-500 text-xs italic">{errors.author}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Status Publikasi</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl border-2 font-bold bg-slate-900 outline-none focus:border-emerald-400 transition-colors appearance-none"
                                    style={{ borderColor: errors.status ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                                >
                                    <option value="draft">Draft (Simpan sementara)</option>
                                    <option value="published">Published (Tayangkan)</option>
                                </select>
                            </div>
                            <div className="space-y-2 opacity-0 pointer-events-none md:block md:opacity-100 italic flex items-center pt-8">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                    Simpan sebagai Draft jika Anda masih ingin menyempurnakan tulisan nanti.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Thumbnail (Biarkan kosong jika tidak diganti)</label>
                            {blog.thumbnail && (
                                <img src={blog.thumbnail} alt="Current Thumbnail" className="h-20 w-auto rounded border mb-2" style={{ borderColor: 'var(--border)' }} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setData('thumbnail', e.target.files[0])}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-dashed bg-transparent outline-none focus:border-purple-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-400/20 file:text-purple-400 hover:file:bg-purple-400/30"
                                style={{ borderColor: errors.thumbnail ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Excerpt (Ringkasan Singkat)</label>
                            <textarea
                                value={data.excerpt}
                                onChange={e => setData('excerpt', e.target.value)}
                                rows={2}
                                className="w-full px-6 py-4 rounded-2xl border-2 font-medium bg-transparent outline-none resize-none focus:border-slate-400 transition-colors"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">Isi Konten</label>
                            <textarea
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                rows={15}
                                className="w-full px-6 py-4 rounded-2xl border-2 font-medium bg-transparent outline-none focus:border-[#38BDF8] transition-colors"
                                style={{ borderColor: errors.content ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                            <Link href={route('admin.blog.index')} className="px-8 py-4 rounded-[1.5rem] border-2 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all text-slate-400" style={{ borderColor: 'var(--border)' }}>
                                Batal
                            </Link>
                            <button type="submit" disabled={processing} className="px-10 py-4 rounded-[1.5rem] bg-[#FACC15] text-slate-900 font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50 italic">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
