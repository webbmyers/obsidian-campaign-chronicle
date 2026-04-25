import { App, PluginSettingTab, Setting } from "obsidian";
import type CampaignChroniclePlugin from "./main";

// ─── Theme definitions ───────────────────────────────────────────────────────
// Each theme is a plain id/label pair. The actual CSS is scoped to the
// [data-cc-theme="<id>"] selector in styles.css, so power users can duplicate
// and tweak a theme file without touching plugin code.
export const THEMES = [
  { id: "legacy-scroll", label: "Legacy Scroll (default)" },
] as const;

export type ThemeId = typeof THEMES[number]["id"];

// ─── Settings interface & defaults ───────────────────────────────────────────
export interface CampaignChronicleSettings {
  /** Vault-relative path to the folder containing session notes. */
  sessionFolder: string;
  /** Frontmatter key whose value is used for chronological ordering. */
  indexField: string;
  /** Active visual theme id. */
  theme: ThemeId;
  /** Whether to include notes that have no index frontmatter field. */
  includeUnindexed: boolean;
}

export const DEFAULT_SETTINGS: CampaignChronicleSettings = {
  sessionFolder: "Sessions",
  indexField: "chapter",
  theme: "legacy-scroll",
  includeUnindexed: false,
};

// ─── Settings tab ────────────────────────────────────────────────────────────
export class CampaignChronicleSettingTab extends PluginSettingTab {
  plugin: CampaignChroniclePlugin;

  constructor(app: App, plugin: CampaignChroniclePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Journal").setHeading();

    // Session folder
    new Setting(containerEl)
      .setName("Session folder")
      .setDesc(
        "Vault-relative path to the folder containing your session notes (e.g.  Sessions)."
      )
      .addText((text) =>
        text
          .setPlaceholder("Sessions")
          .setValue(this.plugin.settings.sessionFolder)
          .onChange(async (value) => {
            this.plugin.settings.sessionFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // Index / sort field
    new Setting(containerEl)
      .setName("Frontmatter field for indexing")
      .setDesc(
        "The frontmatter key used to order session notes (e.g. \"chapter\" or \"session_index\")."
      )
      .addText((text) =>
        text
          .setPlaceholder("Chapter")
          .setValue(this.plugin.settings.indexField)
          .onChange(async (value) => {
            this.plugin.settings.indexField = value.trim() || "Chapter";
            await this.plugin.saveSettings();
          })
      );

    // Include unindexed toggle
    new Setting(containerEl)
      .setName("Include unindexed notes")
      .setDesc(
        "Show notes that do not have the frontmatter field for indexing."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeUnindexed)
          .onChange(async (value) => {
            this.plugin.settings.includeUnindexed = value;
            await this.plugin.saveSettings();
          })
      );
    // Theme selector
    new Setting(containerEl)
      .setName("Theme")
      .setDesc(
        "Visual theme for the reading view. Each theme is a standalone CSS file."
      )
      .addDropdown((drop) => {
        for (const t of THEMES) {
          drop.addOption(t.id, t.label);
        }
        drop.setValue(this.plugin.settings.theme);
        drop.onChange(async (value) => {
          this.plugin.settings.theme = value as ThemeId;
          await this.plugin.saveSettings();
        });
      });

  }
}
