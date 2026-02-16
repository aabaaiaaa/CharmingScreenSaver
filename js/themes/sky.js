(function (themes) {
    // --- Auroral theme ---
    // Northern lights with sweeping curtains of colour, dark starry sky, mountain silhouette
    themes.auroral = (function () {
        // Aurora curtain configs
        var curtains = [
            { yBase: 0.20, amp: 60, freq: 0.003, speed: 0.12, hue: 120, height: 0.25, opacity: 0.06 },
            { yBase: 0.25, amp: 50, freq: 0.004, speed: 0.15, hue: 140, height: 0.22, opacity: 0.05 },
            { yBase: 0.22, amp: 70, freq: 0.0025, speed: 0.10, hue: 180, height: 0.28, opacity: 0.04 },
            { yBase: 0.28, amp: 45, freq: 0.005, speed: 0.18, hue: 100, height: 0.20, opacity: 0.05 },
            { yBase: 0.18, amp: 55, freq: 0.0035, speed: 0.14, hue: 280, height: 0.24, opacity: 0.03 }
        ];

        return {
            targetCount: 120,

            spawn: function (w, h) {
                // Stars in the sky
                return {
                    x: Math.random() * w,
                    y: Math.random() * h * 0.75,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.2 + Math.random() * 0.6,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                return true; // Stars are stationary
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.5 + twinkle * 0.5);
                if (op < 0.05) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark starry sky gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#040810');
                grad.addColorStop(0.5, '#060c16');
                grad.addColorStop(0.75, '#0a1020');
                grad.addColorStop(1, '#0c1424');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;

                // Aurora curtains - sweeping, folding bands of colour
                for (var c = 0; c < curtains.length; c++) {
                    var cur = curtains[c];
                    var baseY = h * cur.yBase;

                    // Draw as a vertical gradient band following a wave
                    for (var x = 0; x <= w; x += 3) {
                        var waveY = baseY
                            + Math.sin(x * cur.freq + t * cur.speed) * cur.amp
                            + Math.sin(x * cur.freq * 0.5 + t * cur.speed * 1.5 + c * 1.8) * cur.amp * 0.6
                            + Math.cos(x * cur.freq * 0.3 + t * cur.speed * 0.8 + c * 3.2) * cur.amp * 0.3;

                        var colH = cur.height * h;
                        // Fold intensity varies along the curtain
                        var foldIntensity = 0.6 + Math.sin(x * 0.008 + t * 0.2 + c * 2) * 0.4;
                        var op = cur.opacity * foldIntensity;

                        // Vertical stripe of aurora
                        var aGrad = ctx.createLinearGradient(x, waveY, x, waveY + colH);
                        aGrad.addColorStop(0, 'hsla(' + cur.hue + ', 80%, 65%, 0)');
                        aGrad.addColorStop(0.2, 'hsla(' + cur.hue + ', 80%, 60%, ' + op + ')');
                        aGrad.addColorStop(0.5, 'hsla(' + ((cur.hue + 30) % 360) + ', 70%, 55%, ' + (op * 0.8) + ')');
                        aGrad.addColorStop(0.8, 'hsla(' + ((cur.hue + 60) % 360) + ', 60%, 45%, ' + (op * 0.4) + ')');
                        aGrad.addColorStop(1, 'hsla(' + cur.hue + ', 50%, 40%, 0)');
                        ctx.fillStyle = aGrad;
                        ctx.fillRect(x, waveY, 4, colH);
                    }
                }

                // Mountain/treeline silhouette along the bottom
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 3) {
                    var my = h * 0.82
                        - Math.sin(x * 0.003 + 0.5) * h * 0.06
                        - Math.sin(x * 0.008 + 2.1) * h * 0.03
                        - Math.sin(x * 0.02 + 0.8) * h * 0.008;
                    ctx.lineTo(x, my);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = '#060a10';
                ctx.fill();

                // Small trees on the ridge
                for (var i = 0; i < 30; i++) {
                    var tx = (i / 30) * w + Math.sin(i * 5.3) * 15;
                    var tBase = h * 0.82 - Math.sin(tx * 0.003 + 0.5) * h * 0.06 - Math.sin(tx * 0.008 + 2.1) * h * 0.03;
                    var tHeight = 8 + Math.sin(i * 3.7) * 5;
                    ctx.beginPath();
                    ctx.moveTo(tx, tBase);
                    ctx.lineTo(tx - 3, tBase);
                    ctx.lineTo(tx, tBase - tHeight);
                    ctx.lineTo(tx + 3, tBase);
                    ctx.closePath();
                    ctx.fillStyle = '#050810';
                    ctx.fill();
                }
            }
        };
    })();

    // --- Twilight theme ---
    // Golden hour fading to blue hour, silhouetted clouds, first stars, fireflies
    themes.twilight = (function () {
        // Firefly state
        var fireflies = [];
        for (var i = 0; i < 15; i++) {
            fireflies.push({
                x: Math.random(),
                y: 0.65 + Math.random() * 0.3,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2,
                driftX: 0.01 + Math.random() * 0.02,
                driftY: 0.005 + Math.random() * 0.01,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2
            });
        }

        return {
            targetCount: 40,

            spawn: function (w, h) {
                // First stars appearing
                return {
                    x: Math.random() * w,
                    y: Math.random() * h * 0.4,
                    size: 0.3 + Math.random() * 1.2,
                    baseOpacity: 0.1 + Math.random() * 0.4,
                    twinkleSpeed: 0.8 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                return true;
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.3 + twinkle * 0.7);
                if (op < 0.03) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 240, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Golden hour to blue hour gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#0c1428');
                grad.addColorStop(0.2, '#1a2848');
                grad.addColorStop(0.4, '#3a3060');
                grad.addColorStop(0.55, '#8a4858');
                grad.addColorStop(0.7, '#d08848');
                grad.addColorStop(0.82, '#e8a838');
                grad.addColorStop(0.9, '#f0c040');
                grad.addColorStop(1, '#e0a030');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Silhouetted clouds drifting slowly
                for (var i = 0; i < 5; i++) {
                    var cx = ((i * 0.22 + Math.sin(i * 3.1) * 0.05 + t * 0.005) % 1.3 - 0.15) * w;
                    var cy = h * (0.3 + Math.sin(i * 4.7) * 0.1);
                    var crx = w * (0.08 + Math.sin(i * 2.3) * 0.03);
                    var cry = h * (0.02 + Math.sin(i * 3.9) * 0.008);
                    // Cloud as overlapping ellipses
                    ctx.save();
                    ctx.globalAlpha = 0.15;
                    for (var j = 0; j < 3; j++) {
                        var ox = crx * (j - 1) * 0.5;
                        var oy = cry * Math.sin(j * 2.1) * 0.3;
                        ctx.beginPath();
                        ctx.ellipse(cx + ox, cy + oy, crx * (0.6 + j * 0.15), cry * (0.8 + j * 0.1), 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(40, 20, 30, 1)';
                        ctx.fill();
                    }
                    ctx.restore();
                }
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;

                // Ground silhouette
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var gy = h * 0.88 - Math.sin(x * 0.004 + 0.3) * h * 0.02 - Math.sin(x * 0.01 + 1.7) * h * 0.008;
                    ctx.lineTo(x, gy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = '#0a0810';
                ctx.fill();

                // Fireflies glowing near the ground
                for (var i = 0; i < fireflies.length; i++) {
                    var ff = fireflies[i];
                    var fx = (ff.x + Math.sin(t * ff.driftX + ff.phaseX) * 0.08) * w;
                    var fy = (ff.y + Math.sin(t * ff.driftY + ff.phaseY) * 0.03) * h;
                    var pulse = Math.sin(t * ff.pulseSpeed + ff.pulseOffset);
                    var fOp = Math.max(0, pulse) * 0.25; // Only glow on positive half
                    if (fOp < 0.02) continue;
                    var ffGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
                    ffGrad.addColorStop(0, 'rgba(220, 255, 100, ' + fOp + ')');
                    ffGrad.addColorStop(0.3, 'rgba(180, 230, 60, ' + (fOp * 0.5) + ')');
                    ffGrad.addColorStop(1, 'rgba(140, 200, 40, 0)');
                    ctx.beginPath();
                    ctx.arc(fx, fy, 12, 0, Math.PI * 2);
                    ctx.fillStyle = ffGrad;
                    ctx.fill();
                    // Bright core
                    ctx.beginPath();
                    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(240, 255, 150, ' + (fOp * 0.8) + ')';
                    ctx.fill();
                }
            }
        };
    })();

    // --- Misty theme ---
    // Dense fog in a forest with drifting layers and tree silhouettes
    themes.misty = {
        targetCount: 30,

        spawn: function (w, h) {
            // Water droplets condensing and falling
            return {
                x: Math.random() * w,
                y: -Math.random() * h * 0.1,
                size: 0.5 + Math.random() * 1,
                speed: 20 + Math.random() * 30,
                opacity: 0.04 + Math.random() * 0.08
            };
        },

        update: function (p, dt, w, h, state) {
            p.y += p.speed * dt;
            if (p.y > h + 5) return false;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 210, 220, ' + p.opacity + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Muted grey-green forest atmosphere
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#6a7a6a');
            grad.addColorStop(0.3, '#788878');
            grad.addColorStop(0.6, '#8a9888');
            grad.addColorStop(1, '#7a8a78');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Soft light blooms breaking through
            for (var i = 0; i < 4; i++) {
                var lx = (0.2 + i * 0.2 + Math.sin(t * 0.03 + i * 2) * 0.05) * w;
                var ly = (0.15 + Math.sin(t * 0.02 + i * 3) * 0.05) * h;
                var lr = Math.min(w, h) * (0.15 + Math.sin(t * 0.1 + i * 1.5) * 0.03);
                var lOp = 0.04 + Math.sin(t * 0.15 + i * 2.3) * 0.02;
                var lGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
                lGrad.addColorStop(0, 'rgba(230, 240, 220, ' + lOp + ')');
                lGrad.addColorStop(1, 'rgba(200, 210, 190, 0)');
                ctx.beginPath();
                ctx.arc(lx, ly, lr, 0, Math.PI * 2);
                ctx.fillStyle = lGrad;
                ctx.fill();
            }

            // Tree trunk silhouettes at varying distances
            var treeConfigs = [
                { x: 0.05, w: 0.015, depth: 0.3 },
                { x: 0.15, w: 0.02, depth: 0.5 },
                { x: 0.28, w: 0.012, depth: 0.2 },
                { x: 0.42, w: 0.018, depth: 0.6 },
                { x: 0.55, w: 0.014, depth: 0.35 },
                { x: 0.68, w: 0.022, depth: 0.7 },
                { x: 0.78, w: 0.016, depth: 0.4 },
                { x: 0.90, w: 0.013, depth: 0.25 },
                { x: 0.35, w: 0.02, depth: 0.8 },
                { x: 0.82, w: 0.017, depth: 0.55 }
            ];
            for (var i = 0; i < treeConfigs.length; i++) {
                var tr = treeConfigs[i];
                var treeOp = 0.08 + (1 - tr.depth) * 0.12;
                var tx = tr.x * w;
                var tw = tr.w * w;
                ctx.fillStyle = 'rgba(40, 50, 40, ' + treeOp + ')';
                ctx.fillRect(tx, h * 0.1, tw, h * 0.9);
                // Slight taper
                ctx.beginPath();
                ctx.moveTo(tx, h * 0.1);
                ctx.lineTo(tx + tw * 0.5, h * 0.05);
                ctx.lineTo(tx + tw, h * 0.1);
                ctx.fillStyle = 'rgba(40, 50, 40, ' + (treeOp * 0.5) + ')';
                ctx.fill();
            }
        },

        drawForeground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Drifting fog layers at different speeds and heights
            for (var layer = 0; layer < 6; layer++) {
                var fogY = h * (0.15 + layer * 0.14);
                var fogSpeed = 8 + layer * 5;
                var fogOp = 0.06 + (layer % 2) * 0.02;
                ctx.beginPath();
                var fogOffset = t * fogSpeed;
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var fy = fogY
                        + Math.sin((x + fogOffset) * 0.004 + layer * 1.5) * 25
                        + Math.sin((x + fogOffset) * 0.008 + layer * 3 + 1) * 12;
                    ctx.lineTo(x, fy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(190, 200, 190, ' + fogOp + ')';
                ctx.fill();
            }
        }
    };
})(window.CV.themes);
