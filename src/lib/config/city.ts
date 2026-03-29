import { env } from '$env/dynamic/public';
import { resources } from './resources/pittsburgh';

export const cityConfig = {
	name: env.PUBLIC_CITY_NAME ?? 'Pittsburgh',
	domain: env.PUBLIC_CITY_DOMAIN ?? 'pgh.comedyconnector.app',
	siteUrl: env.PUBLIC_SITE_URL ?? 'https://pgh.comedyconnector.app',
	// External resources — swap this import to customize per city instance
	resources
};
