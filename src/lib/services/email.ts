import { Resend } from 'resend';

// Use process.env for portability in Netlify functions
// but allow falling back to SvelteKit's dynamic env if available (rarely needed here)
const getEnv = (key: string) => {
	if (typeof process !== 'undefined' && process.env && process.env[key]) {
		return process.env[key];
	}
	return undefined;
};

export interface EmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	text: string;
	replyTo?: string;
	from?: string;
}

class EmailService {
	private resend: Resend | null = null;
	private initialized = false;

	private init() {
		if (this.initialized) return;

		const apiKey = getEnv('RESEND_API_KEY');
		if (apiKey) {
			this.resend = new Resend(apiKey);
		} else {
			console.warn('RESEND_API_KEY is not set. EmailService will log to console instead.');
		}

		this.initialized = true;
	}

	private getFromAddress() {
		const domain = getEnv('PUBLIC_CITY_DOMAIN') || 'pgh.comedyconnector.app';
		return `Comedy Connector <noreply@${domain}>`;
	}

	async send(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
		this.init();

		const emailData = {
			from: options.from || this.getFromAddress(),
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
			replyTo: options.replyTo
		};

		if (!this.resend) {
			console.log('--- MOCK EMAIL ---');
			console.log(JSON.stringify(emailData, null, 2));
			console.log('------------------');
			return { success: true };
		}

		try {
			const { data, error } = await this.resend.emails.send(emailData);
			if (error) {
				console.error('Resend error:', error);
				return { success: false, error: error.message };
			}
			return { success: true };
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.error('EmailService unexpected error:', message);
			return { success: false, error: message };
		}
	}
}

export const emailService = new EmailService();
