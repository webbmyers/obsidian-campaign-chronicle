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
  sessionFolder: "01_Sessions",
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

    containerEl.createEl("h2", { text: "Campaign Chronicle" });

    // Session folder
    new Setting(containerEl)
      .setName("Session folder")
      .setDesc(
        "Vault-relative path to the folder containing your session notes (e.g. 01_Sessions)."
      )
      .addText((text) =>
        text
          .setPlaceholder("01_Sessions")
          .setValue(this.plugin.settings.sessionFolder)
          .onChange(async (value) => {
            this.plugin.settings.sessionFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // Index / sort field
    new Setting(containerEl)
      .setName("Index frontmatter field")
      .setDesc(
        "The frontmatter key used to order session notes (e.g. chapter or session_index). " +
          "Files missing this field, or with duplicate values, will be listed last with a warning."
      )
      .addText((text) =>
        text
          .setPlaceholder("chapter")
          .setValue(this.plugin.settings.indexField)
          .onChange(async (value) => {
            this.plugin.settings.indexField = value.trim() || "chapter";
            await this.plugin.saveSettings();
          })
      );

    // Theme selector
    new Setting(containerEl)
      .setName("Theme")
      .setDesc(
        "Visual theme for the Tome. Each theme is a standalone CSS file — " +
          "power users can copy and customise them manually."
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

    // Include unindexed toggle
    new Setting(containerEl)
      .setName("Include unindexed files")
      .setDesc(
        "Show session notes that do not have the index frontmatter field. " +
          "When enabled, these files are appended at the end with a warning. " +
          "Disable to show only properly indexed notes."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeUnindexed)
          .onChange(async (value) => {
            this.plugin.settings.includeUnindexed = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
