import InputError from '@/Components/UI/InputError';
import InputLabel from '@/Components/UI/InputLabel';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import TextInput from '@/Components/UI/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="mb-10">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter"
                    style={{ color: 'var(--text-primary)' }}>
                    Enkripsi <span className="text-[#38BDF8]">Sandi</span>
                </h2>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-60"
                    style={{ color: 'var(--text-secondary)' }}>
                    Gunakan kombinasi karakter alfa-numerik untuk keamanan maksimal.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Sandi Sekarang</label>
                    <input
                        type="password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        autoComplete="current-password"
                    />
                    {errors.current_password && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.current_password}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Sandi Baru</label>
                        <input
                            type="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.password}</p>}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] ml-2 italic">Konfirmasi Sandi</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-[#38BDF8]/30 transition-all"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.password_confirmation}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-8 pt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-12 py-5 bg-[#38BDF8] text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-[#38BDF8]/20 hover:scale-[1.05] transition-all italic disabled:opacity-50"
                    >
                        PERBARUI SANDI
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">
                            ENKRIPSI DIPERBARUI
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
