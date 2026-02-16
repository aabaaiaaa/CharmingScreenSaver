# Calm Visualiser

A relaxing, full-screen ambient visualiser with 73 animated themes across 10 categories, multiple clock styles, and smooth cross-fade transitions. No external dependencies.

![Screenshot](images/screenshot.png)

## Features

- **73 Animated Themes** across 10 categories — from serene nature scenes to cosmic black holes
- **Auto Cycle** — Rotate through themes with three modes: Sequential, Random, or Category (10s–5min interval)
- **3 Clock Styles** — Digital, Analogue, and Sun & Moon, or hide the clock entirely
- **Adjustable Clock Opacity** — Slider to blend the clock into the background
- **Fullscreen Mode** — Immersive viewing with a single click or press `F`
- **Smooth Transitions** — Cross-fade effect when switching between themes
- **Scene Title** — Current theme name displayed subtly in the bottom-right corner
- **Collapsible Categories** — Theme categories collapse/expand in the settings panel
- **Persistent Settings** — Theme, clock, opacity, and auto-cycle preferences saved to localStorage
- **Zero Dependencies** — Pure HTML, CSS, and vanilla JavaScript

## Theme Categories

| Category | Themes | Description |
|---|---|---|
| **Theme** | Watery, Sandy, Snowy, Wavey, Spacey, Colourful, Windy, Stormy, Sunny | Classic ambient scenes |
| **Solar System** | Mercurial, Venusian, Martian, Jovian, Saturnine, Neptunian, Europan, Titanesque, Ionian, Enceladean, Tritonian | Planets and moons of our solar system |
| **Deep Sea** | Abyssal, Coraline | Ocean depths and coral reefs |
| **Sky** | Auroral, Twilight, Misty | Atmospheric and celestial |
| **Abstract** | Crystalline, Embers, Inkwell | Artistic and geometric |
| **Exotic** | Pulsar, Nebular, Binary | Astrophysical phenomena |
| **Landscapes** | Volcanic, Cavern, Arctic | Earthly terrains |
| **Journey** | Drifting, Soaring, Cruising, Tunnelling, Coasting, Diving, Ascending, Wandering, Sailing, Streaming, Voyager, Odyssey, Genesis, Spelunker, Freefall, Timeline, Apollo | Motion and exploration |
| **Cataclysmic** | Supernova, Maelstrom, Earthquake, Erupting, Tornado, Avalanche, Meteor, Tsunami, Bolts, Solar Flare | Dramatic natural forces |
| **Black Holes** | Singularity, Orbiting, Accreting, Collapsing, Lensing, Spaghettified, Wormhole, Tidal Locked, Hawking, Jettison, Merging, Event Horizon | Gravitational extremes |

## Usage

Open `index.html` in any modern browser. That's it.

### Controls

| Action | How |
|---|---|
| Open settings | Click the gear icon (top-left) |
| Toggle fullscreen | Click the fullscreen button or press **F** |
| Close settings | Click **×** or press **Escape** |
| Switch theme | Click a theme in the settings panel |
| Expand/collapse categories | Click a category label in settings |
| Auto cycle themes | Toggle "Auto Cycle" on, choose a mode, and adjust the interval |

### Keyboard Shortcuts

- **F** — Toggle fullscreen
- **Escape** — Close settings panel

## Project Structure

```
index.html              Main page (HTML + CSS)
js/
  core.js               Engine, clock, settings, and auto-cycle logic
  themes/
    theme.js            Classic themes (Watery, Sandy, Snowy, etc.)
    solar-system.js     Solar System themes
    deep-sea.js         Deep Sea themes
    sky.js              Sky themes
    abstract.js         Abstract themes
    exotic.js           Exotic themes
    landscapes.js       Landscapes themes
    journey.js          Journey themes
    journey-epic.js     Journey themes (continued)
    cataclysmic.js      Cataclysmic themes
    black-holes.js      Black Holes themes
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari). Uses the Canvas API for rendering and `localStorage` for preferences.

## Licence

This project is provided as-is for personal use and experimentation.
