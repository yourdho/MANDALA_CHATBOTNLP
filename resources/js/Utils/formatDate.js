import { format, formatDistanceToNow, parseISO, isToday, isTomorrow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * formatDate — Format a date string or Date object for display.
 *
 * @param {string|Date} date
 * @param {string}      [pattern='dd MMM yyyy']
 * @returns {string}
 *
 * @example
 *   formatDate('2026-04-12')              // "12 Apr 2026"
 *   formatDate('2026-04-12', 'EEEE, dd MMMM yyyy') // "Minggu, 12 April 2026"
 */
export function formatDate(date, pattern = 'dd MMM yyyy') {
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return format(d, pattern, { locale: id });
    } catch {
        return String(date);
    }
}

/**
 * formatDateTime — Format a full date-time string.
 *
 * @param {string|Date} date
 * @returns {string}  e.g. "12 Apr 2026, 14:30"
 */
export function formatDateTime(date) {
    return formatDate(date, 'dd MMM yyyy, HH:mm');
}

/**
 * formatTime — Extract just the time portion.
 *
 * @param {string|Date} date
 * @returns {string}  e.g. "14:30"
 */
export function formatTime(date) {
    return formatDate(date, 'HH:mm');
}

/**
 * formatRelative — Human-readable relative time, e.g. "3 hari yang lalu".
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelative(date) {
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(d, { addSuffix: true, locale: id });
    } catch {
        return String(date);
    }
}

/**
 * formatBookingLabel — Smart label: "Hari ini", "Besok", or a full date.
 *
 * @param {string|Date} date
 * @returns {string}
 */
export function formatBookingLabel(date) {
    try {
        const d = typeof date === 'string' ? parseISO(date) : date;
        if (isToday(d))    return 'Hari ini';
        if (isTomorrow(d)) return 'Besok';
        return formatDate(d, 'EEEE, dd MMM');
    } catch {
        return String(date);
    }
}
