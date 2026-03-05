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

    // ── Real-time poin polling ─────────────────────────────
    const [livePoints, setLivePoints] = useState(user?.points_balance ?? pointsData?.balance ?? 0);
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const res = await fetch('/user/points', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.authenticated && typeof data.points_balance === 'number') {
                    setLivePoints(prev => {
                        if (prev !== data.points_balance) {
                            setJustUpdated(true);
                            setTimeout(() => setJustUpdated(false), 2000);
                        }
                        return data.points_balance;
                    });
                }
            } catch (_) { }
        };

        fetchPoints();
        // Poll setiap 10 detik di halaman profil
        const interval = setInterval(fetchPoints, 10000);
        return () => clearInterval(interval);
    }, []);
    // ────────────────────────────────────────────────────────────

    // Ambil dari livePoints (real-time) bukan dari initial prop
    const pointsBalance = livePoints;
    const totalBookings = pointsData?.total_bookings ?? 0;
    const history = pointsData?.history ?? [];

    // Level berdasarkan saldo poin
    const level = pointsBalance >= 10000 ? { name: 'Platinum', color: '#E5E4E2', icon: '💎', next: null }
        : pointsBalance >= 5000 ? { name: 'Gold', color: '#F2D800', icon: '🥇', next: 10000 }
            : pointsBalance >= 1000 ? { name: 'Silver', color: '#C0C0C0', icon: '🥈', next: 5000 }
                : { name: 'Bronze', color: '#CD7F32', icon: '🥉', next: 1000 };

    const progressPct = level.next
        ? Math.min(100, Math.round((pointsBalance / level.next) * 100))
        : 100;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-100">Profil Saya</h2>}
        >
            <Head title="Profil" />

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">

                    {/* ══ POINTS CARD ══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #1A1818 0%, #2a2620 50%, #1A1818 100%)',
                            border: '1px solid rgba(242,216,0,0.2)',
                        }}
                    >
                        {/* Glow background */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ backgroundColor: '#F2D800' }} />
                        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none"
                            style={{ backgroundColor: level.color }} />

                        <div className="relative z-10">
                            {/* Top row: greeting + level */}
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#F2D800]/60 mb-1">
                                        Kartu Poin Janjee
                                    </p>
                                    <p className="text-lg sm:text-xl font-black text-white">
                                        {user?.name ?? 'Pengguna'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                                </div>
                                <div className="flex-shrink-0 text-center">
                                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black border"
                                        style={{
                                            borderColor: level.color + '60',
                                            background: level.color + '15',
                                            color: level.color,
                                        }}>
                                        <span>{level.icon}</span>
                                        <span>{level.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Big points number */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Total Poin Terkumpul
                                    </p>
                                    {/* Indikator live */}
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"
                                            style={{ animation: 'pulse 2s infinite' }}
                                        />
                                        <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
                                        {justUpdated && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -4 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[10px] text-[#F2D800] font-bold"
                                            >
                                                ✦ Updated!
                                            </motion.span>
                                        )}
                                    </span>
                                </div>
                                <motion.p
                                    key={pointsBalance}
                                    initial={{ scale: 1.1, opacity: 0.5 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl sm:text-6xl font-black"
                                    style={{ color: '#F2D800' }}
                                >
                                    {pointsBalance.toLocaleString('id-ID')}
                                    <span className="text-base font-semibold text-slate-400 ml-2">poin</span>
                                </motion.p>
                                <p className="text-sm text-slate-400 mt-1">
                                    ≈ <span className="font-semibold text-white">
                                        Rp {pointsBalance.toLocaleString('id-ID')}
                                    </span> nilai diskon
                                </p>
                            </div>

                            {/* Progress bar ke level berikutnya */}
                            {level.next && (
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                        <span>Menuju <span style={{ color: level.color }} className="font-bold">
                                            {level.next >= 10000 ? 'Platinum' : level.next >= 5000 ? 'Gold' : 'Silver'}
                                        </span></span>
                                        <span>{level.next.toLocaleString('id-ID')} poin</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPct}%` }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: '#F2D800' }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {(level.next - pointsBalance).toLocaleString('id-ID')} poin lagi ke level berikutnya
                                    </p>
                                </div>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Total Booking', value: totalBookings },
                                    { label: 'Nilai Diskon', value: `Rp ${pointsBalance.toLocaleString('id-ID')}` },
                                    { label: 'Level', value: `${level.icon} ${level.name}` },
                                ].map((s) => (
                                    <div key={s.label}
                                        className="rounded-xl p-3 text-center"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                                        <p className="text-sm font-black text-white">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ RIWAYAT POIN ══ */}
                    {history.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#231F1F] rounded-2xl border border-slate-700/50 overflow-hidden"
                        >
                            <div className="px-5 sm:px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Riwayat Poin</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">5 transaksi terakhir yang menghasilkan poin</p>
                                </div>
                                <span className="text-2xl">⭐</span>
                            </div>
                            <div className="divide-y divide-slate-700/40">
                                {history.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + i * 0.06 }}
                                        className="flex items-center justify-between px-5 sm:px-6 py-3.5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'rgba(242,216,0,0.1)' }}>
                                                <span className="text-sm">🏟️</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{item.venue}</p>
                                                <p className="text-xs text-slate-500">{item.date}
                                                    {item.booking_code && (
                                                        <span className="ml-1.5 font-mono text-slate-600">{item.booking_code}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 ml-3">
                                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black"
                                                style={{ background: 'rgba(242,216,0,0.1)', color: '#F2D800' }}>
                                                ⭐ +{item.points.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Info cara dapat poin */}
                            <div className="px-5 sm:px-6 py-4 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500 text-center">
                                    💡 Dapatkan <span className="text-[#F2D800] font-semibold">1 poin</span> untuk setiap
                                    <span className="text-[#F2D800] font-semibold"> Rp 1.000</span> yang dibayarkan.
                                    Poin bisa digunakan sebagai diskon hingga 10% di booking berikutnya.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ══ Pesan jika belum punya poin ══ */}
                    {history.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#231F1F] rounded-2xl border border-slate-700/50 p-6 text-center"
                        >
                            <p className="text-3xl mb-2">⭐</p>
                            <p className="text-sm font-semibold text-white mb-1">Belum Ada Poin</p>
                            <p className="text-xs text-slate-500">
                                Lakukan booking untuk mulai mengumpulkan poin reward!
                                Setiap Rp 1.000 = 1 poin.
                            </p>
                            <a href={route('venues.index')}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#1A1818] hover:scale-105 transition-all"
                                style={{ backgroundColor: '#F2D800' }}>
                                Jelajahi Venue →
                            </a>
                        </motion.div>
                    )}

                    {/* ══ PROFILE INFO FORM ══ */}
                    <div className="bg-[#231F1F] backdrop-blur-md p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-slate-700/50">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-[#231F1F] backdrop-blur-md p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-slate-700/50">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-[#231F1F] backdrop-blur-md p-4 shadow-sm sm:rounded-2xl sm:p-8 border border-slate-700/50">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
