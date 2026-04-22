<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MitraApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    // adminOnly() DIHAPUS — route sudah dilindungi can:manage-system middleware
    // Redundant check di sini hanya menambah noise tanpa nilai keamanan tambahan.

    /** List all mitra applications */
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');

        $query = MitraApplication::with('user')->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $applications = $query->get()->map(fn($app) => [
            'id'            => $app->id,
            'user_name'     => $app->user->name,
            'user_email'    => $app->user->email,
            'nama_tempat'   => $app->nama_tempat,
            'nama_pemilik'  => $app->nama_pemilik,
            'no_hp'         => $app->no_hp,
            'qris_rekening' => $app->qris_rekening,
            'status'        => $app->status,
            'jadwal_temu'   => $app->jadwal_temu?->format('d M Y, H:i'),
            'jadwal_raw'    => $app->jadwal_temu?->format('Y-m-d\TH:i'),
            'catatan'       => $app->catatan,
            'created_at'    => $app->created_at->format('d M Y'),
        ]);

        $counts = [
            'all'      => MitraApplication::count(),
            'pending'  => MitraApplication::where('status', 'pending')->count(),
            'approved' => MitraApplication::where('status', 'approved')->count(),
            'rejected' => MitraApplication::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'counts'       => $counts,
            'status'       => $status,
        ]);
    }

    /** Approve an application and promote user to mitra */
    public function approve(Request $request, MitraApplication $application)
    {
        $request->validate([
            'jadwal_temu' => 'nullable|date',
            'catatan'     => 'nullable|string|max:1000',
        ]);

        // DB::transaction: jika update role User gagal, update Application juga di-rollback.
        // Tanpa ini, bisa terjadi state setengah jalan: application = approved tapi user masih bukan mitra.
        DB::transaction(function () use ($application, $request) {
            $application->update([
                'status'      => 'approved',
                'jadwal_temu' => $request->jadwal_temu,
                'catatan'     => $request->catatan,
            ]);

            User::where('id', $application->user_id)->update(['role' => 'mitra']);
        });

        return back()->with('success', "Pengajuan {$application->nama_pemilik} disetujui.");
    }

    /** Reject an application */
    public function reject(Request $request, MitraApplication $application)
    {
        $request->validate([
            'catatan' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status'  => 'rejected',
            'catatan' => $request->catatan,
        ]);

        return back()->with('success', "Pengajuan {$application->nama_pemilik} ditolak.");
    }

    /** Set / update meeting schedule without changing status */
    public function schedule(Request $request, MitraApplication $application)
    {
        $request->validate([
            'jadwal_temu' => 'required|date',
            'catatan'     => 'nullable|string|max:1000',
        ]);

        $application->update([
            'jadwal_temu' => $request->jadwal_temu,
            'catatan'     => $request->catatan,
        ]);

        return back()->with('success', 'Jadwal temu berhasil diatur.');
    }
}
