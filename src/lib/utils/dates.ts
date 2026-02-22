const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

/** Format a month number (1-12) + year as "Month YYYY" */
export function formatMonthYear(month: number | null | undefined, year: number | null | undefined): string {
	if (!year) return '';
	if (!month) return String(year);
	return `${MONTHS[month - 1]} ${year}`;
}

/** Format a date range as "Month YYYY – Month YYYY" or "Month YYYY – Present" */
export function formatDateRange(
	startYear: number | null | undefined,
	startMonth: number | null | undefined,
	endYear: number | null | undefined,
	endMonth: number | null | undefined,
	isCurrent: boolean
): string {
	const start = formatMonthYear(startMonth, startYear);
	if (!start) return '';
	const end = isCurrent ? 'Present' : formatMonthYear(endMonth, endYear);
	if (!end) return start;
	return `${start} – ${end}`;
}

export { MONTHS };
