import { App, TFile } from "obsidian";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionNote {
  file: TFile;
  /** Raw markdown body (no frontmatter). */
  content: string;
  /** Parsed value of the index frontmatter field. NaN means missing/invalid. */
  index: number;
  /** True when multiple notes share the same index value. */
  hasDuplicateIndex: boolean;
  /** True when the index field was absent or non-numeric. */
  isMissingIndex: boolean;
}

// ─── Core stitching function ─────────────────────────────────────────────────

/**
 * Loads all Markdown files from `folderPath`, sorts them by the specified
 * frontmatter `indexField`, and returns a `SessionNote[]` ready for rendering.
 *
 * Error-handling strategy:
 *   - Files with a missing or non-numeric index are appended at the end,
 *     sorted alphabetically by filename, and flagged with `isMissingIndex`.
 *   - Files that share an index value are all kept but flagged with
 *     `hasDuplicateIndex` so the UI can display a warning banner.
 *   - Gaps in the index sequence are silently ignored (not an error).
 */
export async function stitchSessions(
  app: App,
  folderPath: string,
  indexField: string,
  includeUnindexed: boolean
): Promise<SessionNote[]> {
  // 1. Collect all .md files directly inside the configured folder.
  const folder = app.vault.getFolderByPath(folderPath);
  if (!folder) {
    return [];
  }

  const mdFiles: TFile[] = folder.children
    .filter((child): child is TFile => child instanceof TFile)
    .filter((f) => f.extension === "md");

  if (mdFiles.length === 0) return [];

  // 2. Read each file's frontmatter and raw content.
  const notes: SessionNote[] = await Promise.all(
    mdFiles.map(async (file) => {
      const cache = app.metadataCache.getFileCache(file);
      const rawIndex = cache?.frontmatter?.[indexField];
      const index = rawIndex !== undefined ? Number(rawIndex) : NaN;

      // Strip YAML frontmatter block from content so we render pure body.
      const fullContent = await app.vault.cachedRead(file);
      const content = stripFrontmatter(fullContent);

      return {
        file,
        content,
        index,
        hasDuplicateIndex: false, // filled in below
        isMissingIndex: isNaN(index),
      } satisfies SessionNote;
    })
  );

  // 3. Find duplicate index values and flag them.
  const indexCounts = new Map<number, number>();
  for (const note of notes) {
    if (!isNaN(note.index)) {
      indexCounts.set(note.index, (indexCounts.get(note.index) ?? 0) + 1);
    }
  }
  for (const note of notes) {
    if (!isNaN(note.index) && (indexCounts.get(note.index) ?? 0) > 1) {
      note.hasDuplicateIndex = true;
    }
  }

  // 4. Sort: indexed notes first (ascending), then missing-index notes by name.
  notes.sort((a, b) => {
    const aMissing = a.isMissingIndex;
    const bMissing = b.isMissingIndex;
    if (!aMissing && !bMissing) return a.index - b.index;
    if (aMissing && !bMissing) return 1;
    if (!aMissing && bMissing) return -1;
    return a.file.name.localeCompare(b.file.name);
  });

  // 5. If not including unindexed files, drop them now.
  return includeUnindexed ? notes : notes.filter((n) => !n.isMissingIndex);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove the opening `---\n...\n---\n` YAML block from raw markdown. */
function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const closeIdx = raw.indexOf("\n---", 3);
  if (closeIdx === -1) return raw;
  // Skip past the closing `---` and any trailing newline.
  return raw.slice(closeIdx + 4).replace(/^\n/, "");
}
