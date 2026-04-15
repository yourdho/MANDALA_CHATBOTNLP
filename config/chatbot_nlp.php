<?php

return [

    'thresholds' => [
        'high_confidence'   => 20,
        'medium_confidence' => 10,
        'low_confidence'    => 4,
        'ambiguity_gap'     => 3,
    ],

    'intents' => [
        'greeting',
        'booking',
        'facility_info',
        'price_check',
        'availability_check',
        'login_help',
        'register_help',
        'matchmaking',
        'promo_info',
        'location_info',
        'operating_hours',
        'cancel',
        'reschedule',
        'thanks',
        'complaint',
        'payment_help',
        'payment_status_check',
        'fallback_unknown',
    ],

    'phrase_weights' => [
        // Greeting
        'halo' => ['intent' => 'greeting', 'score' => 10],
        'hai' => ['intent' => 'greeting', 'score' => 10],
        'hi' => ['intent' => 'greeting', 'score' => 10],
        'hello' => ['intent' => 'greeting', 'score' => 10],
        'assalamualaikum' => ['intent' => 'greeting', 'score' => 12],
        'punten' => ['intent' => 'greeting', 'score' => 8],
        'wilujeng' => ['intent' => 'greeting', 'score' => 8],

        // Booking
        'mau booking' => ['intent' => 'booking', 'score' => 20],
        'bantu booking' => ['intent' => 'booking', 'score' => 20],
        'ingin booking' => ['intent' => 'booking', 'score' => 20],
        'mau pesan' => ['intent' => 'booking', 'score' => 16],
        'ingin pesan' => ['intent' => 'booking', 'score' => 16],
        'mau sewa' => ['intent' => 'booking', 'score' => 16],
        'ingin sewa' => ['intent' => 'booking', 'score' => 16],
        'bisa booking' => ['intent' => 'booking', 'score' => 15],
        'bisa pesan' => ['intent' => 'booking', 'score' => 15],
        'book sekarang' => ['intent' => 'booking', 'score' => 18],
        'booking sekarang' => ['intent' => 'booking', 'score' => 18],
        'mau reservasi' => ['intent' => 'booking', 'score' => 16],
        'ingin reservasi' => ['intent' => 'booking', 'score' => 16],
        'hoyong booking' => ['intent' => 'booking', 'score' => 20],
        'abdi hoyong booking' => ['intent' => 'booking', 'score' => 24],
        'punten rek booking' => ['intent' => 'booking', 'score' => 20],
        'rek booking' => ['intent' => 'booking', 'score' => 18],
        'badé booking' => ['intent' => 'booking', 'score' => 20],
        'mau main' => ['intent' => 'booking', 'score' => 12],
        'ingin main' => ['intent' => 'booking', 'score' => 12],

        // Availability
        'cek jadwal' => ['intent' => 'availability_check', 'score' => 20],
        'cek ketersediaan' => ['intent' => 'availability_check', 'score' => 20],
        'jadwal kosong' => ['intent' => 'availability_check', 'score' => 20],
        'masih kosong' => ['intent' => 'availability_check', 'score' => 18],
        'masih ada slot' => ['intent' => 'availability_check', 'score' => 18],
        'slot tersedia' => ['intent' => 'availability_check', 'score' => 18],
        'jam tersedia' => ['intent' => 'availability_check', 'score' => 16],
        'ada jadwal kosong' => ['intent' => 'availability_check', 'score' => 18],
        'bisa hari ini' => ['intent' => 'availability_check', 'score' => 14],
        'bisa besok' => ['intent' => 'availability_check', 'score' => 14],
        'aya nu kosong' => ['intent' => 'availability_check', 'score' => 20],
        'aya jadwal' => ['intent' => 'availability_check', 'score' => 16],
        'aya slot' => ['intent' => 'availability_check', 'score' => 16],
        'jadwalna aya' => ['intent' => 'availability_check', 'score' => 16],
        'kosong teu' => ['intent' => 'availability_check', 'score' => 15],
        'ada yang kosong' => ['intent' => 'availability_check', 'score' => 18],

        // Price
        'cek harga' => ['intent' => 'price_check', 'score' => 20],
        'harga berapa' => ['intent' => 'price_check', 'score' => 20],
        'berapa harga' => ['intent' => 'price_check', 'score' => 20],
        'harga sewa' => ['intent' => 'price_check', 'score' => 20],
        'harga booking' => ['intent' => 'price_check', 'score' => 18],
        'berapa tarif' => ['intent' => 'price_check', 'score' => 18],
        'berapa biaya' => ['intent' => 'price_check', 'score' => 18],
        'info harga' => ['intent' => 'price_check', 'score' => 18],
        'tarif main' => ['intent' => 'price_check', 'score' => 16],
        'biaya sewa' => ['intent' => 'price_check', 'score' => 18],
        'sabaraha hargana' => ['intent' => 'price_check', 'score' => 20],
        'ongkos sabaraha' => ['intent' => 'price_check', 'score' => 20],

        // Facility info
        'info fasilitas' => ['intent' => 'facility_info', 'score' => 18],
        'fasilitas apa saja' => ['intent' => 'facility_info', 'score' => 18],
        'ada fasilitas apa' => ['intent' => 'facility_info', 'score' => 18],
        'ada apa aja' => ['intent' => 'facility_info', 'score' => 15],
        'lapangan apa saja' => ['intent' => 'facility_info', 'score' => 18],
        'kelas apa saja' => ['intent' => 'facility_info', 'score' => 18],
        'info venue' => ['intent' => 'facility_info', 'score' => 16],
        'pilihan fasilitas' => ['intent' => 'facility_info', 'score' => 16],

        // Login/Register
        'cara login' => ['intent' => 'login_help', 'score' => 18],
        'bantu login' => ['intent' => 'login_help', 'score' => 18],
        'tidak bisa login' => ['intent' => 'login_help', 'score' => 20],
        'gagal login' => ['intent' => 'login_help', 'score' => 20],
        'mau login' => ['intent' => 'login_help', 'score' => 16],
        'masuk akun' => ['intent' => 'login_help', 'score' => 16],

        'cara daftar' => ['intent' => 'register_help', 'score' => 20],
        'buat akun' => ['intent' => 'register_help', 'score' => 20],
        'daftar akun' => ['intent' => 'register_help', 'score' => 20],
        'register akun' => ['intent' => 'register_help', 'score' => 20],
        'mau daftar' => ['intent' => 'register_help', 'score' => 16],
        'bantu daftar' => ['intent' => 'register_help', 'score' => 18],
        'cara registrasi' => ['intent' => 'register_help', 'score' => 18],
        'kumaha cara daftar' => ['intent' => 'register_help', 'score' => 20],

        // Matchmaking
        'cari lawan' => ['intent' => 'matchmaking', 'score' => 25],
        'mau sparing' => ['intent' => 'matchmaking', 'score' => 20],
        'ajak mabar' => ['intent' => 'matchmaking', 'score' => 20],
        'butuh lawan' => ['intent' => 'matchmaking', 'score' => 20],
        'cari partner' => ['intent' => 'matchmaking', 'score' => 18],
        'teman main' => ['intent' => 'matchmaking', 'score' => 16],
        'butuh partner' => ['intent' => 'matchmaking', 'score' => 18],
        'lawan main' => ['intent' => 'matchmaking', 'score' => 18],
        'neangan lawan' => ['intent' => 'matchmaking', 'score' => 20],
        'neangan batur ulin' => ['intent' => 'matchmaking', 'score' => 18],

        // Promo
        'ada promo' => ['intent' => 'promo_info', 'score' => 18],
        'info promo' => ['intent' => 'promo_info', 'score' => 18],
        'promo apa' => ['intent' => 'promo_info', 'score' => 16],
        'sedang diskon' => ['intent' => 'promo_info', 'score' => 16],
        'voucher ada' => ['intent' => 'promo_info', 'score' => 16],
        'cashback ada' => ['intent' => 'promo_info', 'score' => 16],

        // Location
        'lokasinya dimana' => ['intent' => 'location_info', 'score' => 20],
        'alamatnya dimana' => ['intent' => 'location_info', 'score' => 20],
        'kirim alamat' => ['intent' => 'location_info', 'score' => 18],
        'share location' => ['intent' => 'location_info', 'score' => 18],
        'maps nya dimana' => ['intent' => 'location_info', 'score' => 18],
        'cara ke sana' => ['intent' => 'location_info', 'score' => 14],

        // Hours
        'jam buka' => ['intent' => 'operating_hours', 'score' => 20],
        'jam operasional' => ['intent' => 'operating_hours', 'score' => 20],
        'buka jam berapa' => ['intent' => 'operating_hours', 'score' => 20],
        'tutup jam berapa' => ['intent' => 'operating_hours', 'score' => 20],
        'operasionalnya bagaimana' => ['intent' => 'operating_hours', 'score' => 16],
        'buka hari apa saja' => ['intent' => 'operating_hours', 'score' => 18],

        // Cancel
        'batalin booking' => ['intent' => 'cancel', 'score' => 25],
        'batalkan pesanan' => ['intent' => 'cancel', 'score' => 25],
        'batalkan booking' => ['intent' => 'cancel', 'score' => 25],
        'cancel booking' => ['intent' => 'cancel', 'score' => 25],
        'teu jadi' => ['intent' => 'cancel', 'score' => 18],
        'tidak jadi' => ['intent' => 'cancel', 'score' => 18],
        'ga jadi' => ['intent' => 'cancel', 'score' => 18],
        'gak jadi' => ['intent' => 'cancel', 'score' => 18],
        'nggak jadi' => ['intent' => 'cancel', 'score' => 18],

        // Reschedule
        'ganti jadwal' => ['intent' => 'reschedule', 'score' => 20],
        'ubah jadwal' => ['intent' => 'reschedule', 'score' => 20],
        'reschedule booking' => ['intent' => 'reschedule', 'score' => 20],
        'jadwal ulang' => ['intent' => 'reschedule', 'score' => 18],
        'ganti jam' => ['intent' => 'reschedule', 'score' => 18],
        'ganti tanggal' => ['intent' => 'reschedule', 'score' => 18],
        'pindah jadwal' => ['intent' => 'reschedule', 'score' => 18],

        // Thanks
        'terima kasih' => ['intent' => 'thanks', 'score' => 15],
        'makasih' => ['intent' => 'thanks', 'score' => 15],
        'makasi' => ['intent' => 'thanks', 'score' => 15],
        'thanks' => ['intent' => 'thanks', 'score' => 15],
        'thank you' => ['intent' => 'thanks', 'score' => 15],
        'nuhun' => ['intent' => 'thanks', 'score' => 15],
        'hatur nuhun' => ['intent' => 'thanks', 'score' => 16],

        // Complaint
        'mau komplain' => ['intent' => 'complaint', 'score' => 20],
        'ingin komplain' => ['intent' => 'complaint', 'score' => 20],
        'booking bermasalah' => ['intent' => 'complaint', 'score' => 22],
        'payment bermasalah' => ['intent' => 'complaint', 'score' => 22],
        'kok gagal terus' => ['intent' => 'complaint', 'score' => 18],
        'saya kecewa' => ['intent' => 'complaint', 'score' => 18],
        'layanannya jelek' => ['intent' => 'complaint', 'score' => 18],

        // Payment help
        'cara bayar' => ['intent' => 'payment_help', 'score' => 20],
        'metode pembayaran' => ['intent' => 'payment_help', 'score' => 20],
        'pilih pembayaran' => ['intent' => 'payment_help', 'score' => 18],
        'mau bayar' => ['intent' => 'payment_help', 'score' => 18],
        'lanjut pembayaran' => ['intent' => 'payment_help', 'score' => 22],
        'proses pembayaran' => ['intent' => 'payment_help', 'score' => 22],
        'bayar pakai qris' => ['intent' => 'payment_help', 'score' => 22],
        'bayar transfer' => ['intent' => 'payment_help', 'score' => 22],
        'bayar ewallet' => ['intent' => 'payment_help', 'score' => 22],
        'bayar di tempat' => ['intent' => 'payment_help', 'score' => 18],

        // Payment status
        'status pembayaran' => ['intent' => 'payment_status_check', 'score' => 25],
        'sudah bayar' => ['intent' => 'payment_status_check', 'score' => 20],
        'cek pembayaran' => ['intent' => 'payment_status_check', 'score' => 20],
        'cek status pembayaran' => ['intent' => 'payment_status_check', 'score' => 28],
        'payment sudah masuk' => ['intent' => 'payment_status_check', 'score' => 24],
        'apakah sudah masuk' => ['intent' => 'payment_status_check', 'score' => 16],
        'status invoice' => ['intent' => 'payment_status_check', 'score' => 22],
        'sudah transfer' => ['intent' => 'payment_status_check', 'score' => 20],
        'sudah tf' => ['intent' => 'payment_status_check', 'score' => 20],
        'sudah qris' => ['intent' => 'payment_status_check', 'score' => 18],
        'cek status bayar' => ['intent' => 'payment_status_check', 'score' => 24],
    ],

    'token_weights' => [
        // Greeting
        'halo' => ['intent' => 'greeting', 'score' => 5],
        'hai' => ['intent' => 'greeting', 'score' => 5],
        'hi' => ['intent' => 'greeting', 'score' => 5],
        'hello' => ['intent' => 'greeting', 'score' => 5],
        'punten' => ['intent' => 'greeting', 'score' => 4],

        // Booking
        'booking' => ['intent' => 'booking', 'score' => 6],
        'book' => ['intent' => 'booking', 'score' => 6],
        'pesan' => ['intent' => 'booking', 'score' => 4],
        'sewa' => ['intent' => 'booking', 'score' => 4],
        'reservasi' => ['intent' => 'booking', 'score' => 5],
        'reserve' => ['intent' => 'booking', 'score' => 5],
        'main' => ['intent' => 'booking', 'score' => 3],

        // Availability
        'jadwal' => ['intent' => 'availability_check', 'score' => 6],
        'kosong' => ['intent' => 'availability_check', 'score' => 5],
        'tersedia' => ['intent' => 'availability_check', 'score' => 5],
        'slot' => ['intent' => 'availability_check', 'score' => 5],
        'available' => ['intent' => 'availability_check', 'score' => 5],
        'availability' => ['intent' => 'availability_check', 'score' => 5],

        // Price
        'harga' => ['intent' => 'price_check', 'score' => 6],
        'biaya' => ['intent' => 'price_check', 'score' => 5],
        'tarif' => ['intent' => 'price_check', 'score' => 5],
        'ongkos' => ['intent' => 'price_check', 'score' => 5],
        'price' => ['intent' => 'price_check', 'score' => 5],
        'rate' => ['intent' => 'price_check', 'score' => 5],

        // Facility
        'fasilitas' => ['intent' => 'facility_info', 'score' => 5],
        'venue' => ['intent' => 'facility_info', 'score' => 4],
        'lapangan' => ['intent' => 'facility_info', 'score' => 4],
        'lapang' => ['intent' => 'facility_info', 'score' => 4],
        'kelas' => ['intent' => 'facility_info', 'score' => 4],

        // Login/Register
        'login' => ['intent' => 'login_help', 'score' => 6],
        'masuk' => ['intent' => 'login_help', 'score' => 4],
        'signin' => ['intent' => 'login_help', 'score' => 6],

        'daftar' => ['intent' => 'register_help', 'score' => 6],
        'register' => ['intent' => 'register_help', 'score' => 6],
        'registrasi' => ['intent' => 'register_help', 'score' => 6],
        'signup' => ['intent' => 'register_help', 'score' => 6],

        // Matchmaking
        'lawan' => ['intent' => 'matchmaking', 'score' => 6],
        'partner' => ['intent' => 'matchmaking', 'score' => 5],
        'sparing' => ['intent' => 'matchmaking', 'score' => 5],
        'sparring' => ['intent' => 'matchmaking', 'score' => 5],
        'mabar' => ['intent' => 'matchmaking', 'score' => 5],
        'teman' => ['intent' => 'matchmaking', 'score' => 3],

        // Promo
        'promo' => ['intent' => 'promo_info', 'score' => 6],
        'diskon' => ['intent' => 'promo_info', 'score' => 5],
        'voucher' => ['intent' => 'promo_info', 'score' => 5],
        'cashback' => ['intent' => 'promo_info', 'score' => 5],

        // Location
        'lokasi' => ['intent' => 'location_info', 'score' => 6],
        'alamat' => ['intent' => 'location_info', 'score' => 6],
        'maps' => ['intent' => 'location_info', 'score' => 5],
        'map' => ['intent' => 'location_info', 'score' => 5],

        // Hours
        'buka' => ['intent' => 'operating_hours', 'score' => 5],
        'tutup' => ['intent' => 'operating_hours', 'score' => 5],
        'operasional' => ['intent' => 'operating_hours', 'score' => 6],

        // Cancel/Reschedule
        'batal' => ['intent' => 'cancel', 'score' => 6],
        'cancel' => ['intent' => 'cancel', 'score' => 6],
        'batalkan' => ['intent' => 'cancel', 'score' => 6],

        'ubah' => ['intent' => 'reschedule', 'score' => 5],
        'ganti' => ['intent' => 'reschedule', 'score' => 5],
        'reschedule' => ['intent' => 'reschedule', 'score' => 6],
        'pindah' => ['intent' => 'reschedule', 'score' => 5],
        'geser' => ['intent' => 'reschedule', 'score' => 4],

        // Thanks
        'makasih' => ['intent' => 'thanks', 'score' => 5],
        'makasi' => ['intent' => 'thanks', 'score' => 5],
        'thanks' => ['intent' => 'thanks', 'score' => 5],
        'nuhun' => ['intent' => 'thanks', 'score' => 5],

        // Complaint
        'komplain' => ['intent' => 'complaint', 'score' => 6],
        'keluhan' => ['intent' => 'complaint', 'score' => 5],
        'masalah' => ['intent' => 'complaint', 'score' => 5],
        'error' => ['intent' => 'complaint', 'score' => 5],
        'gagal' => ['intent' => 'complaint', 'score' => 5],

        // Payment help/status
        'bayar' => ['intent' => 'payment_help', 'score' => 6],
        'pembayaran' => ['intent' => 'payment_help', 'score' => 6],
        'payment' => ['intent' => 'payment_help', 'score' => 6],
        'transfer' => ['intent' => 'payment_help', 'score' => 5],
        'qris' => ['intent' => 'payment_help', 'score' => 5],
        'invoice' => ['intent' => 'payment_status_check', 'score' => 5],
        'lunas' => ['intent' => 'payment_status_check', 'score' => 5],
        'status' => ['intent' => 'payment_status_check', 'score' => 4],
        'masuk' => ['intent' => 'payment_status_check', 'score' => 3],
    ],

    'synonyms' => [
        'booking_keywords' => [
            'booking', 'book', 'reservasi', 'pesan', 'sewa', 'main', 'order', 'reserve',
        ],
        'availability_keywords' => [
            'jadwal', 'slot', 'ketersediaan', 'tersedia', 'kosong', 'available', 'availability',
        ],
        'price_keywords' => [
            'harga', 'tarif', 'biaya', 'ongkos', 'rate', 'price',
        ],
        'payment_keywords' => [
            'bayar', 'pembayaran', 'transfer', 'qris', 'cash', 'dp', 'lunas',
            'invoice', 'nota', 'tagihan', 'payment', 'pelunasan',
        ],
        'cancel_keywords' => [
            'batal', 'cancel', 'batalkan', 'tidak jadi', 'teu jadi',
        ],
        'reschedule_keywords' => [
            'ubah', 'ganti', 'jadwal ulang', 'reschedule', 'pindah', 'geser',
        ],
        'login_keywords' => [
            'login', 'masuk', 'signin', 'sign in',
        ],
        'register_keywords' => [
            'daftar', 'register', 'registrasi', 'signup', 'sign up', 'buat akun',
        ],
        'matchmaking_keywords' => [
            'cari lawan', 'partner', 'sparing', 'sparring', 'mabar', 'teman main',
        ],
    ],

    'payment_methods' => [
        'qris' => [
            'qris', 'qr', 'scan', 'scan qr', 'barcode', 'qr code',
            'gopay', 'go pay', 'ovo', 'dana', 'shopeepay', 'spay',
        ],
        'transfer' => [
            'transfer', 'tf', 'bank transfer', 'transfer bank',
            'bca', 'mandiri', 'bni', 'bri', 'bank',
        ],
        'virtual_account' => [
            'virtual account', 'va', 'nomor va', 'kode va',
        ],
        'cash' => [
            'cash', 'tunai', 'bayar di tempat', 'cash on venue', 'cod venue',
        ],
    ],

    'stopwords' => [
        'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'adalah', 'yang', 'dengan',
        'ini', 'itu', 'saya', 'anda', 'kamu', 'aku', 'kami', 'kita', 'beliau',
        'ingin', 'mau', 'mohon', 'tolong', 'dong', 'sih', 'kok', 'pun', 'lah',
        'ya', 'yah', 'buat', 'tuh', 'mah', 'teh', 'atuh', 'nya', 'saja', 'aja',
        'kalo', 'kalau', 'kalaw', 'kalu', 'coba', 'sok', 'euy', 'wae', 'weh',
        'ti', 'terus', 'trs', 'lalu', 'sedang', 'akan', 'telah', 'sudah', 'baru',
        'biar', 'supaya', 'agar', 'karena', 'sebab', 'jadi', 'kan', 'mah',
        'nih', 'deh', 'dong', 'bro', 'sis', 'kak', 'min', 'admin',
    ],

    'slang_map' => [
        'gmana' => 'bagaimana',
        'gmn' => 'bagaimana',
        'bgmn' => 'bagaimana',
        'brp' => 'berapa',
        'brapa' => 'berapa',
        'sbrp' => 'seberapa',
        'bs' => 'bisa',
        'bsa' => 'bisa',
        'bisaa' => 'bisa',
        'kpn' => 'kapan',
        'jdwl' => 'jadwal',
        'jdl' => 'jadwal',
        'hrg' => 'harga',
        'hrga' => 'harga',
        'gak' => 'tidak',
        'ga' => 'tidak',
        'gk' => 'tidak',
        'ngga' => 'tidak',
        'nggak' => 'tidak',
        'kgk' => 'tidak',
        'blm' => 'belum',
        'blom' => 'belum',
        'dpt' => 'dapat',
        'dapet' => 'dapat',
        'klo' => 'kalau',
        'kl' => 'kalau',
        'trs' => 'terus',
        'trs' => 'terus',
        'ntar' => 'nanti',
        'bsk' => 'besok',
        'lusaaa' => 'lusa',
        'skrg' => 'sekarang',
        'skrng' => 'sekarang',
        'tf' => 'transfer',
        'byr' => 'bayar',
        'pembyrn' => 'pembayaran',
        'konfirm' => 'konfirmasi',
        'minsok' => 'mini soccer',
        'minsoc' => 'mini soccer',
        'minsoc' => 'mini soccer',
        'msoc' => 'mini soccer',
        'mini soc' => 'mini soccer',
        'minisoc' => 'mini soccer',
        'pdl' => 'padel',
        'pdl' => 'padel',
        'plt' => 'pilates',
        'pilat' => 'pilates',
        'bskt' => 'basket',
        'bsk' => 'basket',
        'bskt' => 'basket',
        'qrisnya' => 'qris',
        'ovonya' => 'ovo',
        'dananya' => 'dana',
        'gopaynya' => 'gopay',
        'shopeepaynya' => 'shopeepay',
    ],

    'sunda_map' => [
        'abdi' => 'saya',
        'abdi hoyong' => 'saya mau',
        'maneh' => 'kamu',
        'anjeun' => 'anda',
        'bade' => 'mau',
        'badé' => 'mau',
        'hoyong' => 'mau',
        'rek' => 'mau',
        'rek booking' => 'mau booking',
        'ayeuna' => 'hari ini',
        'isukan' => 'besok',
        'pageto' => 'besok',
        'engke' => 'nanti',
        'engké' => 'nanti',
        'kumaha' => 'bagaimana',
        'sabaraha' => 'berapa',
        'iraha' => 'kapan',
        'teu' => 'tidak',
        'teu jadi' => 'batal',
        'moal jadi' => 'batal',
        'aya' => 'ada',
        'teu aya' => 'tidak ada',
        'aya nu kosong' => 'ada yang kosong',
        'keneh' => 'masih',
        'kosong keneh' => 'masih kosong',
        'neangan' => 'mencari',
        'batur' => 'teman',
        'batur ulin' => 'teman main',
        'lawan ulin' => 'lawan main',
        'wengi' => 'malam',
        'isuk' => 'pagi',
        'beurang' => 'siang',
        'sonten' => 'sore',
        'punten' => 'permisi',
        'mangga' => 'silakan',
        'nuhun' => 'terima kasih',
        'hatur nuhun' => 'terima kasih',
    ],

    'typo_map' => [
        'boking' => 'booking',
        'buking' => 'booking',
        'bookng' => 'booking',
        'boooking' => 'booking',
        'bokng' => 'booking',
        'bokig' => 'booking',
        'jadawa' => 'jadwal',
        'jadwla' => 'jadwal',
        'jdwal' => 'jadwal',
        'jawdla' => 'jadwal',
        'jafwal' => 'jadwal',
        'harp' => 'harga',
        'hagra' => 'harga',
        'harag' => 'harga',
        'hargaa' => 'harga',
        'lapanan' => 'lapangan',
        'lapangn' => 'lapangan',
        'lapngan' => 'lapangan',
        'soker' => 'soccer',
        'socer' => 'soccer',
        'minsocer' => 'mini soccer',
        'minsoccer' => 'mini soccer',
        'minisocer' => 'mini soccer',
        'minisoccerr' => 'mini soccer',
        'padelh' => 'padel',
        'padell' => 'padel',
        'paddle' => 'padel',
        'paddel' => 'padel',
        'padeel' => 'padel',
        'pilate' => 'pilates',
        'pilattes' => 'pilates',
        'pilatez' => 'pilates',
        'piltes' => 'pilates',
        'baset' => 'basket',
        'baskte' => 'basket',
        'baskt' => 'basket',
        'baskett' => 'basket',
        'pembayran' => 'pembayaran',
        'pembyaran' => 'pembayaran',
        'tranfer' => 'transfer',
        'trasnfer' => 'transfer',
        'konfrimasi' => 'konfirmasi',
        'konfrmasi' => 'konfirmasi',
    ],

    'facility_aliases' => [
        'mini soccer' => [
            'mini soccer', 'minisoccer', 'mini-soccer', 'soccer',
            'mini soccer field', 'lapang mini soccer', 'lapangan mini soccer',
            'main mini soccer', 'main soccer', 'minsok', 'minsoc', 'minsoc', 'msoc', 'minisoc',
        ],
        'padel' => [
            'padel', 'padel court', 'court padel', 'lapang padel',
            'lapangan padel', 'main padel', 'pdl',
        ],
        'pilates' => [
            'pilates', 'kelas pilates', 'studio pilates', 'sesi pilates',
            'latihan pilates', 'class pilates', 'main pilates', 'pilat', 'plt',
        ],
        'basket' => [
            'basket', 'basketball', 'bola basket', 'court basket',
            'lapang basket', 'lapangan basket', 'main basket', 'main basketball',
            'bskt', 'bskt', 'bsk',
        ],
    ],

    'sport_aliases' => [
        'Mini Soccer' => [
            'mini soccer', 'minisoccer', 'soccer', 'mini soccer field',
            'lapangan mini soccer', 'lapang mini soccer',
        ],
        'Padel' => [
            'padel', 'padel court', 'court padel', 'lapangan padel',
        ],
        'Pilates' => [
            'pilates', 'kelas pilates', 'studio pilates', 'sesi pilates',
        ],
        'Basket' => [
            'basket', 'basketball', 'bola basket', 'lapangan basket',
        ],
    ],

    'facility_context_keywords' => [
        'mini soccer' => [
            'tim', 'team', 'pemain', 'player', 'lapangan', 'field', 'main bola',
        ],
        'padel' => [
            'raket', 'racket', 'court', 'serve', 'smash',
        ],
        'pilates' => [
            'kelas', 'class', 'instruktur', 'mat', 'sesi', 'session',
        ],
        'basket' => [
            'ring', 'court', 'dribble', 'shoot', 'three point',
        ],
    ],

    'date_keywords' => [
        'hari ini', 'besok', 'lusa', 'nanti', 'malam ini', 'besok malam',
        'pagi', 'siang', 'sore', 'malam',
        'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'jum\'at', 'sabtu', 'minggu',
        'isukan', 'ayeuna', 'engke', 'isuk', 'beurang', 'sonten', 'wengi',
    ],

    'time_keywords' => [
        'jam', 'pukul', 'pk', 'jamnya', 'wib',
        'pagi', 'siang', 'sore', 'malam',
    ],

    'duration_keywords' => [
        '30 menit', '45 menit', '60 menit', '90 menit', '120 menit',
        '1 jam', '2 jam', '3 jam', '4 jam',
        'setengah jam', 'satu jam', 'dua jam', 'tiga jam', 'empat jam',
        '1 sesi', '2 sesi', '3 sesi',
    ],

    'participant_keywords' => [
        'orang', 'org', 'pemain', 'player', 'tim', 'team', 'rombongan', 'grup',
    ],

    'booking_flow_keywords' => [
        'booking', 'pesan', 'sewa', 'reservasi', 'jadwal', 'slot',
        'tanggal', 'jam', 'durasi', 'orang', 'pemain',
    ],

    'payment_flow_keywords' => [
        'bayar', 'pembayaran', 'payment', 'qris', 'transfer',
        'va', 'virtual account', 'invoice', 'lunas', 'tagihan',
    ],

    'clarification_templates' => [
        'ambiguous' => "Hmm, maksud Kakak itu mau:\n\n[OPTION_1], [OPTION_2], atau [OPTION_3]?",
        'booking_or_schedule' => "Kakak mau langsung booking atau cek jadwal dulu?",
        'booking_or_price' => "Kakak mau langsung booking atau cek harga dulu?",
        'payment_or_status' => "Kakak mau pilih metode pembayaran atau cek status pembayaran?",
        'facility_unknown' => "Saya belum yakin fasilitas yang dimaksud. Pilih salah satu ya: Mini Soccer, Padel, Pilates, atau Basket.",
    ],

    'quick_replies' => [
        'initial' => [
            'Booking',
            'Cek Jadwal',
            'Cek Harga',
            'Info Fasilitas',
        ],
        'facilities' => [
            'Mini Soccer',
            'Padel',
            'Pilates',
            'Basket',
        ],
        'payment' => [
            'QRIS',
            'Transfer',
            'Virtual Account',
            'Cash',
        ],
    ],

    'fallback_phrases' => [
        'low_confidence' => "Maaf Kak, maksudnya mau tanya soal Fasilitas, Booking, Jadwal, Harga, atau Pembayaran ya? Bisa diperjelas sedikit?",
        'unknown_facility' => "Fasilitas yang tersedia saat ini adalah Mini Soccer, Padel, Pilates, dan Basket.",
        'fallback_unknown' => "Maaf Kak, saya belum menangkap maksudnya. Coba tulis seperti: 'booking padel besok', 'cek harga basket', atau 'status pembayaran'.",
        'need_booking_details' => "Baik Kak, saya bantu booking. Mohon info fasilitas, tanggal, jam, dan durasinya ya.",
        'need_payment_choice' => "Silakan pilih metode pembayaran yang diinginkan: QRIS, Transfer, Virtual Account, atau Cash.",
    ],
];