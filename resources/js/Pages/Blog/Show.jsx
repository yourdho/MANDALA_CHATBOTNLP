import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function BlogShow({ post, related }) {
    return (
        <AuthenticatedLayout>
            <Head title={`${post.title} | Blog Mandala Arena`} />

            <article className="max-w-4xl mx-auto pb-20 space-y-10">

                {/* ── Header Area ── */}
                <div className="space-y-6 text-center pt-8">
                    <Link href={route('blog.index')} className="inline-block px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all" style={{ borderColor: 'var(--border)' }}>
                        ← KEMBALI KE BLOG
                    </Link>
                    <div className="flex justify-center">
                        <span className="px-4 py-1.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 text-[10px] font-black uppercase tracking-widest">
                            {post.category?.name || 'Uncategorized'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>
                        {post.title}
                    </h1>
                    <div className="flex justify-center items-center gap-6 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-2">✍ {post.author || 'Admin'}</span>
                        <span className="flex items-center gap-2">📅 {new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="flex items-center gap-2">👁 {post.views} Views</span>
                    </div>
                </div>

                {/* ── Thumbnail ── */}
                {post.thumbnail && (
                    <div className="rounded-[2.5rem] overflow-hidden border-2 shadow-2xl" style={{ borderColor: 'var(--border)' }}>
                        <img src={post.thumbnail} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
                    </div>
                )}

                {/* ── Content Body ── */}
                {post.excerpt && (
                    <div className="p-8 md:p-10 rounded-[2rem] border-l-4 bg-slate-800/20 italic text-lg leading-relaxed shadow-inner" style={{ borderColor: '#FACC15', color: 'var(--text-primary)' }}>
                        {post.excerpt}
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-6"
                    style={{ '--tw-prose-headings': 'var(--text-primary)', '--tw-prose-body': 'var(--text-secondary)' }}
                >
                    {/* Render Content With Line Breaks (Or dangerouslySetInnerHTML if using RichText editor) */}
                    <div className="whitespace-pre-wrap">{post.content}</div>
                </div>

                {/* ── Related Posts ── */}
                {related.length > 0 && (
                    <div className="pt-20 border-t mt-20" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-2xl font-black italic uppercase tracking-widest mb-8" style={{ color: 'var(--text-primary)' }}>Related <span className="text-[#38BDF8]">Posts</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map(r => (
                                <Link key={r.id} href={route('blog.show', r.slug)} className="group">
                                    <div className="h-40 rounded-2xl overflow-hidden mb-4 border" style={{ borderColor: 'var(--border)' }}>
                                        {r.thumbnail ? (
                                            <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs">NO IMG</div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm uppercase tracking-tight group-hover:text-[#38BDF8] transition-colors leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        {r.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">{new Date(r.published_at).toLocaleDateString()}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </AuthenticatedLayout>
    );
}
