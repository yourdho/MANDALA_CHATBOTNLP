import AuthenticatedLayout from '@/Components/Layouts/AuthenticatedLayout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

const PAYMENT_LABEL = {
    lunas_online: { label: 'Midtrans (Lunas)', icon: '' },
    dp_online: { label: 'Midtrans (DP 50%)', icon: '' },
    dp_manual: { label: 'WA Admin (DP/Manual)', icon: '' },
    bayar_ditempat: { label: 'Bayar Kasir', icon: '' },
};

export default function BookingAdminIndex({ bookings, facilities = [] }) {
    const getWhatsAppLink = (phone) => {
        if (!phone) return '#';
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.substring(1);
        }
        return `https://wa.me/${cleanPhone}`;
    };

    const manualForm = useForm({
        facility_id: '',
        guest_name: '',
        guest_phone: '',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
    });

    const { flash } = usePage().props;
    const [nota, setNota] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Fetch availability for manual booking
    useEffect(() => {
        if (showManualModal && manualForm.data.facility_id && manualForm.data.booking_date) {
            setLoadingSlots(true);
            axios.get(route('admin.bookings.availability'), {
                params: {
                    facility_id: manualForm.data.facility_id,
                    date: manualForm.data.booking_date
                }
            }).then(res => {
                console.log("Radar Scan Success:", res.data);
                setAvailability(res.data);
                setLoadingSlots(false);
            }).catch(err => {
                console.error("Availability Scan Error:", err);
                setLoadingSlots(false);
            });
        }
    }, [manualForm.data.facility_id, manualForm.data.booking_date, showManualModal]);

    // Filter states
    const [filter, setFilter] = useState('all');

    const statusColors = {
        confirmed: { bg: 'bg-[#38BDF8]/20', text: 'text-[#0284c7] border-[#38BDF8]/40', label: 'Terkonfirmasi' },
        pending: { bg: 'bg-[#FACC15]/20', text: 'text-[#d97706] border-[#FACC15]/40', label: 'Menunggu Payment' },
        completed: { bg: 'bg-emerald-100', text: 'text-emerald-700 border-emerald-200', label: 'Selesai' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-600 border-red-200', label: 'Dibatalkan' },
    };

    const submitManual = (e) => {
        e.preventDefault();
        manualForm.post(route('admin.bookings.manual_store'), {
            onSuccess: () => {
                setShowManualModal(false);
                manualForm.reset();
            }
        });
    };

    const handleConfirm = (id) => {
        if (confirm('Konfirmasi pembayaran pesanan ini secara manual? (Hanya jika transfer terverifikasi)')) {
            setProcessing(id);
            router.patch(route('admin.bookings.confirm', id), {}, {
                onFinish: () => setProcessing(false)
            });
        }
    };

    const handleReject = (id) => {
        if (confirm('Abaikan / Batalkan transaksi ini secara permanen?')) {
            setProcessing(id);
            router.patch(route('admin.bookings.reject', id), {}, {
                onFinish: () => setProcessing(false)
            });
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        return b.status === filter;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Admin Daftar Booking | Mandala Arena" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-12 mb-12" style={{ borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-[10px] font-black text-[#38BDF8] uppercase tracking-[0.3em] mb-4">Tactical Registry</p>
                    <h1 className="text-2xl sm:text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>
                        Daftar <span className="text-[#38BDF8]">Booking</span>
                    </h1>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <button onClick={() => setShowManualModal(true)} className="w-full md:w-auto min-h-[44px] px-8 py-3 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#38BDF8]/20 hover:scale-105 transition-all italic">
                        + Input Booking Offline
                    </button>
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <div className="w-2 h-2 bg-[#38BDF8] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Manajemen Ops Center</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-12 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Total Booking Logged', value: bookings.length, color: '#38BDF8' },
                        { title: 'Jadwal Aktif (Confirmed)', value: bookings.filter(b => b.status === 'confirmed').length, color: '#10B981' },
                        { title: 'Pending Approval', value: bookings.filter(b => b.status === 'pending').length, color: '#FACC15' },
                    ].map((s, i) => (
                        <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="rounded-[2rem] p-8 border shadow-sm group relative overflow-hidden"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-secondary)' }}>{s.title}</h3>
                            <p className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="rounded-[2.5rem] border overflow-hidden shadow-3xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="p-4 md:p-8 border-b flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                        <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Antrean Transaksi</h3>
                        <div className="flex gap-2">
                            {['all', 'pending', 'confirmed'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-white border text-slate-500 hover:border-[#38BDF8]'}`}
                                    style={filter === f ? {} : { background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] font-black uppercase tracking-[0.2em] italic border-b" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="px-8 py-6 w-32">Kode</th>
                                    <th className="px-4 py-6 text-[#38BDF8]">Fasilitas</th>
                                    <th className="px-4 py-6">Penyewa</th>
                                    <th className="px-4 py-6">Jadwal</th>
                                    <th className="px-4 py-6">Harga</th>
                                    <th className="px-4 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {filteredBookings.length === 0 ? (
                                    <tr><td colSpan="7" className="p-32 text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Belum Ada Data Booking.</td></tr>
                                ) : filteredBookings.map((b, i) => (
                                    <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={b.id} className="hover:bg-slate-500/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="font-black italic text-xl tracking-tighter opacity-30 group-hover:opacity-100 transition-opacity group-hover:text-[#38BDF8]" style={{ color: 'var(--text-secondary)' }}>#MA-{b.id}</p>
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className="text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.1em] border" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}>{b.facility?.name}</span>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="font-black uppercase tracking-tight text-xs mb-1 group-hover:text-[#38BDF8] transition-colors" style={{ color: 'var(--text-primary)' }}>{b.guest_name || b.user?.name}</p>
                                                {b.guest_phone || b.user?.phone ? (
                                                    <a href={getWhatsAppLink(b.guest_phone || b.user?.phone)} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold hover:text-[#38BDF8] underline decoration-[#38BDF8]/30 transition-all flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                                                        <svg className="w-3 h-3 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.171c1.589.943 3.139 1.415 4.75 1.416 5.482 0 9.942-4.46 9.944-9.94.001-2.654-1.034-5.148-2.915-7.03s-4.375-2.912-7.027-2.912c-5.483 0-9.942 4.46-9.945 9.941-.001 1.751.465 3.453 1.347 4.948l-.995 3.637 3.841-1.006zm12.781-4.081c-.24-.12-1.417-.699-1.637-.778-.22-.079-.381-.118-.541.119-.16.239-.62.778-.759.938-.14.16-.279.179-.519.059-.24-.119-1.011-.372-1.926-1.187-.712-.635-1.192-1.419-1.332-1.659-.14-.239-.015-.369.105-.488.108-.107.239-.279.359-.418.12-.139.159-.239.239-.398.08-.159.04-.298-.02-.418-.06-.12-.541-1.305-.741-1.783-.195-.476-.394-.41-.541-.417-.14-.007-.3-.007-.46-.007s-.42.06-.64.298c-.22.239-.84.817-.84 1.992s.859 2.31 1.077 2.61c.22.298 1.69 2.581 4.095 3.621.572.247 1.018.396 1.366.507.575.183 1.097.157 1.51.096.46-.067 1.417-.579 1.617-1.137.2-.558.2-1.037.139-1.137-.06-.099-.22-.158-.46-.279z" /></svg>
                                                        {b.guest_phone || b.user?.phone}
                                                    </a>
                                                ) : (
                                                    <p className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>{b.guest_email || b.user?.email || '-'}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-black uppercase leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{new Date(b.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                                                <p className="text-[9px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>
                                                    {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6">
                                            <p className="font-black text-lg italic tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>RP {parseInt(b.total_price).toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[b.status]?.text}`} style={{ background: 'var(--bg-base)' }}>{statusColors[b.status]?.label || b.status}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <button onClick={() => setNota(b)} className="border text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Nota</button>
                                                {b.status === 'pending' && (
                                                    <button onClick={() => handleConfirm(b.id)} disabled={processing === b.id} className="text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 italic">ACC</button>
                                                )}
                                                {(b.status === 'pending' || b.status === 'confirmed') && (
                                                    <button onClick={() => handleReject(b.id)} disabled={processing === b.id} className="text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 italic">Batal</button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                        {filteredBookings.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Belum Ada Data Booking.</div>
                        ) : filteredBookings.map((b, i) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={b.id} className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black opacity-30 uppercase">#MA-{b.id}</span>
                                        <span className="font-black uppercase tracking-tight text-sm text-[#38BDF8]">{b.facility?.name}</span>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[b.status]?.text}`} style={{ background: 'var(--bg-base)' }}>
                                        {statusColors[b.status]?.label || b.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase opacity-40">Penyewa</span>
                                        <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-primary)' }}>{b.guest_name || b.user?.name}</span>
                                        {(b.guest_phone || b.user?.phone) && (
                                            <a href={getWhatsAppLink(b.guest_phone || b.user?.phone)} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-[#10B981] underline decoration-[#10B981]/30 flex items-center gap-1.5 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.171c1.589.943 3.139 1.415 4.75 1.416 5.482 0 9.942-4.46 9.944-9.94.001-2.654-1.034-5.148-2.915-7.03s-4.375-2.912-7.027-2.912c-5.483 0-9.942 4.46-9.945 9.941-.001 1.751.465 3.453 1.347 4.948l-.995 3.637 3.841-1.006zm12.781-4.081c-.24-.12-1.417-.699-1.637-.778-.22-.079-.381-.118-.541.119-.16.239-.62.778-.759.938-.14.16-.279.179-.519.059-.24-.119-1.011-.372-1.926-1.187-.712-.635-1.192-1.419-1.332-1.659-.14-.239-.015-.369.105-.488.108-.107.239-.279.359-.418.12-.139.159-.239.239-.398.08-.159.04-.298-.02-.418-.06-.12-.541-1.305-.741-1.783-.195-.476-.394-.41-.541-.417-.14-.007-.3-.007-.46-.007s-.42.06-.64.298c-.22.239-.84.817-.84 1.992s.859 2.31 1.077 2.61c.22.298 1.69 2.581 4.095 3.621.572.247 1.018.396 1.366.507.575.183 1.097.157 1.51.096.46-.067 1.417-.579 1.617-1.137.2-.558.2-1.037.139-1.137-.06-.099-.22-.158-.46-.279z" /></svg>
                                                {b.guest_phone || b.user?.phone}
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-black uppercase opacity-40">Jadwal</span>
                                        <span className="text-[10px] font-black uppercase" style={{ color: 'var(--text-primary)' }}>
                                            {new Date(b.starts_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} @ {new Date(b.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase opacity-40">Investasi</span>
                                        <p className="text-xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>RP {parseInt(b.total_price).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <button onClick={() => setNota(b)} className="border text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Nota</button>
                                        {b.status === 'pending' && <button onClick={() => handleConfirm(b.id)} disabled={processing === b.id} className="text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 italic">ACC</button>}
                                        {(b.status === 'pending' || b.status === 'confirmed') && (
                                            <button onClick={() => handleReject(b.id)} disabled={processing === b.id} className="text-[9px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 italic">Batal</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* MODAL BOOKING OFFLINE / MANUAL */}
            <AnimatePresence>
                {showManualModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setShowManualModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                            className="bg-slate-900 border-2 border-[#38BDF8]/20 rounded-[3rem] w-[95%] md:w-full max-w-xl shadow-2xl p-6 md:p-12 overflow-y-auto max-h-[90vh] no-scrollbar"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Manual <span className="text-[#38BDF8]">Lock-In</span></h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#38BDF8] opacity-50 mt-1">Admin Offline Transaction System</p>
                                </div>
                                <button onClick={() => setShowManualModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center font-bold">✕</button>
                            </div>

                            <form onSubmit={submitManual} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest opacity-60 ml-2">Pilih Unit Fasilitas</label>
                                        <select value={manualForm.data.facility_id} onChange={e => manualForm.setData('facility_id', e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-white/5 rounded-2xl px-6 py-4 font-black italic uppercase text-xs text-white focus:border-[#38BDF8] outline-none transition-all cursor-pointer">
                                            <option value="" className="bg-slate-900">-- PILIH FASILITAS --</option>
                                            {facilities.map(f => (
                                                <option key={f.id} value={f.id} className="bg-slate-900">
                                                    {f.name}
                                                </option>
                                            ))}
                                        </select>
                                        {manualForm.errors.facility_id && <p className="text-red-500 text-[10px] font-black uppercase ml-2">{manualForm.errors.facility_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest opacity-60 ml-2">Nama Penyewa</label>
                                            <input type="text" value={manualForm.data.guest_name} onChange={e => manualForm.setData('guest_name', e.target.value)} placeholder="NAMA LENGKAP..."
                                                className="w-full min-h-[44px] bg-slate-800 border-2 border-white/5 rounded-2xl px-6 py-3 font-black italic uppercase text-xs text-white focus:border-[#38BDF8] outline-none transition-all" />
                                            {manualForm.errors.guest_name && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2">{manualForm.errors.guest_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest opacity-60 ml-2">Kontak (WA)</label>
                                            <input type="tel" value={manualForm.data.guest_phone} onChange={e => manualForm.setData('guest_phone', e.target.value)} placeholder="08XXX..."
                                                className="w-full min-h-[44px] bg-slate-800 border-2 border-white/5 rounded-2xl px-6 py-3 font-black italic uppercase text-xs text-white focus:border-[#38BDF8] outline-none transition-all" />
                                            {manualForm.errors.guest_phone && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-2">{manualForm.errors.guest_phone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest opacity-60 ml-2">Tanggal Booking</label>
                                        <input type="date" value={manualForm.data.booking_date} onChange={e => manualForm.setData('booking_date', e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-white/10 rounded-2xl px-6 py-4 font-black italic uppercase text-xs text-white focus:border-[#38BDF8] outline-none transition-all [color-scheme:dark]" />
                                        {manualForm.errors.booking_date && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-2 text-center">{manualForm.errors.booking_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest opacity-60 ml-2 text-center block mb-4 underline underline-offset-4 decoration-white/10">RADAR KETERSEDIAAN (PILIH JAM)</label>

                                        {loadingSlots ? (
                                            <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
                                                <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Scanning Grid...</span>
                                            </div>
                                        ) : availability.length === 0 ? (
                                            <div className="py-12 border-2 border-dashed border-white/10 rounded-3xl text-center">
                                                <span className="text-2xl opacity-20 block mb-2">📡</span>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8]">Silahkan pilih fasilitas dan tanggal.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                                {availability.map(slot => {
                                                    const isSelected = manualForm.data.start_time === slot.time;

                                                    return (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            disabled={!slot.available}
                                                            onClick={() => {
                                                                if (!slot.available) return;
                                                                const currentHour = parseInt(slot.time.split(':')[0]);
                                                                const nextTime = String(currentHour + 1).padStart(2, '0') + ':00';

                                                                if (manualForm.data.start_time === slot.time) {
                                                                    manualForm.setData({ ...manualForm.data, start_time: '', end_time: '' });
                                                                } else {
                                                                    manualForm.setData({ ...manualForm.data, start_time: slot.time, end_time: nextTime });
                                                                }
                                                            }}
                                                            className={`py-4 flex flex-col items-center justify-center rounded-2xl border-2 font-black italic transition-all relative overflow-hidden
                                                                ${isSelected
                                                                    ? 'bg-[#38BDF8] border-[#38BDF8] text-slate-950 shadow-[0_10px_20px_rgba(56,189,248,0.5)] z-10 scale-105'
                                                                    : slot.available
                                                                        ? 'bg-slate-800 border-white/10 text-white hover:border-[#38BDF8] hover:bg-slate-700'
                                                                        : 'bg-red-500/5 border-red-500/10 text-red-500/20 line-through cursor-not-allowed grayscale'
                                                                }
                                                            `}
                                                        >
                                                            <span className="text-sm tracking-tighter">{slot.time}</span>
                                                            <span className={`text-[9px] mt-1 font-bold ${isSelected ? 'text-slate-900' : 'text-[#38BDF8]'}`}>
                                                                RP {parseInt(slot.price).toLocaleString('id-ID')}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {(manualForm.errors.start_time || manualForm.errors.end_time) && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 text-center italic">Mohon pilih jam ketersediaan di grid atas.</p>}

                                        <div className="flex gap-4 p-6 bg-[#38BDF8]/5 rounded-3xl border-2 border-[#38BDF8]/20 shadow-inner">
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black uppercase text-[#38BDF8] mb-1 opacity-60">TARGET SESI</p>
                                                <p className="text-lg font-black italic text-white flex items-center gap-2">
                                                    {manualForm.data.start_time ? (
                                                        <>
                                                            {manualForm.data.start_time} <span className="text-[10px] text-[#38BDF8]/40 ml-1">Sampai</span> {manualForm.data.end_time}
                                                        </>
                                                    ) : '--:--'}
                                                </p>
                                            </div>
                                            <div className="w-[2px] bg-white/5 self-stretch" />
                                            <div className="flex-1 text-right">
                                                <p className="text-[9px] font-black uppercase text-[#38BDF8] mb-1 opacity-60">ESTIMASI BIAYA</p>
                                                <p className="text-lg font-black italic text-emerald-400">
                                                    RP {(availability.find(s => s.time === manualForm.data.start_time)?.price || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {manualForm.errors.time && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase text-center rounded-2xl italic">{manualForm.errors.time}</div>}

                                <button type="submit" disabled={manualForm.processing} className="w-full py-6 bg-[#38BDF8] text-slate-900 font-black rounded-3xl text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-white transition-all italic mt-4">
                                    {manualForm.processing ? 'DEPLOING MISSION...' : 'AUTHORIZE OFFLINE BOOKING →'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )
                }
            </AnimatePresence>

            <AnimatePresence>
                {nota && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden"
                        onClick={() => setNota(null)}>
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="rounded-[2rem] w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex-1 overflow-y-auto">
                                <AdminInvoiceContent nota={nota} paymentLabel={PAYMENT_LABEL} />
                            </div>
                            <div className="flex gap-3 p-4 md:p-6 border-t border-gray-100 bg-white flex-shrink-0 flex-wrap sm:flex-nowrap">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Cetak PDF
                                </button>
                                <button
                                    onClick={() => setNota(null)}
                                    className="w-full sm:w-auto px-8 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRINT-ONLY INVOICE */}
            {
                nota && (
                    <div className="hidden print:block admin-print-invoice">
                        <AdminInvoiceContent nota={nota} paymentLabel={PAYMENT_LABEL} />
                    </div>
                )
            }

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .admin-print-invoice, .admin-print-invoice * { visibility: visible; }
                    .admin-print-invoice { position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; }
                    nav, header, aside { display: none !important; }
                    body { background: white !important; margin: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    @page { margin: 0; size: A4 portrait; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

function AdminInvoiceContent({ nota, paymentLabel }) {
    const startDate = new Date(nota.starts_at);
    const endDate = new Date(nota.ends_at);
    const formattedDate = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const duration = nota.duration_hours || Math.round((endDate - startDate) / 3600000);
    const basePrice = Number(nota.total_price) - Number(nota.referee_price || 0);
    const invoiceNo = String(nota.id).padStart(6, '0');
    const paymentMethodLabel = paymentLabel[nota.payment_method]?.label
        || nota.payment_method?.replace(/_/g, ' ').toUpperCase()
        || 'Offline / Manual';
    const customerName = nota.guest_name || nota.user?.name || 'Pelanggan';
    const customerPhone = nota.guest_phone || nota.user?.phone || '-';
    const customerEmail = nota.guest_email || nota.user?.email || '';

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: '#fff', color: '#111', minHeight: '100%' }}>
            <div style={{ padding: '40px 48px 0' }}>
                {/* Header: Logo + Invoice Number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1 }}>MANDALA</div>
                        <div style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', color: '#38BDF8', lineHeight: 1 }}>ARENA</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#555' }}>
                        NO. {invoiceNo}
                    </div>
                </div>

                {/* INVOICE Title */}
                <div style={{ fontSize: '64px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '28px', color: '#111' }}>
                    INVOICE
                </div>

                {/* Date */}
                <div style={{ marginBottom: '28px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Tanggal:&nbsp;&nbsp;</span>{formattedDate}
                </div>

                {/* Billed To / From */}
                <div style={{ display: 'flex', gap: '48px', marginBottom: '36px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Kepada:</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>
                            <div>{customerName}</div>
                            <div>{customerPhone}</div>
                            {customerEmail && <div>{customerEmail}</div>}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>Dari:</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#333' }}>
                            <div>Mandala Arena</div>
                            <div>Jl. Olahraga No. 1, Kota</div>
                            <div>mandala-arena@mandala.com</div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#e8e8e8' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Item</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Harga</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '12px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 600 }}>{nota.facility?.name}</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{formattedDate}, {startTime} – {endTime}</div>
                            </td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>{duration} jam</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Math.round(basePrice / (duration || 1)).toLocaleString('id-ID')}</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {basePrice.toLocaleString('id-ID')}</td>
                        </tr>
                        {Number(nota.referee_price) > 0 && (
                            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                                <td style={{ padding: '14px 16px' }}>Wasit / Referee</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>1</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Number(nota.referee_price).toLocaleString('id-ID')}</td>
                                <td style={{ textAlign: 'right', padding: '14px 16px' }}>Rp {Number(nota.referee_price).toLocaleString('id-ID')}</td>
                            </tr>
                        )}
                        <tr style={{ borderTop: '2px solid #ddd' }}>
                            <td colSpan="3" style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700 }}>Total</td>
                            <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 900, fontSize: '14px' }}>Rp {Number(nota.total_price).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Divider */}
                <div style={{ height: '1px', background: '#ddd', margin: '28px 0' }} />

                {/* Payment + Note */}
                <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Metode Pembayaran:</span>&nbsp; {paymentMethodLabel}
                </div>

                {/* Category specific dynamic bank display */}
                <div style={{ margin: '20px 0', padding: '20px', border: '1px dashed #ddd', borderRadius: '12px', background: '#fcfcfc' }}>
                    <div style={{ fontWeight: 700, fontSize: '11px', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                        Instruksi Pembayaran Manual ({nota?.facility?.category})
                    </div>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                        {(() => {
                            const category = nota?.facility?.category?.toLowerCase().replace(' ', '_');
                            const bankName = settings[`cat_${category}_bank_name` || ''];
                            const bankNumber = settings[`cat_${category}_bank_number` || ''];
                            const bankOwner = settings[`cat_${category}_bank_owner` || ''];

                            if (bankNumber) {
                                return (
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#888' }}>TRANSFER {bankName}</div>
                                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em', margin: '4px 0' }}>{bankNumber}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 600 }}>A.N {bankOwner}</div>
                                    </div>
                                );
                            }
                            return <div style={{ flex: 1, fontSize: '10px', color: '#888', italic: 'true' }}>Hubungi Admin untuk detail rekening.</div>;
                        })()}

                        {(() => {
                            const category = nota?.facility?.category?.toLowerCase().replace(' ', '_');
                            const qris = settings[`cat_${category}_qris` || ''];

                            if (qris) {
                                return (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>QRIS {nota?.facility?.category?.toUpperCase()}</div>
                                        <img src={qris} style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #eee', padding: '4px', background: 'white' }} alt="QRIS" />
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>

                <div style={{ marginBottom: '40px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700 }}>Catatan:</span>&nbsp; Terima kasih. Nota ini merupakan bukti transaksi resmi dari Mandala Arena.
                </div>
            </div>

            {/* Wave Footer */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <svg viewBox="0 0 728 180" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }}>
                    <path d="M0,180 L0,100 Q200,160 400,120 Q550,90 728,140 L728,180 Z" fill="#c8c8c8" />
                    <path d="M0,180 L0,130 Q180,100 350,150 Q520,190 728,160 L728,180 Z" fill="#444444" />
                </svg>
            </div>
        </div>
    );
}
