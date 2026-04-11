import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, pointsData }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [livePoints, setLivePoints] = useState(user?.points_balance ?? 0);
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const res = await fetch('/user/points', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.authenticated && typeof data.points_balance === 'number') {
                    if (livePoints !== data.points_balance) {
                        setJustUpdated(true);
                        setTimeout(() => setJustUpdated(false), 3000);
                    }
                    setLivePoints(data.points_balance);
                }
            } catch (_) { }
        };

        fetchPoints();
        const interval = setInterval(fetchPoints, 15000);
        return () => clearInterval(interval);
    }, [livePoints]);

    const level = livePoints >= 10000 ? { name: 'Platinum', color: '#0EA5E9', icon: '', next: null }
        : livePoints >= 5000 ? { name: 'Gold', color: '#F2D800', icon: '', next: 10000 }
            : livePoints >= 1000 ? { name: 'Silver', color: '#64748B', icon: '', next: 5000 }
                : { name: 'Athlete', color: '#0EA5E9', icon: '', next: 1000 };

    const progressPct = level.next ? Math.min(100, Math.round((livePoints / level.next) * 100)) : 100;

    return (
        <AuthenticatedLayout>
            <Head title="Profile | Mandala Arena" />

            <div className="py-10 max-w-4xl mx-auto px-6 lg:px-8 space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Tactical Terminal</p>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                            style={{ color: 'var(--text-primary)' }}>
                            Member <span className="text-[#38BDF8]">Profile</span>
                        </h1>
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-40 italic mt-4" style={{ color: 'var(--text-secondary)' }}>
                            Konfigurasi identitas member dan parameter keamanan sistem.
                        </p>
                    </div>
                </div>

                {/* ══ MANDALA POINTS CARD ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[3rem] p-10 shadow-2xl border transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#38BDF8]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#38BDF8] italic">
                                    Operator Designation
                                </span>
                                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mt-2"
                                    style={{ color: 'var(--text-primary)' }}>
                                    {user.name}
                                </h3>
                                <p className="text-[10px] font-bold mt-2 uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                            </div>
                            <div className="bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                                <span className="text-2xl">{level.icon}</span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] italic" style={{ color: '#38BDF8' }}>
                                    {level.name} Class
                                </span>
                            </div>
                        </div>

                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--text-secondary)' }}>Accumulated Mission Points</span>
                                {justUpdated && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-400 font-black italic">
                                        + DATA SYNCED
                                    </motion.span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl md:text-8xl font-black italic tracking-tighter text-[#38BDF8]">
                                    {livePoints.toLocaleString()}
                                </span>
                                <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>PTS</span>
                            </div>
                        </div>

                        {level.next && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-secondary)' }}>
                                        Promotion Target: <span className="text-[#FACC15] italic">{level.next >= 10000 ? 'Platinum' : level.next >= 5000 ? 'Gold' : 'Silver'}</span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: 'var(--text-secondary)' }}>
                                        {livePoints.toLocaleString()} / {level.next.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-900/50 dark:bg-black/50 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                                        className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Forms Section */}
                <div className="space-y-12">
                    <div className="rounded-[3rem] p-10 border shadow-2xl"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                    <div className="rounded-[3rem] p-10 border shadow-2xl"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <UpdatePasswordForm />
                    </div>
                    <div className="rounded-[3rem] p-10 border shadow-2xl border-red-500/20"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

