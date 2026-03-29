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
					...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
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
	<button
		class="backdrop"
		onclick={close}
		tabindex="-1"
		aria-label="Close dialog"
	></button>
	<div class="dialog-wrap">
		<div
			class="dialog-panel"
			role="dialog"
			aria-modal="true"
			aria-labelledby="contact-dialog-title"
		>
			<div class="dialog-header">
				<h2 id="contact-dialog-title" class="dialog-title">
					{sent ? 'MESSAGE SENT' : `CONTACT ${recipientName.toUpperCase()}`}
				</h2>
				<button onclick={close} class="close-btn" aria-label="Close">
					<X size={18} />
				</button>
			</div>

			{#if sent}
				<div class="sent-state">
					<span class="sent-icon">★</span>
					<p class="sent-msg">Your message has been sent to <strong>{recipientName}</strong>.</p>
					<p class="sent-sub">They'll reply directly to your email address.</p>
					<button onclick={close} class="btn-accent">DONE</button>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="dialog-form zine-form">
					<div class="form-field">
						<label for="contact-subject">SUBJECT</label>
						<input
							id="contact-subject"
							type="text"
							bind:value={subject}
							placeholder="e.g. Interested in booking you as an opener"
							maxlength="200"
							required
							disabled={submitting}
						/>
					</div>

					<div class="form-field">
						<label for="contact-message">MESSAGE</label>
						<textarea
							id="contact-message"
							bind:value={message}
							placeholder="Introduce yourself and explain what you're looking for..."
							maxlength="5000"
							rows="6"
							required
							disabled={submitting}
						></textarea>
						<p class="char-count">{message.length}/5000</p>
					</div>

					<p class="privacy-note">
						Your email will be shared with {recipientName} as the reply address so they can respond directly.
					</p>

					<div class="dialog-actions">
						<button type="button" onclick={close} class="btn-outline" disabled={submitting}>CANCEL</button>
						<button
							type="submit"
							class="btn-accent"
							disabled={submitting || !subject.trim() || !message.trim()}
						>
							{#if submitting}
								SENDING…
							{:else}
								<Send size={14} /> SEND
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(28, 28, 28, 0.8); cursor: default; width: 100%; border: none; }
	.dialog-wrap { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none; }
	.dialog-panel { background: var(--zine-bg); border: var(--zine-border); box-shadow: var(--zine-shadow); max-width: 520px; width: 100%; pointer-events: auto; }
	.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: var(--zine-border); }
	.dialog-title { font-family: var(--font-heading); font-size: 18px; color: var(--zine-primary); margin: 0; }
	.close-btn { background: none; border: none; cursor: pointer; color: var(--zine-primary); padding: 4px; opacity: 0.6; }
	.close-btn:hover { opacity: 1; }
	.dialog-form { padding: 20px; }
	.char-count { font-size: 10px; opacity: 0.5; text-align: right; margin-top: 4px; }
	.privacy-note { font-size: 11px; opacity: 0.55; line-height: 1.5; }
	.dialog-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
	.sent-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 24px; text-align: center; }
	.sent-icon { font-size: 40px; color: var(--zine-muted); }
	.sent-msg { font-size: 14px; margin: 0; }
	.sent-sub { font-size: 12px; opacity: 0.6; margin: 0; }
</style>
