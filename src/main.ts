import { Plugin, WorkspaceLeaf } from "obsidian";
import {
  DEFAULT_SETTINGS,
  CampaignChronicleSettings,
  CampaignChronicleSettingTab,
} from "./settings";
import { JournalView, VIEW_TYPE_JOURNAL } from "./views/JournalView";

export default class CampaignChroniclePlugin extends Plugin {
  settings: CampaignChronicleSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Register the custom Journal reading view.
    this.registerView(
      VIEW_TYPE_JOURNAL,
      (leaf: WorkspaceLeaf) => new JournalView(leaf, this.settings)
    );

    // Ribbon icon — opens (or reveals) the Journal.
    this.addRibbonIcon("book-open", "Open journal", () => {
      void this.activateJournalView();
    });

    // Command palette entry.
    this.addCommand({
      id: "open-campaign-chronicle",
      name: "Open journal view",
      callback: () => void this.activateJournalView(),
    });

    // Settings tab.
    this.addSettingTab(
      new CampaignChronicleSettingTab(this.app, this)
    );
  }

  onunload(): void {
    // No-op. In Obsidian, we should not detach leaves in onunload
    // to preserve the user's workspace layout.
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData() as Partial<CampaignChronicleSettings>
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    // Notify any open Journal views to reload with the new settings.
    this.app.workspace.getLeavesOfType(VIEW_TYPE_JOURNAL).forEach((leaf) => {
      if (leaf.view instanceof JournalView) {
        leaf.view.updateSettings(this.settings);
      }
    });
  }

  /** Open or reveal the Journal view in the current workspace. */
  private async activateJournalView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_JOURNAL);
    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]!);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE_JOURNAL, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
}
