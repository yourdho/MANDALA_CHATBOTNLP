import InputError from '@/Components/UI/InputError';
import InputLabel from '@/Components/UI/InputLabel';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import TextInput from '@/Components/UI/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="mb-10">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter"
                    style={{ color: 'var(--text-primary)' }}>
                    Data <span className="text-[#38BDF8]">Diri Member</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 italic">
                    Konfigurasi parameter identitas member untuk otentikasi radar.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Nama Operasional</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.name}</p>}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Frekuensi Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.email}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Nomor Signal (WhatsApp)</label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="CONTOH: 08123456789"
                        className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all placeholder:opacity-20"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.phone}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest italic">
                            Email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post" as="button"
                                className="ml-2 underline text-white hover:text-amber-300"
                            >
                                Klik untuk kirim ulang instruksi verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-3 text-[10px] font-black uppercase text-emerald-400">
                                Sinyal verifikasi baru telah dikirimkan.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-8 pt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-12 py-5 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-[#38BDF8]/20 hover:scale-[1.05] transition-all italic disabled:opacity-50"
                    >
                        PERBARUI PROFIL
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">
                            DATA TER-SINKRONISASI
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
