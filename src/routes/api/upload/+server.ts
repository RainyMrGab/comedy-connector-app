import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$server/supabase';

const ALLOWED_BUCKETS = ['user-media'] as const;
type Bucket = (typeof ALLOWED_BUCKETS)[number];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload
 * Uploads an image to Supabase Storage and returns the public URL.
 *
 * Body: multipart/form-data
 *   file   — the image File
 *   bucket — must be: user-media
 *
 * Returns: { url: string }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'You must be logged in to upload files');

	const formData = await request.formData().catch(() => error(400, 'Invalid form data'));
	const file = formData.get('file');
	const bucket = String(formData.get('bucket') ?? '') as Bucket;

	if (!(file instanceof File)) error(400, 'No file provided');
	if (!ALLOWED_BUCKETS.includes(bucket)) error(400, `Invalid bucket — must be one of: ${ALLOWED_BUCKETS.join(', ')}`);
	if (file.size === 0) error(400, 'File is empty');
	if (file.size > MAX_FILE_SIZE) error(400, 'File too large — maximum size is 5 MB');
	if (!file.type.startsWith('image/')) error(400, 'Only image files are allowed');

	// Build a unique path: userId/timestamp.ext
	const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
	const path = `${locals.user.id}/${Date.now()}.${ext}`;

	const buffer = await file.arrayBuffer();
	const supabase = createSupabaseAdminClient();

	const { error: uploadError } = await supabase.storage
		.from(bucket)
		.upload(path, buffer, { contentType: file.type, upsert: false });

	if (uploadError) {
		console.error('Supabase Storage upload error:', uploadError.message);
		error(500, 'Upload failed — please try again');
	}

	const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

	return json({ url: publicUrl });
};
