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

        // Regex for DD-MM-YYYY or DD/MM/YYYY
        if (preg_match('/\b(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{4}))?\b/', $msg, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
            $year = isset($matches[3]) ? $matches[3] : now()->year;
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
        // Regex for HH:MM (e.g., 14:00, 14.00, jam 2, jam 14)
        if (preg_match('/\b(?:jam |pukul )?(\d{1,2})[:.](\d{2})\b/', $msg, $matches)) {
            $hour = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            return "$hour:{$matches[2]}:00";
        }
        
        if (preg_match('/\b(?:jam |pukul )(\d{1,2})(?:\s|) (pagi|siang|sore|malam)\b/', $msg, $matches)) {
            $hour = (int)$matches[1];
            $meridiem = $matches[2];
            
            if ($meridiem == 'siang' || $meridiem == 'sore' || $meridiem == 'malam') {
                if ($hour < 12) $hour += 12;
            }
            $hourPad = str_pad($hour, 2, '0', STR_PAD_LEFT);
            return "$hourPad:00:00";
        }

        if (preg_match('/\b(?:jam |pukul )(\d{1,2})\b/', $msg, $matches)) {
            $hourPad = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            return "$hourPad:00:00";
        }

        return null;
    }

    protected function extractDuration(string $msg): ?int
    {
        // match: 2 jam, 3 jam
        if (preg_match('/\b(\d+)\s*jam\b/', $msg, $matches)) {
            return (int)$matches[1];
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
