export type PaymentPlatform = 'paypal' | 'venmo' | 'zelle' | null;

export function detectPaymentPlatform(url: string): PaymentPlatform {
	let hostname: string;
	try {
		hostname = new URL(url).hostname.toLowerCase();
	} catch {
		return null;
	}
	if (hostname.includes('paypal.com') || hostname.includes('paypal.me')) return 'paypal';
	if (hostname.includes('venmo.com')) return 'venmo';
	if (hostname.includes('zelle')) return 'zelle';
	return null;
}
