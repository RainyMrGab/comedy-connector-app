import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		// tailwindcss must come before sveltekit
		tailwindcss(),
		sveltekit()
	],
	optimizeDeps: {
		include: ['netlify-identity-widget']
	}
});
