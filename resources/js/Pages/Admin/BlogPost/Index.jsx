import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function BlogPostIndex({ posts, categories }) {
    const [activeTab, setActiveTab] = useState('posts');
    const [editingCategory, setEditingCategory] = useState(null);

    const { data: catData, setData: setCatData, post: postCat, patch: patchCat, reset: resetCat, processing: catProcessing, errors: catErrors } = useForm({
        name: ''
    });

    const handleDelete = (id) => {
        if (confirm("Hapus artikel ini?")) {
            router.delete(route('admin.blog.destroy', id));
        }
    };

    const handleCatSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            patchCat(route('admin.blog_categories.update', editingCategory.id), {
                onSuccess: () => {
                    setEditingCategory(null);
                    resetCat();
                }
            });
        } else {
            postCat(route('admin.blog_categories.store'), {
                onSuccess: () => resetCat()
            });
        }
    };

    const handleCatDelete = (id) => {
        if (confirm("Hapus kategori ini? Semua artikel dalam kategori ini akan menjadi 'Uncategorized'.")) {
            router.delete(route('admin.blog_categories.destroy', id));
        }
    };

    const handleCatEdit = (category) => {
        setEditingCategory(category);
        setCatData('name', category.name);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Blog | Admin Mandala" />

            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                            Blog <span className="text-[#38BDF8]">Dashboard</span>
                        </h1>
                        <div className="flex p-1 bg-slate-900/50 rounded-2xl w-fit border" style={{ borderColor: 'var(--border)' }}>
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Daftar Artikel ({posts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Kelola Kategori ({categories.length})
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.blog.create')} className="px-8 py-4 bg-[#38BDF8] text-slate-900 font-black uppercase italic tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl shadow-[#38BDF8]/20 flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            Tulis Artikel
                        </Link>
                    </div>
                </div>

                {activeTab === 'posts' ? (
                    <div className="grid gap-6">
                        {posts.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-[3rem] opacity-50" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] italic">Belum ada artikel yang diterbitkan.</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                {/* Desktop View Table */}
                                <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border shadow-2xl" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="border-b uppercase tracking-widest text-[9px] text-slate-500 bg-slate-900/10" style={{ borderColor: 'var(--border)' }}>
                                                <th className="p-6 font-black w-auto">Post Info</th>
                                                <th className="p-6 font-black w-32">Status</th>
                                                <th className="p-6 font-black w-32">Statistik</th>
                                                <th className="p-6 font-black w-40 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                            {posts.map(post => (
                                                <tr key={post.id} className="group hover:bg-white/[0.02] transition-all">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                                {post.thumbnail ? (
                                                                    <img src={post.thumbnail} alt={post.title} className="w-20 h-14 object-cover rounded-xl border-2 shadow-sm" style={{ borderColor: 'var(--border)' }} />
                                                                ) : (
                                                                    <div className="w-20 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-[8px] text-slate-600 font-black italic border-2" style={{ borderColor: 'var(--border)' }}>NO IMG</div>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1 overflow-hidden">
                                                                <p className="font-black text-base leading-none truncate group-hover:text-[#38BDF8] transition-colors italic" style={{ color: 'var(--text-primary)' }}>{post.title}</p>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-black uppercase tracking-widest border" style={{ borderColor: 'var(--border)' }}>
                                                                        {post.category ? post.category.name : 'Uncategorized'}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">by {post.author}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-[0.2em] shadow-sm ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                                            {post.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                <span className="text-[11px] font-black italic text-slate-400">{post.views}</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-600 font-bold italic">{new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right space-x-2">
                                                        <Link href={route('admin.blog.edit', post.id)} className="inline-flex items-center justify-center w-9 h-9 bg-slate-800 text-[#38BDF8] rounded-xl hover:bg-[#38BDF8] hover:text-slate-900 transition-all border shadow-lg" style={{ borderColor: 'var(--border)' }}>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </Link>
                                                        <button onClick={() => handleDelete(post.id)} className="inline-flex items-center justify-center w-9 h-9 bg-slate-800 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border shadow-lg" style={{ borderColor: 'var(--border)' }}>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View Cards */}
                                <div className="lg:hidden space-y-4">
                                    {posts.map(post => (
                                        <div key={post.id} className="p-6 rounded-[2rem] border-2 shadow-xl space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                                            <div className="flex items-start gap-4">
                                                {post.thumbnail ? (
                                                    <img src={post.thumbnail} alt={post.title} className="w-20 h-14 object-cover rounded-xl border shrink-0" style={{ borderColor: 'var(--border)' }} />
                                                ) : (
                                                    <div className="w-20 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-[8px] text-slate-600 font-black italic border shrink-0" style={{ borderColor: 'var(--border)' }}>NO IMAGE</div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-black text-sm italic leading-tight" style={{ color: 'var(--text-primary)' }}>{post.title}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold uppercase tracking-widest border" style={{ borderColor: 'var(--border)' }}>
                                                            {post.category?.name || 'Uncategorized'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                            {post.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        <span className="text-xs font-black italic text-slate-400">{post.views}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">by {post.author}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={route('admin.blog.edit', post.id)} className="w-9 h-9 flex items-center justify-center bg-slate-800 text-[#38BDF8] rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                    <button onClick={() => handleDelete(post.id)} className="w-9 h-9 flex items-center justify-center bg-slate-800 text-rose-500 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="space-y-6">
                            <div className="bg-slate-800/10 p-8 rounded-[2.5rem] border-2 shadow-xl" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6" style={{ color: 'var(--text-primary)' }}>
                                    {editingCategory ? 'Update' : 'Tambah'} <span className="text-[#38BDF8]">Kategori</span>
                                </h3>
                                <form onSubmit={handleCatSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Nama Kategori..."
                                            value={catData.name}
                                            onChange={e => setCatData('name', e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl border-2 italic font-bold text-sm bg-transparent outline-none focus:border-[#38BDF8] transition-all"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            required
                                        />
                                        {catErrors.name && <p className="text-red-500 text-[10px] font-bold italic pl-2">{catErrors.name}</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" disabled={catProcessing} className="flex-1 px-8 py-4 bg-[#38BDF8] text-slate-900 font-black uppercase italic tracking-widest rounded-2xl hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-[#38BDF8]/20 text-xs">
                                            {editingCategory ? 'Update Kategori' : 'Simpan Kategori'}
                                        </button>
                                        {editingCategory && (
                                            <button type="button" onClick={() => { setEditingCategory(null); resetCat(); }} className="px-6 py-4 bg-slate-800 text-slate-400 font-black uppercase rounded-2xl hover:bg-slate-700 transition-all text-xs border" style={{ borderColor: 'var(--border)' }}>
                                                Batal
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <div className="p-8 bg-[#38BDF8]/5 rounded-[2.5rem] border-2 border-dashed border-[#38BDF8]/20">
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest italic">
                                    Kategori membantu Anda mengelompokkan konten berita agar memudahkan User mencari informasi sesuai minat mereka.
                                </p>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-2 space-y-4">
                            {categories.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed rounded-[3rem] opacity-50" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] italic">Belum ada kategori blog.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-6 rounded-[2rem] border bg-slate-800/10 group hover:bg-slate-800/20 transition-all shadow-lg" style={{ borderColor: 'var(--border)' }}>
                                            <div className="min-w-0">
                                                <h3 className="font-black italic text-lg leading-none mb-1.5 group-hover:text-[#38BDF8] transition-colors truncate" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8]/60">{cat.posts_count || 0} Artikel</span>
                                                    <span className="text-[10px] text-slate-600 font-bold italic truncate">Slug: {cat.slug}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleCatEdit(cat)} className="w-10 h-10 flex items-center justify-center bg-slate-800 text-[#FACC15] rounded-xl hover:bg-[#FACC15] hover:text-slate-900 transition-all border group-hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleCatDelete(cat.id)} className="w-10 h-10 flex items-center justify-center bg-slate-800 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border group-hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
