import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const PAYMENT_OPTIONS = [
    { value: 'transfer_bank', label: 'Transfer Bank', icon: '', desc: 'BCA / Mandiri / BNI / BRI' },
    { value: 'qris', label: 'QRIS', icon: '', desc: 'Scan QR di tempat' },
    { value: 'bayar_ditempat', label: 'Bayar di Tempat', icon: '', desc: 'Bayar tunai saat tiba' },
];

export default function BookingCreate({ venue, date, auth_user, register_incentive }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const [usePoints, setUsePoints] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        venue_id: venue.id,
        booking_date: date,
        start_time: '',
        end_time: '',
        payment_method: '',
        // Guest fields
        guest_name: '',
        guest_phone: '',
        // Points
        use_points: false,
    });

    // Hitung harga estimasi
    const hours = (() => {
        if (!data.start_time || !data.end_time) return 0;
        const s = parseInt(data.start_time);
        const e = parseInt(data.end_time);
        return e > s ? e - s : 0;
    })();
    const subtotal = hours * venue.price_per_hour;

    // Diskon poin (max 10% dari subtotal)
    const pointsDiscount = (isLoggedIn && usePoints && auth_user?.points_balance > 0)
        ? Math.min(auth_user.points_balance, Math.round(subtotal * 0.10))
        : 0;
    const total = Math.max(0, subtotal - pointsDiscount);

    // Estimasi poin yang akan diperoleh (1 poin per Rp 1.000)
    const pointsToEarn = isLoggedIn ? Math.floor(total / 1000) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bookings.store'));
    };

    const togglePoints = (v) => {
        setUsePoints(v);
        setData('use_points', v);
    };

    return (
        <>
            <Head title={`Booking – ${venue.name}`} />

            {/* Minimal navbar */}
            <header className="fixed inset-x-0 top-0 z-50 h-14 flex items-center px-4 sm:px-8 border-b"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                <Link href={route('venues.show', venue.id)} className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>
                    ← Kembali ke {venue.name}
                </Link>
                {isLoggedIn && (
                    <div className="ml-auto flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1"
                        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                        ⭐ {auth_user?.points_balance?.toLocaleString('id-ID')} poin
                    </div>
                )}
            </header>

            <div className="min-h-screen pt-14 font-sans"
                style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

                <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-widest mb-1"
                            style={{ color: 'var(--accent)' }}>Booking Venue</p>
                        <h1 className="text-2xl sm:text-3xl font-black"
                            style={{ color: 'var(--text-primary)' }}>{venue.name}</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                             {venue.address}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* ─── FORM ─── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-3">
                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* ── GUEST BANNER / INSENTIF ── */}
                                {!isLoggedIn && (
                                    <div className="rounded-2xl p-4 border"
                                        style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent-border)' }}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl"></span>
                                            <div>
                                                <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
                                                    Daftar akun &amp; hemat {register_incentive}!
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                    Pengguna dengan akun mendapat poin reward setiap transaksi,
                                                    diskon dari poin, dan riwayat booking lengkap.
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <Link href={route('register')}
                                                        className="text-xs font-bold rounded-full px-3 py-1 text-[#1A1818]"
                                                        style={{ background: 'var(--accent)' }}>
                                                        Register
                                                    </Link>
                                                    <Link href={route('login')}
                                                        className="text-xs font-semibold rounded-full px-3 py-1 border"
                                                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                                                        Login
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── DATA DIRI (guest only) ── */}
                                {!isLoggedIn && (
                                    <Card title="Data Pemesan">
                                        <FormGroup label="Nama Lengkap" error={errors.guest_name}>
                                            <input
                                                type="text"
                                                placeholder="Masukkan nama lengkap Anda"
                                                value={data.guest_name}
                                                onChange={e => setData('guest_name', e.target.value)}
                                                className="input-field"
                                            />
                                        </FormGroup>
                                        <FormGroup label="Nomor Telepon (WhatsApp)" error={errors.guest_phone}>
                                            <input
                                                type="tel"
                                                placeholder="08xxxxxxxxxx"
                                                value={data.guest_phone}
                                                onChange={e => setData('guest_phone', e.target.value)}
                                                className="input-field"
                                            />
                                        </FormGroup>
                                    </Card>
                                )}

                                {/* ── TANGGAL ── */}
                                <Card title="Tanggal Booking">
                                    <FormGroup label="Pilih Tanggal" error={errors.booking_date}>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={data.booking_date}
                                            onChange={e => setData('booking_date', e.target.value)}
                                            className="input-field"
                                        />
                                    </FormGroup>
                                </Card>

                                {/* ── JAM ── */}
                                <Card title="Waktu Booking">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormGroup label="Jam Mulai" error={errors.start_time}>
                                            <select value={data.start_time}
                                                onChange={e => setData('start_time', e.target.value)}
                                                className="input-field">
                                                <option value="">Pilih</option>
                                                {Array.from({ length: 16 }, (_, i) => i + 7).map(h => (
                                                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                                                        {String(h).padStart(2, '0')}:00
                                                    </option>
                                                ))}
                                            </select>
                                        </FormGroup>
                                        <FormGroup label="Jam Selesai" error={errors.end_time}>
                                            <select value={data.end_time}
                                                onChange={e => setData('end_time', e.target.value)}
                                                className="input-field">
                                                <option value="">Pilih</option>
                                                {Array.from({ length: 16 }, (_, i) => i + 8).map(h => (
                                                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                                                        {String(h).padStart(2, '0')}:00
                                                    </option>
                                                ))}
                                            </select>
                                        </FormGroup>
                                    </div>
                                </Card>

                                {/* ── POIN (user login) ── */}
                                {isLoggedIn && auth_user?.points_balance > 0 && subtotal > 0 && (
                                    <Card title="Gunakan Poin Reward">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    Saldo: ⭐ {auth_user.points_balance.toLocaleString('id-ID')} poin
                                                </p>
                                                <p className="text-xs mt-0.5"
                                                    style={{ color: 'var(--text-secondary)' }}>
                                                    Gunakan hingga Rp {Math.round(subtotal * 0.10).toLocaleString('id-ID')} diskon (maks. 10%)
                                                </p>
                                            </div>
                                            <button type="button"
                                                onClick={() => togglePoints(!usePoints)}
                                                className={`relative w-12 h-6 rounded-full transition-all ${usePoints ? 'bg-[#F2D800]' : 'bg-slate-600'}`}>
                                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${usePoints ? 'translate-x-6' : ''}`} />
                                            </button>
                                        </div>
                                        {usePoints && pointsDiscount > 0 && (
                                            <p className="mt-2 text-xs font-semibold text-green-400">
                                                 Hemat Rp {pointsDiscount.toLocaleString('id-ID')}
                                            </p>
                                        )}
                                    </Card>
                                )}

                                {/* ── METODE BAYAR ── */}
                                <Card title="Metode Pembayaran">
                                    <div className="space-y-2">
                                        {PAYMENT_OPTIONS.map(opt => (
                                            <label key={opt.value}
                                                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${data.payment_method === opt.value ? 'border-[#F2D800] bg-[#F2D800]/5' : ''}`}
                                                style={{ borderColor: data.payment_method === opt.value ? 'var(--accent)' : 'var(--border)' }}>
                                                <input type="radio" name="payment_method" value={opt.value}
                                                    checked={data.payment_method === opt.value}
                                                    onChange={() => setData('payment_method', opt.value)}
                                                    className="accent-[#F2D800]" />
                                                <span className="text-xl">{opt.icon}</span>
                                                <div>
                                                    <p className="text-sm font-semibold"
                                                        style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.payment_method && (
                                        <p className="mt-1 text-xs text-red-400">{errors.payment_method}</p>
                                    )}
                                </Card>

                                {/* ── SUBMIT ── */}
                                <button type="submit" disabled={processing}
                                    className="w-full rounded-2xl py-4 text-base font-black text-[#1A1818] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-60"
                                    style={{ background: 'var(--accent)' }}>
                                    {processing ? 'Memproses...' : isLoggedIn
                                        ? `Booking Sekarang (+${pointsToEarn} Poin)`
                                        : 'Booking Sekarang'}
                                </button>

                                {!isLoggedIn && (
                                    <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Sudah punya akun?{' '}
                                        <Link href={route('login')} className="font-semibold"
                                            style={{ color: 'var(--accent)' }}>
                                            Login untuk mendapat poin reward
                                        </Link>
                                    </p>
                                )}
                            </form>
                        </motion.div>

                        {/* ─── ORDER SUMMARY ─── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2">
                            <div className="sticky top-20 rounded-2xl border p-5 space-y-4"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Ringkasan Pesanan</p>

                                {/* Venue Info */}
                                {venue.images?.[0] && (
                                    <img src={venue.images[0]} alt={venue.name}
                                        className="w-full h-28 object-cover rounded-xl" />
                                )}
                                <div>
                                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{venue.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{venue.category}</p>
                                </div>

                                <hr style={{ borderColor: 'var(--border)' }} />

                                {/* Price breakdown */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Tanggal</span>
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {data.booking_date || '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Waktu</span>
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {data.start_time && data.end_time
                                                ? `${data.start_time} – ${data.end_time}`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Durasi</span>
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {hours > 0 ? `${hours} jam` : '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Harga / jam</span>
                                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            Rp {venue.price_per_hour?.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {pointsDiscount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Diskon poin</span>
                                            <span className="font-semibold">− Rp {pointsDiscount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>

                                <hr style={{ borderColor: 'var(--border)' }} />

                                <div className="flex justify-between items-center">
                                    <span className="font-black" style={{ color: 'var(--text-primary)' }}>Total</span>
                                    <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>
                                        {hours > 0
                                            ? `Rp ${total.toLocaleString('id-ID')}`
                                            : '—'}
                                    </span>
                                </div>

                                {/* Poin yang akan diperoleh */}
                                {isLoggedIn && hours > 0 && (
                                    <div className="rounded-xl p-3 text-center"
                                        style={{ background: 'var(--accent-dim)' }}>
                                        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                                            ⭐ Anda akan mendapat +{pointsToEarn} poin dari transaksi ini
                                        </p>
                                    </div>
                                )}

                                {/* Guest info */}
                                {!isLoggedIn && (
                                    <div className="rounded-xl p-3 text-center"
                                        style={{ background: 'var(--accent-dim)' }}>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                             Daftar akun & hemat <strong style={{ color: 'var(--accent)' }}>{register_incentive}</strong> di booking berikutnya
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    border-radius: 0.75rem;
                    border: 1px solid var(--border);
                    background: var(--bg-base);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: var(--accent);
                }
                .input-field option {
                    background: var(--bg-card);
                }
            `}</style>
        </>
    );
}

function Card({ title, children }) {
    return (
        <div className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {children}
        </div>
    );
}

function FormGroup({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1.5"
                style={{ color: 'var(--text-secondary)' }}>{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}

