<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;

/**
 * TextNormalizer handles basic preprocessing:
 * Invisible-char stripping, lowercasing, unicode/punctuation cleanup,
 * repeated-character normalization, class-level slang dictionary,
 * config-driven slang/typo mapping, and multiple-space normalization.
 */
class TextNormalizer
{
    /**
     * Kamus singkatan / bahasa gaul Indonesia tingkat class.
     * Diprioritaskan sebelum peta config (slang_map / typo_map).
     *
     * Format: 'singkatan' => 'bentuk_baku'
     */
    protected array $inlineSlang = [
        // --- Kata tanya / umum ---
        'yg'      => 'yang',
        'dg'      => 'dengan',
        'dgn'     => 'dengan',
        'utk'     => 'untuk',
        'tuk'     => 'untuk',
        'krn'     => 'karena',
        'krna'    => 'karena',
        'kpn'     => 'kapan',
        'bgmn'    => 'bagaimana',
        'gmn'     => 'bagaimana',
        'gmana'   => 'bagaimana',
        'sama'    => 'dengan',
        'gimana'  => 'bagaimana',
        'jd'      => 'jadi',
        'jdi'     => 'jadi',
        'blm'     => 'belum',
        'blom'    => 'belum',
        'sdh'     => 'sudah',
        'udah'    => 'sudah',
        'udh'     => 'sudah',
        'dah'     => 'sudah',
        'emg'     => 'memang',
        'emang'   => 'memang',
        'sm'      => 'sama',
        'bgt'     => 'banget',
        'bngt'    => 'banget',
        'tp'      => 'tapi',
        'tpi'     => 'tapi',
        'tt'      => 'tentang',
        'ttg'     => 'tentang',
        'hrs'     => 'harus',
        'hrus'    => 'harus',
        'dtg'     => 'datang',
        'bs'      => 'bisa',
        'bsa'     => 'bisa',
        'bgt'     => 'banget',

        // --- Waktu ---
        'bsk'     => 'besok',
        'bsok'    => 'besok',
        'mlm'     => 'malam',
        'pg'      => 'pagi',
        'sore'    => 'sore',
        'skrg'    => 'sekarang',
        'skrng'   => 'sekarang',
        'ntar'    => 'nanti',
        'tar'     => 'nanti',

        // --- Booking / Fasilitas ---
        'pesen'   => 'pesan',
        'psn'     => 'pesan',
        'lap'     => 'lapangan',
        'lapang'  => 'lapangan',
        'lapangn' => 'lapangan',
        'pdl'     => 'padel',
        'plt'     => 'pilates',
        'bskt'    => 'basket',
        'minsok'  => 'mini soccer',
        'minsoc'  => 'mini soccer',
        'msoc'    => 'mini soccer',

        // --- Pembayaran ---
        'tf'      => 'transfer',
        'byr'     => 'bayar',
        'bayr'    => 'bayar',
        'dp'      => 'uang muka',
        'konfirm' => 'konfirmasi',

        // --- Orang / Sapaan ---
        'gw'      => 'saya',
        'gue'     => 'saya',
        'gua'     => 'saya',
        'w'       => 'saya',
        'ak'      => 'saya',
        'aku'     => 'saya',
        'km'      => 'kamu',
        'kmu'     => 'kamu',
        'lo'      => 'kamu',
        'lu'      => 'kamu',
        'mimin'   => 'admin',
        'min'     => 'admin',

        // --- Afirmasi / Negasi ---
        'iya'     => 'ya',
        'iyah'    => 'ya',
        'yap'     => 'ya',
        'yup'     => 'ya',
        'ok'      => 'oke',
        'oke'     => 'oke',
        'gak'     => 'tidak',
        'ga'      => 'tidak',
        'gk'      => 'tidak',
        'ngga'    => 'tidak',
        'nggak'   => 'tidak',
        'engga'   => 'tidak',
        'enggak'  => 'tidak',
        'kgk'     => 'tidak',
    ];

    /**
     * Normalize the raw user message.
     * Alur: invisible-char strip → lowercase → unicode cleanup →
     *       repeated-char normalization → inline slang dict →
     *       config slang/typo map → multiple-space cleanup.
     */
    public function normalize(string $message): string
    {
        // 1. Buang invisible / control characters (zero-width space, BOM, dll.)
        $message = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\xC2\xA0]/u', ' ', $message);
        $message = preg_replace('/\p{Cf}/u', '', $message); // Unicode "format" chars (misal U+200B)

        // 2. Lowercase + trim
        $message = mb_strtolower(trim($message));

        // 3. Unicode Cleanup – pertahankan huruf, angka, spasi, dan tanda baca dasar
        $message = preg_replace('/[^\p{L}\p{N}\s.,?!\-:]/u', '', $message);

        // 4. Normalisasi karakter berulang (misal "okeeee" → "oke", "haaaloooo" → "halo")
        $message = preg_replace('/(.)\\1{2,}/', '$1', $message);

        // 5. Pemetaan kamus inline (class-level) — Sort by length DESC dulu!
        // BUGFIX: Tanpa sort, 'abdi' bisa terganti sebelum 'abdi hoyong' sempat diproses.
        $inlineSlangSorted = $this->inlineSlang;
        uksort($inlineSlangSorted, fn($a, $b) => strlen($b) - strlen($a));
        foreach ($inlineSlangSorted as $slang => $formal) {
            $message = preg_replace(
                '/\b' . preg_quote($slang, '/') . '\b/u',
                $formal,
                $message
            );
        }

        // 6. Pemetaan dari config (sunda_map + slang_map + typo_map) — Sort by length DESC
        // BUGFIX: sunda_map sebelumnya didefinisikan di config tapi tidak pernah dipanggil di sini.
        $sundaMap  = Config::get('chatbot_nlp.sunda_map', []);
        $slangMap  = Config::get('chatbot_nlp.slang_map', []);
        $typoMap   = Config::get('chatbot_nlp.typo_map', []);
        $staticMap = array_merge($sundaMap, $slangMap, $typoMap);

        // Sort by key length descending — frasa panjang diproses lebih dulu
        uksort($staticMap, fn($a, $b) => strlen($b) - strlen($a));

        foreach ($staticMap as $slang => $formal) {
            $message = preg_replace(
                '/\b' . preg_quote($slang, '/') . '\b/u',
                $formal,
                $message
            );
        }

        // 7. Normalisasi spasi ganda menjadi spasi tunggal
        return preg_replace('/\s+/', ' ', trim($message));
    }
}

