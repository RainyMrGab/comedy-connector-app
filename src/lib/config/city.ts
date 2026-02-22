import { env } from '$env/dynamic/public';

export const cityConfig = {
	name: env.PUBLIC_CITY_NAME ?? 'Pittsburgh',
	domain: env.PUBLIC_CITY_DOMAIN ?? 'pittsburgh.comedyconnector.app',
	siteUrl: env.PUBLIC_SITE_URL ?? 'https://pittsburgh.comedyconnector.app',
	// External resources — update per city instance
	resources: [
		{
			title: 'Local Comedy Calendar',
			url: '#',
			description: 'Upcoming shows and open mics'
		},
		{
			title: 'Comedy Coaches',
			url: '#',
			description: 'Find a coach in your city'
		}
	]
} as const;
