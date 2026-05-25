/**
 * Highlight item type for performer profiles.
 * - 'link': an external URL (video, article, social post); may embed as YouTube, display as image, or link
 * - 'image': an image uploaded to Supabase Storage; always rendered as <img>
 */
export interface Highlight {
	type: 'link' | 'image';
	url: string;
	label?: string;
}

/**
 * Normalize the raw `video_highlights` JSON column value into a typed Highlight[].
 * Handles the legacy string[] format (Phase 1–2) and the new Highlight[] format (Phase 3+).
 */
export function normalizeHighlights(raw: unknown): Highlight[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((item): Highlight | null => {
			if (typeof item === 'string') {
				const url = item.trim();
				return url ? { type: 'link', url } : null;
			}
			if (item && typeof item === 'object') {
				const { type, url, label } = item as Record<string, unknown>;
				if (typeof url === 'string' && url.trim()) {
					return {
						type: type === 'image' ? 'image' : 'link',
						url: url.trim(),
						...(label && typeof label === 'string' ? { label } : {})
					};
				}
			}
			return null;
		})
		.filter((h): h is Highlight => h !== null);
}
