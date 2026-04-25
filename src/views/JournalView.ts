import { ItemView, MarkdownRenderer, WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import JournalApp from "../components/JournalApp.svelte";
import { createCampaignStore, type CampaignStore } from "../store/campaignData";
import type { CampaignChronicleSettings } from "../settings";

export const VIEW_TYPE_JOURNAL = "campaign-chronicle-journal";

export class JournalView extends ItemView {
  private settings: CampaignChronicleSettings;
  private store: CampaignStore | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svelteApp: Record<string, any> | null = null;

  constructor(leaf: WorkspaceLeaf, settings: CampaignChronicleSettings) {
    super(leaf);
    this.settings = settings;
  }

  /** Called by Obsidian to get the view's identifier. */
  getViewType(): string {
    return VIEW_TYPE_JOURNAL;
  }

  /** Tab title shown in the Obsidian workspace. */
  getDisplayText(): string {
    return "Campaign chronicle";
  }

  /** Icon for the tab/ribbon (uses Obsidian's Lucide icon set). */
  getIcon(): string {
    return "book-open";
  }

  async onOpen(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass("cc-view-root");

    // Create the reactive data store.
    this.store = createCampaignStore(
      this.app,
      () => this.settings.sessionFolder,
      () => this.settings.indexField,
      () => this.settings.includeUnindexed
    );

    // Helper that uses Obsidian's built-in MarkdownRenderer so internal
    // links, callouts, and embeds all work correctly.
    // sourcePath must be the vault-relative path of the originating file.
    const renderMarkdown = async (md: string, el: HTMLElement, sourcePath: string) => {
      await MarkdownRenderer.render(this.app, md, el, sourcePath, this);
    };

    // Mount the Svelte component tree.
    this.svelteApp = mount(JournalApp, {
      target: container,
      props: {
        store: this.store,
        theme: this.settings.theme,
        renderMarkdown,
      },
    });
  }

  async onClose(): Promise<void> {
    // Detach the MetadataCache listener.
    this.store?.destroy();
    this.store = null;

    // Unmount the Svelte component tree.
    if (this.svelteApp) {
      await unmount(this.svelteApp);
      this.svelteApp = null;
    }

    this.contentEl.empty();
  }

  /** Called by the plugin when settings change so the view can react. */
  updateSettings(newSettings: CampaignChronicleSettings): void {
    this.settings = newSettings;
    // Trigger a data refresh and theme prop update by re-mounting or
    // asking the store to reload.  The simplest approach is a full re-open.
    void this.onClose().then(() => this.onOpen());
  }
}
