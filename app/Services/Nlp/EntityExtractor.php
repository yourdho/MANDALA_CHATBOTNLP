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
            'date' => $this->extractDate($normalizedMessage),
            'time' => $this->extractTime($normalizedMessage),
            'facility' => $this->extractFacility($normalizedMessage),
            'duration' => $this->extractDuration($normalizedMessage),
            'payment_method' => $this->extractPaymentMethod($normalizedMessage),
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
        // "setengah 8" -> 07:30
        if (preg_match('/\bsetengah\s+(\d{1,2})\b/', $msg, $matches)) {
            $targetHour = (int)$matches[1];
            $realHour = $targetHour - 1;
            if ($realHour <= 0) $realHour = 12; // setengah 1 -> 12:30
            
            // Assume PM if it's typical evening hours context or > 1, but we'll stick to 24h fallback
            // If they say setengah 8 malam
            if (str_contains($msg, 'malam') && $realHour < 12) $realHour += 12;
            
            return str_pad($realHour, 2, '0', STR_PAD_LEFT) . ':30:00';
        }

        // Regex for HH:MM (e.g., 14:00, 14.00, jam 14.30)
        if (preg_match('/\b(?:jam |pukul )?(\d{1,2})[:.](\d{2})\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            if (str_contains($msg, 'malam') && $hour < 12) $hour += 12;
            $hourPad = str_pad($hour, 2, '0', STR_PAD_LEFT);
            return "$hourPad:{$matches[2]}:00";
        }
        
        // Regex for exactly "jam 7 malam" or "pukul 1 siang"
        if (preg_match('/\b(?:jam |pukul )(\d{1,2})(?:\s|)(pagi|siang|sore|malam)\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $meridiem = $matches[2];
            
            if (in_array($meridiem, ['siang', 'sore', 'malam']) && $hour < 12) {
                if ($hour !== 12 || $meridiem === 'malam') { 
                    $hour += 12; 
                }
            }
            $hourPad = str_pad($hour, 2, '0', STR_PAD_LEFT);
            return "$hourPad:00:00";
        }

        // Catch pure "jam 20" or "jam 7"
        if (preg_match('/\b(?:jam |pukul |jm )(\d{1,2})\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $hourPad = str_pad($hour, 2, '0', STR_PAD_LEFT);
            return "$hourPad:00:00";
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
}
