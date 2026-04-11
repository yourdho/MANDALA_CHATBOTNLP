import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BlogIndex({ featured, posts, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('blog.index'), { search, category: filters.category }, { preserveState: true });
    };

    // Combine featured and regular posts into one uniform list for a cleaner grid view
    const allPosts = featured ? [featured, ...posts] : posts;

    return (
        <AuthenticatedLayout>
            <Head title="Promo & Berita | Mandala Arena" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">

                {/* ── Page Header & Search ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-700 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Promo dan Berita Mandala Arena
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Informasi terbaru, tips olahraga, dan promo spesial untuk Anda.
                        </p>

                        {/* ── Category Pills ── */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            <Link
                                href={route('blog.index', { search: filters.search })}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${!filters.category ? 'bg-[#38BDF8] text-slate-900 border-[#38BDF8]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-[#38BDF8] hover:text-[#38BDF8]'}`}
                            >
                                Semua
                            </Link>
                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={route('blog.index', { category: cat.slug, search: filters.search })}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${filters.category === cat.slug ? 'bg-[#38BDF8] text-slate-900 border-[#38BDF8]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-[#38BDF8] hover:text-[#38BDF8]'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Cari artikel..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full md:w-64 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all text-sm"
                        />
                        <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#38BDF8] text-slate-900 font-semibold text-sm hover:bg-[#0ea5e9] transition-colors">
                            Cari
                        </button>
                    </form>
                </div>

                {/* ── Grid Post ── */}
                {allPosts.length === 0 ? (
                    <div className="py-20 text-center rounded-xl bg-slate-800 border border-slate-700">
                        <p className="text-slate-400">Belum ada artikel ditemukan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPosts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 hover:shadow-xl transition-all flex flex-col group"
                            >
                                <div className="aspect-[16/10] overflow-hidden relative bg-slate-700">
                                    {post.thumbnail ? (
                                        <img
                                            src={post.thumbnail}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">
                                            NO IMAGE
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#38BDF8] transition-colors">
                                        <Link href={route('blog.show', post.slug)}>
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-slate-300 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt || String(post.content).replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700 text-sm">
                                        <span className="text-slate-400">
                                            {new Date(post.published_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <Link
                                            href={route('blog.show', post.slug)}
                                            className="text-[#38BDF8] font-semibold hover:underline flex items-center gap-1"
                                        >
                                            Selengkapnya
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
        </AuthenticatedLayout>
    );
}
