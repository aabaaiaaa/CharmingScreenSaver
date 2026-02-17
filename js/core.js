        (function () {
            // --- Namespace ---
            var CV = window.CV = {};

            // --- Named constants ---
            const HIDE_TIMEOUT = 3000;
            const TRANSITION_DURATION = 0.8;
            const ARC_SEGMENTS = 100;
            const FALLBACK_DT = 0.016;
            const MAX_DT = 0.1;
            const SHOOTING_STAR_INTERVAL_MIN = 8;
            const SHOOTING_STAR_INTERVAL_RANGE = 2;
            const LIGHTNING_INTERVAL_MIN = 6;
            const LIGHTNING_INTERVAL_RANGE = 10;
            const SHOOTING_STAR_TRAIL_MAX = 20;

            // Expose constants needed by theme files
            CV.FALLBACK_DT = FALLBACK_DT;
            CV.SHOOTING_STAR_INTERVAL_MIN = SHOOTING_STAR_INTERVAL_MIN;
            CV.SHOOTING_STAR_INTERVAL_RANGE = SHOOTING_STAR_INTERVAL_RANGE;
            CV.SHOOTING_STAR_TRAIL_MAX = SHOOTING_STAR_TRAIL_MAX;
            CV.LIGHTNING_INTERVAL_MIN = LIGHTNING_INTERVAL_MIN;
            CV.LIGHTNING_INTERVAL_RANGE = LIGHTNING_INTERVAL_RANGE;

            // Theme registry (shared with theme files)
            CV.themes = {};

            const THEME_NAMES = ['watery', 'sandy', 'snowy', 'wavey', 'spacey', 'colourful', 'windy', 'stormy', 'sunny', 'mercurial', 'venusian', 'martian', 'jovian', 'saturnine', 'neptunian', 'europan', 'titanesque', 'ionian', 'enceladean', 'tritonian', 'abyssal', 'coraline', 'auroral', 'twilight', 'misty', 'crystalline', 'embers', 'inkwell', 'pulsar', 'nebular', 'binary', 'volcanic', 'cavern', 'arctic', 'drifting', 'soaring', 'cruising', 'tunnelling', 'coasting', 'diving', 'ascending', 'wandering', 'sailing', 'streaming', 'voyager', 'odyssey', 'genesis', 'spelunker', 'freefall', 'timeline', 'apollo', 'supernova', 'maelstrom', 'earthquake', 'erupting', 'tornado', 'avalanche', 'meteor', 'tsunami', 'bolts', 'solarflare', 'singularity', 'orbiting', 'accreting', 'collapsing', 'lensing', 'spaghettified', 'wormhole', 'tidallocked', 'hawking', 'jettison', 'merging', 'eventhorizon', 'meadow', 'coast', 'cityscape', 'forest', 'mountain', 'lake', 'desert', 'harbour', 'garden', 'wheatfield'];

            const THEME_CATEGORIES = {
                'Theme': ['watery', 'sandy', 'snowy', 'wavey', 'spacey', 'colourful', 'windy', 'stormy', 'sunny'],
                'Solar System': ['mercurial', 'venusian', 'martian', 'jovian', 'saturnine', 'neptunian', 'europan', 'titanesque', 'ionian', 'enceladean', 'tritonian'],
                'Deep Sea': ['abyssal', 'coraline'],
                'Sky': ['auroral', 'twilight', 'misty'],
                'Abstract': ['crystalline', 'embers', 'inkwell'],
                'Exotic': ['pulsar', 'nebular', 'binary'],
                'Landscapes': ['volcanic', 'cavern', 'arctic'],
                'Journey': ['drifting', 'soaring', 'cruising', 'tunnelling', 'coasting', 'diving', 'ascending', 'wandering', 'sailing', 'streaming', 'voyager', 'odyssey', 'genesis', 'spelunker', 'freefall', 'timeline', 'apollo'],
                'Cataclysmic': ['supernova', 'maelstrom', 'earthquake', 'erupting', 'tornado', 'avalanche', 'meteor', 'tsunami', 'bolts', 'solarflare'],
                'Black Holes': ['singularity', 'orbiting', 'accreting', 'collapsing', 'lensing', 'spaghettified', 'wormhole', 'tidallocked', 'hawking', 'jettison', 'merging', 'eventhorizon'],
                'Diurnal': ['meadow', 'coast', 'cityscape', 'forest', 'mountain', 'lake', 'desert', 'harbour', 'garden', 'wheatfield']
            };
            const THEME_TO_CATEGORY = {};
            (function () {
                var cats = Object.keys(THEME_CATEGORIES);
                for (var i = 0; i < cats.length; i++) {
                    var arr = THEME_CATEGORIES[cats[i]];
                    for (var j = 0; j < arr.length; j++) {
                        THEME_TO_CATEGORY[arr[j]] = cats[i];
                    }
                }
            })();

            // --- Canvas setup ---
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            resizeCanvas();

            // --- Fullscreen toggle ---
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(function () {});
                } else {
                    document.exitFullscreen().catch(function () {});
                }
            }

            document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

            // --- Settings panel & controls ---
            const controls = document.getElementById('controls');
            const settingsPanel = document.getElementById('settings-panel');
            const btnSettings = document.getElementById('btn-settings');
            const btnCloseSettings = document.getElementById('btn-close-settings');
            let hideTimeout = null;

            // --- Application state (moved before first usage) ---
            const state = {
                currentTheme: 'watery',
                timeElapsed: 0,
                particles: [],
                clockType: 'digital',
                clockOpacity: 0.7,
                autoCycle: false,
                cycleMode: 'sequential',
                cycleInterval: 30,
                cycleTimer: 0,
                frameDate: null,
                _lastDayTrackerPeriod: null
            };

            // Expose state for theme access
            CV.state = state;

            // Transition state for smooth cross-fade between themes
            const transition = {
                active: false,
                progress: 0,
                duration: TRANSITION_DURATION,
                snapshotCanvas: null
            };

            function showControls() {
                controls.classList.remove('hidden');
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(function () {
                    if (!settingsPanel.classList.contains('open')) {
                        controls.classList.add('hidden');
                    }
                }, HIDE_TIMEOUT);
            }

            function openSettings() {
                settingsPanel.classList.add('open');
                controls.classList.remove('hidden');
                clearTimeout(hideTimeout);
                // Focus the close button when settings opens
                btnCloseSettings.focus();
            }

            function closeSettings() {
                settingsPanel.classList.remove('open');
                showControls();
                // Return focus to the settings gear button
                btnSettings.focus();
            }

            btnSettings.addEventListener('click', function () {
                if (settingsPanel.classList.contains('open')) {
                    closeSettings();
                } else {
                    openSettings();
                }
            });

            btnCloseSettings.addEventListener('click', closeSettings);

            // --- Consolidated keydown listener (F + Escape) ---
            document.addEventListener('keydown', function (e) {
                if (e.key === 'f' || e.key === 'F') {
                    // Don't trigger if the user is typing in an input or settings panel is open
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                    if (settingsPanel.classList.contains('open')) return;
                    toggleFullscreen();
                }
                if (e.key === 'Escape' && settingsPanel.classList.contains('open')) {
                    closeSettings();
                }
            });

            // --- Focus trap for settings panel ---
            settingsPanel.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab') return;
                const focusable = settingsPanel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            });

            // --- Collapsible theme sections ---
            document.querySelectorAll('.settings-section.collapsible > .settings-label').forEach(function (label) {
                label.addEventListener('click', function () {
                    label.parentElement.classList.toggle('collapsed');
                });
            });

            // --- Theme buttons ---
            const themeBtns = document.querySelectorAll('.theme-btn');
            const sceneTitle = document.getElementById('scene-title');

            function expandSectionForTheme(themeName) {
                var btn = Array.from(themeBtns).find(function (b) { return b.dataset.theme === themeName; });
                if (btn) {
                    var section = btn.closest('.settings-section.collapsible');
                    if (section) section.classList.remove('collapsed');
                }
            }

            function switchTheme(themeName) {
                if (themeName === state.currentTheme) return;
                state.cycleTimer = 0;

                // Capture snapshot of current frame into offscreen canvas for cross-fade
                try {
                    const snap = document.createElement('canvas');
                    snap.width = canvas.width;
                    snap.height = canvas.height;
                    snap.getContext('2d').drawImage(canvas, 0, 0);
                    transition.snapshotCanvas = snap;
                    transition.active = true;
                    transition.progress = 0;
                } catch (e) {
                    transition.active = false;
                }

                // Update active button highlight
                themeBtns.forEach(function (b) { b.classList.remove('active'); });
                const targetBtn = Array.from(themeBtns).find(function (b) { return b.dataset.theme === themeName; });
                if (targetBtn) targetBtn.classList.add('active');

                // Expand the category containing the new theme
                expandSectionForTheme(themeName);

                // Update scene title
                sceneTitle.textContent = themeName;

                // Re-initialise particles for the new theme
                reinitialiseParticles(themeName);

                savePreferences();
            }

            themeBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    switchTheme(btn.dataset.theme);
                });
            });

            // --- Clock type buttons ---
            const clockTypeBtns = document.querySelectorAll('[data-clock]');

            clockTypeBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    clockTypeBtns.forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    state.clockType = btn.dataset.clock;
                    const now = new Date();
                    updateDigitalClock(now);
                    updateAnalogueClock(now);
                    savePreferences();
                });
            });

            // --- Clock opacity slider ---
            const opacitySlider = document.getElementById('clock-opacity');
            const opacityValue = document.getElementById('opacity-value');

            opacitySlider.addEventListener('input', function () {
                const val = parseInt(opacitySlider.value, 10);
                opacityValue.textContent = val + '%';
                state.clockOpacity = val / 100;
                const now = new Date();
                updateDigitalClock(now);
                updateAnalogueClock(now);
                savePreferences();
            });

            // --- Auto-cycle controls ---
            const btnAutoCycle = document.getElementById('btn-auto-cycle');
            const cycleModeRow = document.getElementById('cycle-mode-row');
            const cycleIntervalRow = document.getElementById('cycle-interval-row');
            const cycleIntervalSlider = document.getElementById('cycle-interval');
            const cycleIntervalValue = document.getElementById('cycle-interval-value');
            const cycleModeBtns = document.querySelectorAll('[data-cycle-mode]');

            btnAutoCycle.addEventListener('click', function () {
                state.autoCycle = !state.autoCycle;
                state.cycleTimer = 0;
                state._lastDayTrackerPeriod = null;
                btnAutoCycle.textContent = state.autoCycle ? 'On' : 'Off';
                if (state.autoCycle) {
                    btnAutoCycle.classList.add('active');
                } else {
                    btnAutoCycle.classList.remove('active');
                }
                cycleModeRow.style.display = state.autoCycle ? '' : 'none';
                cycleIntervalRow.style.display = (state.autoCycle && state.cycleMode !== 'daytracker') ? '' : 'none';
                savePreferences();
            });

            cycleModeBtns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    cycleModeBtns.forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    state.cycleMode = btn.dataset.cycleMode;
                    state.cycleTimer = 0;
                    state._lastDayTrackerPeriod = null;
                    // Hide interval slider for Day Tracker (switching is time-based)
                    cycleIntervalRow.style.display = (state.cycleMode === 'daytracker') ? 'none' : '';
                    savePreferences();
                });
            });

            cycleIntervalSlider.addEventListener('input', function () {
                state.cycleInterval = parseInt(cycleIntervalSlider.value, 10);
                cycleIntervalValue.textContent = state.cycleInterval + 's';
                state.cycleTimer = 0;
                savePreferences();
            });

            // --- Digital clock ---
            const digitalClockEl = document.getElementById('digital-clock');

            function updateDigitalClock(now) {
                if (state.clockType !== 'digital') {
                    digitalClockEl.style.display = 'none';
                    return;
                }
                digitalClockEl.style.display = '';
                digitalClockEl.style.opacity = state.clockOpacity;

                now = now || new Date();
                const h = String(now.getHours()).padStart(2, '0');
                const m = String(now.getMinutes()).padStart(2, '0');
                const s = String(now.getSeconds()).padStart(2, '0');
                digitalClockEl.textContent = h + ':' + m + ':' + s;
            }

            // --- Analogue clock ---
            const analogueClockEl = document.getElementById('analogue-clock');
            const analogueCtx = analogueClockEl.getContext('2d');
            // Canvas is 800x800 (2x for sharpness), displayed at 400x400 via CSS
            const ACLOCK_SIZE = 800;
            const ACLOCK_CENTER = ACLOCK_SIZE / 2;
            const ACLOCK_RADIUS = ACLOCK_SIZE / 2 - 20;

            function updateAnalogueClock(now) {
                if (state.clockType !== 'analogue') {
                    analogueClockEl.style.display = 'none';
                    return;
                }
                analogueClockEl.style.display = 'block';
                analogueClockEl.style.opacity = state.clockOpacity;

                const c = analogueCtx;
                const cx = ACLOCK_CENTER;
                const cy = ACLOCK_CENTER;
                const r = ACLOCK_RADIUS;

                // Clear
                c.clearRect(0, 0, ACLOCK_SIZE, ACLOCK_SIZE);

                // Semi-transparent circular face
                c.beginPath();
                c.arc(cx, cy, r, 0, Math.PI * 2);
                c.fillStyle = 'rgba(0, 0, 0, 0.25)';
                c.fill();
                c.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                c.lineWidth = 2;
                c.stroke();

                // Hour markers
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI / 6) - Math.PI / 2;
                    const isMajor = (i % 3 === 0);
                    const markerLen = isMajor ? 22 : 12;
                    const markerWidth = isMajor ? 3 : 1.5;
                    const outerX = cx + Math.cos(angle) * (r - 8);
                    const outerY = cy + Math.sin(angle) * (r - 8);
                    const innerX = cx + Math.cos(angle) * (r - 8 - markerLen);
                    const innerY = cy + Math.sin(angle) * (r - 8 - markerLen);

                    c.beginPath();
                    c.moveTo(outerX, outerY);
                    c.lineTo(innerX, innerY);
                    c.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)';
                    c.lineWidth = markerWidth;
                    c.lineCap = 'round';
                    c.stroke();
                }

                // Current time
                now = now || new Date();
                const hours = now.getHours() % 12;
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const millis = now.getMilliseconds();

                // Tick second angle (discrete steps, no millisecond interpolation)
                const secAngle = (seconds / 60) * Math.PI * 2 - Math.PI / 2;
                const minAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
                const hrAngle = ((hours + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;

                // Hour hand
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + Math.cos(hrAngle) * (r * 0.5), cy + Math.sin(hrAngle) * (r * 0.5));
                c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                c.lineWidth = 6;
                c.lineCap = 'round';
                c.stroke();

                // Minute hand
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + Math.cos(minAngle) * (r * 0.72), cy + Math.sin(minAngle) * (r * 0.72));
                c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                c.lineWidth = 4;
                c.lineCap = 'round';
                c.stroke();

                // Second hand (sweeping)
                c.beginPath();
                c.moveTo(cx - Math.cos(secAngle) * (r * 0.12), cy - Math.sin(secAngle) * (r * 0.12));
                c.lineTo(cx + Math.cos(secAngle) * (r * 0.82), cy + Math.sin(secAngle) * (r * 0.82));
                c.strokeStyle = 'rgba(220, 80, 80, 0.8)';
                c.lineWidth = 2;
                c.lineCap = 'round';
                c.stroke();

                // Centre dot
                c.beginPath();
                c.arc(cx, cy, 5, 0, Math.PI * 2);
                c.fillStyle = 'rgba(255, 255, 255, 0.9)';
                c.fill();
            }

            // --- Sun & Moon sky tracker clock ---
            function drawSunMoonClock(ctx, w, h, now) {
                if (state.clockType !== 'sunmoon') return;

                const opacity = state.clockOpacity;
                if (opacity <= 0) return;

                now = now || new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const totalMinutes = hours * 60 + minutes + seconds / 60;

                // Determine if daytime (6am-6pm) or nighttime (6pm-6am)
                const isDaytime = (hours >= 6 && hours < 18);

                // Calculate progress (0 to 1) within the current period
                let progress;
                if (isDaytime) {
                    // 6:00 = 360 min, 18:00 = 1080 min; range = 720 min
                    progress = (totalMinutes - 360) / 720;
                } else {
                    // Nighttime wraps: 18:00 (1080) to 6:00 (360 next day)
                    if (totalMinutes >= 1080) {
                        progress = (totalMinutes - 1080) / 720;
                    } else {
                        progress = (totalMinutes + 1440 - 1080) / 720;
                    }
                }
                progress = Math.max(0, Math.min(1, progress));

                // Arc geometry
                const margin = w * 0.08;
                const arcLeft = margin;
                const arcRight = w - margin;
                const arcWidth = arcRight - arcLeft;
                const horizonY = h * 0.72;
                const peakHeight = h * 0.38; // how high the arc peaks above horizon

                // Position on the arc: angle goes from PI to 0 (left to right)
                const angle = Math.PI * (1 - progress);
                const celestialX = arcLeft + arcWidth * progress;
                const celestialY = horizonY - Math.sin(angle) * peakHeight;

                ctx.save();
                ctx.globalAlpha = opacity;

                // --- Draw the dotted arc path ---
                ctx.beginPath();
                ctx.setLineDash([4, 8]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= ARC_SEGMENTS; i++) {
                    const t = i / ARC_SEGMENTS;
                    const a = Math.PI * (1 - t);
                    const px = arcLeft + arcWidth * t;
                    const py = horizonY - Math.sin(a) * peakHeight;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
                ctx.setLineDash([]);

                // --- Draw the horizon line ---
                ctx.beginPath();
                ctx.moveTo(arcLeft - 20, horizonY);
                ctx.lineTo(arcRight + 20, horizonY);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // --- Time labels ---
                ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                const labelY = horizonY + 10;
                const labelAlpha = 0.35;

                if (isDaytime) {
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + labelAlpha + ')';
                    ctx.fillText('6am', arcLeft, labelY);
                    ctx.fillText('noon', arcLeft + arcWidth * 0.5, labelY);
                    ctx.fillText('6pm', arcRight, labelY);
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + labelAlpha + ')';
                    ctx.fillText('6pm', arcLeft, labelY);
                    ctx.fillText('midnight', arcLeft + arcWidth * 0.5, labelY);
                    ctx.fillText('6am', arcRight, labelY);
                }

                // --- Draw the sun or moon ---
                if (isDaytime) {
                    // Sun: warm glow + rays
                    const sunRadius = Math.min(w, h) * 0.028;

                    // Outer glow
                    const glowGrad = ctx.createRadialGradient(celestialX, celestialY, sunRadius * 0.5, celestialX, celestialY, sunRadius * 5);
                    glowGrad.addColorStop(0, 'rgba(255, 200, 50, 0.25)');
                    glowGrad.addColorStop(0.3, 'rgba(255, 180, 40, 0.1)');
                    glowGrad.addColorStop(1, 'rgba(255, 160, 30, 0)');
                    ctx.beginPath();
                    ctx.arc(celestialX, celestialY, sunRadius * 5, 0, Math.PI * 2);
                    ctx.fillStyle = glowGrad;
                    ctx.fill();

                    // Subtle rays
                    const rayCount = 12;
                    const t = state.timeElapsed;
                    for (let i = 0; i < rayCount; i++) {
                        const rayAngle = (i / rayCount) * Math.PI * 2 + t * 0.08;
                        const rayInner = sunRadius * 1.3;
                        const rayOuter = sunRadius * 2.2 + Math.sin(t * 0.5 + i * 1.1) * sunRadius * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(
                            celestialX + Math.cos(rayAngle) * rayInner,
                            celestialY + Math.sin(rayAngle) * rayInner
                        );
                        ctx.lineTo(
                            celestialX + Math.cos(rayAngle) * rayOuter,
                            celestialY + Math.sin(rayAngle) * rayOuter
                        );
                        ctx.strokeStyle = 'rgba(255, 210, 80, 0.3)';
                        ctx.lineWidth = 2;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }

                    // Sun body
                    const sunGrad = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, sunRadius);
                    sunGrad.addColorStop(0, 'rgba(255, 240, 180, 1)');
                    sunGrad.addColorStop(0.6, 'rgba(255, 200, 60, 1)');
                    sunGrad.addColorStop(1, 'rgba(255, 170, 30, 0.9)');
                    ctx.beginPath();
                    ctx.arc(celestialX, celestialY, sunRadius, 0, Math.PI * 2);
                    ctx.fillStyle = sunGrad;
                    ctx.fill();
                } else {
                    // Moon: cool glow + crescent shadow
                    const moonRadius = Math.min(w, h) * 0.026;

                    // Cool glow
                    const moonGlowGrad = ctx.createRadialGradient(celestialX, celestialY, moonRadius * 0.5, celestialX, celestialY, moonRadius * 4.5);
                    moonGlowGrad.addColorStop(0, 'rgba(180, 200, 255, 0.2)');
                    moonGlowGrad.addColorStop(0.3, 'rgba(150, 180, 240, 0.08)');
                    moonGlowGrad.addColorStop(1, 'rgba(120, 150, 220, 0)');
                    ctx.beginPath();
                    ctx.arc(celestialX, celestialY, moonRadius * 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = moonGlowGrad;
                    ctx.fill();

                    // Moon body (light disc) with crescent shadow
                    // Clip to moon circle, then draw body + shadow
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(celestialX, celestialY, moonRadius, 0, Math.PI * 2);
                    ctx.clip();

                    // Fill the full moon body
                    const moonBodyGrad = ctx.createRadialGradient(celestialX, celestialY, 0, celestialX, celestialY, moonRadius);
                    moonBodyGrad.addColorStop(0, 'rgba(230, 235, 255, 1)');
                    moonBodyGrad.addColorStop(0.7, 'rgba(210, 220, 245, 1)');
                    moonBodyGrad.addColorStop(1, 'rgba(190, 200, 235, 0.9)');
                    ctx.beginPath();
                    ctx.arc(celestialX, celestialY, moonRadius, 0, Math.PI * 2);
                    ctx.fillStyle = moonBodyGrad;
                    ctx.fill();

                    // Crescent shadow (dark circle offset to the upper-right, clipped to moon)
                    ctx.beginPath();
                    ctx.arc(celestialX + moonRadius * 0.5, celestialY - moonRadius * 0.15, moonRadius * 0.78, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(15, 20, 45, 0.9)';
                    ctx.fill();
                    ctx.restore();
                }

                ctx.restore();
            }

            // Initial clock render
            const initDate = new Date();
            updateDigitalClock(initDate);
            updateAnalogueClock(initDate);

            document.addEventListener('mousemove', showControls);
            document.addEventListener('mousedown', showControls);
            document.addEventListener('touchstart', showControls);

            // Start the initial hide timer
            showControls();

            // --- Theme configurations ---
            // Local alias so all internal references to themes work unchanged
            var themes = CV.themes;

            // Default/placeholder theme configuration
            function getDefaultThemeConfig() {
                return {
                    targetCount: 0,
                    // Create a single particle with custom properties
                    spawn: function (w, h) {
                        return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0 };
                    },
                    // Update a particle each frame; return false to recycle it
                    update: function (p, dt, w, h, state) {
                        return true;
                    },
                    // Draw a single particle
                    draw: function (p, ctx, state) {},
                    // Draw the scene background/effects (called before particles)
                    drawBackground: function (ctx, w, h, state) {
                        ctx.fillStyle = '#0a0a0f';
                        ctx.fillRect(0, 0, w, h);
                    },
                    // Draw foreground effects (called after particles)
                    drawForeground: function (ctx, w, h, state) {},
                    // Optional activation callback
                    onActivate: null
                };
            }

            // Get the active theme config, falling back to defaults
            function getThemeConfig(themeName) {
                const config = themes[themeName] || {};
                const defaults = getDefaultThemeConfig();
                return {
                    targetCount: config.targetCount !== undefined ? config.targetCount : defaults.targetCount,
                    spawn: config.spawn || defaults.spawn,
                    update: config.update || defaults.update,
                    draw: config.draw || defaults.draw,
                    drawBackground: config.drawBackground || defaults.drawBackground,
                    drawForeground: config.drawForeground || defaults.drawForeground,
                    onActivate: config.onActivate || null,
                    cycleDuration: config.cycleDuration || 0
                };
            }

            // --- Particle system ---

            // Cached theme config - rebuilt only on theme switch
            let cachedThemeConfig = null;

            // Spawn particles up to the theme's target count
            function spawnParticles() {
                const config = cachedThemeConfig;
                const target = config.targetCount;
                const w = canvas.width;
                const h = canvas.height;
                const particles = [];
                for (let i = 0; i < target; i++) {
                    particles.push(config.spawn(w, h));
                }
                return particles;
            }

            // Update all particles; recycle any that are off-screen or flagged
            function updateParticles(dt) {
                const config = cachedThemeConfig;
                const w = canvas.width;
                const h = canvas.height;
                const particles = state.particles;

                for (let i = 0; i < particles.length; i++) {
                    const alive = config.update(particles[i], dt, w, h, state);
                    if (!alive) {
                        // Recycle: replace with a fresh particle
                        particles[i] = config.spawn(w, h);
                    }
                }

                // Maintain target count (add if below, trim if above)
                const target = config.targetCount;
                while (particles.length < target) {
                    particles.push(config.spawn(w, h));
                }
                if (particles.length > target) {
                    particles.length = target;
                }
            }

            // Draw all particles
            function drawParticles() {
                const config = cachedThemeConfig;
                for (let i = 0; i < state.particles.length; i++) {
                    config.draw(state.particles[i], ctx, state);
                }
            }

            // Re-initialise particles for a new theme
            function reinitialiseParticles(themeName, preserveTime) {
                state.currentTheme = themeName;
                if (!preserveTime) state.timeElapsed = 0;
                cachedThemeConfig = getThemeConfig(themeName);
                // Reset stale timers for themes with periodic effects
                if (cachedThemeConfig.onActivate) cachedThemeConfig.onActivate();
                state.particles = spawnParticles();
            }

            // --- Animation loop ---
            let lastTimestamp = 0;

            function animate(timestamp) {
                requestAnimationFrame(animate);

                // Delta time in seconds, capped to avoid jumps
                const dt = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, MAX_DT) : FALLBACK_DT;
                lastTimestamp = timestamp;

                state.timeElapsed += dt;

                if (state.autoCycle) {
                    if (state.cycleMode === 'daytracker') {
                        // Day Tracker: switch theme based on current time period
                        if (CV.diurnal) {
                            var timeData = CV.diurnal.getTimeData(new Date());
                            if (timeData.period !== state._lastDayTrackerPeriod) {
                                state._lastDayTrackerPeriod = timeData.period;
                                var dtTheme = CV.diurnal.getThemeForPeriod(timeData.period);
                                if (dtTheme !== state.currentTheme) {
                                    switchTheme(dtTheme);
                                }
                            }
                        }
                    } else {
                        state.cycleTimer += dt;
                        var effectiveInterval = cachedThemeConfig.cycleDuration > 0
                            ? Math.max(state.cycleInterval, cachedThemeConfig.cycleDuration)
                            : state.cycleInterval;
                        if (state.cycleTimer >= effectiveInterval) {
                            state.cycleTimer = 0;
                            var nextTheme;
                            if (state.cycleMode === 'random') {
                                do { nextTheme = THEME_NAMES[Math.floor(Math.random() * THEME_NAMES.length)]; }
                                while (nextTheme === state.currentTheme && THEME_NAMES.length > 1);
                            } else if (state.cycleMode === 'category') {
                                var cat = THEME_TO_CATEGORY[state.currentTheme];
                                var catThemes = THEME_CATEGORIES[cat] || THEME_NAMES;
                                var idx = catThemes.indexOf(state.currentTheme);
                                nextTheme = catThemes[(idx + 1) % catThemes.length];
                            } else {
                                var idx = THEME_NAMES.indexOf(state.currentTheme);
                                nextTheme = THEME_NAMES[(idx + 1) % THEME_NAMES.length];
                            }
                            switchTheme(nextTheme);
                        }
                    }
                }

                const w = canvas.width;
                const h = canvas.height;
                const config = cachedThemeConfig;

                // Draw background
                config.drawBackground(ctx, w, h, state);

                // Update and draw particles
                updateParticles(dt);
                drawParticles();

                // Draw foreground effects
                config.drawForeground(ctx, w, h, state, dt);

                // Scene duration progress bar
                if (config.cycleDuration > 0) {
                    var progress = (state.timeElapsed % config.cycleDuration) / config.cycleDuration;
                    var barH = 3;
                    var barY = h - barH;
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.fillRect(0, barY, w, barH);
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(0, barY, w * progress, barH);
                }

                // Cross-fade transition overlay (old frame fading out)
                if (transition.active) {
                    transition.progress += dt / transition.duration;
                    if (transition.progress >= 1) {
                        transition.active = false;
                        transition.snapshotCanvas = null;
                    } else if (transition.snapshotCanvas) {
                        ctx.save();
                        ctx.globalAlpha = 1 - transition.progress;
                        ctx.drawImage(transition.snapshotCanvas, 0, 0);
                        ctx.restore();
                    }
                }

                // Share a single Date object per frame
                const frameDate = new Date();
                state.frameDate = frameDate;

                // Draw Sun & Moon clock on the main canvas
                drawSunMoonClock(ctx, w, h, frameDate);

                // Update clock overlays
                updateDigitalClock(frameDate);
                updateAnalogueClock(frameDate);
            }

            // --- Handle window resize: consolidated single handler ---
            window.addEventListener('resize', function () {
                resizeCanvas();
                transition.active = false;
                transition.snapshotCanvas = null;
                reinitialiseParticles(state.currentTheme, true);
            });

            // --- localStorage persistence ---
            function savePreferences() {
                try {
                    localStorage.setItem('calmVisualiser_theme', state.currentTheme);
                    localStorage.setItem('calmVisualiser_clockType', state.clockType);
                    localStorage.setItem('calmVisualiser_clockOpacity', String(state.clockOpacity));
                    localStorage.setItem('calmVisualiser_autoCycle', state.autoCycle ? 'true' : 'false');
                    localStorage.setItem('calmVisualiser_cycleMode', state.cycleMode);
                    localStorage.setItem('calmVisualiser_cycleInterval', String(state.cycleInterval));
                } catch (e) {
                    // localStorage may be unavailable
                }
            }

            function loadPreferences() {
                try {
                    const savedTheme = localStorage.getItem('calmVisualiser_theme');
                    const savedClockType = localStorage.getItem('calmVisualiser_clockType');
                    const savedOpacity = localStorage.getItem('calmVisualiser_clockOpacity');

                    if (savedTheme && themes[savedTheme]) {
                        themeBtns.forEach(function (b) { b.classList.remove('active'); });
                        const targetBtn = Array.from(themeBtns).find(function (b) { return b.dataset.theme === savedTheme; });
                        if (targetBtn) targetBtn.classList.add('active');
                        expandSectionForTheme(savedTheme);
                        sceneTitle.textContent = savedTheme;
                        state.currentTheme = savedTheme;
                    }

                    if (savedClockType) {
                        clockTypeBtns.forEach(function (b) { b.classList.remove('active'); });
                        const targetBtn = Array.from(clockTypeBtns).find(function (b) { return b.dataset.clock === savedClockType; });
                        if (targetBtn) targetBtn.classList.add('active');
                        state.clockType = savedClockType;
                    }

                    if (savedOpacity !== null) {
                        const val = parseFloat(savedOpacity);
                        if (!isNaN(val)) {
                            state.clockOpacity = val;
                            opacitySlider.value = String(Math.round(val * 100));
                            opacityValue.textContent = Math.round(val * 100) + '%';
                        }
                    }

                    const savedAutoCycle = localStorage.getItem('calmVisualiser_autoCycle');
                    const savedCycleInterval = localStorage.getItem('calmVisualiser_cycleInterval');

                    if (savedAutoCycle === 'true') {
                        state.autoCycle = true;
                        btnAutoCycle.textContent = 'On';
                        btnAutoCycle.classList.add('active');
                        cycleModeRow.style.display = '';
                        // Will be re-evaluated after cycleMode is loaded below
                        cycleIntervalRow.style.display = '';
                    }

                    var savedCycleMode = localStorage.getItem('calmVisualiser_cycleMode');
                    if (savedCycleMode && (savedCycleMode === 'sequential' || savedCycleMode === 'random' || savedCycleMode === 'category' || savedCycleMode === 'daytracker')) {
                        state.cycleMode = savedCycleMode;
                        cycleModeBtns.forEach(function (b) { b.classList.remove('active'); });
                        var targetModeBtn = Array.from(cycleModeBtns).find(function (b) { return b.dataset.cycleMode === savedCycleMode; });
                        if (targetModeBtn) targetModeBtn.classList.add('active');
                        // Hide interval slider for Day Tracker
                        if (savedCycleMode === 'daytracker' && state.autoCycle) {
                            cycleIntervalRow.style.display = 'none';
                        }
                    }

                    if (savedCycleInterval !== null) {
                        const interval = parseInt(savedCycleInterval, 10);
                        if (!isNaN(interval) && interval >= 10 && interval <= 300) {
                            state.cycleInterval = interval;
                            cycleIntervalSlider.value = String(interval);
                            cycleIntervalValue.textContent = interval + 's';
                        }
                    }
                } catch (e) {
                    // localStorage may be unavailable
                }
            }

            // --- Init deferred until all theme scripts have loaded ---
            document.addEventListener('DOMContentLoaded', function () {
                loadPreferences();
                reinitialiseParticles(state.currentTheme);
                requestAnimationFrame(animate);
            });
        })();
