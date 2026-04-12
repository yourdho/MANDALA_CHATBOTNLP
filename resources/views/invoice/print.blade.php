<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Ticket MA-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }} | Mandala Arena</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

        :root {
            --primary: #38BDF8;
            --bg-dark: #0f172a;
            --border: #e2e8f0;
            --text-main: #1e293b;
            --text-muted: #64748b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif;
            background: white;
            color: var(--text-main);
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .invoice-container {
            width: 210mm;
            height: 296mm;
            margin: 0 auto;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: white;
        }

        .header {
            padding: 50px 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .logo {
            font-weight: 900;
            font-size: 24px;
            line-height: 1;
            text-transform: uppercase;
            font-style: italic;
        }

        .logo span {
            color: var(--primary);
        }

        .invoice-number {
            text-align: right;
            font-size: 14px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .main-title {
            padding: 0 60px;
            font-size: 80px;
            font-weight: 900;
            letter-spacing: -4px;
            line-height: 1;
            margin-bottom: 40px;
        }

        .meta-info {
            padding: 0 60px;
            display: flex;
            gap: 80px;
            margin-bottom: 50px;
        }

        .meta-block h4 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--text-muted);
            margin-bottom: 8px;
        }

        .meta-block p {
            font-size: 14px;
            font-weight: 700;
        }

        .content-table {
            padding: 0 60px;
            margin-bottom: 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8fafc;
            text-align: left;
            padding: 15px 20px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #f1f5f9;
        }

        td {
            padding: 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }

        .item-name {
            font-weight: 900;
            font-size: 16px;
            text-transform: uppercase;
            font-style: italic;
        }

        .item-sub {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 4px;
        }

        .total-row td {
            border-top: 3px solid var(--bg-dark);
            padding-top: 30px;
        }

        .total-label {
            font-weight: 700;
            font-size: 18px;
            text-align: right;
        }

        .total-amount {
            font-weight: 900;
            font-size: 28px;
            color: var(--primary);
            text-align: right;
            font-style: italic;
        }

        .footer-note {
            padding: 0 60px;
            margin-top: auto;
            margin-bottom: 60px;
        }

        .footer-note h5 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            color: var(--text-muted);
        }

        .footer-note p {
            font-size: 12px;
            color: var(--text-muted);
            max-width: 400px;
            line-height: 1.8;
        }

        .wave-footer {
            height: 150px;
            width: 100%;
            position: relative;
        }

        .wave-footer svg {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            body {
                margin: 0;
            }
            .no-print {
                display: none;
            }
        }

        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--bg-dark);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: none;
            z-index: 100;
        }
    </style>
</head>
<body>
    <button class="print-btn no-print" onclick="window.print()">Cetak / Save PDF</button>

    <div class="invoice-container">
        <div class="header">
            <div class="logo">
                Mandala <span>Arena</span>
            </div>
            <div class="invoice-number">
                SERIAL MA-{{ str_pad($booking->id, 5, '0', STR_PAD_LEFT) }}
            </div>
        </div>

        <h1 class="main-title">E-TICKET</h1>

        <div class="meta-info">
            <div class="meta-block">
                <h4>Ditujukan Kepada</h4>
                <p>{{ $booking->guest_name ?? ($booking->user->name ?? 'Pelanggan') }}</p>
                <p style="font-weight: 400; color: var(--text-muted); margin-top: 2px;">{{ $booking->guest_phone ?? ($booking->user->phone ?? '-') }}</p>
            </div>
            <div class="meta-block">
                <h4>Tanggal Transaksi</h4>
                <p>{{ $booking->created_at->format('d F Y') }}</p>
            </div>
            <div class="meta-block">
                <h4>Status Otorisasi</h4>
                <p style="color: {{ $booking->payment_status === 'paid' ? '#10B981' : '#FACC15' }}">{{ strtoupper($booking->payment_status === 'paid' ? 'LUNAS / PAID' : 'PENDING') }}</p>
            </div>
        </div>

        <div class="content-table">
            <table>
                <thead>
                    <tr>
                        <th>Item Deskripsi</th>
                        <th style="text-align: center;">Durasi</th>
                        <th style="text-align: right;">Harga Satuan</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="50%">
                            <div class="item-name">{{ $booking->facility->name }}</div>
                            <div class="item-sub">
                                {{ \Carbon\Carbon::parse($booking->starts_at)->format('l, d M Y') }}<br>
                                {{ \Carbon\Carbon::parse($booking->starts_at)->format('H:i') }} - {{ \Carbon\Carbon::parse($booking->ends_at)->format('H:i') }}
                            </div>
                        </td>
                        <td style="text-align: center;">{{ $booking->duration_hours }} Jam</td>
                        <td style="text-align: right;">Rp {{ number_format($booking->total_price / ($booking->duration_hours ?: 1), 0, ',', '.') }}</td>
                        <td style="text-align: right; font-weight: 700;">Rp {{ number_format($booking->total_price, 0, ',', '.') }}</td>
                    </tr>
                    @if($booking->is_with_referee)
                    <tr>
                        <td>
                            <div class="item-name">Layanan Wasit / Referee</div>
                            <div class="item-sub">Pendampingan teknis di lapangan</div>
                        </td>
                        <td style="text-align: center;">1 Sesi</td>
                        <td style="text-align: right;">-</td>
                        <td style="text-align: right; font-weight: 700;">Included</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td colspan="2"></td>
                        <td class="total-label">TOTAL</td>
                        <td class="total-amount">Rp {{ number_format($booking->total_price, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer-note">
            <h5>Catatan Penting</h5>
            <p>
                Harap tunjukkan E-Ticket ini (digital atau cetak) kepada staff operasional kami saat tiba di lokasi.
                Pemesanan ini telah divalidasi oleh sistem pusat Mandala Arena. Operational excellence is our only standard.
            </p>
        </div>

        <div class="wave-footer">
            <svg viewBox="0 0 728 150" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,150 L0,100 Q180,140 360,110 Q540,80 728,120 L728,150 Z" fill="#f1f5f9" />
                <path d="M0,150 L0,115 Q180,85 360,125 Q540,165 728,135 L728,150 Z" fill="#0f172a" />
            </svg>
        </div>
    </div>

    <script>
        // Auto-open print dialog when ready
        window.onload = function() {
            setTimeout(function() {
                // window.print();
            }, 500);
        };
    </script>
</body>
</html>
