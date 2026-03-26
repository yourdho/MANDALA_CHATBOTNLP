import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ChatbotAdmin({ dictionary, greeting }) {
    const flash = usePage().props.flash;

    const [greetingText, setGreetingText] = useState(greeting);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ slang: '', formal: '' });

    const openAdd = () => {
        setForm({ slang: '', formal: '' });
        setModal({ mode: 'add' });
    };

    const openEdit = (entry) => {
        setForm({ slang: entry.slang, formal: entry.formal });
        setModal({ mode: 'edit', entry });
    };

    const closeModal = () => setModal(null);

    const submitDictionary = () => {
        if (modal.mode === 'add') {
            router.post(route('admin.chatbot.dictionary.store'), form, { onSuccess: closeModal });
        } else {
            router.put(route('admin.chatbot.dictionary.update', modal.entry.id), form, { onSuccess: closeModal });
        }
    };

    const deleteEntry = (id) => {
        if (!confirm('Hapus kata ini dari kamus?')) return;
        router.delete(route('admin.chatbot.dictionary.destroy', id));
    };

    const saveGreeting = () => {
        router.post(route('admin.chatbot.greeting.update'), { greeting: greetingText });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Chatbot | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12 px-4"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Neural Language Processor Terminal</p>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Chatbot <span className="text-[#38BDF8]">Lexicon</span>
                    </h1>
                </div>
                <button
                    onClick={openAdd}
                    className="px-8 py-4 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all"
                >
                    + Register Signal
                </button>
            </div>
            <Head title="Manajemen Chatbot | Mandala Arena" />

            <div className="max-w-5xl mx-auto space-y-10 pb-20">

                {/* Flash Message */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl"
                        >
                            {flash.success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Greeting Section ── */}
                <div className="rounded-[3.5rem] p-12 border shadow-3xl relative overflow-hidden group transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start gap-8 mb-10">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl border shadow-xl flex-shrink-0"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                            📡
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-2">Automated Response SOP</p>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>SOP Greeting</h3>
                            <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--text-secondary)' }}>Standard mission briefing for incoming signal requests.</p>
                        </div>
                    </div>
                    <textarea
                        value={greetingText}
                        onChange={e => setGreetingText(e.target.value)}
                        rows={4}
                        className="w-full rounded-[2rem] border px-10 py-8 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 resize-none transition-all italic"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        placeholder="DEFINE STARTUP SIGNAL..."
                    />
                    <button
                        onClick={saveGreeting}
                        className="mt-8 bg-[#38BDF8] text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] px-10 py-5 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#38BDF8]/20 italic"
                    >
                        UPDATE MISSION PROTOCOL
                    </button>
                </div>

                {/* ── Kamus Slang ── */}
                <div className="rounded-[3.5rem] p-12 border shadow-3xl transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-start gap-8">
                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl border shadow-xl flex-shrink-0"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                📖
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em] mb-2">Signal Translation Matrix</p>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Pilot Lexicon</h3>
                                <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{ color: 'var(--text-secondary)' }}>Mapping informal signals to HQ-approved directives.</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                            {dictionary.length} SIGNALS MAPS
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] overflow-hidden border transition-all"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em] border-b"
                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                <tr>
                                    <th className="px-10 py-10 whitespace-nowrap">Input Signal (Slang)</th>
                                    <th className="px-10 py-10 whitespace-nowrap">Directive (Formal)</th>
                                    <th className="px-12 py-10 text-right whitespace-nowrap">Correction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {dictionary.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-32 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 italic" style={{ color: 'var(--text-secondary)' }}>LEXICON IS EMPTY. STANDBY FOR SIGNAL INPUT.</p>
                                        </td>
                                    </tr>
                                ) : dictionary.map((entry, i) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-slate-500/5 transition-all"
                                    >
                                        <td className="px-10 py-8">
                                            <span className="font-black italic text-sm text-[#38BDF8] border border-[#38BDF8]/20 bg-[#38BDF8]/5 rounded-xl px-4 py-2 uppercase tracking-widest">
                                                {entry.slang}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-sm font-black uppercase italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>{entry.formal}</td>
                                        <td className="px-12 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openEdit(entry)}
                                                    className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest border rounded-xl hover:bg-[#38BDF8] hover:text-slate-900 transition-all shadow-lg italic"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                >
                                                    Modify
                                                </button>
                                                <button
                                                    onClick={() => deleteEntry(entry.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Modal Add/Edit ── */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="rounded-[3.5rem] w-full max-w-lg shadow-3xl relative z-10 overflow-hidden border transition-all"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                        >
                            <div className="p-16 space-y-10">
                                <div>
                                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.4em] mb-3">Signal Calibration</p>
                                    <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter"
                                        style={{ color: 'var(--text-primary)' }}>
                                        {modal.mode === 'add' ? <>Register <span className="text-[#38BDF8]">Signal</span></> : <>Modify <span className="text-[#38BDF8]">Signal</span></>}
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Input Signal (Slang)</label>
                                        <input
                                            type="text"
                                            value={form.slang}
                                            onChange={e => setForm({ ...form, slang: e.target.value })}
                                            placeholder="SIGNAL.CODE..."
                                            className="w-full border-none rounded-2xl p-6 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                                            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic ml-4" style={{ color: 'var(--text-secondary)' }}>Directive (Formal Replacement)</label>
                                        <input
                                            type="text"
                                            value={form.formal}
                                            onChange={e => setForm({ ...form, formal: e.target.value })}
                                            placeholder="DIRECTIVE.VALUE..."
                                            className="w-full border-none rounded-2xl p-6 font-black italic uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                                            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all italic"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={submitDictionary}
                                        disabled={!form.slang || !form.formal}
                                        className="flex-[2] py-5 bg-[#38BDF8] text-slate-900 rounded-2xl shadow-xl shadow-[#38BDF8]/20 font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed transition-all italic"
                                    >
                                        {modal.mode === 'add' ? 'EXECUTE REGISTRY' : 'UPDATE SIGNAL'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}

