<x-mail::message>
    # MISSION RECEIPT / INVOICE
    ## MANDALA ARENA COMMAND CENTER

    Athlete **{{ $customerName }}**, your mission deployment has been authorized.
    Below are the strategic details of your booking at **Mandala Arena**.

    **Mission Serial :** {{ $invoiceNumber }}
    **Timeline :** {{ now()->format('d M Y - H:i') }}

    ---

    ### Personnel Info
    **Name :** {{ $customerName }}
    **Comm Link :** {{ $customerPhone }}

    ### Tactical Deployment Details
    **Division :** {{ $booking->facility->name }}
    **Timeline :** {{ $booking->starts_at->format('d M Y') }}
    **Window :** {{ $booking->starts_at->format('H:i') }} - {{ $booking->ends_at->format('H:i') }}

    ---

    <x-mail::table>
        | Keterangan | Nominal |
        | :--------- | ------: |
        | Deployment Time ({{ $booking->duration_hours }} Hours) | Rp
        {{ number_format((float) $booking->total_price, 0, ',', '.') }} |
        @if($booking->is_with_referee)
            | Tactical Referee Support | Included |
        @endif
        | **TOTAL CREDIT** | **Rp {{ number_format((float) $booking->total_price, 0, ',', '.') }}** |
    </x-mail::table>

    **Status:** {{ strtoupper($booking->payment_status ?? 'AUTHORIZED') }}

    <br>

    <x-mail::button :url="url('/dashboard')">
        View Mission Status
    </x-mail::button>

    Please retain this mission receipt as a valid proof of operations from the Mandala Arena tactical system.
    Operational excellence is our only standard. See you at the station.

    Operational Command,<br>
    **Mandala Arena Station**
</x-mail::message>