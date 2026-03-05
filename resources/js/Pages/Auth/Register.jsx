import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputCls = 'block w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none mt-1.5 theme-transition'
    + ' [background-color:var(--input-bg)] [border-color:var(--border)] [color:var(--input-text)]'
    + ' focus:[border-color:var(--accent)] placeholder:[color:var(--input-placeholder)]';
const labelCls = 'block text-sm font-semibold [color:var(--text-secondary)]';

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
            <Head title="Daftar - Janjee" />

            <h1 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Buat Akun Baru</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={labelCls}>Nama Lengkap</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={data.name}
                        className={inputCls}
                        autoComplete="name"
                        autoFocus
                        placeholder="Nama kamu"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="email" className={labelCls}>Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputCls}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        placeholder="Min. 8 karakter"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className={labelCls}>Konfirmasi Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={inputCls}
                        autoComplete="new-password"
                        placeholder="Ulangi password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-[#F2D800] py-2.5 text-sm font-bold text-[#1A1818] hover:bg-[#ffe800] hover:scale-[1.01] transition-all shadow-lg shadow-[#F2D800]/20 disabled:opacity-60 mt-2"
                >
                    {processing ? 'Mendaftar...' : 'Buat Akun'}
                </button>

                <p className="text-center text-sm pt-1" style={{ color: 'var(--text-muted)' }}>
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                        Masuk di sini
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
