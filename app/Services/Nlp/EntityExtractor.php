<?php

namespace App\Services\Nlp;

use Carbon\Carbon;
use App\Models\Facility;

class EntityExtractor
{
    /**
     * Ekstrak berbagai entitas spesifik dari pesan normalisasi
     */
    public function extract(string $normalizedMessage): array
    {
        return [
            'date'               => $this->extractDate($normalizedMessage),
            'time'               => $this->extractTime($normalizedMessage),
            'facility'           => $this->extractFacility($normalizedMessage),
            'duration'           => $this->extractDuration($normalizedMessage),
            'payment_method'     => $this->extractPaymentMethod($normalizedMessage),
            'additional_services'=> $this->extractAdditionalServices($normalizedMessage),
        ];
    }

    protected function extractDate(string $msg): ?string
    {
        if (str_contains($msg, 'hari ini') || str_contains($msg, 'sekarang')) {
            return now()->toDateString();
        }
        if (str_contains($msg, 'besok')) {
            return now()->addDay()->toDateString();
        }
        if (str_contains($msg, 'lusa')) {
            return now()->addDays(2)->toDateString();
        }
        
        // Relative Dates
        if (preg_match('/\b(minggu|bulan) depan\b/', $msg, $matches)) {
            if ($matches[1] === 'minggu') {
                return now()->addWeek()->toDateString();
            } else {
                return now()->addMonth()->toDateString();
            }
        }
        
        if (str_contains($msg, 'akhir pekan ini') || str_contains($msg, 'weekend')) {
            return now()->next('saturday')->toDateString();
        }

        // Days of week
        $days = ['senin' => 'monday', 'selasa' => 'tuesday', 'rabu' => 'wednesday', 'kamis' => 'thursday', 'jumat' => 'friday', 'jum\'at' => 'friday', 'sabtu' => 'saturday', 'minggu' => 'sunday'];
        foreach ($days as $id => $en) {
            if (str_contains($msg, $id)) {
                if (str_contains($msg, "$id depan") || str_contains($msg, "$id mnggu depan")) {
                    return now()->next($en)->addWeek()->toDateString();
                }
                return now()->next($en)->toDateString(); // gets the *upcoming* provided day
            }
        }

        // Regex for DD-MM-YYYY or DD/MM/YYYY or DD MMM YYYY
        if (preg_match('/\b(\d{1,2})[-\/\s]([a-zA-Z]+|\d{1,2})(?:[-\/\s](\d{4}))?\b/', $msg, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $monthInput = $matches[2];
            $year = $matches[3] ?? now()->year;

            if (is_numeric($monthInput)) {
                $month = str_pad($monthInput, 2, '0', STR_PAD_LEFT);
            } else {
                $months = ['jan' => '01', 'feb' => '02', 'mar' => '03', 'apr' => '04', 'mei' => '05', 'jun' => '06', 'jul' => '07', 'agu' => '08', 'aug' => '08', 'sep' => '09', 'okt' => '10', 'nov' => '11', 'des' => '12', 'dec' => '12'];
                $monthStr = strtolower(substr($monthInput, 0, 3));
                $month = $months[$monthStr] ?? '01';
            }

            try {
                return Carbon::createFromFormat('Y-m-d', "$year-$month-$day")->toDateString();
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    protected function extractTime(string $msg): ?string
    {
        $hour = null;
        $minute = "00";
        $meridiem = null;

        // Mendeteksi keteraturan meridiem di dalam teks panjang (meski terpisah dari "jam")
        if (preg_match('/\b(pagi|siang|sore|malam|malem)\b/', $msg, $matches)) {
            $meridiem = $matches[1];
            if ($meridiem === 'malem') $meridiem = 'malam';
        }

        // "setengah 8" -> 07:30
        if (preg_match('/\bsetengah\s+(\d{1,2})\b/', $msg, $matches)) {
            $targetHour = (int)$matches[1];
            $hour = $targetHour - 1;
            if ($hour <= 0) $hour = 12; // setengah 1 -> 12:30
            $minute = "30";
        }
        // Regex for HH:MM (e.g., 14:00, 14.00, jam 14.30)
        elseif (preg_match('/\b(?:jam\s*|pukul\s*|jm\s*)?(\d{1,2})[:.](\d{2})\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $minute = $matches[2];
        }
        // Jam dengan label lewat menit "jam 4 lewat 15"
        elseif (preg_match('/\b(?:jam\s*|pukul\s*|jm\s*)?(\d{1,2})\s*lewat\s*(\d{1,2})\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $minute = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
        }
        // Regex exactly "jam 7 malam" or "pukul 1 siang" (ini double check if the first meridiem missed tight bound)
        elseif (preg_match('/\b(?:jam\s*|pukul\s*|jm\s*)(\d{1,2})(?:\s|)(pagi|siang|sore|malam|malem)\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $meridiem = $matches[2] === 'malem' ? 'malam' : $matches[2];
        }
        // Catch pure "jam 20" or "jam 7"
        elseif (preg_match('/\b(?:jam|pukul|jm)\s*(\d{1,2})\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
        }

        if ($hour !== null) {
            // Evaluasi Konversi 12H ke 24H Berdasarkan Meridiem
            if ($meridiem === 'malam' && $hour < 12) {
                $hour += 12;
            } elseif ($meridiem === 'sore' && $hour < 12) {
                if ($hour <= 6) $hour += 12; // sore jam 4 -> 16
            } elseif ($meridiem === 'siang' && $hour < 12) {
                if ($hour <= 6) $hour += 12; // siang jam 2 -> 14
            } elseif ($meridiem === 'pagi' && $hour === 12) {
                $hour = 0; // kasus aneh: jam 12 pagi
            }
            // Time Travel Prevention (Cerdas Waktu Lampau)
            // Jika tidak ada meridiem eksplisit dan jam <= 12
            elseif ($meridiem === null && $hour <= 12) {
                 $nowCountHour = (int) now()->format('H');
                 
                 // Jika saat ini sudah lewat jam yang diinput, asumsikan itu jam malam (hour + 12)
                 if ($nowCountHour >= $hour) {
                      $hour += 12;
                 }
            }
            
            // Format ulang dengan Carbon supaya aman dan terstandar H:i:00
            try {
                return Carbon::createFromTime($hour, (int)$minute, 0)->format('H:i:00');
            } catch (\Exception $e) {
                // Ignore fallback
            }
        }

        // --- Deteksi Natural / Keterangan Waktu Murni (Tanpa angka Jam Spesifik) ---
        // Jika user hanya bilang "nanti sore", "besok malam", dsb.
        if ($meridiem) {
            if ($meridiem === 'pagi') return '08:00:00'; // asumsi standar pagi jam 08:00
            if ($meridiem === 'siang') return '13:00:00'; // asumsi standar siang jam 13:00
            if ($meridiem === 'sore') return '16:00:00'; // asumsi standar sore jam 16:00
            if ($meridiem === 'malam') return '19:00:00'; // asumsi standar malam jam 19:00
        }

        return null;
    }

    protected function extractDuration(string $msg): ?int
    {
        if (preg_match('/\b(\d+)\s*jam\b/', $msg, $matches)) {
            return (int)$matches[1];
        }
        if (str_contains($msg, 'setengah jam')) {
            return null; // We only support full hours mostly, but safely return null
        }
        if (str_contains($msg, 'sejam') || str_contains($msg, 'satu jam')) {
            return 1;
        }
        if (str_contains($msg, 'dua jam')) {
            return 2;
        }
        if (str_contains($msg, 'tiga jam')) {
            return 3;
        }
        
        return null;
    }

    protected function extractFacility(string $msg): ?array
    {
        $aliases = config('chatbot_nlp.facility_aliases', []);

        foreach ($aliases as $key => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($msg, $keyword)) {
                    // Try to map to DB
                    $facility = Facility::where('category', 'like', "%$key%")
                        ->orWhere('name', 'like', "%$key%")
                        ->first();
                        
                    if ($facility) {
                        return [
                            'category' => $key,
                            'id' => $facility->id,
                            'name' => $facility->name
                        ];
                    }
                    
                    return ['category' => $key, 'id' => null, 'name' => ucfirst($key)];
                }
            }
        }
        return null;
    }

    protected function extractPaymentMethod(string $msg): ?string
    {
        $methods = config('chatbot_nlp.payment_methods', []);
        foreach ($methods as $method => $keywords) {
            foreach ($keywords as $word) {
                if (str_contains($msg, $word)) {
                    return $method;
                }
            }
        }
        return null;
    }

    /**
     * Ekstrak pilihan layanan tambahan: wasit dan/atau fotografer.
     * Mengembalikan array berisi nama layanan yang dipilih, atau array kosong jika tidak ada.
     */
    protected function extractAdditionalServices(string $msg): array
    {
        $chosen = [];

        $wasitKeywords      = config('chatbot_nlp.additional_services.wasit',      ['wasit', 'referee', 'hakim lapangan']);
        $fotograferKeywords = config('chatbot_nlp.additional_services.fotografer', ['fotografer', 'foto', 'dokumentasi', 'photographer', 'kamera', 'fotografi']);

        foreach ($wasitKeywords as $kw) {
            if (str_contains($msg, $kw)) { $chosen[] = 'wasit'; break; }
        }

        foreach ($fotograferKeywords as $kw) {
            if (str_contains($msg, $kw)) { $chosen[] = 'fotografer'; break; }
        }

        // "dua-duanya" / "keduanya" / "semua"
        if (preg_match('/\b(dua-duanya|dua duanya|keduanya|semua|both)\b/', $msg)) {
            $chosen = ['wasit', 'fotografer'];
        }

        return array_unique($chosen);
    }
}
