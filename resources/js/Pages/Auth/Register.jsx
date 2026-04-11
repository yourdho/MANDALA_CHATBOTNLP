import InputError from '@/Components/UI/InputError';
import GuestLayout from '@/Components/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Gabung Arena | Mandala Arena" />

            <div className="mb-10 text-center md:text-center">
                <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                    Mandala <span className="text-[#38BDF8]">Arena</span>
                </h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3">
                    Buat akun olahraga kamu hari ini juga
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Nama Lengkap</label>
                    <input
                        type="text"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                        placeholder="Ujang"
                    />
                    <InputError message={errors.name} className="mt-2 ml-2" />
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Email Address</label>
                    <input
                        type="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                        placeholder="ujang@gmail.com"
                    />
                    <InputError message={errors.email} className="mt-2 ml-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Konfirmasi</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#38BDF8]/40 focus:border-[#38BDF8]/50 text-slate-900 text-sm font-bold transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <InputError message={errors.password} className="mt-1 ml-2" />
                <InputError message={errors.password_confirmation} className="mt-1 ml-2" />

                <div className="pt-4">
                    <motion.button
                        whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#FACC15] text-amber-950 rounded-2xl py-5 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-[#FACC15]/30 hover:bg-[#FACC15]/90 transition-all disabled:opacity-50"
                    >
                        {processing ? 'Memproses...' : 'Daftar Sekarang '}
                    </motion.button>
                </div>

                <div className="text-center pt-6 border-t border-slate-100 mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Sudah Punya Akun?{' '}
                        <Link href={route('login')} className="text-[#38BDF8] hover:text-slate-900 font-black italic ml-1">
                            Login Disini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}

