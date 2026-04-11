import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ApplicationIndex({ applications, counts, status: currentStatus }) {
    const [selectedApp, setSelectedApp] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        jadwal_temu: '',
        catatan: '',
    });

    const handleApprove = (app) => {
        setSelectedApp({ ...app, action: 'approve' });
        setData({
            jadwal_temu: app.jadwal_raw || '',
            catatan: app.catatan || '',
        });
    };

    const handleReject = (app) => {
        setSelectedApp({ ...app, action: 'reject' });
        setData({
            catatan: app.catatan || '',
        });
    };

    const handleSchedule = (app) => {
        setSelectedApp({ ...app, action: 'schedule' });
        setData({
            jadwal_temu: app.jadwal_raw || '',
            catatan: app.catatan || '',
        });
    };

    const submitAction = (e) => {
        e.preventDefault();
        const routeName = `admin.applications.${selectedApp.action}`;
        post(route(routeName, selectedApp.id), {
            onSuccess: () => {
                setSelectedApp(null);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mitra Applications Terminal - Mandala Arena" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 pb-32">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b-2 border-dashed transition-all" style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-pulse shadow-[0_0_10px_#38BDF8]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8]">Mandala Mitra Command Center</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                            Mitra <span className="text-[#38BDF8]">Logistics</span>
                        </h1>
                        <p className="max-w-xl text-xs font-bold uppercase tracking-widest opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Signal screening for potential sector partners. Verify operational parameters before approval.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 overflow-x-auto no-scrollbar pb-2">
                        {['all', 'pending', 'approved', 'rejected'].map((s) => (
                            <button key={s} onClick={() => window.location.href = route('admin.applications.index', { status: s })}
                                className={`px-6 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === s ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-900 shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                                {s} ({counts[s]})
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {applications.map((app) => (
                        <motion.div key={app.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="group rounded-[2.5rem] p-8 md:p-12 border-2 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className={`absolute top-0 right-10 w-40 h-1 transition-all ${app.status === 'approved' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-[#FACC15]'}`} />

                            <div className="flex flex-col lg:flex-row gap-12 mt-4">
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8]">Target Identification</p>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                            {app.nama_tempat}
                                        </h3>
                                        <div className="flex flex-wrap gap-6 pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">👤</div>
                                                <div className="flex flex-col"><span className="text-[8px] font-black uppercase opacity-40">Owner Protocol</span><span className="text-xs font-black italic uppercase">{app.nama_pemilik}</span></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">📞</div>
                                                <div className="flex flex-col"><span className="text-[8px] font-black uppercase opacity-40">Signal Link</span><span className="text-xs font-black italic uppercase">{app.no_hp}</span></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">💳</div>
                                                <div className="flex flex-col"><span className="text-[8px] font-black uppercase opacity-40">Financial Port</span><span className="text-xs font-black italic uppercase tracking-widest">{app.qris_rekening}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {app.catatan && (
                                        <div className="bg-white/5 p-6 rounded-3xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-3 italic">Internal Ops Logs / Feedback</p>
                                            <p className="text-xs font-black italic uppercase leading-relaxed text-white/70">{app.catatan}</p>
                                        </div>
                                    )}

                                    {app.jadwal_temu && (
                                        <div className="flex items-center gap-4">
                                            <div className="px-5 py-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                Meeting Initialized: {app.jadwal_temu}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center gap-4 w-full lg:w-72">
                                    {app.status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleApprove(app)} className="w-full py-5 bg-[#10B981] text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all italic">APPROVE MISSION →</button>
                                            <button onClick={() => handleReject(app)} className="w-full py-5 border-2 border-rose-500/30 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all italic">ABORT SIGNAL ✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <div className={`text-center py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] italic mb-2 ${app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                DEPLOYMENT {app.status === 'approved' ? 'GRANTED' : 'REVOKED'}
                                            </div>
                                            <button onClick={() => handleSchedule(app)} className="w-full py-4 border-2 border-white/5 text-white/50 rounded-3xl text-[9px] font-black uppercase tracking-[0.2em] hover:border-white/20 hover:text-white transition-all italic">RESCHEDULE COMMS</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {applications.length === 0 && (
                        <div className="py-40 text-center space-y-4">
                            <p className="text-4xl font-black italic uppercase opacity-10 tracking-widest">No Active Signals</p>
                            <p className="text-[10px] font-black uppercase opacity-20 tracking-[0.5em]">Scanning global frequencies...</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedApp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedApp(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border-2 border-white/10 rounded-[3rem] p-10 md:p-14 w-full max-w-xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-4 mb-10">
                                <div className={`w-3 h-10 rounded-full ${selectedApp.action === 'approve' ? 'bg-[#10B981]' : selectedApp.action === 'reject' ? 'bg-rose-500' : 'bg-[#38BDF8]'}`} />
                                <div>
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                        {selectedApp.action === 'approve' ? 'Authorization' : selectedApp.action === 'reject' ? 'Signal Abort' : 'Comms Schedule'}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{selectedApp.nama_tempat} Protocol</p>
                                </div>
                            </div>

                            <form onSubmit={submitAction} className="space-y-8">
                                {selectedApp.action !== 'reject' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 italic text-white">Jadwal Pertemuan / Initial Meeting</label>
                                        <input type="datetime-local" value={data.jadwal_temu} onChange={e => setData('jadwal_temu', e.target.value)} required
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-3xl px-8 py-5 font-black italic text-xs text-white uppercase focus:border-[#38BDF8] transition-all outline-none" />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 italic text-white">Internal Notes / Ops Feedback</label>
                                    <textarea value={data.catatan} onChange={e => setData('catatan', e.target.value)} placeholder="ENTER FEEDBACK..." rows="4"
                                        className="w-full bg-white/5 border-2 border-white/5 rounded-3xl px-8 py-5 font-black italic text-xs text-white uppercase focus:border-[#38BDF8] transition-all outline-none resize-none" />
                                </div>

                                <button type="submit" disabled={processing}
                                    className={`w-full py-7 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl transition-all ${selectedApp.action === 'approve' ? 'bg-[#10B981] text-slate-900 hover:bg-white' : selectedApp.action === 'reject' ? 'bg-rose-500 text-white hover:bg-white hover:text-rose-500' : 'bg-[#38BDF8] text-slate-900 hover:bg-white'}`}>
                                    {processing ? 'UPLOADING PROTOCOL...' : 'EXECUTE DIRECTIVE →'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
