import DangerButton from '@/Components/UI/DangerButton';
import InputError from '@/Components/UI/InputError';
import InputLabel from '@/Components/UI/InputLabel';
import Modal from '@/Components/UI/Modal';
import SecondaryButton from '@/Components/UI/SecondaryButton';
import TextInput from '@/Components/UI/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="mb-10">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-red-500">
                    Penghapusan <span className="text-red-400/50">Akun</span>
                </h2>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-60"
                    style={{ color: 'var(--text-secondary)' }}>
                    Tindakan ini bersifat permanen. Seluruh data misi akan dihapus dari server.
                </p>
            </header>

            <button
                onClick={confirmUserDeletion}
                className="px-10 py-4 bg-red-500/10 border-2 border-red-500/20 text-red-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all italic"
            >
                TERMINASI AKUN
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-10 space-y-8" style={{ shadow: 'none', background: 'var(--bg-card)' }}>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">
                            Konfirmasi <span className="text-white">Terminasi</span>
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-loose" style={{ color: 'var(--text-secondary)' }}>
                            Apakah Anda yakin ingin menghapus akun? Masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun Anda secara permanen.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 ml-2 italic">Sandi Konfirmasi</label>
                        <input
                            type="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full border-2 rounded-2xl px-6 py-5 font-black italic uppercase tracking-[0.2em] text-sm outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            placeholder="MASUKKAN SANDI ANDA"
                        />
                        {errors.password && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-4 italic">{errors.password}</p>}
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 py-4 border-2 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all italic"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                        >
                            BATALKAN
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-10 py-4 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all italic"
                        >
                            HAPUS PERMANEN
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
