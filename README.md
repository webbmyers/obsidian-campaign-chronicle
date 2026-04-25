# Obsidian Campaign Chronicle

An immersive, scroll-based "Tome" reading view for your RPG session journals. This plugin transforms your raw Markdown session logs into a beautifully styled, reactive narrative experience within Obsidian.

![Tome View](./docs/assets/Journal%20Page%20Empty%20Canvas.jpeg)

## Features

- **The Tome View**: A dedicated view that renders session logs as a continuous, scrollable parchment scroll.
- **Narrative Stitching**: Automatically orders and stitches together session notes based on YAML frontmatter (e.g., session numbers, dates).
- **Immersive Aesthetics**: Custom CSS and Svelte-based UI that provides a high-fantasy, tactile feel (parchment textures, serif typography, decorative dividers).
- **Reactive Integration**: Leverages Obsidian's MetadataCache to update the view instantly when session files are modified.

## How to Use

1. **Install the Plugin**:
   - For now, manual installation is required. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-campaign-chronicle/` folder.
2. **Setup your Session Logs**:
   - Ensure your session notes have consistent frontmatter for ordering (e.g., `session: 1`).
3. **Open the Tome**:
   - Use the ribbon icon or the command palette (**Campaign Chronicle: Open Tome View**) to launch the immersive reader.

## Development

This plugin is built with **Svelte** and **Vite**.

### Prerequisites
- Node.js (v18+)
- npm

### Setup
```bash
npm install
```

### Dev Mode
Starts Vite in watch mode. Changes to `src/` will automatically rebuild `main.js` and `styles.css`.
```bash
npm run dev
```

### Build
Creates a production build.
```bash
npm run build
```

## Documentation
- [Product Requirements (PRD)](./docs/PRD.md)
- [Migration Notes](./docs/MIGRATION_NOTES.md)
- [Developer Resources](./docs/DEVELOPER_RESOURCES.md)

## License
MIT
