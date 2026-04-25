<script lang="ts">
  // TomeApp.svelte
  // Root component for the Campaign Chronicle Tome view.
  // Layout: fixed top roller → scrollable parchment → fixed bottom roller.

  import type { CampaignStore } from "../store/campaignData";
  import SessionScroll from "./SessionScroll.svelte";

  export let store: CampaignStore;
  export let theme: string;
  export let renderMarkdown: (md: string, el: HTMLElement, sourcePath: string) => Promise<void>;

  $: state = $store;
</script>

<!-- Root container; data-cc-theme drives CSS variable overrides -->
<div class="cc-tome-root" data-cc-theme={theme}>

  <!-- Top roller — always visible, does not scroll -->
  <div class="cc-roller cc-roller--top" aria-hidden="true">
    <div class="cc-roller__cap cc-roller__cap--left"></div>
    <div class="cc-roller__rod"></div>
    <div class="cc-roller__cap cc-roller__cap--right"></div>
  </div>

  <!-- ── Content area ───────────────────────────────────────────── -->

  {#if state.loading}
    <div class="cc-status cc-status--loading" role="status" aria-live="polite">
      <span class="cc-spinner" aria-hidden="true"></span>
      <p>Opening the Chronicle…</p>
    </div>

  {:else if state.error}
    <div class="cc-status cc-status--error" role="alert">
      <p>⚠ Could not load the Chronicle.</p>
      <p class="cc-status__detail">{state.error}</p>
      <button on:click={() => store.refresh()}>Try again</button>
    </div>

  {:else if state.notes.length === 0}
    <div class="cc-status cc-status--empty" role="status">
      <p>No session notes found.</p>
      <p class="cc-status__detail">
        Check <strong>Settings → Campaign Chronicle</strong> and confirm the
        session folder path is correct.
      </p>
    </div>

  {:else}
    <!-- Continuous parchment scroll -->
    <div class="cc-parchment-window custom-scrollbar" role="main">
      <div class="cc-parchment-body">
        {#each state.notes as note (note.file.path)}
          <SessionScroll {note} {renderMarkdown} />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Bottom roller — always visible, does not scroll -->
  <div class="cc-roller cc-roller--bottom" aria-hidden="true">
    <div class="cc-roller__cap cc-roller__cap--left"></div>
    <div class="cc-roller__rod"></div>
    <div class="cc-roller__cap cc-roller__cap--right"></div>
  </div>

</div>

<style>
  /* ── Root ─────────────────────────────────────────────────────── */
  .cc-tome-root {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--cc-bg, #1a120b);
    /* Subtle wood-grain noise overlay */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='wg'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.02 0.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23wg)' opacity='0.06'/%3E%3C/svg%3E");
    box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.5);
  }

  /* ── Roller ───────────────────────────────────────────────────── */
  .cc-roller {
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    height: 26px;
    z-index: 10;
  }

  /* The long cylindrical rod */
  .cc-roller__rod {
    flex: 1;
    background: linear-gradient(
      to bottom,
      #6b3a22 0%,
      #9c5a32 18%,
      #c47a4a 32%,
      #d4895a 45%,
      #b86a3a 60%,
      #7a3e20 80%,
      #4a2010 100%
    );
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 220, 160, 0.15);
  }

  /* Round cap at each end */
  .cc-roller__cap {
    width: 16px;
    background: linear-gradient(
      to bottom,
      #4a2010 0%,
      #7a3e20 40%,
      #5a2e14 100%
    );
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .cc-roller--top {
    border-bottom: 2px solid rgba(0, 0, 0, 0.4);
  }

  .cc-roller--bottom {
    border-top: 2px solid rgba(0, 0, 0, 0.4);
  }

  /* ── Parchment window (the scrollable viewport between rollers) ─ */
  .cc-parchment-window {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* Continuous parchment background — one sheet, not per-card */
    background-color: var(--cc-parchment-bg, #f5f0e1);
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");
    /* Subtle side shadows to simulate depth at scroll edges */
    box-shadow:
      inset 4px 0 12px rgba(0, 0, 0, 0.08),
      inset -4px 0 12px rgba(0, 0, 0, 0.08);
  }

  .cc-parchment-body {
    /* Horizontal margins to keep text away from shadow edges */
    padding: 0 2.5rem;
    color: var(--cc-text-color, #292524);
    font-family: var(--cc-font-body, "Crimson Pro", Georgia, serif);
    font-size: var(--cc-font-size, 1.05rem);
    line-height: var(--cc-line-height, 1.8);
    /* Override Obsidian's text variables for rendered markdown */
    --text-normal: var(--cc-text-color, #292524);
    --text-muted: var(--cc-text-muted, #5a4a3a);
    --text-accent: var(--cc-accent, #7a4a20);
  }

  /* ── Status / error / empty states ───────────────────────────── */
  .cc-status {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: rgba(230, 220, 200, 0.6);
    font-family: var(--cc-font-body, "Crimson Pro", Georgia, serif);
    font-size: 1.1rem;
    text-align: center;
    padding: 2rem;
  }

  .cc-status--loading .cc-spinner {
    display: block;
    width: 32px;
    height: 32px;
    border: 3px solid rgba(200, 160, 80, 0.2);
    border-top-color: rgba(200, 160, 80, 0.8);
    border-radius: 50%;
    animation: cc-spin 0.9s linear infinite;
    margin-bottom: 0.5rem;
  }

  @keyframes cc-spin {
    to { transform: rotate(360deg); }
  }

  .cc-status--error { color: rgba(220, 140, 100, 0.9); }

  .cc-status__detail {
    font-size: 0.85rem;
    opacity: 0.7;
    max-width: 380px;
  }

  .cc-status button {
    margin-top: 0.75rem;
    padding: 0.35rem 1.1rem;
    background: rgba(200, 160, 80, 0.15);
    border: 1px solid rgba(200, 160, 80, 0.4);
    border-radius: 6px;
    color: rgba(230, 200, 130, 0.9);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .cc-status button:hover {
    background: rgba(200, 160, 80, 0.3);
  }

  /* ── Custom scrollbar ─────────────────────────────────────────── */
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(140, 100, 60, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(140, 100, 60, 0.5);
  }
</style>
