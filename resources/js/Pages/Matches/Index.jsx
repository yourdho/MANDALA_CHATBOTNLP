import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { id } from 'date-fns/locale/id';

const FACILITIES = [
    'Mini Soccer',
    'Padel',
    'Basket',
    'Pilates'
];

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
];

export default function MatchesIndex({ my_matches }) {
    const { data, setData, post, processing, errors } = useForm({
        team_name: '',
        facility: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        contact_type: 'whatsapp',
        contact_value: '',
        skill_level: 3,
    });

    const dates = useMemo(() => {
        return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('matchmaking.store'), {
            onSuccess: () => {
                // Success handled by flash
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Cari Lawan | Mandala Arena" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Tactical Matchmaking System</p>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none"
                        style={{ color: 'var(--text-primary)' }}>
                        Cari <span className="text-[#38BDF8]">Lawan</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: 'var(--text-secondary)' }}>Radar Active</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">

                {/* ─── FORM PILOT ─── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-12 space-y-12"
                >
                    <div className="rounded-[2.5rem] md:rounded-[3.5rem] border p-6 md:p-12 shadow-3xl relative overflow-hidden"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        <form onSubmit={handleSubmit} className="space-y-16">
                            {/* Step 1: Arena Selection */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-[#38BDF8] text-slate-900 flex items-center justify-center font-black text-xs italic border-2 border-white/20">01</span>
                                    <h3 className="text-xl font-black italic uppercase tracking-widest text-[#38BDF8]">Select Strategic Asset</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {FACILITIES.map(f => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setData('facility', f)}
                                            className={`p-6 rounded-3xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden group ${data.facility === f ? 'scale-105 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-102'}`}
                                            style={{
                                                borderColor: data.facility === f ? '#38BDF8' : 'var(--border)',
                                                background: data.facility === f ? 'var(--bg-base)' : 'transparent',
                                                color: data.facility === f ? '#38BDF8' : 'var(--text-primary)'
                                            }}
                                        >
                                            {f}
                                            {data.facility === f && (
                                                <motion.div layoutId="active-fac-bg" className="absolute inset-0 bg-[#38BDF8]/5 -z-10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.facility && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-14">{errors.facility}</p>}
                            </div>

                            {/* Step 2: Date Grid */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-[#FACC15] text-slate-900 flex items-center justify-center font-black text-xs italic border-2 border-white/20">02</span>
                                    <h3 className="text-xl font-black italic uppercase tracking-widest text-[#FACC15]">Mission Date</h3>
                                </div>
                                <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar mask-fade-right -mx-6 px-6 md:mx-0 md:px-0">
                                    {dates.map((date, i) => {
                                        const dateStr = format(date, 'yyyy-MM-dd');
                                        const isSelected = data.date === dateStr;
                                        return (
                                            <button
                                                key={dateStr}
                                                type="button"
                                                onClick={() => setData('date', dateStr)}
                                                className={`flex-shrink-0 w-24 h-28 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all ${isSelected ? 'scale-105 border-[#FACC15] bg-[#FACC15]/5 shadow-xl shadow-[#FACC15]/10' : 'opacity-40 hover:opacity-100 hover:scale-102'}`}
                                                style={{ borderColor: isSelected ? '#FACC15' : 'var(--border)' }}
                                            >
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-[#FACC15]' : 'text-slate-400'}`}>
                                                    {format(date, 'eee', { locale: id })}
                                                </span>
                                                <span className="text-2xl font-black italic tracking-tighter" style={{ color: isSelected ? '#FACC15' : 'var(--text-primary)' }}>
                                                    {format(date, 'dd')}
                                                </span>
                                                <span className={`text-[8px] font-bold uppercase ${isSelected ? 'text-[#FACC15]/60' : 'text-slate-500'}`}>
                                                    {format(date, 'MMM', { locale: id })}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.date && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-14">{errors.date}</p>}
                            </div>

                            {/* Step 3: Time Matrix */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xs italic border-2 border-white/20">03</span>
                                    <h3 className="text-xl font-black italic uppercase tracking-widest text-emerald-500">Operation window</h3>
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {TIME_SLOTS.map(t => {
                                        const isSelected = data.time === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setData('time', t)}
                                                className={`p-4 rounded-2xl border-2 font-mono text-sm font-black transition-all ${isSelected ? 'scale-105 border-emerald-500 bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/20' : 'opacity-40 hover:opacity-100 hover:scale-102'}`}
                                                style={{
                                                    borderColor: isSelected ? '#10B981' : 'var(--border)',
                                                    color: isSelected ? '#000' : 'var(--text-primary)'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.time && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-14">{errors.time}</p>}
                            </div>

                            {/* Step 4 & 5: Squad & Comms */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-full bg-orange-500 text-slate-900 flex items-center justify-center font-black text-xs italic border-2 border-white/20">04</span>
                                        <h3 className="text-xl font-black italic uppercase tracking-widest text-orange-500">Unit ID & Comms</h3>
                                    </div>
                                    <div className="space-y-6 md:ml-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Tactical Designation (Nama Tim)</p>
                                            <input
                                                type="text"
                                                placeholder="SQUAD.ID.BRAVO..."
                                                value={data.team_name}
                                                onChange={e => setData('team_name', e.target.value)}
                                                className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:opacity-30"
                                                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            />
                                            {errors.team_name && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4">{errors.team_name}</p>}
                                        </div>

                                        <div className="flex gap-4 p-1 rounded-2xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                            <button
                                                type="button"
                                                onClick={() => setData('contact_type', 'whatsapp')}
                                                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${data.contact_type === 'whatsapp' ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'opacity-40'}`}
                                            >
                                                WhatsApp
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('contact_type', 'instagram')}
                                                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${data.contact_type === 'instagram' ? 'bg-[#38BDF8] text-slate-900 shadow-lg' : 'opacity-40'}`}
                                            >
                                                Instagram
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={data.contact_type === 'whatsapp' ? 'Nomor WA (contoh: 087892312759)...' : '@ID.INSTAGRAM...'}
                                            value={data.contact_value}
                                            onChange={e => setData('contact_value', e.target.value)}
                                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all placeholder:opacity-30"
                                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        />
                                        {errors.contact_value && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4">{errors.contact_value}</p>}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <span className="w-10 h-10 rounded-full bg-rose-500 text-slate-900 flex items-center justify-center font-black text-xs italic border-2 border-white/20">05</span>
                                        <h3 className="text-xl font-black italic uppercase tracking-widest text-rose-500">Combat Lvl</h3>
                                    </div>
                                    <div className="space-y-10 md:ml-6">
                                        <div className="flex justify-between items-end mb-4">
                                            {[1, 2, 3, 4, 5].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => setData('skill_level', lvl)}
                                                    className={`w-12 h-12 rounded-xl border-2 font-black italic transition-all ${data.skill_level === lvl ? 'scale-125 border-rose-500 bg-rose-500 text-slate-900 shadow-xl shadow-rose-500/20' : 'opacity-20 hover:opacity-100'}`}
                                                    style={{ borderColor: data.skill_level === lvl ? '#F43F5E' : 'var(--border)', color: data.skill_level === lvl ? '#000' : 'var(--text-primary)' }}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-40 italic">
                                            {data.skill_level <= 2 ? 'RECRUIT / CASUAL' : data.skill_level <= 4 ? 'VETERAN / COMPETITIVE' : 'ELITE / PRO PILOT'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-8 rounded-[2.5rem] bg-[#38BDF8] text-slate-900 font-black text-lg uppercase tracking-[0.4em] shadow-2xl shadow-[#38BDF8]/40 hover:scale-[1.02] hover:bg-[#38BDF8]/90 transition-all italic relative overflow-hidden group"
                            >
                                <span className="relative z-10">{processing ? 'SYNCHRONIZING RADAR...' : 'DEPLOY RADAR SIGNAL'}</span>
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* ─── RADAR MONITORING ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-12 space-y-8"
                >
                    <div className="rounded-[2.5rem] md:rounded-[3.5rem] border overflow-hidden shadow-3xl"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="p-8 md:p-12 border-b flex flex-col md:flex-row md:items-end justify-between gap-6"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                            <div>
                                <p className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em] mb-2">Live Telemetry Feed</p>
                                <h3 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter"
                                    style={{ color: 'var(--text-primary)' }}>Radar <span className="text-[#FACC15]">Monitoring</span></h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse italic">
                                    <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full" />
                                    Active Scan
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic" style={{ color: 'var(--text-secondary)' }}>
                                    {my_matches.length} DIRECTIVES FOUND
                                </span>
                            </div>
                        </div>

                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {my_matches.length === 0 ? (
                                <div className="p-32 text-center space-y-6">
                                    <div className="text-6xl opacity-10 italic font-black">📡</div>
                                    <p className="font-black uppercase tracking-[0.4em] italic text-xs"
                                        style={{ color: 'var(--text-secondary)' }}>NO SIGNALS DETECTED. STANDBY FOR DEPLOYMENT.</p>
                                </div>
                            ) : (
                                my_matches.map((match, i) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="p-6 md:p-12 hover:bg-slate-500/5 transition-all group relative"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                            <div className="flex items-start gap-8">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl border shadow-xl flex items-center justify-center text-2xl md:text-3xl shrink-0"
                                                    style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                                                    {match.facility.includes('Soccer') ? '⚽' : match.facility.includes('Padel') ? '🎾' : match.facility.includes('Basket') ? '🏀' : '🧘'}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic ${match.status === 'matched' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/30'}`}>
                                                            {match.status === 'matched' ? 'Target Locked' : 'Searching...'}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono italic">{match.date} @ {match.time}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h4 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{match.facility}</h4>
                                                        <p className="text-[#FACC15] font-black italic uppercase tracking-widest text-[11px] mt-2">SQUAD: {match.team_name || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-secondary)' }}>
                                                            Operation Time: <span className="text-white ml-2">{match.time} WIB</span>
                                                        </p>
                                                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic" style={{ color: 'var(--text-secondary)' }}>
                                                            Pilot Lvl: <span className="text-[#38BDF8] ml-2">LVL {match.skill_level}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start md:items-end gap-6 shrink-0">
                                                {match.status === 'matched' ? (
                                                    <div className="space-y-4 flex flex-col items-end">
                                                        <div className="flex flex-col items-end gap-1 mb-2">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase italic">Opponent Squad:</p>
                                                            <p className="text-lg font-black text-[#FACC15] italic uppercase leading-none">{match.opponent_team_name}</p>
                                                        </div>
                                                        <a
                                                            href={match.opponent_contact_type === 'whatsapp' ? `https://wa.me/${match.opponent_contact_value.replace(/\D/g, '')}` : `https://instagram.com/${match.opponent_contact_value?.replace('@', '')}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="px-10 py-5 bg-emerald-500 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all italic"
                                                        >
                                                            {match.opponent_contact_type === 'whatsapp' ? 'ESTABLISH COMMS (WA)' : 'ESTABLISH COMMS (IG)'}
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 px-8 py-5 rounded-2xl border bg-slate-500/5 italic" style={{ borderColor: 'var(--border)' }}>
                                                        <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-ping" />
                                                        <span className="text-[10px] font-black text-[#FACC15] uppercase tracking-[0.3em]">Scanning frequencies...</span>
                                                    </div>
                                                )}
                                                <Link
                                                    href={route('facilities.public')}
                                                    className="text-[10px] font-black text-slate-500 hover:text-[#38BDF8] uppercase tracking-[0.3em] transition-all italic border-b-2 border-transparent hover:border-[#38BDF8] pb-1"
                                                >
                                                    RESERVE ARENA ASSET
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .mask-fade-right {
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
            ` }} />
        </AuthenticatedLayout>
    );
}
