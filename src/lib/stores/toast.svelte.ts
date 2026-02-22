export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

let _toasts = $state<Toast[]>([]);

export const toastStore = {
	get toasts() {
		return _toasts;
	},

	add(message: string, type: ToastType = 'info', duration = 4000): string {
		const id = crypto.randomUUID();
		_toasts = [..._toasts, { id, type, message, duration }];
		if (duration > 0) {
			setTimeout(() => this.remove(id), duration);
		}
		return id;
	},

	remove(id: string) {
		_toasts = _toasts.filter((t) => t.id !== id);
	},

	success(message: string) {
		return this.add(message, 'success');
	},

	error(message: string) {
		return this.add(message, 'error', 6000);
	},

	warning(message: string) {
		return this.add(message, 'warning');
	},

	info(message: string) {
		return this.add(message, 'info');
	}
};
