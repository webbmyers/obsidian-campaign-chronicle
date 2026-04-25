import { writable } from "svelte/store";
import type { App } from "obsidian";
import { stitchSessions, type SessionNote } from "../utils/stitcher";

// ─── Store shape ─────────────────────────────────────────────────────────────

export interface CampaignDataState {
  notes: SessionNote[];
  loading: boolean;
  error: string | null;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Creates a reactive Svelte store that holds stitched session notes.
 *
 * Call `refresh()` to trigger an immediate reload from the vault.
 * Pass the returned `destroy()` to `ItemView.onClose()` to detach the
 * MetadataCache listener and prevent leaks.
 */
export function createCampaignStore(
  app: App,
  getFolder: () => string,
  getIndexField: () => string,
  getIncludeUnindexed: () => boolean
) {
  const { subscribe, set, update } = writable<CampaignDataState>({
    notes: [],
    loading: true,
    error: null,
  });

  async function refresh() {
    update((s) => ({ ...s, loading: true, error: null }));
    try {
      const notes = await stitchSessions(app, getFolder(), getIndexField(), getIncludeUnindexed());
      set({ notes, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ notes: [], loading: false, error: message });
    }
  }

  // Re-stitch whenever the metadata cache changes (covers edits to frontmatter
  // in any open file).  We use a simple debounce so rapid saves don't hammer
  // the vault reader.
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const eventRef = app.metadataCache.on("changed", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void refresh(), 500);
  });

  function destroy() {
    if (debounceTimer) clearTimeout(debounceTimer);
    app.metadataCache.offref(eventRef);
  }

  // Initial load.
  void refresh();

  return { subscribe, refresh, destroy };
}

export type CampaignStore = ReturnType<typeof createCampaignStore>;
