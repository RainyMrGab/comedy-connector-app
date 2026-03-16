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
	<button
		class="backdrop"
		onclick={handleCancel}
		tabindex="-1"
		aria-label="Close dialog"
	></button>
	<div
		class="dialog-wrap"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div class="dialog-panel">
			<h2 id="dialog-title" class="dialog-title">{title}</h2>
			{#if message}
				<p class="dialog-message">{message}</p>
			{/if}
			<div class="dialog-actions">
				<button onclick={handleCancel} class="btn-outline">{cancelLabel}</button>
				<button
					onclick={handleConfirm}
					class={destructive ? 'btn-accent' : 'btn-dark'}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(28, 28, 28, 0.75); cursor: default; width: 100%; border: none; }
	.dialog-wrap { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none; }
	.dialog-panel { background: var(--zine-bg); border: var(--zine-border); box-shadow: var(--zine-shadow); max-width: 440px; width: 100%; padding: 28px; pointer-events: auto; }
	.dialog-title { font-family: var(--font-heading); font-size: 22px; color: var(--zine-primary); margin: 0 0 12px; }
	.dialog-message { font-size: 13px; opacity: 0.75; margin: 0 0 24px; line-height: 1.6; }
	.dialog-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
