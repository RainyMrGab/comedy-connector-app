<script lang="ts">
	let {
		open = $bindable(false),
		title = 'Are you sure?',
		message = '',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		destructive = false,
		onConfirm,
		onCancel
	} = $props<{
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		destructive?: boolean;
		onConfirm: () => void;
		onCancel?: () => void;
	}>();

	function handleCancel() {
		open = false;
		onCancel?.();
	}

	function handleConfirm() {
		open = false;
		onConfirm();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div class="bg-surface-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
			<h2 id="dialog-title" class="text-lg font-semibold text-surface-50 mb-2">{title}</h2>
			{#if message}
				<p class="text-surface-300 text-sm mb-6">{message}</p>
			{/if}
			<div class="flex gap-3 justify-end">
				<button onclick={handleCancel} class="btn preset-tonal-surface">
					{cancelLabel}
				</button>
				<button
					onclick={handleConfirm}
					class="btn {destructive ? 'preset-filled-error-500' : 'preset-filled-primary-500'}"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
