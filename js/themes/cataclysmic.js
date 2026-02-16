(function (themes, FALLBACK_DT) {
    // --- Supernova theme ---
    // Star exploding with shockwave, ejected material, debris filaments
    themes.supernova = (function () {
        // Explosion cycle (repeats)
        var CYCLE_DURATION = 18;

        // Debris filaments
        var filaments = [];
        for (var i = 0; i < 20; i++) {
            filaments.push({
                angle: (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
                speed: 0.06 + Math.random() * 0.08,
                length: 0.03 + Math.random() * 0.05,
                width: 1 + Math.random() * 2,
                hue: [0, 30, 200, 50, 340][i % 5]
            });
        }

        return {
            cycleDuration: CYCLE_DURATION,
            targetCount: 100,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.2 + Math.random() * 0.5,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    shakeAmp: Math.random() * 3
                };
            },

            update: function (p, dt, w, h, state) { return true; },

            draw: function (p, ctx, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var twinkle = Math.sin(t * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                // Stars shake during the shockwave
                var shakeIntensity = cycle > 0.15 && cycle < 0.4 ? (1 - (cycle - 0.15) / 0.25) * 3 : 0;
                var sx = p.x + Math.sin(t * 20 + p.twinkleOffset) * shakeIntensity * p.shakeAmp;
                var sy = p.y + Math.cos(t * 18 + p.twinkleOffset * 2) * shakeIntensity * p.shakeAmp;
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                // Dark space
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var cx = w * 0.5;
                var cy = h * 0.5;
                var minDim = Math.min(w, h);
                var maxDim = Math.max(w, h);

                // Phase 1: Star brightens (0-0.1)
                if (cycle < 0.1) {
                    var brightPhase = cycle / 0.1;
                    var coreR = minDim * (0.01 + brightPhase * 0.03);
                    var coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
                    coreGrad.addColorStop(0, 'rgba(255, 255, 250, ' + (0.3 + brightPhase * 0.6) + ')');
                    coreGrad.addColorStop(0.3, 'rgba(255, 240, 200, ' + (0.1 + brightPhase * 0.3) + ')');
                    coreGrad.addColorStop(1, 'rgba(255, 200, 150, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
                    ctx.fillStyle = coreGrad;
                    ctx.fill();
                }

                // Phase 2: Explosion (0.1-0.5) - shockwave expanding
                if (cycle >= 0.1 && cycle < 0.5) {
                    var explPhase = (cycle - 0.1) / 0.4;
                    var blastR = explPhase * maxDim * 0.8;
                    var fadeOut = 1 - explPhase;

                    // White flash
                    if (explPhase < 0.15) {
                        var flashOp = (1 - explPhase / 0.15) * 0.4;
                        ctx.fillStyle = 'rgba(255, 255, 255, ' + flashOp + ')';
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Expanding bright core
                    var coreR = minDim * (0.03 + explPhase * 0.08) * fadeOut;
                    if (coreR > 1) {
                        var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
                        cGrad.addColorStop(0, 'rgba(255, 255, 250, ' + (fadeOut * 0.8) + ')');
                        cGrad.addColorStop(0.5, 'rgba(255, 220, 150, ' + (fadeOut * 0.3) + ')');
                        cGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
                        ctx.fillStyle = cGrad;
                        ctx.fill();
                    }

                    // Shockwave ring
                    var ringWidth = 5 + explPhase * 15;
                    var ringOp = fadeOut * 0.3;
                    ctx.beginPath();
                    ctx.arc(cx, cy, blastR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(150, 200, 255, ' + ringOp + ')';
                    ctx.lineWidth = ringWidth;
                    ctx.stroke();

                    // Ejected material layers
                    var layers = [
                        { r: 0.9, hue: 10, sat: 80, light: 50 },
                        { r: 0.7, hue: 220, sat: 60, light: 55 },
                        { r: 0.5, hue: 40, sat: 70, light: 50 }
                    ];
                    for (var l = 0; l < layers.length; l++) {
                        var lr = blastR * layers[l].r;
                        var lOp = fadeOut * 0.08;
                        var lGrad = ctx.createRadialGradient(cx, cy, lr * 0.5, cx, cy, lr);
                        lGrad.addColorStop(0, 'hsla(' + layers[l].hue + ', ' + layers[l].sat + '%, ' + layers[l].light + '%, 0)');
                        lGrad.addColorStop(0.7, 'hsla(' + layers[l].hue + ', ' + layers[l].sat + '%, ' + layers[l].light + '%, ' + lOp + ')');
                        lGrad.addColorStop(1, 'hsla(' + layers[l].hue + ', ' + layers[l].sat + '%, ' + layers[l].light + '%, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, lr, 0, Math.PI * 2);
                        ctx.fillStyle = lGrad;
                        ctx.fill();
                    }

                    // Debris filaments stretching into space
                    for (var i = 0; i < filaments.length; i++) {
                        var f = filaments[i];
                        var fDist = blastR * f.speed * 10;
                        var fLen = minDim * f.length * explPhase;
                        var fx = cx + Math.cos(f.angle) * fDist;
                        var fy = cy + Math.sin(f.angle) * fDist;
                        var fEndX = fx + Math.cos(f.angle) * fLen;
                        var fEndY = fy + Math.sin(f.angle) * fLen;
                        var fOp = fadeOut * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(fx, fy);
                        ctx.lineTo(fEndX, fEndY);
                        ctx.strokeStyle = 'hsla(' + f.hue + ', 70%, 60%, ' + fOp + ')';
                        ctx.lineWidth = f.width;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }
                }

                // Phase 3: Aftermath glow / nebula remnant (0.5-1.0)
                if (cycle >= 0.5) {
                    var afterPhase = (cycle - 0.5) / 0.5;
                    var remnantOp = (1 - afterPhase) * 0.06;
                    var remnantR = maxDim * (0.3 + afterPhase * 0.2);
                    if (remnantOp > 0.005) {
                        var rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, remnantR);
                        rGrad.addColorStop(0, 'rgba(200, 100, 50, ' + remnantOp + ')');
                        rGrad.addColorStop(0.4, 'rgba(100, 60, 150, ' + (remnantOp * 0.6) + ')');
                        rGrad.addColorStop(1, 'rgba(50, 80, 180, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, remnantR, 0, Math.PI * 2);
                        ctx.fillStyle = rGrad;
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Maelstrom theme ---
    // Massive ocean whirlpool with spiraling water, foam, debris
    themes.maelstrom = {
        targetCount: 60,

        spawn: function (w, h) {
            // Foam and debris particles caught in the vortex
            var angle = Math.random() * Math.PI * 2;
            var dist = 0.15 + Math.random() * 0.35;
            return {
                angle: angle,
                dist: dist,
                size: 1 + Math.random() * 3,
                orbitSpeed: 0.3 + (1 - dist) * 1.5,
                inwardSpeed: 0.01 + Math.random() * 0.02,
                opacity: 0.15 + Math.random() * 0.3,
                isDebris: Math.random() < 0.2
            };
        },

        update: function (p, dt, w, h, state) {
            p.angle += p.orbitSpeed * dt;
            p.dist -= p.inwardSpeed * dt;
            if (p.dist < 0.02) {
                p.dist = 0.15 + Math.random() * 0.35;
                p.angle = Math.random() * Math.PI * 2;
            }
            return true;
        },

        draw: function (p, ctx, state) {
            var w = ctx.canvas.width;
            var h = ctx.canvas.height;
            var cx = w * 0.5;
            var cy = h * 0.5;
            var minDim = Math.min(w, h);
            var px = cx + Math.cos(p.angle) * p.dist * minDim;
            var py = cy + Math.sin(p.angle) * p.dist * minDim;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            if (p.isDebris) {
                ctx.fillStyle = 'rgba(100, 80, 50, ' + p.opacity + ')';
            } else {
                ctx.fillStyle = 'rgba(220, 240, 255, ' + p.opacity + ')';
            }
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            var cx = w * 0.5;
            var cy = h * 0.5;
            var minDim = Math.min(w, h);

            // Dark ocean base
            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.6);
            grad.addColorStop(0, '#080c18');
            grad.addColorStop(0.3, '#0c1828');
            grad.addColorStop(0.6, '#142840');
            grad.addColorStop(1, '#1a3858');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Concentric rotating wave rings
            for (var r = 0; r < 12; r++) {
                var ringDist = (r / 12) * minDim * 0.5;
                var rotSpeed = 0.5 + (1 - r / 12) * 1.5;
                ctx.beginPath();
                for (var a = 0; a <= Math.PI * 2; a += 0.05) {
                    var wobble = Math.sin(a * 6 + t * rotSpeed + r * 0.8) * (5 + r * 2);
                    var px = cx + Math.cos(a + t * rotSpeed * 0.3) * (ringDist + wobble);
                    var py = cy + Math.sin(a + t * rotSpeed * 0.3) * (ringDist + wobble);
                    if (a === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = 'rgba(80, 140, 180, ' + (0.03 + (1 - r / 12) * 0.04) + ')';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Dark churning centre
            var darkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.08);
            darkGrad.addColorStop(0, 'rgba(0, 0, 5, 0.6)');
            darkGrad.addColorStop(0.5, 'rgba(5, 10, 20, 0.3)');
            darkGrad.addColorStop(1, 'rgba(10, 20, 40, 0)');
            ctx.beginPath();
            ctx.arc(cx, cy, minDim * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = darkGrad;
            ctx.fill();

            // Spiral arms of water
            ctx.save();
            ctx.translate(cx, cy);
            for (var arm = 0; arm < 3; arm++) {
                ctx.beginPath();
                var armOffset = arm * Math.PI * 2 / 3;
                for (var s = 0; s < 80; s++) {
                    var frac = s / 80;
                    var spiralAngle = armOffset + frac * Math.PI * 4 + t * 0.4;
                    var spiralR = frac * minDim * 0.45;
                    var sx = Math.cos(spiralAngle) * spiralR;
                    var sy = Math.sin(spiralAngle) * spiralR;
                    if (s === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.strokeStyle = 'rgba(60, 120, 160, 0.06)';
                ctx.lineWidth = 3 + Math.sin(t + arm) * 1;
                ctx.stroke();
            }
            ctx.restore();
        },

        drawForeground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            var cx = w * 0.5;
            var cy = h * 0.5;
            var minDim = Math.min(w, h);
            // Spray particles flying outward from the vortex edge
            for (var i = 0; i < 15; i++) {
                var angle = t * 0.8 + i * Math.PI * 2 / 15;
                var dist = minDim * (0.35 + Math.sin(t * 2 + i * 1.7) * 0.05);
                var sprayDist = 10 + Math.sin(t * 3 + i * 2.3) * 8;
                var sx = cx + Math.cos(angle) * (dist + sprayDist);
                var sy = cy + Math.sin(angle) * (dist + sprayDist);
                var sOp = 0.04 + Math.sin(t * 2 + i) * 0.02;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 230, 255, ' + sOp + ')';
                ctx.fill();
            }
        }
    };

    // --- Earthquake theme ---
    // Ground splitting with cracks, shuddering terrain, dust, glowing fissures
    themes.earthquake = (function () {
        // Jolt state
        var joltTimer = 2 + Math.random() * 3;
        var joltIntensity = 0;
        var joltDecay = 3;

        // Crack configs
        var cracks = [];
        for (var i = 0; i < 12; i++) {
            var segs = [];
            var sx = (Math.sin(i * 5.3 + 0.7) * 0.5 + 0.5) * 0.8 + 0.1;
            var sy = 0.45 + Math.sin(i * 3.1) * 0.08;
            for (var s = 0; s < 6; s++) {
                segs.push({
                    dx: (Math.random() - 0.5) * 0.06,
                    dy: 0.02 + Math.random() * 0.04
                });
                sx += segs[s].dx;
                sy += segs[s].dy;
            }
            cracks.push({
                startX: (Math.sin(i * 5.3 + 0.7) * 0.5 + 0.5) * 0.8 + 0.1,
                startY: 0.45 + Math.sin(i * 3.1) * 0.08,
                segments: segs,
                width: 1 + Math.random() * 2,
                glowWidth: 4 + Math.random() * 6,
                speed: 0.5 + Math.random() * 1
            });
        }

        return {
            targetCount: 40,

            spawn: function (w, h) {
                // Dust and debris particles
                return {
                    x: Math.random() * w,
                    y: h * (0.4 + Math.random() * 0.2),
                    vx: (Math.random() - 0.5) * 40,
                    vy: -(20 + Math.random() * 60),
                    size: 1 + Math.random() * 3,
                    opacity: 0.1 + Math.random() * 0.2,
                    gravity: 50 + Math.random() * 50,
                    life: 0,
                    maxLife: 2 + Math.random() * 3
                };
            },

            update: function (p, dt, w, h, state) {
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += p.gravity * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var fade = p.life > p.maxLife * 0.6 ? (1 - (p.life - p.maxLife * 0.6) / (p.maxLife * 0.4)) : 1;
                var op = p.opacity * fade;
                if (op < 0.02) return;
                // Apply screen shake
                var shakeX = Math.sin(state.timeElapsed * 25) * joltIntensity * 2;
                var shakeY = Math.cos(state.timeElapsed * 22) * joltIntensity * 2;
                ctx.beginPath();
                ctx.arc(p.x + shakeX, p.y + shakeY, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(160, 130, 100, ' + op + ')';
                ctx.fill();
            },

            onActivate: function () {
                joltTimer = 1;
                joltIntensity = 0;
            },

            drawBackground: function (ctx, w, h, state, dt) {
                var t = state.timeElapsed;
                var shakeX = Math.sin(t * 25) * joltIntensity * 4;
                var shakeY = Math.cos(t * 22) * joltIntensity * 4;

                ctx.save();
                ctx.translate(shakeX, shakeY);

                // Terrain gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#4a5868');
                grad.addColorStop(0.35, '#687868');
                grad.addColorStop(0.5, '#586850');
                grad.addColorStop(0.7, '#4a5838');
                grad.addColorStop(1, '#3a4828');
                ctx.fillStyle = grad;
                ctx.fillRect(-10, -10, w + 20, h + 20);

                // Ground crack fissures with orange glow
                for (var i = 0; i < cracks.length; i++) {
                    var c = cracks[i];
                    var progress = Math.min(1, (t * c.speed * 0.3) % 2);
                    if (progress > 1) progress = 2 - progress;
                    var px = c.startX * w;
                    var py = c.startY * h;

                    // Glow underneath
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    for (var s = 0; s < c.segments.length * progress; s++) {
                        var seg = c.segments[Math.min(s, c.segments.length - 1)];
                        px += seg.dx * w;
                        py += seg.dy * h;
                        ctx.lineTo(px, py);
                    }
                    ctx.strokeStyle = 'rgba(255, 120, 20, 0.1)';
                    ctx.lineWidth = c.glowWidth + Math.sin(t * 2 + i) * 2;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Crack line
                    px = c.startX * w;
                    py = c.startY * h;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    for (var s = 0; s < c.segments.length * progress; s++) {
                        var seg = c.segments[Math.min(s, c.segments.length - 1)];
                        px += seg.dx * w;
                        py += seg.dy * h;
                        ctx.lineTo(px, py);
                    }
                    ctx.strokeStyle = 'rgba(255, 180, 60, 0.2)';
                    ctx.lineWidth = c.width;
                    ctx.stroke();
                }

                // Dust clouds along the cracks
                for (var i = 0; i < 20; i++) {
                    var dx = (Math.sin(i * 6.3 + t * 0.1) * 0.5 + 0.5) * w;
                    var dy = h * (0.45 + Math.sin(i * 3.7 + 0.4) * 0.15) - Math.sin(t * 0.5 + i) * 15;
                    var dOp = 0.02 + Math.sin(t * 0.4 + i * 2.1) * 0.01;
                    var dr = 15 + Math.sin(i * 2.3 + t * 0.3) * 8;
                    ctx.beginPath();
                    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(140, 120, 90, ' + dOp + ')';
                    ctx.fill();
                }

                ctx.restore();
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                // Periodic jolts
                joltTimer -= dt;
                if (joltTimer <= 0) {
                    joltIntensity = 0.5 + Math.random() * 0.5;
                    joltTimer = 2 + Math.random() * 4;
                }
                joltIntensity = Math.max(0, joltIntensity - joltDecay * dt);
            }
        };
    })();

    // --- Erupting theme ---
    // Plinian volcanic eruption with ash column, pyroclastic flows, lava bombs, lightning
    themes.erupting = (function () {
        // Lava bomb state
        var lavaBombs = [];
        var bombTimer = 0.3;
        // Ash lightning
        var ashLightning = { active: false, opacity: 0, timer: 3 + Math.random() * 5 };

        return {
            targetCount: 80,

            spawn: function (w, h) {
                // Ash/tephra raining down
                return {
                    x: Math.random() * w,
                    y: -Math.random() * h * 0.2,
                    size: 0.5 + Math.random() * 2,
                    speed: 30 + Math.random() * 50,
                    drift: (Math.random() - 0.5) * 20,
                    opacity: 0.08 + Math.random() * 0.15
                };
            },

            update: function (p, dt, w, h, state) {
                p.y += p.speed * dt;
                p.x += p.drift * dt;
                if (p.y > h + 5) return false;
                return true;
            },

            draw: function (p, ctx) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(100, 80, 70, ' + p.opacity + ')';
                ctx.fill();
            },

            onActivate: function () {
                lavaBombs.length = 0;
                bombTimer = 0.3;
                ashLightning.active = false;
                ashLightning.timer = 3 + Math.random() * 5;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark ominous sky
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1a1210');
                grad.addColorStop(0.3, '#2a1810');
                grad.addColorStop(0.5, '#3a2015');
                grad.addColorStop(0.7, '#4a2818');
                grad.addColorStop(1, '#2a1510');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Red/orange underlighting from the eruption
                var eruptGlow = ctx.createRadialGradient(w * 0.5, h * 0.7, 0, w * 0.5, h * 0.4, h * 0.6);
                eruptGlow.addColorStop(0, 'rgba(255, 80, 10, 0.12)');
                eruptGlow.addColorStop(0.4, 'rgba(200, 50, 5, 0.06)');
                eruptGlow.addColorStop(1, 'rgba(100, 20, 0, 0)');
                ctx.fillStyle = eruptGlow;
                ctx.fillRect(0, 0, w, h);

                // Volcano silhouette
                var volcX = w * 0.5;
                var volcBaseY = h * 0.85;
                var volcTopY = h * 0.55;
                ctx.beginPath();
                ctx.moveTo(0, volcBaseY);
                ctx.lineTo(volcX - w * 0.05, volcTopY);
                ctx.lineTo(volcX + w * 0.05, volcTopY);
                ctx.lineTo(w, volcBaseY);
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fillStyle = '#1a1008';
                ctx.fill();

                // Crater glow
                var craterGlow = ctx.createRadialGradient(volcX, volcTopY, 0, volcX, volcTopY, w * 0.06);
                craterGlow.addColorStop(0, 'rgba(255, 150, 30, 0.4)');
                craterGlow.addColorStop(0.5, 'rgba(255, 80, 10, 0.15)');
                craterGlow.addColorStop(1, 'rgba(200, 40, 0, 0)');
                ctx.beginPath();
                ctx.arc(volcX, volcTopY, w * 0.06, 0, Math.PI * 2);
                ctx.fillStyle = craterGlow;
                ctx.fill();

                // Massive ash column billowing upward
                for (var i = 0; i < 15; i++) {
                    var frac = i / 15;
                    var colY = volcTopY - frac * h * 0.5;
                    var spread = w * (0.03 + frac * 0.15);
                    var colX = volcX + Math.sin(t * 0.3 + frac * 5) * spread * 0.3;
                    var colR = spread * (0.6 + Math.sin(t * 0.5 + i * 1.3) * 0.2);
                    var colOp = 0.08 * (1 - frac * 0.5);
                    ctx.beginPath();
                    ctx.arc(colX, colY, colR, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(60, 50, 45, ' + colOp + ')';
                    ctx.fill();
                }

                // Pyroclastic flows racing down the sides
                for (var side = -1; side <= 1; side += 2) {
                    var flowX = volcX + side * w * 0.04;
                    ctx.beginPath();
                    ctx.moveTo(flowX, volcTopY + h * 0.05);
                    for (var s = 0; s < 15; s++) {
                        var frac = s / 15;
                        var fx = flowX + side * frac * w * 0.2 + Math.sin(t * 0.8 + s * 2 + side) * 10;
                        var fy = volcTopY + h * 0.05 + frac * (volcBaseY - volcTopY);
                        ctx.lineTo(fx, fy);
                    }
                    ctx.strokeStyle = 'rgba(200, 80, 20, 0.08)';
                    ctx.lineWidth = 15 + Math.sin(t + side) * 5;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var volcX = w * 0.5;
                var volcTopY = h * 0.55;

                // Lava bombs arcing through the sky
                bombTimer -= dt;
                if (bombTimer <= 0) {
                    var angle = -Math.PI * 0.25 - Math.random() * Math.PI * 0.5;
                    var speed = 150 + Math.random() * 200;
                    lavaBombs.push({
                        x: volcX + (Math.random() - 0.5) * 20,
                        y: volcTopY,
                        vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
                        vy: Math.sin(angle) * speed,
                        size: 2 + Math.random() * 4,
                        life: 0,
                        maxLife: 2 + Math.random() * 2
                    });
                    bombTimer = 0.1 + Math.random() * 0.4;
                }
                for (var i = lavaBombs.length - 1; i >= 0; i--) {
                    var lb = lavaBombs[i];
                    lb.life += dt;
                    if (lb.life >= lb.maxLife || lb.y > h + 10) {
                        lavaBombs.splice(i, 1);
                        continue;
                    }
                    lb.x += lb.vx * dt;
                    lb.y += lb.vy * dt;
                    lb.vy += 80 * dt;
                    var bOp = 0.6 * (1 - lb.life / lb.maxLife);
                    ctx.beginPath();
                    ctx.arc(lb.x, lb.y, lb.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 150, 20, ' + bOp + ')';
                    ctx.fill();
                    // Glow
                    ctx.beginPath();
                    ctx.arc(lb.x, lb.y, lb.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 100, 10, ' + (bOp * 0.1) + ')';
                    ctx.fill();
                }

                // Lightning within the ash cloud
                ashLightning.timer -= dt;
                if (!ashLightning.active && ashLightning.timer <= 0) {
                    ashLightning.active = true;
                    ashLightning.opacity = 0.2 + Math.random() * 0.2;
                    ashLightning.timer = 2 + Math.random() * 4;
                }
                if (ashLightning.active) {
                    ctx.fillStyle = 'rgba(255, 220, 180, ' + ashLightning.opacity + ')';
                    ctx.fillRect(0, 0, w, h * 0.4);
                    ashLightning.opacity -= 3 * dt;
                    if (ashLightning.opacity <= 0) { ashLightning.active = false; }
                }
            }
        };
    })();

    // --- Tornado theme ---
    // Violent twister with rotating funnel, debris, dark clouds, lightning
    themes.tornado = (function () {
        // Debris particles orbiting the funnel
        var DEBRIS_COUNT = 50;
        var debris = [];
        var debrisInited = false;
        var lightningState = { active: false, opacity: 0, timer: 5 + Math.random() * 8 };

        function initDebris() {
            debris.length = 0;
            for (var i = 0; i < DEBRIS_COUNT; i++) {
                debris.push({
                    angle: Math.random() * Math.PI * 2,
                    height: Math.random(),
                    dist: 0.3 + Math.random() * 0.7,
                    speed: 2 + Math.random() * 4,
                    size: 1 + Math.random() * 3,
                    opacity: 0.1 + Math.random() * 0.2
                });
            }
            debrisInited = true;
        }

        return {
            targetCount: 80,

            spawn: function (w, h) {
                // Rain particles
                return {
                    x: Math.random() * w + w * 0.15,
                    y: -Math.random() * h * 0.2,
                    speed: 250 + Math.random() * 150,
                    windDrift: 80 + Math.random() * 60,
                    length: 10 + Math.random() * 15,
                    opacity: 0.08 + Math.random() * 0.12
                };
            },

            update: function (p, dt, w, h, state) {
                p.y += p.speed * dt;
                p.x -= p.windDrift * dt;
                if (p.y > h + 20 || p.x < -20) return false;
                return true;
            },

            draw: function (p, ctx) {
                var angle = Math.atan2(p.speed, -p.windDrift);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(angle) * p.length, p.y + Math.sin(angle) * p.length);
                ctx.strokeStyle = 'rgba(150, 160, 170, ' + p.opacity + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            },

            onActivate: function () {
                initDebris();
                lightningState.active = false;
                lightningState.timer = 5 + Math.random() * 8;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark green-grey storm sky
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1a2018');
                grad.addColorStop(0.2, '#222820');
                grad.addColorStop(0.4, '#2a3028');
                grad.addColorStop(0.6, '#283028');
                grad.addColorStop(1, '#1a2018');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Roiling cloud base
                for (var i = 0; i < 8; i++) {
                    var cx = ((i * 0.14 + Math.sin(i * 3.7 + t * 0.03) * 0.04)) * w;
                    var cy = h * (0.08 + Math.sin(i * 2.3 + t * 0.05) * 0.03);
                    var cr = w * (0.12 + Math.sin(i * 4.1) * 0.04);
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, cr, cr * 0.4, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(20, 25, 18, 0.3)';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                if (!debrisInited) initDebris();
                var t = state.timeElapsed;

                // Funnel cloud
                var funnelTopX = w * (0.5 + Math.sin(t * 0.15) * 0.05);
                var funnelTopY = h * 0.12;
                var funnelBotX = w * (0.5 + Math.sin(t * 0.2 + 1) * 0.08);
                var funnelBotY = h * 0.85;
                var topWidth = w * 0.12;
                var botWidth = w * 0.02;

                // Draw funnel as tapered rotating shape
                for (var seg = 0; seg < 30; seg++) {
                    var frac = seg / 30;
                    var fx = funnelTopX + (funnelBotX - funnelTopX) * frac;
                    var fy = funnelTopY + (funnelBotY - funnelTopY) * frac;
                    var fw = topWidth + (botWidth - topWidth) * frac;
                    var rotation = Math.sin(t * 2 + frac * 5) * fw * 0.3;
                    ctx.beginPath();
                    ctx.ellipse(fx + rotation, fy, fw, fw * 0.15, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(30, 35, 28, ' + (0.04 + (1 - frac) * 0.03) + ')';
                    ctx.fill();
                }

                // Debris orbiting the funnel
                for (var i = 0; i < debris.length; i++) {
                    var d = debris[i];
                    d.angle += d.speed * dt;
                    var frac = d.height;
                    var fx = funnelTopX + (funnelBotX - funnelTopX) * frac;
                    var fy = funnelTopY + (funnelBotY - funnelTopY) * frac;
                    var fw = (topWidth + (botWidth - topWidth) * frac) * d.dist;
                    var dx = fx + Math.cos(d.angle) * fw;
                    var dy = fy + Math.sin(d.angle) * fw * 0.2;
                    ctx.beginPath();
                    ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(80, 70, 50, ' + d.opacity + ')';
                    ctx.fill();
                }

                // Lightning
                lightningState.timer -= dt;
                if (!lightningState.active && lightningState.timer <= 0) {
                    lightningState.active = true;
                    lightningState.opacity = 0.25 + Math.random() * 0.2;
                    lightningState.timer = 4 + Math.random() * 8;
                }
                if (lightningState.active) {
                    ctx.fillStyle = 'rgba(200, 210, 220, ' + lightningState.opacity + ')';
                    ctx.fillRect(0, 0, w, h);
                    lightningState.opacity -= 3.5 * dt;
                    if (lightningState.opacity <= 0) { lightningState.active = false; }
                }
            }
        };
    })();

    // --- Avalanche theme ---
    // Wall of snow cascading down with powder cloud and swept debris
    themes.avalanche = {
        targetCount: 100,

        spawn: function (w, h) {
            // Snow chunks tumbling
            return {
                x: Math.random() * w,
                y: -10 - Math.random() * h * 0.3,
                size: 2 + Math.random() * 8,
                speed: 120 + Math.random() * 180,
                drift: (Math.random() - 0.5) * 40,
                opacity: 0.15 + Math.random() * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 5,
                bounce: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.y += p.speed * dt;
            p.x += (p.drift + Math.sin(state.timeElapsed * 2 + p.bounce) * 15) * dt;
            p.rotation += p.rotSpeed * dt;
            if (p.y > h + p.size * 2) return false;
            return true;
        },

        draw: function (p, ctx) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.beginPath();
            // Irregular chunk shape
            ctx.moveTo(-p.size * 0.5, -p.size * 0.3);
            ctx.lineTo(p.size * 0.4, -p.size * 0.5);
            ctx.lineTo(p.size * 0.5, p.size * 0.2);
            ctx.lineTo(-p.size * 0.2, p.size * 0.5);
            ctx.closePath();
            ctx.fillStyle = 'rgba(235, 240, 250, ' + p.opacity + ')';
            ctx.fill();
            ctx.restore();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Mountain backdrop
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#7088a0');
            grad.addColorStop(0.3, '#8898a8');
            grad.addColorStop(0.5, '#a0b0c0');
            grad.addColorStop(1, '#c0ccd8');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Mountain silhouettes
            ctx.beginPath();
            ctx.moveTo(0, h * 0.5);
            ctx.lineTo(w * 0.15, h * 0.2);
            ctx.lineTo(w * 0.3, h * 0.35);
            ctx.lineTo(w * 0.5, h * 0.1);
            ctx.lineTo(w * 0.7, h * 0.3);
            ctx.lineTo(w * 0.85, h * 0.15);
            ctx.lineTo(w, h * 0.4);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fillStyle = 'rgba(60, 70, 80, 0.15)';
            ctx.fill();

            // Powder cloud billowing ahead of the main mass
            for (var i = 0; i < 10; i++) {
                var pcY = h * (0.2 + i * 0.06) + Math.sin(t * 0.8 + i * 2) * 15;
                var pcX = w * (0.3 + Math.sin(i * 3.7 + t * 0.2) * 0.2);
                var pcR = 40 + Math.sin(i * 2.1 + t * 0.5) * 20;
                var pcOp = 0.04 + Math.sin(t * 0.3 + i) * 0.02;
                ctx.beginPath();
                ctx.arc(pcX, pcY, pcR, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 230, 245, ' + pcOp + ')';
                ctx.fill();
            }

            // Dense white wall rolling down
            var wallY = ((t * 60) % (h * 1.5)) - h * 0.2;
            var wallGrad = ctx.createLinearGradient(0, wallY - h * 0.15, 0, wallY + h * 0.2);
            wallGrad.addColorStop(0, 'rgba(230, 240, 250, 0)');
            wallGrad.addColorStop(0.3, 'rgba(230, 240, 250, 0.06)');
            wallGrad.addColorStop(0.5, 'rgba(240, 245, 255, 0.1)');
            wallGrad.addColorStop(0.7, 'rgba(230, 240, 250, 0.06)');
            wallGrad.addColorStop(1, 'rgba(220, 235, 248, 0)');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(0, wallY - h * 0.15, w, h * 0.35);
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Meteor theme ---
    // Asteroid impact with fireball streak, expanding dome of light, shockwave, debris
    themes.meteor = (function () {
        var CYCLE = 14;

        return {
            cycleDuration: CYCLE,
            targetCount: 60,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.2,
                    baseOpacity: 0.2 + Math.random() * 0.5,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) { return true; },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#040310';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE) / CYCLE;
                var maxDim = Math.max(w, h);

                // Phase 1: Fireball streaks across (0-0.2)
                if (cycle < 0.2) {
                    var streakPhase = cycle / 0.2;
                    var startX = w * 0.9;
                    var startY = h * 0.05;
                    var endX = w * 0.35;
                    var endY = h * 0.65;
                    var fx = startX + (endX - startX) * streakPhase;
                    var fy = startY + (endY - startY) * streakPhase;
                    var trailLen = Math.min(streakPhase, 0.5) * maxDim * 0.3;
                    var dx = (endX - startX);
                    var dy = (endY - startY);
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var nx = -dx / dist;
                    var ny = -dy / dist;

                    // Trail
                    var trGrad = ctx.createLinearGradient(fx, fy, fx + nx * trailLen, fy + ny * trailLen);
                    trGrad.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
                    trGrad.addColorStop(0.3, 'rgba(255, 120, 20, 0.15)');
                    trGrad.addColorStop(1, 'rgba(200, 60, 10, 0)');
                    ctx.beginPath();
                    ctx.moveTo(fx - ny * 8, fy + nx * 8);
                    ctx.lineTo(fx + ny * 8, fy - nx * 8);
                    ctx.lineTo(fx + nx * trailLen, fy + ny * trailLen);
                    ctx.closePath();
                    ctx.fillStyle = trGrad;
                    ctx.fill();

                    // Fireball head
                    var fbGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 20);
                    fbGrad.addColorStop(0, 'rgba(255, 255, 240, 0.8)');
                    fbGrad.addColorStop(0.3, 'rgba(255, 200, 80, 0.4)');
                    fbGrad.addColorStop(1, 'rgba(255, 120, 20, 0)');
                    ctx.beginPath();
                    ctx.arc(fx, fy, 20, 0, Math.PI * 2);
                    ctx.fillStyle = fbGrad;
                    ctx.fill();
                }

                // Phase 2: Impact (0.2-0.6)
                if (cycle >= 0.2 && cycle < 0.6) {
                    var impPhase = (cycle - 0.2) / 0.4;
                    var impX = w * 0.35;
                    var impY = h * 0.65;
                    var fadeOut = 1 - impPhase;

                    // Flash
                    if (impPhase < 0.1) {
                        ctx.fillStyle = 'rgba(255, 240, 200, ' + ((1 - impPhase / 0.1) * 0.5) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Expanding dome of light
                    var domeR = impPhase * maxDim * 0.6;
                    var domeGrad = ctx.createRadialGradient(impX, impY, domeR * 0.8, impX, impY, domeR);
                    domeGrad.addColorStop(0, 'rgba(255, 200, 100, 0)');
                    domeGrad.addColorStop(0.8, 'rgba(255, 180, 60, ' + (fadeOut * 0.08) + ')');
                    domeGrad.addColorStop(1, 'rgba(255, 150, 30, 0)');
                    ctx.beginPath();
                    ctx.arc(impX, impY, domeR, 0, Math.PI * 2);
                    ctx.fillStyle = domeGrad;
                    ctx.fill();

                    // Shockwave ring
                    ctx.beginPath();
                    ctx.arc(impX, impY, domeR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 220, 180, ' + (fadeOut * 0.2) + ')';
                    ctx.lineWidth = 3 + impPhase * 10;
                    ctx.stroke();

                    // Ejecta arcing in all directions
                    for (var i = 0; i < 20; i++) {
                        var eAngle = (i / 20) * Math.PI * 2 + Math.sin(i * 3.7) * 0.3;
                        var eSpeed = 0.3 + Math.sin(i * 2.3) * 0.15;
                        var eDist = impPhase * maxDim * eSpeed;
                        var eGravity = eDist * 0.1;
                        var ex = impX + Math.cos(eAngle) * eDist;
                        var ey = impY + Math.sin(eAngle) * eDist + eGravity;
                        var eOp = fadeOut * 0.2;
                        ctx.beginPath();
                        ctx.arc(ex, ey, 2 + Math.sin(i) * 1, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 180, 60, ' + eOp + ')';
                        ctx.fill();
                    }
                }

                // Phase 3: Sky turns orange, debris rain (0.6-1.0)
                if (cycle >= 0.6) {
                    var afterPhase = (cycle - 0.6) / 0.4;
                    var skyOp = (1 - afterPhase) * 0.05;
                    ctx.fillStyle = 'rgba(200, 100, 30, ' + skyOp + ')';
                    ctx.fillRect(0, 0, w, h);
                }
            }
        };
    })();

    // --- Tsunami theme ---
    // Towering wave rising and curling with foam, spray, darkened sky
    themes.tsunami = {
        targetCount: 40,

        spawn: function (w, h) {
            // Spray particles
            return {
                x: Math.random() * w,
                y: h * (0.2 + Math.random() * 0.4),
                size: 1 + Math.random() * 3,
                vx: (Math.random() - 0.5) * 30,
                vy: -(10 + Math.random() * 30),
                opacity: 0.1 + Math.random() * 0.15,
                gravity: 20 + Math.random() * 20,
                life: 0,
                maxLife: 2 + Math.random() * 3
            };
        },

        update: function (p, dt, w, h, state) {
            p.life += dt;
            if (p.life >= p.maxLife) return false;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            return true;
        },

        draw: function (p, ctx) {
            var fade = p.life > p.maxLife * 0.5 ? (1 - (p.life - p.maxLife * 0.5) / (p.maxLife * 0.5)) : 1;
            var op = p.opacity * fade;
            if (op < 0.02) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200, 230, 255, ' + op + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Dark storm sky
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#18202a');
            grad.addColorStop(0.25, '#202830');
            grad.addColorStop(0.4, '#283038');
            grad.addColorStop(0.5, '#1a4060');
            grad.addColorStop(0.7, '#184870');
            grad.addColorStop(1, '#103858');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Towering wave wall - cycles between building and cresting
            var waveCycle = (t * 0.08) % 1;
            var waveHeight = h * (0.4 + waveCycle * 0.2);
            var waveTopY = h - waveHeight;

            // Wave body
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (var x = 0; x <= w; x += 3) {
                var wy = waveTopY
                    + Math.sin(x * 0.004 + t * 0.3) * 20
                    + Math.sin(x * 0.01 + t * 0.5) * 10
                    + Math.pow(Math.sin(x * 0.002 + t * 0.15), 2) * 30;
                ctx.lineTo(x, wy);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            var waveGrad = ctx.createLinearGradient(0, waveTopY, 0, h);
            waveGrad.addColorStop(0, 'rgba(20, 60, 100, 0.5)');
            waveGrad.addColorStop(0.3, 'rgba(15, 50, 85, 0.4)');
            waveGrad.addColorStop(1, 'rgba(10, 40, 70, 0.3)');
            ctx.fillStyle = waveGrad;
            ctx.fill();

            // Curling crest (breaking wave lip)
            var crestY = waveTopY - 10;
            ctx.beginPath();
            for (var x = 0; x <= w; x += 3) {
                var cy = crestY + Math.sin(x * 0.004 + t * 0.3) * 20 + Math.sin(x * 0.01 + t * 0.5) * 10;
                var curl = Math.sin(x * 0.003 + t * 0.2) * 15;
                if (x === 0) ctx.moveTo(x, cy);
                else ctx.lineTo(x, cy + curl);
            }
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.15)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Foam on the crest
            for (var i = 0; i < 30; i++) {
                var fx = (Math.sin(i * 5.7 + t * 0.5) * 0.5 + 0.5) * w;
                var fy = crestY + Math.sin(fx * 0.004 + t * 0.3) * 20 + Math.sin(i * 3.1 + t) * 8;
                var fSize = 2 + Math.sin(i * 2.3) * 1.5;
                ctx.beginPath();
                ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(230, 245, 255, 0.08)';
                ctx.fill();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Bolts theme ---
    // Violent electrical storm with branching lightning, rain, screen shake
    themes.bolts = (function () {
        var bolts = [];
        var boltTimer = 0.5 + Math.random() * 1;
        var screenShake = 0;

        function createBolt(w, h) {
            var startX = w * (0.1 + Math.random() * 0.8);
            var segments = [];
            var x = startX;
            var y = 0;
            var segCount = 8 + Math.floor(Math.random() * 8);
            for (var s = 0; s < segCount; s++) {
                var nx = x + (Math.random() - 0.5) * 80;
                var ny = y + (h / segCount) * (0.8 + Math.random() * 0.4);
                segments.push({ x1: x, y1: y, x2: nx, y2: ny });
                // Branches
                if (Math.random() < 0.3) {
                    var bx = nx + (Math.random() - 0.5) * 60;
                    var by = ny + h / segCount * (0.3 + Math.random() * 0.4);
                    segments.push({ x1: nx, y1: ny, x2: bx, y2: by, branch: true });
                }
                x = nx;
                y = ny;
            }
            return { segments: segments, life: 0, maxLife: 0.15 + Math.random() * 0.15 };
        }

        return {
            targetCount: 120,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w + w * 0.1,
                    y: -Math.random() * h * 0.2,
                    speed: 350 + Math.random() * 200,
                    windDrift: 40 + Math.random() * 40,
                    length: 8 + Math.random() * 12,
                    opacity: 0.1 + Math.random() * 0.2
                };
            },

            update: function (p, dt, w, h, state) {
                p.y += p.speed * dt;
                p.x -= p.windDrift * dt;
                if (p.y > h + 20 || p.x < -20) return false;
                return true;
            },

            draw: function (p, ctx) {
                var angle = Math.atan2(p.speed, -p.windDrift);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(angle) * p.length, p.y + Math.sin(angle) * p.length);
                ctx.strokeStyle = 'rgba(180, 195, 210, ' + p.opacity + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            },

            onActivate: function () {
                bolts.length = 0;
                boltTimer = 0.5 + Math.random() * 1;
                screenShake = 0;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var shX = Math.sin(t * 30) * screenShake * 3;
                var shY = Math.cos(t * 27) * screenShake * 3;
                ctx.save();
                ctx.translate(shX, shY);
                // Very dark purple-grey sky
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#100c18');
                grad.addColorStop(0.3, '#18142a');
                grad.addColorStop(0.6, '#1a1830');
                grad.addColorStop(1, '#141020');
                ctx.fillStyle = grad;
                ctx.fillRect(-10, -10, w + 20, h + 20);
                // Heavy clouds
                for (var i = 0; i < 6; i++) {
                    var cx = (i * 0.18 + Math.sin(i * 3.1 + t * 0.02) * 0.03) * w;
                    var cy = h * (0.05 + Math.sin(i * 2.7) * 0.03);
                    var cr = w * (0.14 + Math.sin(i * 4.3) * 0.04);
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, cr, cr * 0.35, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(18, 15, 28, 0.4)';
                    ctx.fill();
                }
                ctx.restore();
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Spawn bolts
                boltTimer -= dt;
                if (boltTimer <= 0) {
                    bolts.push(createBolt(w, h));
                    screenShake = 0.8;
                    boltTimer = 0.3 + Math.random() * 1.5;
                    // Sometimes double-strike
                    if (Math.random() < 0.3) {
                        bolts.push(createBolt(w, h));
                    }
                }

                screenShake = Math.max(0, screenShake - 2 * dt);

                // Draw bolts
                for (var b = bolts.length - 1; b >= 0; b--) {
                    var bolt = bolts[b];
                    bolt.life += dt;
                    if (bolt.life >= bolt.maxLife) {
                        bolts.splice(b, 1);
                        continue;
                    }
                    var bFade = 1 - bolt.life / bolt.maxLife;

                    // Screen flash
                    if (bolt.life < 0.05) {
                        ctx.fillStyle = 'rgba(200, 210, 255, ' + (bFade * 0.15) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }

                    for (var s = 0; s < bolt.segments.length; s++) {
                        var seg = bolt.segments[s];
                        var isBranch = seg.branch;
                        // Bright core
                        ctx.beginPath();
                        ctx.moveTo(seg.x1, seg.y1);
                        ctx.lineTo(seg.x2, seg.y2);
                        ctx.strokeStyle = 'rgba(220, 230, 255, ' + (bFade * (isBranch ? 0.4 : 0.7)) + ')';
                        ctx.lineWidth = isBranch ? 1 : 2.5;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                        // Purple glow
                        ctx.beginPath();
                        ctx.moveTo(seg.x1, seg.y1);
                        ctx.lineTo(seg.x2, seg.y2);
                        ctx.strokeStyle = 'rgba(150, 120, 255, ' + (bFade * (isBranch ? 0.1 : 0.2)) + ')';
                        ctx.lineWidth = isBranch ? 4 : 8;
                        ctx.stroke();
                    }
                }
            }
        };
    })();

    // --- Solar Flare theme ---
    // Massive coronal mass ejection with plasma arcs, roiling surface, particle streams
    themes.solarflare = (function () {
        // Plasma arc configs
        var arcs = [];
        for (var i = 0; i < 6; i++) {
            arcs.push({
                angle: (Math.sin(i * 4.3 + 0.7) * 0.5 + 0.5) * Math.PI - Math.PI * 0.5,
                height: 0.15 + (Math.sin(i * 2.9) * 0.5 + 0.5) * 0.2,
                width: 0.05 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 0.08,
                speed: 0.3 + Math.sin(i * 5.1) * 0.15,
                phase: Math.random() * Math.PI * 2
            });
        }

        return {
            targetCount: 50,

            spawn: function (w, h) {
                // Particle streams blasting outward
                var angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
                var speed = 50 + Math.random() * 100;
                return {
                    x: w * 0.5 + (Math.random() - 0.5) * w * 0.1,
                    y: h * 0.75,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 0.5 + Math.random() * 2,
                    opacity: 0.15 + Math.random() * 0.25,
                    life: 0,
                    maxLife: 2 + Math.random() * 4
                };
            },

            update: function (p, dt, w, h, state) {
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var fade = p.life > p.maxLife * 0.5 ? (1 - (p.life - p.maxLife * 0.5) / (p.maxLife * 0.5)) : 1;
                var op = p.opacity * fade;
                if (op < 0.02) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 200, 80, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark space above, sun surface below
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#0a0408');
                grad.addColorStop(0.4, '#1a0808');
                grad.addColorStop(0.6, '#802800');
                grad.addColorStop(0.75, '#c04800');
                grad.addColorStop(0.85, '#e06800');
                grad.addColorStop(1, '#ff8800');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Convection cells on the sun's surface
                var surfaceY = h * 0.7;
                for (var i = 0; i < 25; i++) {
                    var cx = (Math.sin(i * 5.3 + t * 0.02 + 0.7) * 0.5 + 0.5) * w;
                    var cy = surfaceY + (Math.sin(i * 3.1 + 0.4) * 0.5 + 0.5) * h * 0.25;
                    var cr = 15 + Math.sin(i * 2.7 + t * 0.3) * 8;
                    var cOp = 0.04 + Math.sin(t * 0.5 + i * 1.3) * 0.02;
                    ctx.beginPath();
                    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 180, 50, ' + cOp + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Bright eruption point
                var eruptX = w * 0.5;
                var eruptY = h * 0.72;
                var pulse = Math.sin(t * 1.5) * 0.03;
                var eGrad = ctx.createRadialGradient(eruptX, eruptY, 0, eruptX, eruptY, w * 0.08);
                eGrad.addColorStop(0, 'rgba(255, 255, 230, ' + (0.4 + pulse) + ')');
                eGrad.addColorStop(0.3, 'rgba(255, 220, 120, ' + (0.2 + pulse) + ')');
                eGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
                ctx.beginPath();
                ctx.arc(eruptX, eruptY, w * 0.08, 0, Math.PI * 2);
                ctx.fillStyle = eGrad;
                ctx.fill();

                // Plasma arcs looping outward along magnetic field lines
                for (var i = 0; i < arcs.length; i++) {
                    var arc = arcs[i];
                    var animPhase = Math.sin(t * arc.speed + arc.phase);
                    var arcH = arc.height * h * (0.7 + animPhase * 0.3);
                    var arcW = arc.width * w;
                    var arcAngle = arc.angle + Math.sin(t * 0.1 + i * 2) * 0.1;

                    ctx.save();
                    ctx.translate(eruptX, eruptY);
                    ctx.rotate(arcAngle);

                    // Draw arc as a curved line
                    ctx.beginPath();
                    for (var s = 0; s <= 20; s++) {
                        var frac = s / 20;
                        var ax = (frac - 0.5) * arcW * 2;
                        var ay = -Math.sin(frac * Math.PI) * arcH;
                        if (s === 0) ctx.moveTo(ax, ay);
                        else ctx.lineTo(ax, ay);
                    }
                    var arcOp = 0.1 + animPhase * 0.05;
                    ctx.strokeStyle = 'rgba(255, 180, 60, ' + arcOp + ')';
                    ctx.lineWidth = 3 + animPhase * 2;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    // Hot core of arc
                    ctx.strokeStyle = 'rgba(255, 240, 180, ' + (arcOp * 0.5) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.restore();
                }

                // Coronal glow above the surface
                var coronaGrad = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.75);
                coronaGrad.addColorStop(0, 'rgba(255, 150, 50, 0)');
                coronaGrad.addColorStop(0.5, 'rgba(255, 120, 30, 0.03)');
                coronaGrad.addColorStop(1, 'rgba(255, 100, 20, 0.06)');
                ctx.fillStyle = coronaGrad;
                ctx.fillRect(0, h * 0.5, w, h * 0.25);
            },

            drawForeground: function (ctx, w, h, state) {}
        };
    })();
})(window.CV.themes, window.CV.FALLBACK_DT);
