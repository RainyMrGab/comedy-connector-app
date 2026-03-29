/**
 * Freshness reminder configuration.
 * Edit these values to adjust polling schedule and rate limits without touching function logic.
 */
export const reminderConfig = {
	/**
	 * Netlify cron schedule — days 1–7 of each month at 10am EST (15:00 UTC).
	 * Must match the schedule in netlify.toml exactly.
	 */
	cronSchedule: '0 15 1-7 * *',

	/** Human-readable description used in admin alerts and logs. */
	scheduleDescription: 'Daily on the 1st–7th of each month at 10am EST',

	/**
	 * Maximum emails sent per daily cron run.
	 * Keep at or below 50 to reserve headroom on the Resend free tier (100/day total).
	 */
	dailyEmailLimit: 50,

	/**
	 * Number of days the polling window spans (days 1 through N of the month).
	 * Maximum reachable users = dailyEmailLimit × pollingWindowDays (currently 350).
	 * Must match the day range in cronSchedule.
	 */
	pollingWindowDays: 7,

	/**
	 * Users who logged in within the previous N calendar months are excluded from polls.
	 * 1 = skip anyone who logged in last month (they're active, their profile is likely current).
	 */
	inactivityThresholdMonths: 1
} as const;
