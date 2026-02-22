import type { HandleClientError } from '@sveltejs/kit';

// Netlify Identity widget is initialized in +layout.svelte (onMount / $effect)
// because it needs the DOM and can't run during SSR.

export const handleError: HandleClientError = ({ error, event }) => {
	console.error('Client error on', event.url.pathname, error);
	return {
		message: 'An unexpected error occurred.'
	};
};
