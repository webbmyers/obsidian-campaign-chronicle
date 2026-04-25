# Product Requirements Document: Campaign Chronicle Reader

## 1. Overview and Purpose
The Campaign Chronicle plugin is a dedicated reading environment for Obsidian. It is designed to take raw, unstyled Markdown session notes and character sheets, and present them in a highly immersive, "old book" interface. 

By separating the reading experience (display) from the underlying files (data), users can enjoy a rich, stylized "Journal" layout while keeping their Vault files clean, portable, and fully compatible with other plugins or web publishing tools (like Obsidian Publish).

## 2. Core Scope & Features
*   **Custom Reading View:** Introduces a custom Obsidian `ItemView` that renders a stylized, continuous "Journal" experience.
*   **Pop-Out Window Support:** Fully compatible with Obsidian's native pop-out windows (`app.workspace.getLeaf('window')`), allowing users to read the compiled chronicle on one view while editing raw Markdown on another.
*   **Chronological Stitching:** Parses YAML frontmatter in session notes (e.g., tracking `chapter: 1` or `next_session: "[[Session 2]]"`) to seamlessly chain multiple Markdown files together into a single, cohesive narrative flow.
*   **Immersive Theming:** Manages specific visual styling entirely within the plugin's view. This includes custom fonts ("Royal Script", "Rustic Hand"), dynamic "Parchment" and "Ink" color palettes, and tactile CSS micro-animations like page corner curls. See [Journal%20Page%20Empty%20Canvas.jpeg] as example background image and page aesthetic.
*   **Standalone Utility:** Focuses purely on data presentation and layout. It does not require any external APIs, AI integrations, or network requests.
