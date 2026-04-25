import { Plugin, WorkspaceLeaf } from "obsidian";
import {
  DEFAULT_SETTINGS,
  CampaignChronicleSettings,
  CampaignChronicleSettingTab,
} from "./settings";
import { TomeView, VIEW_TYPE_TOME } from "./views/TomeView";

export default class CampaignChroniclePlugin extends Plugin {
  settings: CampaignChronicleSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    // Register the custom Tome reading view.
    this.registerView(
      VIEW_TYPE_TOME,
      (leaf: WorkspaceLeaf) => new TomeView(leaf, this.settings)
    );

    // Ribbon icon — opens (or reveals) the Tome.
    this.addRibbonIcon("book-open", "Open Campaign Chronicle", () => {
      void this.activateTomeView();
    });

    // Command palette entry.
    this.addCommand({
      id: "open-campaign-chronicle",
      name: "Open Campaign Chronicle",
      callback: () => void this.activateTomeView(),
    });

    // Settings tab.
    this.addSettingTab(
      new CampaignChronicleSettingTab(this.app, this)
    );
  }

  onunload(): void {
    // Detach all open Tome leaves so their onClose() runs and cleans up.
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TOME);
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
    // Notify any open Tome views to reload with the new settings.
    this.app.workspace.getLeavesOfType(VIEW_TYPE_TOME).forEach((leaf) => {
      if (leaf.view instanceof TomeView) {
        leaf.view.updateSettings(this.settings);
      }
    });
  }

  /** Open or reveal the Tome view in the current workspace. */
  private async activateTomeView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_TOME);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]!);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE_TOME, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
}
