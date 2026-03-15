<script lang="ts">
	import { toastStore, type Toast } from '$stores/toast.svelte';
	import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info
	};

	const accentColors: Record<Toast['type'], string> = {
		success: '#2e7d7d',
		error: '#d93b2b',
		warning: '#f2c84b',
		info: '#2e7d7d'
	};
</script>

<div
	class="toast-container"
	aria-live="polite"
	aria-label="Notifications"
>
	{#each toastStore.toasts as toast (toast.id)}
		{@const Icon = icons[toast.type]}
		{@const accent = accentColors[toast.type]}
		<div
			class="toast-item"
			style="border-left-color: {accent};"
			role="alert"
		>
			<Icon size={18} style="color: {accent}; flex-shrink: 0;" />
			<p class="toast-msg">{toast.message}</p>
			<button
				onclick={() => toastStore.remove(toast.id)}
				class="toast-close"
				aria-label="Dismiss notification"
			>
				<X size={14} />
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container { position: fixed; bottom: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: 360px; width: 100%; pointer-events: none; }
	.toast-item { pointer-events: auto; display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: var(--zine-primary); color: var(--zine-bg); border: 2px solid var(--zine-primary); border-left-width: 4px; box-shadow: var(--zine-shadow); font-family: var(--font-body); font-size: 13px; }
	.toast-msg { flex: 1; line-height: 1.4; }
	.toast-close { background: none; border: none; cursor: pointer; color: var(--zine-bg); opacity: 0.7; padding: 0; flex-shrink: 0; }
	.toast-close:hover { opacity: 1; }
</style>
