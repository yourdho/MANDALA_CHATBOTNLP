import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

const FACILITIES = ['Mini Soccer', 'Padel', 'Basket', 'Pilates'];
const SKILL_LABELS = { 1: 'Pemula', 2: 'Dasar', 3: 'Menengah', 4: 'Mahir', 5: 'Pro' };
const SKILL_COLORS = { 1: '#94A3B8', 2: '#38BDF8', 3: '#FACC15', 4: '#F97316', 5: '#EF4444' };

const FACILITY_EMOJI = {
    'Mini Soccer': '⚽',
    'Padel': '🎾',
    'Basket': '🏀',

    'Pilates': '🧘',
};

const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
];

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── KOMPONEN FORM (dipakai untuk Create & Edit) ──────────────────────────────
function MatchForm({ initialData = {}, onSuccess, submitLabel = 'Pasang Iklan', matchId = null }) {
    const isEdit = !!matchId;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        team_name: initialData.team_name || '',
        facility: initialData.facility || '',
        date: initialData.date ? initialData.date.substring(0, 10) : new Date().toISOString().split('T')[0],
        time: initialData.time || '',
        notes: initialData.notes || '',
        contact_type: initialData.contact_type || 'whatsapp',
        contact_value: initialData.contact_value || '',
        skill_level: initialData.skill_level || 3,
    });

    const dates = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d;
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('matchmaking.update', matchId), { onSuccess });
        } else {
            post(route('matchmaking.store'), { onSuccess: () => { reset(); onSuccess?.(); } });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">

            {/* 01. Nama Tim */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#38BDF8]">
                    <span className="w-7 h-7 rounded-full bg-[#38BDF8] text-slate-900 text-[9px] flex items-center justify-center font-black">01</span>
                    Nama Tim / Skuad
                </label>
                <input
                    type="text"
                    placeholder="Contoh: FC MANDALA, GARUDA SQUAD..."
                    value={data.team_name}
                    onChange={e => setData('team_name', e.target.value)}
                    className="w-full border-2 rounded-2xl px-6 py-4 font-bold italic text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/40 transition-all"
                    style={{ background: 'var(--bg-base)', borderColor: errors.team_name ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                />
                {errors.team_name && <p className="text-[10px] text-red-500 font-black uppercase ml-2">{errors.team_name}</p>}
            </div>

            {/* 02. Pilih Cabang Olahraga */}
            <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15]">
                    <span className="w-7 h-7 rounded-full bg-[#FACC15] text-slate-900 text-[9px] flex items-center justify-center font-black">02</span>
                    Cabang Olahraga
                </label>
                <div className="flex flex-wrap gap-3">
                    {FACILITIES.map(f => (
                        <button key={f} type="button" onClick={() => setData('facility', f)}
                            className={`px-5 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2
                                ${data.facility === f
                                    ? 'bg-[#FACC15] border-[#FACC15] text-slate-900 scale-105 shadow-lg'
                                    : 'opacity-50 hover:opacity-100'}`}
                            style={{ borderColor: data.facility === f ? '#FACC15' : 'var(--border)', color: data.facility === f ? '#0F172A' : 'var(--text-primary)' }}>
                            <span>{FACILITY_EMOJI[f]}</span> {f}
                        </button>
                    ))}
                </div>
                {errors.facility && <p className="text-[10px] text-red-500 font-black uppercase ml-2">{errors.facility}</p>}
            </div>

            {/* 03. Tanggal */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                    <span className="w-7 h-7 rounded-full bg-emerald-400 text-slate-900 text-[9px] flex items-center justify-center font-black">03</span>
                    Tanggal Main
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {dates.map(d => {
                        const ds = d.toISOString().split('T')[0];
                        const isActive = data.date === ds;
                        return (
                            <button key={ds} type="button" onClick={() => setData('date', ds)}
                                className={`min-w-[72px] flex-shrink-0 py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all
                                    ${isActive ? 'bg-emerald-400 border-emerald-400 text-slate-900 scale-105 shadow-xl' : 'opacity-40 hover:opacity-80'}`}
                                style={{ borderColor: isActive ? '#34D399' : 'var(--border)' }}>
                                <span className="text-[8px] font-black uppercase">{d.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                <span className="text-xl font-black italic">{d.getDate()}</span>
                                <span className="text-[8px] font-bold uppercase opacity-70">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                            </button>
                        );
                    })}
                </div>
                {errors.date && <p className="text-[10px] text-red-500 font-black uppercase ml-2">{errors.date}</p>}
            </div>

            {/* 04. Jam */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">
                    <span className="w-7 h-7 rounded-full bg-orange-400 text-slate-900 text-[9px] flex items-center justify-center font-black">04</span>
                    Jam Main
                </label>
                <div className="flex flex-wrap gap-3">
                    {TIME_SLOTS.map(t => {
                        const isActive = data.time === t;
                        return (
                            <button key={t} type="button" onClick={() => setData('time', t)}
                                className={`px-4 py-3 rounded-xl border-2 font-mono text-sm font-black transition-all
                                    ${isActive ? 'bg-orange-400 border-orange-400 text-slate-900 scale-105 shadow-lg' : 'opacity-40 hover:opacity-80'}`}
                                style={{ borderColor: isActive ? '#FB923C' : 'var(--border)', color: isActive ? '#0F172A' : 'var(--text-primary)' }}>
                                {t}
                            </button>
                        );
                    })}
                </div>
                {errors.time && <p className="text-[10px] text-red-500 font-black uppercase ml-2">{errors.time}</p>}
            </div>

            {/* 05. Level Skill */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: SKILL_COLORS[data.skill_level] }}>
                    <span className="w-7 h-7 rounded-full text-slate-900 text-[9px] flex items-center justify-center font-black" style={{ background: SKILL_COLORS[data.skill_level] }}>05</span>
                    Level Kemampuan · <span style={{ color: SKILL_COLORS[data.skill_level] }}>{SKILL_LABELS[data.skill_level]}</span>
                </label>
                <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(lvl => (
                        <button key={lvl} type="button" onClick={() => setData('skill_level', lvl)}
                            className={`flex-1 py-3 rounded-2xl border-2 font-black text-xs transition-all ${data.skill_level === lvl ? 'scale-105 shadow-lg' : 'opacity-30 hover:opacity-70'}`}
                            style={{
                                borderColor: data.skill_level === lvl ? SKILL_COLORS[lvl] : 'var(--border)',
                                background: data.skill_level === lvl ? SKILL_COLORS[lvl] + '20' : 'transparent',
                                color: data.skill_level === lvl ? SKILL_COLORS[lvl] : 'var(--text-primary)'
                            }}>
                            {SKILL_LABELS[lvl]}
                        </button>
                    ))}
                </div>
            </div>

            {/* 06. Kontak */}
            <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
                    <span className="w-7 h-7 rounded-full bg-purple-400 text-slate-900 text-[9px] flex items-center justify-center font-black">06</span>
                    Kontak (untuk dihubungi lawan)
                </label>
                <div className="flex gap-3 p-1 rounded-2xl border w-fit" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                    {['whatsapp', 'instagram'].map(ct => (
                        <button key={ct} type="button" onClick={() => setData('contact_type', ct)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.contact_type === ct ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'opacity-40 hover:opacity-70'}`}>
                            {ct === 'whatsapp' ? '📱 WhatsApp' : '📸 Instagram'}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder={data.contact_type === 'whatsapp' ? 'Nomor WA (contoh: 0878...)' : '@username_instagram'}
                    value={data.contact_value}
                    onChange={e => setData('contact_value', e.target.value)}
                    className="w-full border-2 rounded-2xl px-6 py-4 font-bold italic text-sm outline-none focus:ring-2 focus:ring-purple-400/40 transition-all"
                    style={{ background: 'var(--bg-base)', borderColor: errors.contact_value ? '#EF4444' : 'var(--border)', color: 'var(--text-primary)' }}
                />
                {errors.contact_value && <p className="text-[10px] text-red-500 font-black uppercase ml-2">{errors.contact_value}</p>}
            </div>

            {/* 07. Catatan tambahan */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-7 h-7 rounded-full bg-slate-500 text-white text-[9px] flex items-center justify-center font-black">07</span>
                    Catatan (opsional)
                </label>
                <textarea
                    placeholder="Contoh: Butuh 5 lawan, bawa jersey, bersedia tanggung biaya sewa..."
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    rows={3}
                    className="w-full border-2 rounded-2xl px-6 py-4 font-medium text-sm outline-none focus:ring-2 focus:ring-slate-400/40 transition-all resize-none"
                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
            </div>

            {/* Submit */}
            <button type="submit" disabled={processing}
                className="w-full py-6 rounded-[2rem] bg-[#38BDF8] text-slate-900 font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-[#38BDF8]/30 hover:scale-[1.02] hover:bg-white transition-all italic disabled:opacity-50">
                {processing ? 'Menyimpan...' : submitLabel}
            </button>
        </form>
    );
}

// ─── KARTU IKLAN (tampil di daftar) ──────────────────────────────────────────
function MatchCard({ match, isOwn = false, index = 0 }) {
    const [deleting, setDeleting] = useState(false);

    const waLink = match.contact_type === 'whatsapp'
        ? `https://wa.me/${match.contact_value.replace(/\D/g, '').replace(/^0/, '62')}`
        : null;
    const igLink = match.contact_type === 'instagram'
        ? `https://instagram.com/${match.contact_value.replace('@', '')}`
        : null;

    const handleDelete = () => {
        if (!confirm('Hapus iklan cari lawan ini?')) return;
        setDeleting(true);
        router.delete(route('matchmaking.destroy', match.id), {
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
            className="rounded-[2rem] border-2 p-6 md:p-8 transition-all hover:shadow-xl relative overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

            {/* accent bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-[2rem]"
                style={{ background: SKILL_COLORS[match.skill_level] || '#38BDF8' }} />

            <div className="pl-4 flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Emoji & Info */}
                <div className="text-5xl">{FACILITY_EMOJI[match.facility] || '🏅'}</div>

                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                            style={{ color: SKILL_COLORS[match.skill_level], borderColor: SKILL_COLORS[match.skill_level] + '40', background: SKILL_COLORS[match.skill_level] + '15' }}>
                            {SKILL_LABELS[match.skill_level] || 'Menengah'}
                        </span>
                        {isOwn && <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">Iklan Saya</span>}
                    </div>

                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>
                        {match.team_name}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><b>{match.facility}</b></span>
                        <span className="flex items-center gap-1">{formatDate(match.date)}</span>
                        <span className="flex items-center gap-1">{match.time}</span>
                    </div>

                    {match.notes && (
                        <p className="text-xs italic opacity-60 border-l-2 border-slate-500/30 pl-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {match.notes}
                        </p>
                    )}

                    {isOwn && match.user && (
                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold" style={{ color: 'var(--text-secondary)' }}>
                            Dipasang oleh: {match.user?.name || 'Kamu'}
                        </p>
                    )}
                </div>

                {/* Tombol aksi */}
                <div className="flex flex-row sm:flex-col gap-3 items-start sm:items-end shrink-0">
                    {!isOwn && (
                        <a href={waLink || igLink} target="_blank" rel="noreferrer"
                            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg
                                bg-[#38BDF8] text-slate-900 hover:scale-105 hover:bg-white hover:shadow-[#38BDF8]/30 italic">
                            {match.contact_type === 'whatsapp' ? '📱 Hubungi WA' : '📸 Buka IG'}
                        </a>
                    )}

                    {isOwn && (
                        <div className="flex gap-2">
                            <Link href={route('matchmaking.edit', match.id)}
                                className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all hover:scale-105 italic"
                                style={{ borderColor: '#38BDF8', color: '#38BDF8' }}>
                                ✏ Edit
                            </Link>
                            <button onClick={handleDelete} disabled={deleting}
                                className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-105 italic disabled:opacity-50">
                                {deleting ? '...' : '🗑 Hapus'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── HALAMAN UTAMA ─────────────────────────────────────────────────────────────
export default function MatchesIndex({ my_matches = [], available_matches = [], editing_match = null }) {
    const [showForm, setShowForm] = useState(!!editing_match);
    const [activeTab, setActiveTab] = useState('board'); // 'board' | 'mine'

    const isEditing = !!editing_match;

    return (
        <AuthenticatedLayout>
            <Head title="Cari Lawan | Mandala Arena" />

            <div className="max-w-5xl mx-auto pb-20 space-y-10">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-10"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-3">Mandala Arena</p>
                        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>
                            Cari <span className="text-[#38BDF8]">Lawan</span>
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-widest mt-3 opacity-50 italic" style={{ color: 'var(--text-secondary)' }}>
                            Pasang iklan, biarkan lawan menghubungi kamu langsung
                        </p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setShowForm(p => !p)}
                            className={`px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl italic
                                ${showForm ? 'bg-slate-700 text-white' : 'bg-[#38BDF8] text-slate-900 hover:bg-white hover:scale-105'}`}>
                            {showForm ? '✕ Tutup Form' : '＋ Pasang Iklan'}
                        </button>
                    )}
                </div>

                {/* ── Form (collapsible atau edit mode) ── */}
                <AnimatePresence>
                    {(showForm || isEditing) && (
                        <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }}
                            className="rounded-[2.5rem] border-2 p-6 md:p-10 overflow-hidden"
                            style={{ background: 'var(--bg-card)', borderColor: isEditing ? '#FACC15' : '#38BDF8' }}>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1 h-8 rounded-full" style={{ background: isEditing ? '#FACC15' : '#38BDF8' }} />
                                <h2 className="text-xl font-black italic uppercase tracking-tight" style={{ color: isEditing ? '#FACC15' : '#38BDF8' }}>
                                    {isEditing ? 'Edit Iklan Cari Lawan' : 'Pasang Iklan Cari Lawan'}
                                </h2>
                            </div>
                            <MatchForm
                                initialData={editing_match || {}}
                                matchId={editing_match?.id}
                                submitLabel={isEditing ? 'Simpan Perubahan' : 'Pasang Iklan'}
                                onSuccess={() => {
                                    if (!isEditing) setShowForm(false);
                                    router.visit(route('matchmaking.index'));
                                }}
                            />
                            {isEditing && (
                                <Link href={route('matchmaking.index')} className="block mt-6 text-center text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-80 transition italic">
                                    ← Batal, kembali ke daftar
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Tab Switcher ── */}
                {!isEditing && (
                    <div className="flex rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                        {[
                            { key: 'board', label: `Iklan (${available_matches.length})` },
                            { key: 'mine', label: `Milik Saya (${my_matches.length})` },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-5 font-black text-xs uppercase tracking-widest transition-all relative
                                    ${activeTab === tab.key ? 'text-[#38BDF8]' : 'opacity-40 hover:opacity-70'}`}>
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div layoutId="tab-bar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38BDF8]" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Daftar Iklan ── */}
                {!isEditing && (
                    <AnimatePresence mode="wait">
                        {activeTab === 'board' ? (
                            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {available_matches.length === 0 ? (
                                    <EmptyState message="Belum ada iklan cari lawan tersedia. Jadilah yang pertama!" />
                                ) : (
                                    available_matches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {my_matches.length === 0 ? (
                                    <EmptyState message="Kamu belum pasang iklan. Klik '+ Pasang Iklan' untuk mulai!" />
                                ) : (
                                    my_matches.map((m, i) => <MatchCard key={m.id} match={m} index={i} isOwn />)
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
        </AuthenticatedLayout>
    );
}

function EmptyState({ message }) {
    return (
        <div className="py-24 text-center space-y-4 rounded-[2rem] border-2 border-dashed opacity-50" style={{ borderColor: 'var(--border)' }}>
            <div className="text-5xl">🔍</div>
            <p className="text-xs font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
    );
}
