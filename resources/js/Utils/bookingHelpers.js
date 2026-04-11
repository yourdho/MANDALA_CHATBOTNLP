/**
 * bookingStatusMap — Maps raw booking status keys to display labels and styles.
 *
 * @type {Record<string, { label: string, color: string, bg: string, border: string }>}
 */
export const bookingStatusMap = {
    confirmed: {
        label:  'Dikonfirmasi',
        color:  'text-[#38BDF8]',
        bg:     'bg-[#38BDF8]/5',
        border: 'border-[#38BDF8]/20',
    },
    pending: {
        label:  'Menunggu',
        color:  'text-amber-400',
        bg:     'bg-amber-500/5',
        border: 'border-amber-500/20',
    },
    cancelled: {
        label:  'Dibatalkan',
        color:  'text-red-400',
        bg:     'bg-red-500/5',
        border: 'border-red-500/20',
    },
    completed: {
        label:  'Selesai',
        color:  'text-emerald-400',
        bg:     'bg-emerald-500/5',
        border: 'border-emerald-500/20',
    },
    failed: {
        label:  'Gagal',
        color:  'text-red-400',
        bg:     'bg-red-500/5',
        border: 'border-red-500/20',
    },
};

/**
 * paymentStatusMap — Maps raw payment status keys to display labels and styles.
 */
export const paymentStatusMap = {
    paid:       { label: 'Lunas',     color: 'text-emerald-400' },
    settlement: { label: 'Lunas',     color: 'text-emerald-400' },
    capture:    { label: 'Lunas',     color: 'text-emerald-400' },
    pending:    { label: 'Menunggu',  color: 'text-amber-400'   },
    failed:     { label: 'Gagal',     color: 'text-red-400'     },
    expired:    { label: 'Kedaluarsa',color: 'text-slate-400'   },
    refunded:   { label: 'Direfund', color: 'text-purple-400'  },
};

/**
 * getBookingStatus — Safely retrieve status display config with a fallback.
 *
 * @param {string} status
 * @returns {{ label: string, color: string, bg: string, border: string }}
 */
export function getBookingStatus(status) {
    return bookingStatusMap[status] ?? {
        label:  status ?? 'Unknown',
        color:  'text-slate-400',
        bg:     'bg-slate-500/5',
        border: 'border-slate-500/20',
    };
}

/**
 * getPaymentStatus — Safely retrieve payment status display config with a fallback.
 *
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
export function getPaymentStatus(status) {
    return paymentStatusMap[status] ?? { label: status ?? '-', color: 'text-slate-400' };
}

/**
 * buildBookingCode — Format a booking ID as the display booking code.
 *
 * @param {number|string} id
 * @returns {string}  e.g. "MA-00042"
 */
export function buildBookingCode(id) {
    return `MA-${String(id).padStart(5, '0')}`;
}
