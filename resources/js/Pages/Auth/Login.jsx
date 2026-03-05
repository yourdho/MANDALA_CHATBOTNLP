import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputCls = 'block w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none mt-1.5 theme-transition'
    + ' [background-color:var(--input-bg)] [border-color:var(--border)] [color:var(--input-text)]'
    + ' focus:[border-color:var(--accent)] focus:[ring-color:var(--accent)] placeholder:[color:var(--input-placeholder)]';
const labelCls = 'block text-sm font-semibold [color:var(--text-secondary)]';

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
            <Head title="Masuk - Janjee" />

            {status && (
                <div className="mb-4 rounded-xl bg-[#F2D800]/10 border border-[#F2D800]/20 px-4 py-3 text-sm text-[#F2D800]">
                    {status}
                </div>
            )}

            <h1 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Masuk ke Akunmu</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className={labelCls}>Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputCls}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password" className={labelCls}>Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputCls}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ingat saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-[#F2D800] py-2.5 text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.01] transition-all shadow-lg shadow-[#F2D800]/20 disabled:opacity-60 mt-2"
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>

                <p className="text-center text-sm pt-1" style={{ color: 'var(--text-muted)' }}>
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                        Daftar di sini
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
