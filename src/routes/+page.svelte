<script lang="ts">
  import { authStore } from '$stores/auth.svelte';
  import { cityConfig } from '$config/city';
  import { Sparkles, GraduationCap, Handshake, Users, UserCheck, ArrowRight } from 'lucide-svelte';

  const connectCards = [
    {
      icon: Sparkles,
      label: 'BOOK AN OPENER',
      desc: 'Find teams interested in opening for your show.',
      href: '/connect/book-opener'
    },
    {
      icon: GraduationCap,
      label: 'FIND A COACH',
      desc: 'Browse coaches by style, availability, and focus area.',
      href: '/connect/find-coach'
    },
    {
      icon: Handshake,
      label: 'JOIN A TEAM',
      desc: 'Find teams and practice groups looking for new players.',
      href: '/connect/join-team'
    }
  ];

  const browseCards = [
    {
      icon: Sparkles,
      label: 'PERFORMERS',
      desc: 'Browse performer profiles including bios, interests, media, and teams.',
      href: '/performers'
    },
    {
      icon: UserCheck,
      label: 'COACHES',
      desc: 'Browse coach profiles including bios, interests, styles, and availability.',
      href: '/coaches'
    },
    {
      icon: Users,
      label: 'TEAMS',
      desc: 'Browse team profiles including performance videos, interests, members, and coaches.',
      href: '/teams'
    }
  ];

  async function openSignup() {
    const module = await import('netlify-identity-widget');
    module.default.open('signup');
  }
</script>

<svelte:head>
  <title>{cityConfig.name} Comedy Connector</title>
  <meta name="description"
        content="Connect with {cityConfig.name}'s improv and comedy community. Find performers, coaches, and teams."/>
</svelte:head>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-headline" aria-label="Connecting your comedy scene">
      <h1 class="headline-line">CONNECTING</h1>
      <h1 class="headline-line indent">YOUR</h1>
      <h1 class="headline-line">COMEDY SCENE.</h1>
    </div>
    <p class="hero-sub">
      {cityConfig.name}'s open directory for performers, coaches, and teams.
    </p>
    <div class="hero-actions">
      {#if authStore.isAuthenticated}
        <a href="/profile/edit" class="btn-accent">
          SET UP YOUR PROFILE
          <ArrowRight size={18}/>
        </a>
        <a href="/performers" class="btn-outline">BROWSE</a>
      {:else}
        <button onclick={openSignup} class="btn-accent">
          JOIN THE SCENE
          <ArrowRight size={18}/>
        </button>
        <a href="/performers" class="btn-outline">BROWSE THE SCENE</a>
      {/if}
    </div>
  </div>
</section>

<!-- RULE -->
<div class="section-rule" aria-hidden="true">
  ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
</div>

<!-- CONNECT -->
<section class="content-section">
  <h2 class="section-heading">WHAT DO YOU NEED?</h2>
  <div class="connect-grid">
    {#each connectCards as card}
      <a href={card.href} class="zine-card connect-card">
        <div class="card-icon">
          <card.icon size={24}/>
        </div>
        <h3 class="card-label">{card.label}</h3>
        <p class="card-desc">{card.desc}</p>
      </a>
    {/each}
  </div>
</section>

<!-- FEATURES -->
<section class="content-section features-section">
  <h2 class="section-heading">WHO'S HERE?</h2>
  <div class="features-grid">
    {#each browseCards as card}
      <a href={card.href} class="zine-card">
        <div class="card-icon">
          <card.icon size={28}/>
        </div>
        <h3 class="card-label">{card.label}</h3>
        <p class="card-desc">{card.desc}</p>
      </a>
    {/each}
  </div>
</section>

<!-- CTA STRIP (logged out only) -->
{#if !authStore.isAuthenticated && !authStore.loading}
  <section class="cta-strip">
    <div class="cta-inner">
      <!-- <p class="cta-eyebrow">— IT'S FREE, FOREVER —</p>-->
      <h2 class="cta-heading">READY TO GET INVOLVED?</h2>
      <button onclick={openSignup} class="btn-accent">
        CREATE YOUR PROFILE
        <ArrowRight size={18}/>
      </button>
    </div>
  </section>
{/if}

<style>
  /* HERO */
  .hero {
    padding: 56px 48px;
    border-bottom: var(--zine-border);
  }

  .hero-headline {
    transform: rotate(-2deg);
    transform-origin: left center;
    margin-bottom: 20px;
  }

  .headline-line {
    font-family: var(--font-heading);
    font-size: clamp(48px, 8vw, 88px);
    line-height: 1.05;
    color: var(--zine-primary);
    display: block;
    margin: 0;
  }

  .headline-line.indent {
    margin-left: 24px;
  }

  .hero-sub {
    font-size: 16px;
    line-height: 1.7;
    color: var(--zine-primary);
    margin-bottom: 32px;
    max-width: 480px;
    opacity: 0.85;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* RULE */
  .section-rule {
    text-align: center;
    padding: 12px 0;
    font-size: 13px;
    letter-spacing: 0.15em;
    color: var(--zine-muted);
    border-bottom: var(--zine-border);
    background: var(--zine-surface);
    overflow: hidden;
    white-space: nowrap;
  }

  /* SECTIONS */
  .content-section {
    padding: 48px 32px;
  }

  .features-section {
    background: var(--zine-surface);
    border-top: var(--zine-border);
  }

  .section-heading {
    font-family: var(--font-heading);
    font-size: 36px;
    margin-bottom: 24px;
    color: var(--zine-primary);
    transform: rotate(-1deg);
    display: inline-block;
  }

  /* CARDS */
  .connect-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .zine-card {
    background: var(--zine-bg);
    border: var(--zine-border);
    box-shadow: var(--zine-shadow);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-decoration: none;
    color: var(--zine-primary);
    transition: transform 0.1s,
    box-shadow 0.1s;
  }

  .zine-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px var(--zine-primary);
  }

  .connect-card {
    padding: 20px 24px;
    background: var(--zine-surface);
  }

  .features-section .zine-card {
    background: var(--zine-bg);
  }

  .card-icon {
    color: var(--zine-accent);
    margin-top: 4px;
  }

  .card-label {
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--zine-primary);
    margin: 0;
  }

  .card-desc {
    font-size: 13px;
    line-height: 1.6;
    color: var(--zine-primary);
    opacity: 0.8;
    margin: 0;
  }

  /* CTA STRIP */
  .cta-strip {
    background: var(--zine-highlight);
    border-top: var(--zine-border);
    padding: 48px 32px;
  }

  .cta-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
  }

  .cta-eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--zine-primary);
    opacity: 0.7;
    margin: 0;
  }

  .cta-heading {
    font-family: var(--font-heading);
    font-size: 42px;
    color: var(--zine-primary);
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      padding: 36px 24px;
    }

    .connect-grid,
    .features-grid {
      grid-template-columns: 1fr;
    }

    .content-section {
      padding: 48px 24px;
    }
  }
</style>
