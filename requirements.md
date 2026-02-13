# Project Requirements

## Metadata
- **Project**: Calm Visualiser - Browser Relaxation App
- **Created**: 2026-02-13
- **Author**: Developer

## Overview
A relaxing, calming fullscreen browser visualisation with animated scenes, configurable clock display (digital, analogue, sun/moon sky tracker), opacity controls, and multiple visual themes. Built as a single self-contained HTML file.

## Tasks

### TASK-001: Create base HTML page with fullscreen canvas and layout structure
- **Status**: done
- **Priority**: high
- **Dependencies**: none
- **Description**: Create `index.html` with a fullscreen canvas element, basic CSS reset, and the overlay structure for clock, settings panel, controls (settings gear + fullscreen button), and scene title element in the bottom-right corner. Wire up fullscreen toggle using the Fullscreen API. Also support pressing 'F' as a keyboard shortcut. Ensure the page fills the viewport with no scrollbars and has a dark background.

### TASK-002: Build the settings panel UI
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Create a slide-out settings panel on the left side with: (1) a 3x3 grid of theme buttons for the 9 visualisations (Watery, Sandy, Snowy, Wavey, Spacey, Colourful, Windy, Stormy, Sunny), (2) clock type selector with options for Digital, Analogue, Sun & Moon, and None, (3) a clock opacity slider (0-100%). Style with a semi-transparent dark backdrop-blur background. Add a gear icon button to toggle the panel and a close button inside. Auto-hide the controls after 3 seconds of mouse inactivity and show them again on mouse movement.

### TASK-003: Implement the animation loop and particle system framework
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Create the core `requestAnimationFrame` loop with delta-time calculation for frame-rate-independent animation. Build a reusable particle system that each theme can configure: spawn particles with custom properties, update them each frame, draw them, and recycle particles that go off-screen. Maintain a target particle count per theme. Expose a state object tracking current theme, time elapsed, and particle array. Include a function to re-initialise particles when the theme changes.

### TASK-004: Implement the Watery visualisation
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-003
- **Description**: Create the Watery theme with: deep ocean blue gradient background, translucent bubble particles that rise slowly with gentle sine-wave wobble, 4-5 layered horizontal wave curves drawn with semi-transparent fills that slowly undulate across the screen, and subtle light ray effects from the top. All movement should feel slow and calming.

### TASK-005: Implement the Sandy visualisation
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Sandy theme with: warm amber/tan/gold gradient background, tiny sand grain particles drifting slowly to the right, 3-4 smooth dune curves at the lower portion of the screen that shift slowly over time, and a subtle heat shimmer effect (thin horizontal wavy lines with very low opacity).

### TASK-006: Implement the Snowy visualisation
- **Status**: done
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Snowy theme with: soft grey-blue to white gradient background, 80-90 snowflake particles of varying sizes falling gently with slight horizontal drift that changes over time using sine-wave modulation, and a subtle snow accumulation effect at the bottom of the screen (white curved area).

### TASK-007: Implement the Wavey visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Wavey theme with: deep teal/navy gradient background, 10-12 layered flowing sine waves as the main visual element using different frequencies, amplitudes, and speeds to create a mesmerising overlapping effect. Use blues and teals with low opacity fills. Add subtle surface shimmer dots. No particles needed - the waves are the focus.

### TASK-008: Implement the Spacey visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Spacey theme with: dark navy/black radial gradient background, ~200 star particles that twinkle (oscillating opacity using sine waves at different speeds), 2-3 nebula blobs (large low-opacity radial gradients in purple/blue/pink that drift slowly), and an occasional shooting star effect (a short bright trail that appears every 8-10 seconds).

### TASK-009: Implement the Colourful visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Colourful theme with: slowly rotating rainbow hue gradient background, ~45 soft glowing circle particles in rainbow hues that drift gently (drawn as radial gradients), and 4-5 aurora-like wave layers with hue-shifting fills. All colours should shift gradually over time for a dreamy, kaleidoscopic feel.

### TASK-010: Implement the Windy visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Windy theme with: soft sky-blue gradient background, ~35 leaf-like ellipse particles that are swept across the screen from left to right with rotation and vertical wobble, wind gust effects (varying speed over time using sine waves), and flowing wind current lines (thin semi-transparent horizontal curves that show air movement direction).

### TASK-011: Implement the Stormy visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Stormy theme with: dark grey/purple gradient background, ~150 rain drop particles falling diagonally (drawn as short lines), dark cloud shapes at the top (radial gradients), and a lightning flash effect that triggers every 6-16 seconds with a brief screen-wide white overlay that fades out. Keep it atmospheric and hypnotic rather than jarring.

### TASK-012: Implement the Sunny visualisation
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-003
- **Description**: Create the Sunny theme with: warm golden radial gradient background, ~30 dust mote particles floating gently upward with subtle drift, a glowing sun positioned in the upper area with a radial glow effect, and 10-12 light rays radiating outward from the sun that slowly rotate and pulse in width/opacity.

### TASK-013: Implement the digital clock overlay
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Create a digital clock displayed centred on the screen showing HH:MM:SS format with seconds updating in real time. Use a large, light-weight sans-serif font with tabular numerals for stable width. Apply the user-configured opacity from the settings. Hide when clock type is not set to Digital.

### TASK-014: Implement the analogue clock overlay
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-001
- **Description**: Create an analogue clock rendered on a small overlay canvas (~220x220px) centred on screen. Draw: a subtle circular face with semi-transparent background, 12 hour markers (larger at 12/3/6/9), hour hand, minute hand, and a smooth sweeping second hand. Apply the user-configured opacity. Hide when clock type is not set to Analogue.

### TASK-015: Implement the Sun & Moon sky tracker clock
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-003
- **Description**: When clock type is Sun & Moon, draw a sun or moon on the main canvas that tracks across the screen in an arc to indicate the time. Daytime (6am-6pm): sun arcs from left horizon to right horizon, peaking at noon. Nighttime (6pm-6am): moon arcs similarly, peaking at midnight. Draw a subtle dotted arc path and horizon line. Add time labels (6am/noon/6pm or 6pm/midnight/6am). Sun should have a warm glow and subtle rays. Moon should have a crescent shadow and cool glow. Apply the user-configured opacity.

### TASK-016: Wire settings to state and connect all components
- **Status**: done
- **Priority**: high
- **Dependencies**: TASK-002, TASK-003, TASK-013, TASK-014, TASK-015
- **Description**: Connect the settings panel controls to the application state: theme buttons switch the active visualisation and re-initialise particles, clock type buttons switch between digital/analogue/sun-moon/none, opacity slider updates clock opacity in real time. Highlight the active button for both theme and clock type. Update the scene title text in the bottom-right corner when the theme changes. Ensure smooth transitions between themes.

### TASK-017: Add scene title display in bottom-right corner
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-001
- **Description**: Show the name of the currently active visualisation (e.g. "Watery", "Spacey") in the bottom-right corner of the screen using semi-transparent text (~18% opacity) so it's visible but not distracting. Use a light font weight, lowercase, with subtle letter spacing. Update it whenever the theme changes.

### TASK-018: Final polish, testing, and cross-browser check
- **Status**: pending
- **Priority**: medium
- **Dependencies**: TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-016, TASK-017
- **Description**: Test all 9 visualisations to ensure they render correctly and feel calming. Verify all 3 clock modes work with opacity control. Test fullscreen mode. Handle window resize gracefully (re-calculate canvas dimensions). Ensure the settings panel opens/closes smoothly and auto-hides controls work. Check keyboard shortcuts (F for fullscreen, Escape to close settings). Fix any visual glitches or performance issues.
