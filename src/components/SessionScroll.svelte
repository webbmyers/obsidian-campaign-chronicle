<script lang="ts">
  // SessionScroll.svelte
  // Renders a single session note as a seamless section of the continuous
  // parchment scroll. No box, no frame, no padding — just content flowing
  // into the next note. A decorative divider separates sessions.

  import { onMount } from "svelte";
  import type { SessionNote } from "../utils/stitcher";

  export let note: SessionNote;
  export let renderMarkdown: (md: string, el: HTMLElement, sourcePath: string) => Promise<void>;

  let contentEl: HTMLElement;

  onMount(() => {
    if (contentEl && note.content) {
      void renderMarkdown(note.content, contentEl, note.file.path);
    }
  });
</script>

<section class="cc-session" data-file={note.file.path}>
  <!-- Data quality warnings — shown inline, above content -->
  {#if note.isMissingIndex}
    <p class="cc-warn cc-warn--missing">⚠ No index field — sorted to end</p>
  {/if}
  {#if note.hasDuplicateIndex}
    <p class="cc-warn cc-warn--duplicate">⚠ Duplicate index value</p>
  {/if}

  <!-- Rendered markdown body -->
  <div class="cc-session__body" bind:this={contentEl}></div>

  <!-- Decorative inter-session divider -->
  <div class="cc-divider" aria-hidden="true">
    <span class="cc-divider__line"></span>
    <span class="cc-divider__glyph">✦</span>
    <span class="cc-divider__line"></span>
  </div>
</section>

<style>
  /* ── Session section ──────────────────────────────────────────── */
  .cc-session {
    /* No margin, no padding — vertical rhythm comes from rendered headings */
    display: block;
  }

  /* Obsidian renders markdown into .cc-session__body; we just size it. */
  .cc-session__body {
    /* Ensure rendered content inherits parchment body styles from JournalApp */
    min-height: 1px;
  }

  /* ── Inter-session divider ────────────────────────────────────── */
  .cc-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.25rem 0;
    opacity: 0.35;
  }

  .cc-divider__line {
    flex: 1;
    height: 1px;
    background: currentColor;
  }

  .cc-divider__glyph {
    font-size: 0.65rem;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  /* ── Inline data-quality warnings ────────────────────────────── */
  .cc-warn {
    margin: 0;
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
    border-radius: 3px;
    font-family: var(--font-ui-small, sans-serif);
  }

  .cc-warn--missing {
    background: rgba(220, 160, 40, 0.12);
    color: #856404;
    border-left: 3px solid rgba(220, 160, 40, 0.5);
  }

  .cc-warn--duplicate {
    background: rgba(200, 60, 40, 0.08);
    color: #842029;
    border-left: 3px solid rgba(200, 60, 40, 0.4);
  }
</style>
