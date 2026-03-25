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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                        Chatbot <span className="text-[#38BDF8]">Dictionary</span>
                    </h2>
                    <button
                        onClick={openAdd}
                        className="bg-slate-900 text-white hover:bg-[#38BDF8] transition-all font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-widest"
                    >
                        + Tambah Kata
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Chatbot | Mandala Arena" />

            <div className="max-w-5xl mx-auto space-y-10 pb-20">

                {/* Flash Message */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-2xl"
                        >
                            ✅ {flash.success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Greeting Section ── */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/10 flex items-center justify-center text-3xl border border-[#38BDF8]/10 flex-shrink-0">
                            🤖
                        </div>
                        <div>
                            <h3 className="text-2xl font-['Permanent_Marker'] italic uppercase text-slate-900">Pesan Sapaan</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Pesan yang dikirim chatbot saat pertama kali chat atau intent tidak dikenali.</p>
                        </div>
                    </div>
                    <textarea
                        value={greetingText}
                        onChange={e => setGreetingText(e.target.value)}
                        rows={4}
                        className="w-full rounded-3xl bg-slate-50 border border-slate-100 text-slate-800 px-8 py-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 resize-none"
                        placeholder="Contoh: Halo! Mau booking lapangan?"
                    />
                    <button
                        onClick={saveGreeting}
                        className="mt-6 bg-[#38BDF8] text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-[#38BDF8]/20"
                    >
                        Simpan Greeting ⚡
                    </button>
                </div>

                {/* ── Kamus Slang ── */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-3xl border border-[#FACC15]/10 flex-shrink-0">
                                📖
                            </div>
                            <div>
                                <h3 className="text-2xl font-['Permanent_Marker'] italic uppercase text-slate-900">Kamus Slang</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Kata informal → formal yang dikenali oleh NLP engine chatbot.</p>
                            </div>
                        </div>
                        <span className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {dictionary.length} Entri
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-100">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Kata Slang</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Formal / Pengganti</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 w-32 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {dictionary.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-24 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <span className="text-4xl opacity-20 block mb-4">📖</span>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Kamus masih kosong. Tambahkan kata pertama!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dictionary.map((entry, i) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-slate-50/80 transition-all"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-[#38BDF8] bg-[#38BDF8]/5 border border-[#38BDF8]/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest">
                                                {entry.slang}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-slate-700 font-bold text-sm">{entry.formal}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(entry)}
                                                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#38BDF8] border border-slate-100 rounded-xl hover:border-[#38BDF8]/20 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteEntry(entry.id)}
                                                    className="px-3 py-2 text-[10px] rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                                >
                                                    🗑️
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
                            className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-12 space-y-8">
                                <h3 className="text-3xl font-['Permanent_Marker'] italic uppercase text-slate-900">
                                    {modal.mode === 'add' ? <>Tambah <span className="text-[#38BDF8]">Kata Baru</span></> : <>Edit <span className="text-[#38BDF8]">Kata</span></>}
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kata Slang / Informal</label>
                                        <input
                                            type="text"
                                            value={form.slang}
                                            onChange={e => setForm({ ...form, slang: e.target.value })}
                                            placeholder="cth: gaspol, gaskeun, skrg"
                                            className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-[#38BDF8]/30 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kata Formal (Pengganti)</label>
                                        <input
                                            type="text"
                                            value={form.formal}
                                            onChange={e => setForm({ ...form, formal: e.target.value })}
                                            placeholder="cth: ayo, lakukan, sekarang"
                                            className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 focus:ring-2 focus:ring-[#38BDF8]/30 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={submitDictionary}
                                        disabled={!form.slang || !form.formal}
                                        className="flex-[2] py-4 bg-[#38BDF8] text-white rounded-2xl shadow-lg shadow-[#38BDF8]/20 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#38BDF8]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        {modal.mode === 'add' ? 'Tambah Kata ⚡' : 'Simpan Perubahan ✓'}
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
