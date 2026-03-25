import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Login Area | Mandala Arena" />

            {status && (
                <div className="mb-6 p-4 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-black uppercase tracking-widest italic">
                    {status}
                </div>
            )}

            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                    Welcome <span className="text-[#38BDF8]">Back</span> ⚡
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">
                    Akses area olahraga Anda
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Email Address</label>
                    <input
                        type="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                        placeholder="your@email.com"
                        id="email-input"
                    />
                    <InputError message={errors.email} className="mt-2 ml-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Password</label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-[10px] font-bold tracking-wider text-[#38BDF8] hover:text-slate-900 transition-colors">
                                Lupa Pandi?
                            </Link>
                        )}
                    </div>
                    <input
                        type="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                        id="password-input"
                    />
                    <InputError message={errors.password} className="mt-2 ml-2" />
                </div>

                <div className="flex items-center px-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-5 h-5 rounded-lg bg-slate-50 border-slate-200 text-[#38BDF8] focus:ring-[#38BDF8]/20"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">Ingat Sesi Saya</span>
                    </label>
                </div>

                <div className="pt-4">
                    <motion.button
                        whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#38BDF8] text-white rounded-2xl py-5 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-[#38BDF8]/30 hover:bg-[#38BDF8]/90 transition-all disabled:opacity-50"
                    >
                        {processing ? 'Authenticating...' : 'Login Area 🚀'}
                    </motion.button>
                </div>

                <div className="text-center pt-6 border-t border-slate-100 mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Belum Punya Akun?{' '}
                        <Link href={route('register')} className="text-[#38BDF8] hover:text-slate-900 font-black italic ml-1">
                            Daftar Sekarang
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
