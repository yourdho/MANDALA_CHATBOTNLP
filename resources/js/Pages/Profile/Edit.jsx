import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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

    const level = livePoints >= 10000 ? { name: 'Platinum', color: '#0EA5E9', icon: '🏆', next: null }
        : livePoints >= 5000 ? { name: 'Gold', color: '#F2D800', icon: '🥇', next: 10000 }
            : livePoints >= 1000 ? { name: 'Silver', color: '#64748B', icon: '🥈', next: 5000 }
                : { name: 'Athlete', color: '#0EA5E9', icon: '🏃', next: 1000 };

    const progressPct = level.next ? Math.min(100, Math.round((livePoints / level.next) * 100)) : 100;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4 px-2">
                    <h2 className="text-3xl font-black italic tracking-tighter text-dark uppercase leading-none">
                        My Profile
                    </h2>
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                        Athlete Settings
                    </span>
                </div>
            }
        >
            <Head title="Profile | Mandala Arena" />

            <div className="py-10 max-w-4xl mx-auto px-6 lg:px-8 space-y-10">

                {/* ══ MANDALA POINTS CARD ══ */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-dark p-8 md:p-12 shadow-2xl shadow-dark/20 text-white"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
                                    Mandala Points ID
                                </span>
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mt-2">
                                    {user.name}
                                </h3>
                                <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-widest">{user.email}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                                <span className="text-xl">{level.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: level.color }}>
                                    {level.name}
                                </span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Balance Points</span>
                                {justUpdated && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-green-400 font-black italic">
                                        + RECEIVED
                                    </motion.span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-primary">
                                    {livePoints.toLocaleString()}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500 italic">PTS</span>
                            </div>
                        </div>

                        {level.next && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                        Next Level: <span className="text-white italic">{level.next >= 5000 ? 'Gold' : 'Silver'}</span>
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">
                                        {livePoints.toLocaleString()} / {level.next.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Forms Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-premium border border-gray-100">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-premium border border-gray-100">
                        <UpdatePasswordForm />
                    </div>
                    <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 border border-gray-200">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
