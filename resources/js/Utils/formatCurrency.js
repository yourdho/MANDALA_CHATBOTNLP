/**
 * formatCurrency — Format a number as Indonesian Rupiah.
 *
 * @param {number} amount
 * @param {boolean} [showSymbol=true] - Prefix with "Rp" when true.
 * @returns {string}
 *
 * @example
 *   formatCurrency(150000)        // "Rp 150.000"
 *   formatCurrency(150000, false) // "150.000"
 */
export function formatCurrency(amount, showSymbol = true) {
    const formatted = new Intl.NumberFormat('id-ID', {
        style:                 showSymbol ? 'currency' : 'decimal',
        currency:              'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount ?? 0);

    // Intl outputs "Rp 150.000" — return as-is when symbol is wanted
    return formatted;
}

/**
 * formatCompact — Shorten large numbers to a compact form.
 *
 * @param {number} amount
 * @returns {string}
 *
 * @example
 *   formatCompact(1_500_000) // "Rp 1,5 jt"
 */
export function formatCompact(amount) {
    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')} jt`;
    }
    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(0)}k`;
    }
    return formatCurrency(amount);
}
