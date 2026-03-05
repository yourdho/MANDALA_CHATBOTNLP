<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MitraApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    private function adminOnly(): void
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403);
        }
    }

    /** List all mitra applications */
    public function index(Request $request)
    {
        $this->adminOnly();
        $status = $request->get('status', 'all');

        $query = MitraApplication::with('user')->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $applications = $query->get()->map(fn($app) => [
            'id' => $app->id,
            'user_name' => $app->user->name,
            'user_email' => $app->user->email,
            'nama_tempat' => $app->nama_tempat,
            'nama_pemilik' => $app->nama_pemilik,
            'no_hp' => $app->no_hp,
            'qris_rekening' => $app->qris_rekening,
            'status' => $app->status,
            'jadwal_temu' => $app->jadwal_temu?->format('d M Y, H:i'),
            'jadwal_raw' => $app->jadwal_temu?->format('Y-m-d\TH:i'),
            'catatan' => $app->catatan,
            'created_at' => $app->created_at->format('d M Y'),
        ]);

        $counts = [
            'all' => MitraApplication::count(),
            'pending' => MitraApplication::where('status', 'pending')->count(),
            'approved' => MitraApplication::where('status', 'approved')->count(),
            'rejected' => MitraApplication::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Applications/Index', [
            'applications' => $applications,
            'counts' => $counts,
            'status' => $status,
        ]);
    }

    /** Approve an application and promote user to mitra */
    public function approve(Request $request, MitraApplication $application)
    {
        $this->adminOnly();
        $request->validate([
            'jadwal_temu' => 'nullable|date',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status' => 'approved',
            'jadwal_temu' => $request->jadwal_temu,
            'catatan' => $request->catatan,
        ]);

        // Promote user role to mitra
        User::where('id', $application->user_id)->update(['role' => 'mitra']);

        return back()->with('success', "Pengajuan {$application->nama_pemilik} disetujui.");
    }

    /** Reject an application */
    public function reject(Request $request, MitraApplication $application)
    {
        $this->adminOnly();
        $request->validate([
            'catatan' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status' => 'rejected',
            'catatan' => $request->catatan,
        ]);

        return back()->with('success', "Pengajuan {$application->nama_pemilik} ditolak.");
    }

    /** Set / update meeting schedule without changing status */
    public function schedule(Request $request, MitraApplication $application)
    {
        $this->adminOnly();
        $request->validate([
            'jadwal_temu' => 'required|date',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'jadwal_temu' => $request->jadwal_temu,
            'catatan' => $request->catatan,
        ]);

        return back()->with('success', 'Jadwal temu berhasil diatur.');
    }
}
