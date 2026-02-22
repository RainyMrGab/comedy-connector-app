<script lang="ts">
	import { toastStore, type Toast } from '$stores/toast.svelte';
	import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info
	};

	const styles: Record<Toast['type'], string> = {
		success: 'bg-success-500 text-white',
		error: 'bg-error-500 text-white',
		warning: 'bg-warning-500 text-white',
		info: 'bg-tertiary-600 text-white'
	};
</script>

<div
	class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
	aria-live="polite"
	aria-label="Notifications"
>
	{#each toastStore.toasts as toast (toast.id)}
		{@const Icon = icons[toast.type]}
		{@const styleClass = styles[toast.type]}
		<div
			class="pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg {styleClass}"
			role="alert"
		>
			<Icon size={20} class="mt-0.5 shrink-0" />
			<p class="flex-1 text-sm">{toast.message}</p>
			<button
				onclick={() => toastStore.remove(toast.id)}
				class="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
				aria-label="Dismiss notification"
			>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
