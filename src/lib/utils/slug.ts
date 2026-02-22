/**
 * Generate a URL-safe slug from a name.
 * e.g. "John O'Brien Jr." → "john-obrien-jr"
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[''`]/g, '') // remove apostrophes
		.replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
		.replace(/\s+/g, '-') // spaces → hyphens
		.replace(/-+/g, '-') // collapse multiple hyphens
		.replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

/**
 * Append a numeric suffix to make a slug unique.
 * e.g. "john-smith" → "john-smith-2"
 */
export function uniquifySlug(base: string, attempt: number): string {
	if (attempt <= 1) return base;
	return `${base}-${attempt}`;
}
