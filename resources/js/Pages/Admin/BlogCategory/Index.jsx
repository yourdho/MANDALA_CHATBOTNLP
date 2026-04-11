import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function BlogCategoryIndex({ categories }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, reset, processing, errors } = useForm({
        name: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            patch(route('admin.blog_categories.update', editing.id), {
                onSuccess: () => {
                    setEditing(null);
                    reset();
                }
            });
        } else {
            post(route('admin.blog_categories.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Hapus kategori ini?")) {
            router.delete(route('admin.blog_categories.destroy', id));
        }
    };

    const handleEdit = (category) => {
        setEditing(category);
        setData('name', category.name);
    };

    const cancelEdit = () => {
        setEditing(null);
        reset();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Kategori Blog | Admin Mandala" />

            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="border-b pb-6" style={{ borderColor: 'var(--border)' }}>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                        Kategori <span className="text-[#38BDF8]">Blog</span>
                    </h1>
                </div>

                <div className="bg-slate-800/10 p-6 rounded-[2rem] border-2" style={{ borderColor: 'var(--border)' }}>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 w-full space-y-2">
                            <input
                                type="text"
                                placeholder="Nama Kategori..."
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-6 py-4 rounded-xl border-2 italic font-bold text-sm bg-transparent outline-none focus:border-[#38BDF8]"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button type="submit" disabled={processing} className="flex-1 md:flex-none px-8 py-4 bg-[#38BDF8] text-slate-900 font-black uppercase italic tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50">
                                {editing ? 'Update' : 'Tambah'}
                            </button>
                            {editing && (
                                <button type="button" onClick={cancelEdit} className="px-6 py-4 bg-slate-500/20 text-slate-400 font-bold uppercase rounded-xl hover:bg-slate-500/40 transition-all">
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="grid gap-4">
                    {categories.length === 0 ? (
                        <p className="text-slate-500 text-center py-10">Belum ada kategori.</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-6 rounded-2xl border bg-slate-800/5 group hover:bg-slate-800/20 transition-all" style={{ borderColor: 'var(--border)' }}>
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                                    <p className="text-xs text-slate-500">Slug: {cat.slug} / {cat.posts_count || 0} post</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="px-4 py-2 text-xs font-bold bg-[#FACC15]/10 text-[#FACC15] rounded-lg hover:bg-[#FACC15] hover:text-slate-900 transition-all">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">Hapus</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
