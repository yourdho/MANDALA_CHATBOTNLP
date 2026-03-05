<x-mail::message>
    # INVOICE / NOTA PEMBAYARAN

    Terima kasih telah melakukan booking di platform **Janjee**.
    Berikut adalah rincian tagihan dan konfirmasi booking Anda.

    **Nomor Invoice :** {{ $invoiceNumber }}
    **Tanggal :** {{ now()->format('d M Y - H:i') }}

    ---

    ### Informasi Pemesan
    **Nama :** {{ $customerName }}
    **Telepon :** {{ $customerPhone }}

    ### Detail Lapangan / Venue
    **Venue :** {{ $booking->venue->name }}
    **Lokasi :** {{ $booking->venue->address }}
    **Tanggal :** {{ $booking->booking_date->format('d M Y') }}
    **Jam :** {{ $booking->start_time }} s/d {{ $booking->end_time }}

    ---

    <x-mail::table>
        | Keterangan | Nominal |
        | :--------- | ------: |
        | Subtotal Venue ({{ round((strtotime($booking->end_time) - strtotime($booking->start_time)) / 3600, 1) }} jam)
        | Rp {{ number_format($booking->total_price, 0, ',', '.') }} |
        @if($booking->points_used > 0)
            | Diskon (Poin Reward) | - Rp {{ number_format($booking->points_used, 0, ',', '.') }} |
        @endif
        | **TOTAL PEMBAYARAN** | **Rp
        {{ number_format($booking->total_price - ($booking->points_used ?? 0), 0, ',', '.') }}** |
    </x-mail::table>

    **Status Pembayaran:** {{ strtoupper($booking->payment_status ?? 'SUDAH DIBAYAR') }}

    <br>

    <x-mail::button :url="url('/')">
        Lihat Info Detail di Janjee
    </x-mail::button>

    Silakan simpan invoice ini sebagai tanda bukti pemesanan yang valid dari sistem komputer Janjee.
    Selamat bertanding dan bersenang-senang!

    Salam Olahraga,<br>
    **{{ config('app.name', 'Janjee') }}**
</x-mail::message>