<script lang="ts">
	import { authStore } from '$stores/auth.svelte';
	import { toastStore } from '$stores/toast.svelte';
	import { X, Send } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		recipientId: string;
		recipientType: 'personal_profile' | 'team';
		recipientName: string;
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		recipientId,
		recipientType,
		recipientName,
		onClose
	}: Props = $props();

	let subject = $state('');
	let message = $state('');
	let submitting = $state(false);
	let sent = $state(false);

	function close() {
		open = false;
		onClose?.();
	}

	function reset() {
		subject = '';
		message = '';
		sent = false;
		submitting = false;
	}

	// Reset form when dialog opens
	$effect(() => {
		if (open) reset();
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!subject.trim() || !message.trim()) return;

		submitting = true;
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authStore.token}`
				},
				body: JSON.stringify({ recipientId, recipientType, subject: subject.trim(), message: message.trim() })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Failed to send message' }));
				throw new Error(err.message ?? 'Failed to send message');
			}

			sent = true;
			toastStore.success('Message sent!');
		} catch (err) {
			toastStore.error(err instanceof Error ? err.message : 'Failed to send message');
		} finally {
			submitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop button (click outside to close) -->
	<button
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-default w-full"
		onclick={close}
		tabindex="-1"
		aria-label="Close dialog"
	></button>
	<!-- Dialog panel -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
		<div
			class="bg-surface-50 dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto"
			role="dialog"
			aria-modal="true"
			aria-labelledby="contact-dialog-title"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
				<h2 id="contact-dialog-title" class="text-lg font-semibold text-surface-900 dark:text-surface-50">
					{sent ? 'Message Sent' : `Contact ${recipientName}`}
				</h2>
				<button
					onclick={close}
					class="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
					aria-label="Close"
				>
					<X size={20} />
				</button>
			</div>

			{#if sent}
				<!-- Success state -->
				<div class="px-6 py-8 text-center">
					<div class="w-14 h-14 rounded-full bg-success-500 flex items-center justify-center text-white text-2xl mx-auto mb-4">
						✓
					</div>
					<p class="text-surface-700 dark:text-surface-300 mb-2">
						Your message has been sent to <strong>{recipientName}</strong>.
					</p>
					<p class="text-sm text-surface-500">
						They'll reply directly to your email address.
					</p>
					<button onclick={close} class="btn preset-filled-primary-500 mt-6">
						Done
					</button>
				</div>
			{:else}
				<!-- Form -->
				<form onsubmit={handleSubmit} class="px-6 py-5 flex flex-col gap-4">
					<div class="label">
						<span class="label-text text-sm font-medium">Subject</span>
						<input
							type="text"
							class="input mt-1"
							bind:value={subject}
							placeholder="e.g. Interested in booking you as an opener"
							maxlength="200"
							required
							disabled={submitting}
						/>
					</div>

					<div class="label">
						<span class="label-text text-sm font-medium">Message</span>
						<textarea
							class="textarea mt-1 min-h-32 resize-y"
							bind:value={message}
							placeholder="Introduce yourself and explain what you're looking for..."
							maxlength="5000"
							required
							disabled={submitting}
						></textarea>
						<p class="text-xs text-surface-400 mt-1 text-right">{message.length}/5000</p>
					</div>

					<p class="text-xs text-surface-500">
						Your email will be shared with {recipientName} as the reply address so they can respond directly.
					</p>

					<div class="flex gap-3 justify-end pt-2">
						<button
							type="button"
							onclick={close}
							class="btn preset-tonal-surface"
							disabled={submitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="btn preset-filled-primary-500 gap-2"
							disabled={submitting || !subject.trim() || !message.trim()}
						>
							{#if submitting}
								<span class="animate-spin">⏳</span> Sending...
							{:else}
								<Send size={16} /> Send Message
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
