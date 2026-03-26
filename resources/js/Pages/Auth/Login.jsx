import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
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
            <Head title="Login | Mandala Arena" />

            {status && (
                <div className="mb-6 p-4 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-black uppercase tracking-widest italic">
                    {status}
                </div>
            )}

            <div className="mb-10 text-center md:text-center">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                    Mandala <span className="text-[#38BDF8]"> Arena</span>
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
                        placeholder="ujang@gmail.com"
                        id="email-input"
                    />
                    <InputError message={errors.email} className="mt-2 ml-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Password</label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-[10px] font-bold tracking-wider text-[#38BDF8] hover:text-slate-900 transition-colors">
                                Lupa Sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300 pr-14"
                            placeholder="••••••••"
                            id="password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#38BDF8] transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
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
                        {processing ? 'Authenticating...' : 'Login'}
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
