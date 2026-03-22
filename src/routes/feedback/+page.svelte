<script lang="ts">
	import { cityConfig } from '$config/city';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let loadedAt = $state(Date.now());
	let submitting = $state(false);
	let submitted = $state(false);
	let errorMsg = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, loadedAt, website: '' })
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message ?? 'Something went wrong');
			}

			submitted = true;
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Feedback | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Share feedback about {cityConfig.name} Comedy Connector." />
</svelte:head>

<div class="feedback-page">
	{#if submitted}
		<div class="success-box">
			<h1 class="page-title">THANKS!</h1>
			<p class="success-msg">Your feedback was sent. We appreciate it.</p>
			<a href="/" class="btn-back">← BACK TO HOME</a>
		</div>
	{:else}
		<h1 class="page-title">FEEDBACK</h1>
		<p class="page-sub">
			Got a suggestion, a complaint, or something nice to say? We want to hear it.
		</p>

		<form onsubmit={handleSubmit} class="feedback-form" novalidate>
			<!-- Honeypot — hidden from humans -->
			<input type="text" name="website" tabindex="-1" autocomplete="off" class="honeypot" />

			<div class="field">
				<label for="feedback-name" class="field-label">NAME <span class="optional">(optional)</span></label>
				<input
					id="feedback-name"
					type="text"
					bind:value={name}
					maxlength="200"
					autocomplete="name"
					class="field-input"
					placeholder="Your name"
				/>
			</div>

			<div class="field">
				<label for="feedback-email" class="field-label">EMAIL <span class="optional">(optional — only if you'd like a reply)</span></label>
				<input
					id="feedback-email"
					type="email"
					bind:value={email}
					autocomplete="email"
					class="field-input"
					placeholder="your@email.com"
				/>
			</div>

			<div class="field">
				<label for="feedback-message" class="field-label">
					MESSAGE <span class="char-count">{message.length}/5000</span>
				</label>
				<textarea
					id="feedback-message"
					bind:value={message}
					maxlength="5000"
					required
					rows="6"
					class="field-input field-textarea"
					placeholder="What's on your mind?"
				></textarea>
			</div>

			{#if errorMsg}
				<p class="error-msg">{errorMsg}</p>
			{/if}

			<button type="submit" class="btn-submit" disabled={submitting || !message.trim()}>
				{submitting ? 'SENDING…' : 'SEND FEEDBACK →'}
			</button>
		</form>
	{/if}
</div>

<style>
	.feedback-page {
		max-width: 640px;
		margin: 0 auto;
		padding: 48px 32px;
	}

	.page-title {
		font-family: var(--font-heading);
		font-size: 40px;
		color: var(--zine-primary);
		transform: rotate(-1deg);
		display: inline-block;
		margin-bottom: 8px;
	}

	.page-sub {
		font-size: 14px;
		line-height: 1.7;
		opacity: 0.75;
		margin-bottom: 36px;
	}

	.feedback-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.honeypot {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--zine-primary);
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.optional {
		font-weight: 400;
		opacity: 0.6;
		text-transform: none;
		letter-spacing: 0;
		font-size: 11px;
	}

	.char-count {
		font-weight: 400;
		opacity: 0.5;
		margin-left: auto;
		letter-spacing: 0;
		text-transform: none;
	}

	.field-input {
		border: var(--zine-border);
		background: var(--zine-bg);
		color: var(--zine-primary);
		padding: 10px 12px;
		font-size: 14px;
		font-family: var(--font-body);
		outline: none;
		width: 100%;
		box-sizing: border-box;
	}

	.field-input:focus {
		box-shadow: 3px 3px 0 var(--zine-accent);
	}

	.field-textarea {
		resize: vertical;
		min-height: 140px;
	}

	.error-msg {
		font-size: 13px;
		color: var(--zine-accent);
		font-weight: 700;
	}

	.btn-submit {
		align-self: flex-start;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 12px 24px;
		background: var(--zine-primary);
		color: var(--zine-bg);
		border: var(--zine-border);
		cursor: pointer;
		transition: transform 0.1s, box-shadow 0.1s;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translate(-2px, -2px);
		box-shadow: var(--zine-shadow);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.success-box {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.success-msg {
		font-size: 16px;
		line-height: 1.6;
	}

	.btn-back {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--zine-muted);
		text-decoration: none;
	}

	.btn-back:hover {
		color: var(--zine-accent);
	}

	@media (max-width: 640px) {
		.feedback-page {
			padding: 36px 24px;
		}
	}
</style>
