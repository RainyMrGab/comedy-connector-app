import { env } from '$env/dynamic/public';

export const cityConfig = {
	name: env.PUBLIC_CITY_NAME ?? 'Pittsburgh',
	domain: env.PUBLIC_CITY_DOMAIN ?? 'pittsburgh.comedyconnector.app',
	siteUrl: env.PUBLIC_SITE_URL ?? 'https://pittsburgh.comedyconnector.app',
	// External resources — update these per city instance
	resources: [
		{
			category: 'Venues & Theaters',
			links: [
				{
					title: 'Arcade Comedy Theater',
					url: 'https://arcadecomedytheater.com',
					description: 'Pittsburgh\'s home for improv, comedy shows, and training'
				},
				{
					title: 'Pittsburgh Improv',
					url: 'https://pittsburghimprov.com',
					description: 'Major comedy club in Pittsburgh'
				}
			]
		},
		{
			category: 'Training & Classes',
			links: [
				{
					title: 'Arcade Comedy School',
					url: 'https://arcadecomedytheater.com/classes',
					description: 'Improv and sketch comedy classes at Arcade'
				}
			]
		},
		{
			category: 'Community',
			links: [
				{
					title: 'Pittsburgh Comedy Scene',
					url: 'https://www.facebook.com/groups/pittsburghcomedy',
					description: 'Facebook group for the Pittsburgh comedy community'
				},
				{
					title: 'Find Shows',
					url: 'https://arcadecomedytheater.com/shows',
					description: 'Upcoming comedy shows in Pittsburgh'
				}
			]
		}
	]
};
