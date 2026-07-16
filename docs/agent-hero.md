# Agent Hero

The profile hero is generated as an animated SVG so it can run directly inside the GitHub README without JavaScript or external UI runtimes.

## Generate assets

```bash
node scripts/generate-agent-hero.mjs --source /absolute/path/to/portrait.jpg
```

The script produces desktop and mobile SVG assets for GitHub dark and light themes. The existing `assets/header.png` remains the stable PNG fallback in the README.

GitHub proxies README images and may keep an older SVG when its URL is reused. When publishing a visual revision, increment the filename version in both the generator and README sources instead of overwriting an already published path.

## Visual system

- Desktop assets use a compact `1180x610` console layout with a visual map and a structured system information panel.
- Mobile assets stack the portrait and information panels so the text remains legible instead of shrinking the desktop composition.
- The portrait source is a transparent PNG. The generator composites it onto white only during sampling, preserves the subject from head through torso, and converts the real silhouette with a ten-character luminance ramp plus restrained edge weighting for facial and clothing detail.
- The portrait panel uses a low-opacity ambient network layer with a sparse grid, large orbital paths, edge nodes, and a soft halo. These elements remain behind the ASCII silhouette and avoid high-frequency detail so the subject stays dominant.
- System information is grouped into identity, research direction, active builds, and profile links.

## Portrait privacy

Do not commit the original source portrait. The public repository should contain only the generated SVG assets and the existing profile fallback banner.

## Content source

The profile fields and portrait crop are intentionally maintained in `scripts/generate-agent-hero.mjs`. Keep them concise and evidence-based. The crop is tuned for a `3072x4096` transparent source portrait and should be reviewed when the source image changes. The hero is a stable identity card; activity and changing project detail remain in the README sections below it.
