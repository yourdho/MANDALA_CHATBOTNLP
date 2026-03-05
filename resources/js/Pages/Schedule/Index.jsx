import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function ScheduleIndex({ bookings, upcoming, weekLabel }) {
    const hours = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

    const typeColors = {
        confirmed: 'bg-[#F2D800]/20 border-[#F2D800]/40 text-[#F2D800]',
        pending: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400',
    };

    // Build schedule grid from bookings
    const scheduleData = {};
    (bookings || []).forEach((b) => {
        const startH = parseInt(b.start_time.split(':')[0]);
        const endH = parseInt(b.end_time.split(':')[0]);
        for (let h = startH; h < endH; h++) {
            const time = String(h).padStart(2, '0') + ':00';
            scheduleData[`${b.day}-${time}`] = { venue: b.venue, type: b.status };
        }
    });

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-100 leading-tight">Jadwal Saya</h2>}
        >
            <Head title="Schedule" />

            <div className="py-8 sm:py-12 px-4 sm:px-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Upcoming — shown first on mobile for quick access */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8 bg-[#231F1F] rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-700/50">
                            <h3 className="text-base sm:text-lg font-bold text-white">Jadwal Mendatang</h3>
                        </div>

                        {(!upcoming || upcoming.length === 0) ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-500 text-sm">Belum ada jadwal mendatang.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {upcoming.map((item, index) => (
                                    <motion.div key={item.id}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 + index * 0.05 }}
                                        className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                                        {/* Day badge */}
                                        <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center ${item.status === 'confirmed' ? 'bg-[#F2D800]/10 border border-[#F2D800]/30' : 'bg-yellow-400/10 border border-yellow-400/30'
                                            }`}>
                                            <span className={`text-xs font-bold ${item.status === 'confirmed' ? 'text-[#F2D800]' : 'text-yellow-400'}`}>{item.day_label}</span>
                                            <span className={`text-base sm:text-lg font-black ${item.status === 'confirmed' ? 'text-[#F2D800]' : 'text-yellow-400'}`}>{item.day_num}</span>
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{item.venue}</h4>
                                            <p className="text-xs sm:text-sm text-slate-400 truncate">{item.time} • {item.location}</p>
                                        </div>
                                        {/* Status badge */}
                                        <span className={`hidden sm:inline-flex flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${item.status === 'confirmed' ? 'bg-[#F2D800]/10 text-[#F2D800]' : 'bg-yellow-400/10 text-yellow-400'
                                            }`}>
                                            {item.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Calendar Grid — hidden on small mobile, visible from sm */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="bg-[#231F1F] rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-700/50 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-white">Jadwal Mingguan</h3>
                            <span className="text-xs sm:text-sm text-slate-400">{weekLabel}</span>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-4 sm:px-6 pt-3 pb-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="w-3 h-3 rounded bg-[#F2D800]/20 border border-[#F2D800]/40"></span> Dikonfirmasi
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="w-3 h-3 rounded bg-yellow-400/20 border border-yellow-400/40"></span> Menunggu
                            </div>
                        </div>

                        {/* Table — scrollable horizontally on mobile */}
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full" style={{ minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 border-b border-slate-700/50">Jam</th>
                                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                            <th key={day} className="px-2 py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {hours.map((hour) => (
                                        <tr key={hour} className="hover:bg-slate-700/10 transition-colors">
                                            <td className="px-3 py-1.5 text-xs text-slate-500 font-mono border-r border-slate-700/30">{hour}</td>
                                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => {
                                                const event = scheduleData[`${day}-${hour}`];
                                                return (
                                                    <td key={day} className="px-1 py-0.5 border-r border-b border-slate-700/20" style={{ minWidth: '72px' }}>
                                                        {event ? (
                                                            <div className={`rounded px-1.5 py-1 text-xs font-medium border ${typeColors[event.type] || typeColors.confirmed} truncate`}>
                                                                {event.venue}
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
