import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function RewardMarket({ available_rewards, my_vouchers, user_points }) {

    const redeem = (id) => {
        if (confirm('Tukarkan poin Anda dengan voucher ini?')) {
            router.post(route('user.rewards.redeem'), { reward_id: id });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-['Permanent_Marker'] italic text-slate-900 uppercase tracking-tighter leading-none">
                            Loyalty <span className="text-[#38BDF8]">Market</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Dapatkan voucher eksklusif dengan poin Anda.</p>
                    </div>
                    <div className="flex items-center gap-6 bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-100/50">
                        <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 flex items-center justify-center text-3xl"></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Saldo Poin</p>
                            <p className="text-3xl font-black italic text-slate-900 leading-none">{user_points || 0} <span className="text-[10px] text-[#FACC15] ml-1 not-italic tracking-widest">PTS</span></p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Loyalty Market | Mandala Arena" />

            <div className="max-w-7xl mx-auto space-y-20 pb-20">

                {/* 1. Promo Tersedia */}
                <div className="space-y-10">
                    <div className="flex items-center gap-6">
                        <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">Katalog <span className="text-[#38BDF8]">Redeem</span></h3>
                        <div className="h-[1px] flex-1 bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {available_rewards.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden group flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#38BDF8]/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-[#38BDF8]/10 flex items-center justify-center text-3xl shadow-sm border border-[#38BDF8]/10 group-hover:rotate-6 transition-transform">
                                        {r.discount_type === 'percentage' ? '️' : ''}
                                    </div>
                                    <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {r.quota} Sisa
                                    </span>
                                </div>

                                <div className="flex-1 relative z-10">
                                    <h4 className="text-3xl font-['Permanent_Marker'] italic uppercase text-slate-900 leading-none mb-4 group-hover:text-[#38BDF8] transition-colors">{r.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed line-clamp-2">
                                        {r.description || "Tukarkan poin Anda untuk mendapatkan potongan harga eksklusif di Mandala Arena."}
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 mb-8 flex items-end justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Berlaku Hingga</p>
                                        <p className="text-xs font-bold text-slate-900">{new Date(r.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Potongan</p>
                                        <p className="text-2xl font-black italic text-emerald-500">
                                            {r.discount_type === 'percentage'
                                                ? `${parseFloat(r.discount_value)}%`
                                                : `RP ${parseInt(r.discount_value).toLocaleString('id-ID')}`}
                                        </p>
                                        {r.discount_type === 'percentage' && r.max_discount && (
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Max. RP {parseInt(r.max_discount).toLocaleString('id-ID')}</p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => redeem(r.id)}
                                    disabled={user_points < r.points_required}
                                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10 ${user_points >= r.points_required
                                        ? 'bg-[#38BDF8] text-white hover:bg-slate-900 shadow-lg shadow-[#38BDF8]/20'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    {user_points >= r.points_required ? `Tukarkan ${r.points_required} Poin ` : `Butuh ${r.points_required} Poin`}
                                </button>
                            </motion.div>
                        ))}

                        {available_rewards.length === 0 && (
                            <div className="col-span-full py-32 text-center rounded-[3rem] bg-slate-50/50 border-2 border-dashed border-slate-200">
                                <span className="text-6xl opacity-30"></span>
                                <p className="text-slate-400 font-bold uppercase tracking-widest mt-6">Belum ada promo rewards tersedia hari ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Voucher Saya */}
                <div className="pt-20 space-y-10">
                    <div className="flex items-center gap-6">
                        <h3 className="text-2xl font-black italic text-slate-900 uppercase tracking-tight">Voucher <span className="text-emerald-500">Saya</span></h3>
                        <div className="h-[1px] flex-1 bg-slate-200" />
                    </div>

                    <div className="bg-white rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-8">Nama Reward</th>
                                        <th className="px-10 py-8 text-center">Tipe Diskon</th>
                                        <th className="px-10 py-8 text-center">Status</th>
                                        <th className="px-10 py-8 text-right">Tanggal Claim</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {my_vouchers.map((v, i) => (
                                        <tr key={v.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-10 py-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl grayscale-[0.5] group-hover:grayscale-0 transition-all">
                                                        {v.reward?.discount_type === 'percentage' ? '️' : ''}
                                                    </div>
                                                    <span className="font-['Permanent_Marker'] italic text-2xl uppercase tracking-tight text-slate-900">{v.reward?.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-10 text-center font-black text-slate-600 text-[11px] uppercase tracking-widest">
                                                {v.reward?.discount_type === 'percentage' ? `${parseFloat(v.reward?.discount_value)}%` : `RP ${parseInt(v.reward?.discount_value).toLocaleString('id-ID')}`}
                                            </td>
                                            <td className="px-10 py-10 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${v.status === 'unused' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    v.status === 'used' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-red-50 text-red-400 border-red-100'
                                                    }`}>
                                                    {v.status === 'unused' ? 'Siap Pakai' : v.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-10 text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{new Date(v.created_at).toLocaleDateString()}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(v.created_at).toLocaleTimeString().slice(0, 5)} WIB</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {my_vouchers.map((v, i) => (
                                <div key={v.id} className="p-6 rounded-[2rem] border border-slate-100 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                                            {v.reward?.discount_type === 'percentage' ? '️' : ''}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-['Permanent_Marker'] text-xl italic uppercase text-slate-900 leading-none">{v.reward?.title}</h4>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{new Date(v.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${v.status === 'unused' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            v.status === 'used' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-red-50 text-red-400 border-red-100'
                                            }`}>
                                            {v.status === 'unused' ? 'Siap Pakai' : v.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai Voucher</p>
                                        <p className="text-xl font-black italic text-[#38BDF8]">
                                            {v.reward?.discount_type === 'percentage' ? `${parseFloat(v.reward?.discount_value)}%` : `Rp ${parseInt(v.reward?.discount_value).toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {my_vouchers.length === 0 && (
                            <div className="py-24 text-center">
                                <div className="max-w-xs mx-auto">
                                    <span className="text-4xl opacity-20 block mb-6">️</span>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Anda belum memiliki voucher. Ayo tukar poin sekarang!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

