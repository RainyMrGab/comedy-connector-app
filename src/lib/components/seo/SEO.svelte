<script lang="ts">
  import { cityConfig } from '$config/city';

  let {
    title,
    description,
    path,
    image,
    type = 'website',
    jsonLd,
    noindex = false
  }: {
    title: string;
    description: string;
    path: string;
    image?: string;
    type?: 'website' | 'profile';
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
  } = $props();

  const canonicalUrl = $derived(`${cityConfig.siteUrl}${path}`);
  const ogImage = $derived(image ?? `${cityConfig.siteUrl}/assets/brand/og-default.png`);
  // Site-wide brand name — intentionally not city-specific, matches the shared
  // Google OAuth consent screen app name ("Comedy Connector") used across all city deployments.
  const siteName = 'Comedy Connector';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}

  <meta property="og:site_name" content={siteName} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />

  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
  {/if}
</svelte:head>
