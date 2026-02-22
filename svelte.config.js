import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Run as serverless functions (not edge)
			edge: false,
			// Split routes into separate functions for better cold start performance
			split: false
		}),
		alias: {
			$lib: 'src/lib',
			$components: 'src/lib/components',
			$server: 'src/lib/server',
			$stores: 'src/lib/stores',
			$types: 'src/lib/types',
			$utils: 'src/lib/utils',
			$config: 'src/lib/config'
		}
	}
};

export default config;
