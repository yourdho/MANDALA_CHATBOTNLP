<?php

namespace App\Contracts\Services;

interface MidtransServiceInterface
{
    public function getSnapToken($booking, $override_amount = null);

    public function refund($order_id, $amount, $reason = 'Bentrok Jadwal');

}
