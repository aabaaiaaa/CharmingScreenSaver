(function (themes, FALLBACK_DT, SHOOTING_STAR_INTERVAL_MIN, SHOOTING_STAR_INTERVAL_RANGE, SHOOTING_STAR_TRAIL_MAX, LIGHTNING_INTERVAL_MIN, LIGHTNING_INTERVAL_RANGE) {
    // --- Watery theme ---
    // Hoisted wave configs (avoid per-frame allocation)
    const wateryWaveConfigs = [
        { yBase: 0.55, amp: 18, freq: 0.004, speed: 0.3, color: '20, 60, 140', opacity: 0.12 },
        { yBase: 0.60, amp: 22, freq: 0.005, speed: 0.25, color: '30, 80, 160', opacity: 0.10 },
        { yBase: 0.68, amp: 15, freq: 0.006, speed: 0.35, color: '20, 70, 150', opacity: 0.10 },
        { yBase: 0.75, amp: 20, freq: 0.003, speed: 0.20, color: '15, 50, 130', opacity: 0.08 },
        { yBase: 0.82, amp: 12, freq: 0.007, speed: 0.28, color: '10, 40, 120', opacity: 0.08 }
    ];

    themes.watery = {
        targetCount: 40,

        spawn: function (w, h) {
            const r = 2 + Math.random() * 8;
            return {
                x: Math.random() * w,
                y: h + r + Math.random() * h * 0.3,
                r: r,
                speed: 12 + Math.random() * 20,
                wobbleAmp: 15 + Math.random() * 25,
                wobbleSpeed: 0.4 + Math.random() * 0.6,
                wobbleOffset: Math.random() * Math.PI * 2,
                opacity: 0.08 + Math.random() * 0.18
            };
        },

        update: function (p, dt, w, h, state) {
            p.y -= p.speed * dt;
            p.x += Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * dt;
            // Recycle when above the top
            if (p.y + p.r < 0) return false;
            // Wrap horizontally
            if (p.x < -p.r) p.x = w + p.r;
            if (p.x > w + p.r) p.x = -p.r;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 220, 255, ' + p.opacity + ')';
            ctx.fill();
            // Highlight on bubble
            ctx.beginPath();
            ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (p.opacity * 0.6) + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            // Deep ocean blue gradient
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#040818');
            grad.addColorStop(0.3, '#061530');
            grad.addColorStop(0.7, '#0a2a50');
            grad.addColorStop(1, '#0c3568');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Subtle light rays from the top
            const t = state.timeElapsed;
            const rayCount = 6;
            ctx.save();
            for (let i = 0; i < rayCount; i++) {
                const baseX = w * (0.15 + 0.7 * (i / (rayCount - 1)));
                const sway = Math.sin(t * 0.15 + i * 1.2) * w * 0.04;
                const topX = baseX + sway;
                const spread = w * 0.04 + Math.sin(t * 0.2 + i * 0.8) * w * 0.01;
                const rayOpacity = 0.02 + Math.sin(t * 0.25 + i * 1.5) * 0.01;

                const rayGrad = ctx.createLinearGradient(topX, 0, topX, h * 0.75);
                rayGrad.addColorStop(0, 'rgba(120, 180, 255, ' + rayOpacity + ')');
                rayGrad.addColorStop(0.5, 'rgba(80, 150, 230, ' + (rayOpacity * 0.5) + ')');
                rayGrad.addColorStop(1, 'rgba(60, 120, 200, 0)');

                ctx.beginPath();
                ctx.moveTo(topX - spread, 0);
                ctx.lineTo(topX + spread, 0);
                ctx.lineTo(topX + spread * 3, h * 0.75);
                ctx.lineTo(topX - spread * 3, h * 0.75);
                ctx.closePath();
                ctx.fillStyle = rayGrad;
                ctx.fill();
            }
            ctx.restore();
        },

        drawForeground: function (ctx, w, h, state) {
            // 5 layered wave curves
            const t = state.timeElapsed;

            for (let i = 0; i < wateryWaveConfigs.length; i++) {
                const wc = wateryWaveConfigs[i];
                const baseY = h * wc.yBase;

                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 4) {
                    const y = baseY
                        + Math.sin(x * wc.freq + t * wc.speed) * wc.amp
                        + Math.sin(x * wc.freq * 0.5 + t * wc.speed * 1.3 + 2) * wc.amp * 0.5;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + wc.color + ', ' + wc.opacity + ')';
                ctx.fill();
            }
        }
    };

    // --- Sandy theme ---
    // Hoisted dune configs (avoid per-frame allocation)
    const sandyDuneConfigs = [
        { yBase: 0.62, amp: 35, freq: 0.0025, shiftSpeed: 0.06, color: '160, 110, 40', opacity: 0.18 },
        { yBase: 0.70, amp: 45, freq: 0.0018, shiftSpeed: 0.04, color: '175, 125, 50', opacity: 0.22 },
        { yBase: 0.78, amp: 30, freq: 0.0030, shiftSpeed: 0.08, color: '190, 140, 60', opacity: 0.25 },
        { yBase: 0.86, amp: 25, freq: 0.0022, shiftSpeed: 0.05, color: '200, 155, 70', opacity: 0.30 }
    ];

    themes.sandy = {
        targetCount: 80,

        spawn: function (w, h) {
            return {
                x: -Math.random() * w * 0.3,
                y: Math.random() * h,
                size: 0.5 + Math.random() * 2,
                speed: 8 + Math.random() * 18,
                drift: -2 + Math.random() * 4,
                opacity: 0.15 + Math.random() * 0.35,
                wobbleSpeed: 0.3 + Math.random() * 0.5,
                wobbleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.x += p.speed * dt;
            p.y += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 3) * dt;
            // Recycle when past the right edge
            if (p.x > w + 10) return false;
            // Wrap vertically
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(210, 180, 120, ' + p.opacity + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            // Warm amber/tan/gold gradient
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#d4a44a');
            grad.addColorStop(0.25, '#c89038');
            grad.addColorStop(0.5, '#b87d2e');
            grad.addColorStop(0.75, '#a36b24');
            grad.addColorStop(1, '#8a5518');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Subtle heat shimmer effect - thin horizontal wavy lines
            const t = state.timeElapsed;
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            const shimmerSpacing = 24;
            for (let row = 0; row < h; row += shimmerSpacing) {
                ctx.beginPath();
                for (let x = 0; x <= w; x += 16) {
                    const yOff = Math.sin(x * 0.015 + t * 0.8 + row * 0.1) * 2
                             + Math.sin(x * 0.008 + t * 1.2 + row * 0.05) * 1.5;
                    if (x === 0) ctx.moveTo(x, row + yOff);
                    else ctx.lineTo(x, row + yOff);
                }
                ctx.stroke();
            }
            ctx.restore();
        },

        drawForeground: function (ctx, w, h, state) {
            // 4 smooth dune curves at the lower portion of the screen
            const t = state.timeElapsed;

            for (let i = 0; i < sandyDuneConfigs.length; i++) {
                const dc = sandyDuneConfigs[i];
                const baseY = h * dc.yBase;

                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 4) {
                    const y = baseY
                        + Math.sin(x * dc.freq + t * dc.shiftSpeed) * dc.amp
                        + Math.sin(x * dc.freq * 1.6 + t * dc.shiftSpeed * 0.7 + 1.5) * dc.amp * 0.4
                        + Math.sin(x * dc.freq * 0.5 + t * dc.shiftSpeed * 1.3 + 3) * dc.amp * 0.25;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + dc.color + ', ' + dc.opacity + ')';
                ctx.fill();
            }
        }
    };

    // --- Snowy theme ---
    // Hoisted snow layers (avoid per-frame allocation)
    const snowyLayers = [
        { yOffset: 0, amp: 18, freq: 0.003, speed: 0.02, opacity: 0.5 },
        { yOffset: -8, amp: 12, freq: 0.005, speed: 0.03, opacity: 0.7 },
        { yOffset: -16, amp: 8, freq: 0.004, speed: 0.015, opacity: 0.9 }
    ];

    themes.snowy = {
        targetCount: 85,

        spawn: function (w, h) {
            const size = 1 + Math.random() * 5;
            return {
                x: Math.random() * w,
                y: -size - Math.random() * h * 0.3,
                size: size,
                speedY: 15 + Math.random() * 25,
                driftAmp: 20 + Math.random() * 40,
                driftSpeed: 0.2 + Math.random() * 0.4,
                driftOffset: Math.random() * Math.PI * 2,
                opacity: 0.3 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.5
            };
        },

        update: function (p, dt, w, h, state) {
            p.y += p.speedY * dt;
            // Sine-wave horizontal drift that changes over time
            p.x += Math.sin(state.timeElapsed * p.driftSpeed + p.driftOffset) * p.driftAmp * dt;
            p.rotation += p.rotationSpeed * dt;
            // Recycle when below the accumulation zone
            if (p.y > h + p.size) return false;
            // Wrap horizontally
            if (p.x < -p.size * 2) p.x = w + p.size * 2;
            if (p.x > w + p.size * 2) p.x = -p.size * 2;
            return true;
        },

        draw: function (p, ctx) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            // Draw snowflake as a soft glowing circle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacity + ')';
            ctx.fill();
            // Subtle glow around larger flakes
            if (p.size > 3) {
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (p.opacity * 0.12) + ')';
                ctx.fill();
            }
            ctx.restore();
        },

        drawBackground: function (ctx, w, h, state) {
            // Soft grey-blue to white gradient
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#8a9bb5');
            grad.addColorStop(0.3, '#a0b0c8');
            grad.addColorStop(0.6, '#bcc8d8');
            grad.addColorStop(0.85, '#d8e0ea');
            grad.addColorStop(1, '#e8ecf2');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        },

        drawForeground: function (ctx, w, h, state) {
            // Snow accumulation effect at the bottom - white curved area
            const t = state.timeElapsed;
            const accumH = h * 0.12; // height of the accumulation zone
            const baseY = h - accumH;

            // Draw 3 layered snow mound curves for a natural look
            for (let i = 0; i < snowyLayers.length; i++) {
                const layer = snowyLayers[i];
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 4) {
                    const y = baseY + layer.yOffset
                        + Math.sin(x * layer.freq + t * layer.speed) * layer.amp
                        + Math.sin(x * layer.freq * 2.2 + t * layer.speed * 0.7 + 1.8) * layer.amp * 0.4
                        + Math.cos(x * layer.freq * 0.6 + t * layer.speed * 1.4 + 3.2) * layer.amp * 0.25;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 255, ' + layer.opacity + ')';
                ctx.fill();
            }
        }
    };

    // --- Wavey theme ---
    // Hoisted wave configs (avoid per-frame allocation)
    const waveyWaveConfigs = [
        { yBase: 0.15, amp: 30, freq: 0.0030, speed: 0.20, freq2: 0.0018, speed2: 0.12, r: 20, g: 80, b: 160, opacity: 0.06 },
        { yBase: 0.22, amp: 25, freq: 0.0045, speed: 0.28, freq2: 0.0025, speed2: 0.18, r: 30, g: 120, b: 180, opacity: 0.05 },
        { yBase: 0.28, amp: 35, freq: 0.0020, speed: 0.15, freq2: 0.0035, speed2: 0.22, r: 15, g: 100, b: 170, opacity: 0.06 },
        { yBase: 0.35, amp: 22, freq: 0.0055, speed: 0.32, freq2: 0.0012, speed2: 0.10, r: 40, g: 140, b: 190, opacity: 0.05 },
        { yBase: 0.42, amp: 28, freq: 0.0035, speed: 0.22, freq2: 0.0040, speed2: 0.30, r: 20, g: 110, b: 175, opacity: 0.06 },
        { yBase: 0.48, amp: 20, freq: 0.0060, speed: 0.35, freq2: 0.0020, speed2: 0.14, r: 50, g: 150, b: 195, opacity: 0.05 },
        { yBase: 0.55, amp: 32, freq: 0.0025, speed: 0.18, freq2: 0.0045, speed2: 0.26, r: 25, g: 90, b: 165, opacity: 0.06 },
        { yBase: 0.62, amp: 26, freq: 0.0040, speed: 0.25, freq2: 0.0015, speed2: 0.20, r: 35, g: 130, b: 185, opacity: 0.05 },
        { yBase: 0.68, amp: 18, freq: 0.0070, speed: 0.38, freq2: 0.0030, speed2: 0.16, r: 45, g: 155, b: 200, opacity: 0.05 },
        { yBase: 0.75, amp: 30, freq: 0.0028, speed: 0.16, freq2: 0.0050, speed2: 0.28, r: 18, g: 85, b: 155, opacity: 0.06 },
        { yBase: 0.82, amp: 24, freq: 0.0050, speed: 0.30, freq2: 0.0022, speed2: 0.12, r: 30, g: 115, b: 178, opacity: 0.05 },
        { yBase: 0.88, amp: 15, freq: 0.0038, speed: 0.24, freq2: 0.0060, speed2: 0.34, r: 55, g: 160, b: 205, opacity: 0.04 }
    ];

    themes.wavey = {
        targetCount: 0, // No particles - waves are the focus

        spawn: function (w, h) {
            return { x: 0, y: 0 };
        },

        update: function (p, dt, w, h, state) {
            return true;
        },

        draw: function (p, ctx, state) {},

        drawBackground: function (ctx, w, h, state) {
            // Deep teal/navy gradient background
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#040d1a');
            grad.addColorStop(0.3, '#061a2e');
            grad.addColorStop(0.6, '#0a2838');
            grad.addColorStop(1, '#0d3040');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        },

        drawForeground: function (ctx, w, h, state) {
            const t = state.timeElapsed;

            // 12 layered flowing sine waves
            for (let i = 0; i < waveyWaveConfigs.length; i++) {
                const wc = waveyWaveConfigs[i];
                const baseY = h * wc.yBase;

                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 3) {
                    const y = baseY
                        + Math.sin(x * wc.freq + t * wc.speed) * wc.amp
                        + Math.sin(x * wc.freq2 + t * wc.speed2 + i * 0.8) * wc.amp * 0.6
                        + Math.cos(x * wc.freq * 0.7 + t * wc.speed * 1.4 + i * 1.3) * wc.amp * 0.3;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + wc.r + ', ' + wc.g + ', ' + wc.b + ', ' + wc.opacity + ')';
                ctx.fill();
            }

            // Subtle surface shimmer dots
            ctx.save();
            const shimmerCount = 60;
            for (let i = 0; i < shimmerCount; i++) {
                // Deterministic positions using index-based offsets
                const sx = (Math.sin(i * 3.7 + t * 0.05) * 0.5 + 0.5) * w;
                const sy = (Math.sin(i * 5.3 + t * 0.03 + 2.1) * 0.5 + 0.5) * h;
                const shimmerOpacity = (Math.sin(t * 1.5 + i * 2.1) * 0.5 + 0.5) * 0.15;
                const shimmerSize = 1 + Math.sin(t * 0.8 + i * 1.7) * 0.5;

                ctx.beginPath();
                ctx.arc(sx, sy, shimmerSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(150, 220, 255, ' + shimmerOpacity + ')';
                ctx.fill();
            }
            ctx.restore();
        }
    };

    // --- Spacey theme ---
    themes.spacey = (function () {
        // Pre-allocate trail buffer (ring buffer to avoid push/shift GC)
        const trailBuffer = [];
        for (let i = 0; i < SHOOTING_STAR_TRAIL_MAX; i++) {
            trailBuffer.push({ x: 0, y: 0 });
        }

        // Shooting star state
        const shootingStar = {
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 0,
            maxLife: 0.6,
            trailBuffer: trailBuffer,
            trailIndex: 0,
            trailCount: 0,
            timer: SHOOTING_STAR_INTERVAL_MIN + Math.random() * SHOOTING_STAR_INTERVAL_RANGE
        };

        // Nebula blobs - 3 slowly drifting colourful clouds
        const nebulae = [
            { cx: 0.25, cy: 0.35, r: 0.18, hue: 'purple', driftX: 0.008, driftY: 0.005, phaseX: 0, phaseY: 1.2 },
            { cx: 0.70, cy: 0.55, r: 0.22, hue: 'blue', driftX: 0.006, driftY: 0.009, phaseX: 2.5, phaseY: 0.4 },
            { cx: 0.50, cy: 0.75, r: 0.16, hue: 'pink', driftX: 0.010, driftY: 0.007, phaseX: 4.0, phaseY: 3.1 }
        ];

        // Nebula colour mappings
        const nebulaColors = {
            purple: { r: 120, g: 40, b: 180 },
            blue:   { r: 40, g: 80, b: 200 },
            pink:   { r: 180, g: 50, b: 130 }
        };

        return {
            targetCount: 200,

            onActivate: function () {
                shootingStar.active = false;
                shootingStar.trailCount = 0;
                shootingStar.trailIndex = 0;
                shootingStar.timer = SHOOTING_STAR_INTERVAL_MIN + Math.random() * SHOOTING_STAR_INTERVAL_RANGE;
            },

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 2,
                    baseOpacity: 0.3 + Math.random() * 0.6,
                    twinkleSpeed: 0.8 + Math.random() * 2.5,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                // Stars are stationary, just twinkle
                return true;
            },

            draw: function (p, ctx, state) {
                // Oscillating opacity via sine wave
                const twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                const opacity = p.baseOpacity * (0.5 + twinkle * 0.5);
                if (opacity < 0.05) return;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
                ctx.fill();

                // Glow around brighter/larger stars
                if (p.size > 1.2 && opacity > 0.4) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 220, 255, ' + (opacity * 0.08) + ')';
                    ctx.fill();
                }
            },

            drawBackground: function (ctx, w, h, state) {
                // Dark navy/black radial gradient background
                const cx = w * 0.5;
                const cy = h * 0.4;
                const maxR = Math.max(w, h) * 0.8;
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
                grad.addColorStop(0, '#0a0e1a');
                grad.addColorStop(0.4, '#060a14');
                grad.addColorStop(0.8, '#030610');
                grad.addColorStop(1, '#010208');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Draw nebula blobs
                const t = state.timeElapsed;
                for (let i = 0; i < nebulae.length; i++) {
                    const n = nebulae[i];
                    const col = nebulaColors[n.hue];
                    // Slow drifting position
                    const nx = (n.cx + Math.sin(t * n.driftX + n.phaseX) * 0.06) * w;
                    const ny = (n.cy + Math.sin(t * n.driftY + n.phaseY) * 0.05) * h;
                    const nr = n.r * Math.min(w, h);

                    const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
                    nebGrad.addColorStop(0, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.06)');
                    nebGrad.addColorStop(0.3, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.04)');
                    nebGrad.addColorStop(0.6, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0.02)');
                    nebGrad.addColorStop(1, 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', 0)');
                    ctx.beginPath();
                    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
                    ctx.fillStyle = nebGrad;
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;

                // --- Shooting star ---
                shootingStar.timer -= dt;

                if (!shootingStar.active && shootingStar.timer <= 0) {
                    // Launch a new shooting star
                    shootingStar.active = true;
                    shootingStar.life = 0;
                    shootingStar.maxLife = 0.4 + Math.random() * 0.4;
                    shootingStar.trailCount = 0;
                    shootingStar.trailIndex = 0;
                    // Start from a random position in the upper portion
                    shootingStar.x = Math.random() * w;
                    shootingStar.y = Math.random() * h * 0.4;
                    // Move diagonally downward
                    const speed = 600 + Math.random() * 400;
                    const angle = Math.PI * 0.15 + Math.random() * Math.PI * 0.2;
                    shootingStar.vx = Math.cos(angle) * speed;
                    shootingStar.vy = Math.sin(angle) * speed;
                    shootingStar.timer = SHOOTING_STAR_INTERVAL_MIN + Math.random() * SHOOTING_STAR_INTERVAL_RANGE;
                }

                if (shootingStar.active) {
                    shootingStar.life += dt;
                    shootingStar.x += shootingStar.vx * dt;
                    shootingStar.y += shootingStar.vy * dt;

                    // Store trail point in ring buffer
                    shootingStar.trailBuffer[shootingStar.trailIndex].x = shootingStar.x;
                    shootingStar.trailBuffer[shootingStar.trailIndex].y = shootingStar.y;
                    shootingStar.trailIndex = (shootingStar.trailIndex + 1) % SHOOTING_STAR_TRAIL_MAX;
                    if (shootingStar.trailCount < SHOOTING_STAR_TRAIL_MAX) shootingStar.trailCount++;

                    // Draw the trail
                    const progress = shootingStar.life / shootingStar.maxLife;
                    const fadeOut = 1 - progress;

                    if (shootingStar.trailCount > 1) {
                        for (let i = 1; i < shootingStar.trailCount; i++) {
                            const prevIdx = (shootingStar.trailIndex - shootingStar.trailCount + i - 1 + SHOOTING_STAR_TRAIL_MAX) % SHOOTING_STAR_TRAIL_MAX;
                            const currIdx = (shootingStar.trailIndex - shootingStar.trailCount + i + SHOOTING_STAR_TRAIL_MAX) % SHOOTING_STAR_TRAIL_MAX;
                            const prev = shootingStar.trailBuffer[prevIdx];
                            const curr = shootingStar.trailBuffer[currIdx];
                            const segAlpha = (i / shootingStar.trailCount) * fadeOut * 0.8;
                            const segWidth = (i / shootingStar.trailCount) * 2.5;
                            ctx.beginPath();
                            ctx.moveTo(prev.x, prev.y);
                            ctx.lineTo(curr.x, curr.y);
                            ctx.strokeStyle = 'rgba(255, 255, 255, ' + segAlpha + ')';
                            ctx.lineWidth = segWidth;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                        }

                        // Bright head glow
                        const headIdx = (shootingStar.trailIndex - 1 + SHOOTING_STAR_TRAIL_MAX) % SHOOTING_STAR_TRAIL_MAX;
                        const headX = shootingStar.trailBuffer[headIdx].x;
                        const headY = shootingStar.trailBuffer[headIdx].y;
                        const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
                        headGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (fadeOut * 0.9) + ')');
                        headGrad.addColorStop(0.5, 'rgba(200, 220, 255, ' + (fadeOut * 0.3) + ')');
                        headGrad.addColorStop(1, 'rgba(150, 180, 255, 0)');
                        ctx.beginPath();
                        ctx.arc(headX, headY, 8, 0, Math.PI * 2);
                        ctx.fillStyle = headGrad;
                        ctx.fill();
                    }

                    // End shooting star when life expires or it goes off-screen
                    if (shootingStar.life >= shootingStar.maxLife ||
                        shootingStar.x > w + 50 || shootingStar.y > h + 50 ||
                        shootingStar.x < -50 || shootingStar.y < -50) {
                        shootingStar.active = false;
                        shootingStar.trailCount = 0;
                        shootingStar.trailIndex = 0;
                    }
                }
            }
        };
    })();

    // --- Colourful theme ---
    // Hoisted aurora configs (avoid per-frame allocation)
    const colourfulAuroraConfigs = [
        { yBase: 0.30, amp: 40, freq: 0.003, speed: 0.18, hueBase: 0,   opacity: 0.06 },
        { yBase: 0.40, amp: 35, freq: 0.004, speed: 0.22, hueBase: 72,  opacity: 0.05 },
        { yBase: 0.50, amp: 45, freq: 0.0025, speed: 0.15, hueBase: 144, opacity: 0.06 },
        { yBase: 0.60, amp: 30, freq: 0.005, speed: 0.25, hueBase: 216, opacity: 0.05 },
        { yBase: 0.72, amp: 38, freq: 0.0035, speed: 0.20, hueBase: 288, opacity: 0.06 }
    ];

    themes.colourful = {
        targetCount: 45,

        spawn: function (w, h) {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                r: 15 + Math.random() * 35,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                hueOffset: Math.random() * 360,
                opacity: 0.08 + Math.random() * 0.15,
                driftPhaseX: Math.random() * Math.PI * 2,
                driftPhaseY: Math.random() * Math.PI * 2,
                driftSpeedX: 0.15 + Math.random() * 0.3,
                driftSpeedY: 0.15 + Math.random() * 0.3
            };
        },

        update: function (p, dt, w, h, state) {
            // Gentle drifting motion using sine waves
            p.x += Math.sin(state.timeElapsed * p.driftSpeedX + p.driftPhaseX) * p.vx * dt;
            p.y += Math.sin(state.timeElapsed * p.driftSpeedY + p.driftPhaseY) * p.vy * dt;
            // Wrap around edges
            if (p.x < -p.r * 2) p.x = w + p.r * 2;
            if (p.x > w + p.r * 2) p.x = -p.r * 2;
            if (p.y < -p.r * 2) p.y = h + p.r * 2;
            if (p.y > h + p.r * 2) p.y = -p.r * 2;
            return true;
        },

        draw: function (p, ctx, state) {
            // Hue shifts over time for kaleidoscopic feel
            const hue = (p.hueOffset + state.timeElapsed * 15) % 360;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            grad.addColorStop(0, 'hsla(' + hue + ', 80%, 65%, ' + p.opacity + ')');
            grad.addColorStop(0.5, 'hsla(' + hue + ', 70%, 55%, ' + (p.opacity * 0.5) + ')');
            grad.addColorStop(1, 'hsla(' + hue + ', 60%, 45%, 0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            const t = state.timeElapsed;
            // Slowly rotating rainbow hue gradient background
            // Use a base hue that shifts over time
            const baseHue = (t * 8) % 360;
            const grad = ctx.createLinearGradient(
                w * 0.5 + Math.cos(t * 0.1) * w * 0.4,
                h * 0.5 + Math.sin(t * 0.1) * h * 0.4,
                w * 0.5 + Math.cos(t * 0.1 + Math.PI) * w * 0.4,
                h * 0.5 + Math.sin(t * 0.1 + Math.PI) * h * 0.4
            );
            const hue1 = baseHue;
            const hue2 = (baseHue + 60) % 360;
            const hue3 = (baseHue + 120) % 360;
            const hue4 = (baseHue + 180) % 360;
            const hue5 = (baseHue + 240) % 360;
            const hue6 = (baseHue + 300) % 360;
            grad.addColorStop(0, 'hsl(' + hue1 + ', 35%, 12%)');
            grad.addColorStop(0.2, 'hsl(' + hue2 + ', 35%, 14%)');
            grad.addColorStop(0.4, 'hsl(' + hue3 + ', 35%, 12%)');
            grad.addColorStop(0.6, 'hsl(' + hue4 + ', 35%, 14%)');
            grad.addColorStop(0.8, 'hsl(' + hue5 + ', 35%, 12%)');
            grad.addColorStop(1, 'hsl(' + hue6 + ', 35%, 14%)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        },

        drawForeground: function (ctx, w, h, state) {
            const t = state.timeElapsed;

            // 5 aurora-like wave layers with hue-shifting fills
            for (let i = 0; i < colourfulAuroraConfigs.length; i++) {
                const ac = colourfulAuroraConfigs[i];
                const baseY = h * ac.yBase;
                // Hue shifts over time
                const hue = (ac.hueBase + t * 12) % 360;

                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x += 3) {
                    const y = baseY
                        + Math.sin(x * ac.freq + t * ac.speed) * ac.amp
                        + Math.sin(x * ac.freq * 0.6 + t * ac.speed * 1.3 + i * 1.5) * ac.amp * 0.5
                        + Math.cos(x * ac.freq * 0.3 + t * ac.speed * 0.7 + i * 2.8) * ac.amp * 0.3;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'hsla(' + hue + ', 70%, 55%, ' + ac.opacity + ')';
                ctx.fill();
            }
        }
    };

    // --- Windy theme ---
    themes.windy = (function () {
        // Wind gust state - varies over time using layered sine waves
        function getWindStrength(t) {
            return 1.0
                + Math.sin(t * 0.3) * 0.4
                + Math.sin(t * 0.7 + 1.2) * 0.25
                + Math.sin(t * 1.5 + 3.0) * 0.15;
        }

        // Wind current line state (persistent across frames)
        const windLines = [];
        let windLinesInited = false;
        let windLinesW = 0;
        let windLinesH = 0;
        const WIND_LINE_COUNT = 8;

        function initWindLines(w, h) {
            windLines.length = 0;
            for (let i = 0; i < WIND_LINE_COUNT; i++) {
                windLines.push({
                    y: h * (0.1 + 0.8 * (i / (WIND_LINE_COUNT - 1))),
                    speed: 60 + Math.random() * 80,
                    offset: Math.random() * w,
                    amp: 8 + Math.random() * 15,
                    freq: 0.003 + Math.random() * 0.004,
                    opacity: 0.04 + Math.random() * 0.06,
                    length: w * (0.3 + Math.random() * 0.4),
                    phase: Math.random() * Math.PI * 2
                });
            }
            windLinesInited = true;
            windLinesW = w;
            windLinesH = h;
        }

        return {
            targetCount: 35,

            spawn: function (w, h) {
                // Leaf-like ellipse particles
                if (!windLinesInited || windLinesW !== w || windLinesH !== h) initWindLines(w, h);
                const leafHues = [
                    { r: 90, g: 140, b: 60 },   // green
                    { r: 120, g: 160, b: 50 },  // light green
                    { r: 180, g: 130, b: 40 },  // amber
                    { r: 160, g: 90, b: 30 },   // brown
                    { r: 200, g: 160, b: 50 },  // golden
                    { r: 140, g: 70, b: 40 }    // dark brown
                ];
                const col = leafHues[Math.floor(Math.random() * leafHues.length)];
                return {
                    x: -20 - Math.random() * w * 0.3,
                    y: Math.random() * h,
                    rx: 4 + Math.random() * 6,     // ellipse horizontal radius
                    ry: 2 + Math.random() * 3,     // ellipse vertical radius
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: 1.5 + Math.random() * 3,
                    wobbleAmp: 30 + Math.random() * 50,
                    wobbleSpeed: 0.5 + Math.random() * 1.0,
                    wobbleOffset: Math.random() * Math.PI * 2,
                    baseSpeed: 80 + Math.random() * 100,
                    opacity: 0.4 + Math.random() * 0.4,
                    r: col.r,
                    g: col.g,
                    b: col.b
                };
            },

            update: function (p, dt, w, h, state) {
                const wind = getWindStrength(state.timeElapsed);
                // Move horizontally with wind
                p.x += p.baseSpeed * wind * dt;
                // Vertical wobble
                p.y += Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * dt;
                // Rotate
                p.rotation += p.rotationSpeed * wind * dt;
                // Recycle when past the right edge
                if (p.x > w + 30) return false;
                // Wrap vertically
                if (p.y < -20) p.y = h + 20;
                if (p.y > h + 20) p.y = -20;
                return true;
            },

            draw: function (p, ctx) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                // Draw leaf-like ellipse
                ctx.beginPath();
                ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + p.opacity + ')';
                ctx.fill();
                // Leaf vein (subtle centre line)
                ctx.beginPath();
                ctx.moveTo(-p.rx * 0.8, 0);
                ctx.lineTo(p.rx * 0.8, 0);
                ctx.strokeStyle = 'rgba(' + Math.max(0, p.r - 30) + ', ' + Math.max(0, p.g - 30) + ', ' + Math.max(0, p.b - 20) + ', ' + (p.opacity * 0.5) + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.restore();
            },

            drawBackground: function (ctx, w, h, state) {
                // Soft sky-blue gradient background
                const grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#6ba3c7');
                grad.addColorStop(0.3, '#85b8d8');
                grad.addColorStop(0.6, '#a0cce5');
                grad.addColorStop(0.85, '#b8dced');
                grad.addColorStop(1, '#c8e4f0');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state) {
                const t = state.timeElapsed;
                const wind = getWindStrength(t);

                if (!windLinesInited || windLines.length === 0 || windLinesW !== w || windLinesH !== h) initWindLines(w, h);

                // Flowing wind current lines - thin semi-transparent horizontal curves
                ctx.save();
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';

                for (let i = 0; i < windLines.length; i++) {
                    const wl = windLines[i];
                    // Advance the offset so the line moves across the screen
                    const lineX = (wl.offset + t * wl.speed * wind) % (w + wl.length) - wl.length * 0.3;
                    const baseY = wl.y + Math.sin(t * 0.2 + wl.phase) * 20;

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (wl.opacity * wind) + ')';

                    const segments = 60;
                    for (let s = 0; s <= segments; s++) {
                        const frac = s / segments;
                        const px = lineX + frac * wl.length;
                        const py = baseY + Math.sin(px * wl.freq + t * 1.5 + wl.phase) * wl.amp
                                      + Math.sin(px * wl.freq * 2.3 + t * 0.8 + wl.phase * 2) * wl.amp * 0.3;

                        // Fade at the ends of the line for a soft look
                        if (s === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }
        };
    })();

    // --- Stormy theme ---
    themes.stormy = (function () {
        // Lightning flash state
        const lightning = {
            active: false,
            opacity: 0,
            timer: LIGHTNING_INTERVAL_MIN + Math.random() * LIGHTNING_INTERVAL_RANGE,
            fadeSpeed: 3.0 // how fast the flash fades out
        };

        // Cloud shape definitions (positioned at the top of the screen)
        const clouds = [
            { cx: 0.12, cy: 0.06, rx: 0.18, ry: 0.08, phase: 0 },
            { cx: 0.30, cy: 0.04, rx: 0.22, ry: 0.10, phase: 1.5 },
            { cx: 0.52, cy: 0.05, rx: 0.20, ry: 0.09, phase: 3.0 },
            { cx: 0.73, cy: 0.04, rx: 0.24, ry: 0.11, phase: 4.5 },
            { cx: 0.90, cy: 0.06, rx: 0.16, ry: 0.08, phase: 6.0 }
        ];

        return {
            targetCount: 150,

            onActivate: function () {
                lightning.active = false;
                lightning.opacity = 0;
                lightning.timer = LIGHTNING_INTERVAL_MIN + Math.random() * LIGHTNING_INTERVAL_RANGE;
            },

            spawn: function (w, h) {
                return {
                    x: Math.random() * w + w * 0.1,
                    y: -Math.random() * h * 0.3,
                    speed: 300 + Math.random() * 250,
                    windDrift: 60 + Math.random() * 40,
                    length: 12 + Math.random() * 18,
                    opacity: 0.15 + Math.random() * 0.35
                };
            },

            update: function (p, dt, w, h, state) {
                // Fall diagonally (mostly down, slightly to the left)
                p.y += p.speed * dt;
                p.x -= p.windDrift * dt;
                // Recycle when below the screen or past left edge
                if (p.y > h + 20 || p.x < -20) return false;
                return true;
            },

            draw: function (p, ctx) {
                // Draw rain drop as a short diagonal line
                const angle = Math.atan2(p.speed, -p.windDrift);
                const dx = Math.cos(angle) * p.length;
                const dy = Math.sin(angle) * p.length;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + dx, p.y + dy);
                ctx.strokeStyle = 'rgba(180, 200, 220, ' + p.opacity + ')';
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                ctx.stroke();
            },

            drawBackground: function (ctx, w, h, state) {
                // Dark grey/purple gradient background
                const grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1a1525');
                grad.addColorStop(0.3, '#1e1830');
                grad.addColorStop(0.6, '#22202e');
                grad.addColorStop(1, '#181620');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Dark cloud shapes at the top using radial gradients
                for (let i = 0; i < clouds.length; i++) {
                    const c = clouds[i];
                    const cx = (c.cx + Math.sin(state.timeElapsed * 0.02 + c.phase) * 0.02) * w;
                    const cy = c.cy * h;
                    const rx = c.rx * w;
                    const ry = c.ry * h;

                    // Draw cloud as a large elliptical radial gradient
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(1, ry / rx);
                    const cloudGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
                    cloudGrad.addColorStop(0, 'rgba(25, 20, 35, 0.8)');
                    cloudGrad.addColorStop(0.4, 'rgba(30, 25, 40, 0.5)');
                    cloudGrad.addColorStop(0.7, 'rgba(35, 30, 45, 0.25)');
                    cloudGrad.addColorStop(1, 'rgba(35, 30, 45, 0)');
                    ctx.beginPath();
                    ctx.arc(0, 0, rx, 0, Math.PI * 2);
                    ctx.fillStyle = cloudGrad;
                    ctx.fill();
                    ctx.restore();

                    // Second cloud blob slightly offset for volume
                    ctx.save();
                    ctx.translate(cx + rx * 0.3, cy + ry * 0.2);
                    ctx.scale(1, (ry * 0.7) / (rx * 0.6));
                    const cloudGrad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.6);
                    cloudGrad2.addColorStop(0, 'rgba(20, 15, 30, 0.7)');
                    cloudGrad2.addColorStop(0.5, 'rgba(28, 22, 38, 0.35)');
                    cloudGrad2.addColorStop(1, 'rgba(30, 25, 40, 0)');
                    ctx.beginPath();
                    ctx.arc(0, 0, rx * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = cloudGrad2;
                    ctx.fill();
                    ctx.restore();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;

                // --- Lightning flash ---
                lightning.timer -= dt;

                if (!lightning.active && lightning.timer <= 0) {
                    // Trigger a lightning flash
                    lightning.active = true;
                    lightning.opacity = 0.35 + Math.random() * 0.2; // brief white overlay
                    lightning.timer = LIGHTNING_INTERVAL_MIN + Math.random() * LIGHTNING_INTERVAL_RANGE;
                }

                if (lightning.active) {
                    // Draw the screen-wide white overlay
                    ctx.save();
                    ctx.fillStyle = 'rgba(220, 225, 255, ' + lightning.opacity + ')';
                    ctx.fillRect(0, 0, w, h);
                    ctx.restore();

                    // Fade out
                    lightning.opacity -= lightning.fadeSpeed * dt;
                    if (lightning.opacity <= 0) {
                        lightning.active = false;
                        lightning.opacity = 0;
                    }
                }
            }
        };
    })();

    // --- Sunny theme ---
    themes.sunny = (function () {
        // Sun position (relative to canvas)
        const sunX = 0.5;
        const sunY = 0.22;
        const sunRadius = 0.06; // relative to Math.min(w, h)

        // Light rays radiating from the sun
        const rayCount = 12;
        const rays = [];
        for (let i = 0; i < rayCount; i++) {
            rays.push({
                angle: (i / rayCount) * Math.PI * 2,
                baseWidth: 0.015 + Math.random() * 0.02,
                length: 0.3 + Math.random() * 0.25,
                pulseSpeed: 0.3 + Math.random() * 0.4,
                pulseOffset: Math.random() * Math.PI * 2,
                opacityBase: 0.04 + Math.random() * 0.03
            });
        }

        // Rotation speed for the rays (very slow)
        const rotationSpeed = 0.02;

        return {
            targetCount: 30,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: h * 0.3 + Math.random() * h * 0.7,
                    size: 1 + Math.random() * 2.5,
                    baseOpacity: 0.15 + Math.random() * 0.25,
                    speedY: -(8 + Math.random() * 15), // float upward
                    driftSpeed: 0.5 + Math.random() * 1.0,
                    driftOffset: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.8 + Math.random() * 1.5,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                // Float gently upward
                p.y += p.speedY * dt;
                // Subtle horizontal drift using sine wave
                p.x += Math.sin(state.timeElapsed * p.driftSpeed + p.driftOffset) * 12 * dt;
                // Recycle when above screen
                if (p.y < -10) return false;
                return true;
            },

            draw: function (p, ctx, state) {
                // Oscillating opacity for a gentle twinkle
                const twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                const opacity = p.baseOpacity * (0.6 + twinkle * 0.4);
                if (opacity < 0.03) return;

                // Draw dust mote as a soft glowing circle
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
                grad.addColorStop(0, 'rgba(255, 240, 200, ' + opacity + ')');
                grad.addColorStop(0.5, 'rgba(255, 230, 170, ' + (opacity * 0.5) + ')');
                grad.addColorStop(1, 'rgba(255, 220, 140, 0)');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                const t = state.timeElapsed;
                const minDim = Math.min(w, h);

                // Warm golden radial gradient background
                const cx = w * sunX;
                const cy = h * sunY;
                const maxR = Math.max(w, h) * 1.2;
                const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
                bgGrad.addColorStop(0, '#fff5d6');
                bgGrad.addColorStop(0.15, '#ffe8a0');
                bgGrad.addColorStop(0.35, '#f5c84a');
                bgGrad.addColorStop(0.55, '#e0a020');
                bgGrad.addColorStop(0.8, '#c07818');
                bgGrad.addColorStop(1, '#905510');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w, h);

                // --- Light rays radiating from the sun ---
                const rotation = t * rotationSpeed;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rotation);

                for (let i = 0; i < rays.length; i++) {
                    const ray = rays[i];
                    // Pulsing width and opacity
                    const pulse = Math.sin(t * ray.pulseSpeed + ray.pulseOffset);
                    const rayWidth = ray.baseWidth * (0.7 + pulse * 0.3) * minDim;
                    const rayLength = ray.length * maxR;
                    const rayOpacity = ray.opacityBase * (0.6 + pulse * 0.4);

                    // Draw ray as a triangle/wedge
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    const halfAngle = Math.atan2(rayWidth, rayLength * 0.3);
                    const x1 = Math.cos(ray.angle - halfAngle) * rayLength;
                    const y1 = Math.sin(ray.angle - halfAngle) * rayLength;
                    const x2 = Math.cos(ray.angle + halfAngle) * rayLength;
                    const y2 = Math.sin(ray.angle + halfAngle) * rayLength;
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.closePath();

                    // Gradient along the ray for a natural fade
                    const rayGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rayLength);
                    rayGrad.addColorStop(0, 'rgba(255, 248, 220, ' + rayOpacity + ')');
                    rayGrad.addColorStop(0.3, 'rgba(255, 240, 190, ' + (rayOpacity * 0.6) + ')');
                    rayGrad.addColorStop(0.7, 'rgba(255, 230, 150, ' + (rayOpacity * 0.25) + ')');
                    rayGrad.addColorStop(1, 'rgba(255, 220, 120, 0)');
                    ctx.fillStyle = rayGrad;
                    ctx.fill();
                }

                ctx.restore();

                // --- Glowing sun ---
                // Outer glow (large soft halo)
                const glowR = sunRadius * minDim * 4;
                const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
                outerGlow.addColorStop(0, 'rgba(255, 250, 230, 0.25)');
                outerGlow.addColorStop(0.2, 'rgba(255, 240, 200, 0.15)');
                outerGlow.addColorStop(0.5, 'rgba(255, 220, 150, 0.06)');
                outerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
                ctx.fillStyle = outerGlow;
                ctx.fill();

                // Middle glow
                const midR = sunRadius * minDim * 2;
                const midGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, midR);
                midGlow.addColorStop(0, 'rgba(255, 252, 240, 0.4)');
                midGlow.addColorStop(0.4, 'rgba(255, 245, 210, 0.2)');
                midGlow.addColorStop(1, 'rgba(255, 235, 180, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, midR, 0, Math.PI * 2);
                ctx.fillStyle = midGlow;
                ctx.fill();

                // Sun core (bright white-yellow disc)
                const coreR = sunRadius * minDim;
                const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
                coreGrad.addColorStop(0, 'rgba(255, 255, 250, 0.95)');
                coreGrad.addColorStop(0.5, 'rgba(255, 250, 230, 0.85)');
                coreGrad.addColorStop(0.8, 'rgba(255, 240, 200, 0.6)');
                coreGrad.addColorStop(1, 'rgba(255, 230, 170, 0.3)');
                ctx.beginPath();
                ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
                ctx.fillStyle = coreGrad;
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                // No foreground effects needed for sunny theme
            }
        };
    })();
})(window.CV.themes, window.CV.FALLBACK_DT, window.CV.SHOOTING_STAR_INTERVAL_MIN, window.CV.SHOOTING_STAR_INTERVAL_RANGE, window.CV.SHOOTING_STAR_TRAIL_MAX, window.CV.LIGHTNING_INTERVAL_MIN, window.CV.LIGHTNING_INTERVAL_RANGE);
