import { siPaypal, siZelle } from 'simple-icons';
import type { PaymentPlatform } from './paymentPlatform';

// Venmo's simple-icons glyph is the full wordmark, illegible at badge sizes,
// so it's rendered as a plain "V" letter badge instead — see +page.svelte.
export const paymentBrandIcons: Partial<Record<Exclude<PaymentPlatform, null>, { path: string; hex: string }>> = {
	paypal: { path: siPaypal.path, hex: `#${siPaypal.hex}` },
	zelle: { path: siZelle.path, hex: `#${siZelle.hex}` }
};
