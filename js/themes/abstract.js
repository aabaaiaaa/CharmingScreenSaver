(function (themes, FALLBACK_DT) {
    // --- Crystalline theme ---
    // Slowly growing crystal formations with refractive highlights
    themes.crystalline = (function () {
        // Crystal seed points with branches
        var crystals = [];
        for (var i = 0; i < 8; i++) {
            var branches = [];
            var branchCount = 3 + Math.floor(Math.sin(i * 4.3) * 2 + 2);
            for (var b = 0; b < branchCount; b++) {
                branches.push({
                    angle: (b / branchCount) * Math.PI * 2 + Math.sin(i * 2.7 + b * 1.3) * 0.3,
                    length: 0.03 + (Math.sin(i * 3.1 + b * 2.5) * 0.5 + 0.5) * 0.06,
                    width: 2 + Math.sin(i * 5.1 + b * 1.7) * 1.5,
                    growSpeed: 0.08 + Math.sin(i * 2.3 + b * 3.1) * 0.04
                });
            }
            crystals.push({
                x: 0.08 + (i / 8) * 0.84 + Math.sin(i * 5.7) * 0.04,
                y: 0.55 + (Math.sin(i * 3.3 + 0.8) * 0.5 + 0.5) * 0.35,
                branches: branches,
                hue: 190 + Math.sin(i * 4.1) * 20
            });
        }

        return {
            targetCount: 25,

            spawn: function (w, h) {
                // Sparkle particles
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 1.5,
                    opacity: 0.1 + Math.random() * 0.3,
                    twinkleSpeed: 1.5 + Math.random() * 3,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    life: 0,
                    maxLife: 2 + Math.random() * 4
                };
            },

            update: function (p, dt, w, h, state) {
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                return true;
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var fade = p.life < 0.3 ? p.life / 0.3 : (p.life > p.maxLife - 0.5 ? (p.maxLife - p.life) / 0.5 : 1);
                var op = p.opacity * (0.2 + twinkle * 0.8) * fade;
                if (op < 0.02) return;
                // Draw as a small cross/star shape
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.strokeStyle = 'rgba(200, 230, 255, ' + op + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0);
                ctx.moveTo(0, -p.size); ctx.lineTo(0, p.size);
                ctx.stroke();
                ctx.restore();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Cool ice-blue to dark background
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#0a1020');
                grad.addColorStop(0.3, '#0c1830');
                grad.addColorStop(0.6, '#102040');
                grad.addColorStop(1, '#0e1828');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                var minDim = Math.min(w, h);
                // Draw crystal formations
                for (var i = 0; i < crystals.length; i++) {
                    var cr = crystals[i];
                    var cx = cr.x * w;
                    var cy = cr.y * h;

                    for (var b = 0; b < cr.branches.length; b++) {
                        var br = cr.branches[b];
                        // Growth animation - crystal extends over time
                        var growPhase = (Math.sin(t * br.growSpeed + i * 1.7 + b * 2.3) * 0.5 + 0.5);
                        var len = br.length * minDim * (0.5 + growPhase * 0.5);
                        var endX = cx + Math.cos(br.angle) * len;
                        var endY = cy + Math.sin(br.angle) * len;

                        // Crystal edge with gradient
                        var brGrad = ctx.createLinearGradient(cx, cy, endX, endY);
                        brGrad.addColorStop(0, 'hsla(' + cr.hue + ', 50%, 60%, 0.15)');
                        brGrad.addColorStop(0.5, 'hsla(' + cr.hue + ', 60%, 70%, 0.08)');
                        brGrad.addColorStop(1, 'hsla(' + cr.hue + ', 40%, 80%, 0.03)');
                        ctx.beginPath();
                        ctx.moveTo(cx, cy);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = brGrad;
                        ctx.lineWidth = br.width;
                        ctx.lineCap = 'round';
                        ctx.stroke();

                        // Refractive rainbow highlight near the tip
                        var highlightOp = growPhase * 0.1;
                        if (highlightOp > 0.02) {
                            var hGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 8);
                            hGrad.addColorStop(0, 'rgba(255, 255, 255, ' + highlightOp + ')');
                            hGrad.addColorStop(0.3, 'hsla(' + ((cr.hue + 60) % 360) + ', 80%, 80%, ' + (highlightOp * 0.5) + ')');
                            hGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
                            ctx.beginPath();
                            ctx.arc(endX, endY, 8, 0, Math.PI * 2);
                            ctx.fillStyle = hGrad;
                            ctx.fill();
                        }

                        // Sub-branches
                        for (var sb = 0; sb < 2; sb++) {
                            var subFrac = 0.4 + sb * 0.3;
                            var subX = cx + Math.cos(br.angle) * len * subFrac;
                            var subY = cy + Math.sin(br.angle) * len * subFrac;
                            var subAngle = br.angle + (sb === 0 ? 0.5 : -0.5);
                            var subLen = len * 0.3;
                            var subEndX = subX + Math.cos(subAngle) * subLen;
                            var subEndY = subY + Math.sin(subAngle) * subLen;
                            ctx.beginPath();
                            ctx.moveTo(subX, subY);
                            ctx.lineTo(subEndX, subEndY);
                            ctx.strokeStyle = 'hsla(' + cr.hue + ', 50%, 65%, 0.06)';
                            ctx.lineWidth = br.width * 0.6;
                            ctx.stroke();
                        }
                    }

                    // Seed point glow
                    var seedGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
                    seedGrad.addColorStop(0, 'hsla(' + cr.hue + ', 60%, 70%, 0.12)');
                    seedGrad.addColorStop(1, 'hsla(' + cr.hue + ', 50%, 60%, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
                    ctx.fillStyle = seedGrad;
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state) {}
        };
    })();

    // --- Embers theme ---
    // Dying campfire with floating embers, warm glow, wispy smoke
    themes.embers = (function () {
        // Smoke trail state
        var smokeParticles = [];
        var SMOKE_MAX = 20;

        return {
            targetCount: 45,

            spawn: function (w, h) {
                // Ember particles floating upward
                var isLarge = Math.random() < 0.15;
                return {
                    x: w * (0.3 + Math.random() * 0.4),
                    y: h * (0.75 + Math.random() * 0.15),
                    size: isLarge ? (2 + Math.random() * 3) : (0.5 + Math.random() * 2),
                    speed: -(15 + Math.random() * 35),
                    driftAmp: 20 + Math.random() * 40,
                    driftSpeed: 0.3 + Math.random() * 0.8,
                    driftOffset: Math.random() * Math.PI * 2,
                    startOpacity: 0.5 + Math.random() * 0.5,
                    hue: 15 + Math.random() * 25, // orange to red
                    life: 0,
                    maxLife: 3 + Math.random() * 5,
                    isLarge: isLarge
                };
            },

            update: function (p, dt, w, h, state) {
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                p.y += p.speed * dt;
                p.x += Math.sin(state.timeElapsed * p.driftSpeed + p.driftOffset) * p.driftAmp * dt;
                // Cool and dim as they rise
                if (p.y < h * 0.2) return false;
                return true;
            },

            draw: function (p, ctx, state) {
                var progress = p.life / p.maxLife;
                var fade = progress < 0.1 ? progress / 0.1 : (1 - (progress - 0.1) / 0.9);
                var op = p.startOpacity * fade;
                if (op < 0.02) return;
                // Colour shifts from bright orange to dim red as it ages
                var hue = p.hue - progress * 10;
                var lightness = 60 - progress * 25;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + hue + ', 100%, ' + lightness + '%, ' + op + ')';
                ctx.fill();
                // Glow around larger embers
                if (p.isLarge && op > 0.1) {
                    var gGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                    gGrad.addColorStop(0, 'hsla(' + hue + ', 100%, 50%, ' + (op * 0.15) + ')');
                    gGrad.addColorStop(1, 'hsla(' + hue + ', 80%, 40%, 0)');
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fillStyle = gGrad;
                    ctx.fill();
                }
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Deep black background
                var grad = ctx.createRadialGradient(w * 0.5, h * 0.85, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
                grad.addColorStop(0, '#1a0a04');
                grad.addColorStop(0.3, '#0c0604');
                grad.addColorStop(0.6, '#060404');
                grad.addColorStop(1, '#020202');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Warm fire glow at the bottom
                var glowPulse = Math.sin(t * 1.5) * 0.02 + Math.sin(t * 2.3 + 1.1) * 0.015;
                var fireGlow = ctx.createRadialGradient(w * 0.5, h * 0.88, 0, w * 0.5, h * 0.88, Math.min(w, h) * 0.4);
                fireGlow.addColorStop(0, 'rgba(255, 120, 20, ' + (0.12 + glowPulse) + ')');
                fireGlow.addColorStop(0.3, 'rgba(255, 80, 10, ' + (0.06 + glowPulse * 0.5) + ')');
                fireGlow.addColorStop(0.6, 'rgba(200, 50, 5, ' + (0.02 + glowPulse * 0.2) + ')');
                fireGlow.addColorStop(1, 'rgba(100, 20, 0, 0)');
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.88, Math.min(w, h) * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = fireGlow;
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                // Wispy smoke trails rising from the fire
                if (Math.random() < dt * 2 && smokeParticles.length < SMOKE_MAX) {
                    smokeParticles.push({
                        x: w * (0.45 + Math.random() * 0.1),
                        y: h * 0.78,
                        size: 10 + Math.random() * 15,
                        vy: -(10 + Math.random() * 20),
                        vx: (Math.random() - 0.5) * 8,
                        opacity: 0.04 + Math.random() * 0.04,
                        life: 0,
                        maxLife: 4 + Math.random() * 4
                    });
                }
                for (var i = smokeParticles.length - 1; i >= 0; i--) {
                    var sp = smokeParticles[i];
                    sp.life += dt;
                    if (sp.life >= sp.maxLife) {
                        smokeParticles.splice(i, 1);
                        continue;
                    }
                    sp.y += sp.vy * dt;
                    sp.x += (sp.vx + Math.sin(t * 0.5 + i) * 5) * dt;
                    sp.size += 3 * dt;
                    var fade = sp.life > sp.maxLife * 0.5 ? (1 - (sp.life - sp.maxLife * 0.5) / (sp.maxLife * 0.5)) : 1;
                    var sOp = sp.opacity * fade;
                    if (sOp < 0.005) continue;
                    var smGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.size);
                    smGrad.addColorStop(0, 'rgba(80, 70, 60, ' + sOp + ')');
                    smGrad.addColorStop(1, 'rgba(60, 55, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                    ctx.fillStyle = smGrad;
                    ctx.fill();
                }
            }
        };
    })();

    // --- Inkwell theme ---
    // Ink dropped in water with blooming tendrils
    themes.inkwell = (function () {
        // Ink drop state
        var inkDrops = [];
        var MAX_DROPS = 5;
        var dropTimer = 2;

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                inkDrops.length = 0;
                dropTimer = 1;
            },

            drawBackground: function (ctx, w, h, state) {
                // Pale water-like background
                var grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
                grad.addColorStop(0, '#e8e4e0');
                grad.addColorStop(0.5, '#d8d4d0');
                grad.addColorStop(1, '#c8c4c0');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var minDim = Math.min(w, h);

                // Spawn new ink drops periodically
                dropTimer -= dt;
                if (dropTimer <= 0 && inkDrops.length < MAX_DROPS) {
                    var hues = [240, 260, 220, 280, 200]; // blues and purples
                    inkDrops.push({
                        x: w * (0.2 + Math.random() * 0.6),
                        y: h * (0.2 + Math.random() * 0.6),
                        life: 0,
                        maxLife: 12 + Math.random() * 8,
                        hue: hues[Math.floor(Math.random() * hues.length)],
                        tendrils: (function () {
                            var arr = [];
                            var count = 6 + Math.floor(Math.random() * 6);
                            for (var j = 0; j < count; j++) {
                                arr.push({
                                    angle: (j / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
                                    speed: 15 + Math.random() * 25,
                                    curl: (Math.random() - 0.5) * 1.5,
                                    width: 3 + Math.random() * 5
                                });
                            }
                            return arr;
                        })()
                    });
                    dropTimer = 3 + Math.random() * 5;
                }

                // Draw ink drops
                for (var d = inkDrops.length - 1; d >= 0; d--) {
                    var drop = inkDrops[d];
                    drop.life += dt;
                    if (drop.life >= drop.maxLife) {
                        inkDrops.splice(d, 1);
                        continue;
                    }
                    var prog = drop.life / drop.maxLife;
                    var fadeIn = Math.min(1, drop.life * 2);
                    var fadeOut = prog > 0.6 ? (1 - (prog - 0.6) / 0.4) : 1;
                    var opacity = fadeIn * fadeOut;

                    // Central bloom
                    var bloomR = minDim * (0.02 + prog * 0.06);
                    var bGrad = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, bloomR);
                    bGrad.addColorStop(0, 'hsla(' + drop.hue + ', 40%, 15%, ' + (opacity * 0.3) + ')');
                    bGrad.addColorStop(0.4, 'hsla(' + drop.hue + ', 50%, 20%, ' + (opacity * 0.15) + ')');
                    bGrad.addColorStop(1, 'hsla(' + drop.hue + ', 40%, 25%, 0)');
                    ctx.beginPath();
                    ctx.arc(drop.x, drop.y, bloomR, 0, Math.PI * 2);
                    ctx.fillStyle = bGrad;
                    ctx.fill();

                    // Tendrils extending outward
                    for (var j = 0; j < drop.tendrils.length; j++) {
                        var ten = drop.tendrils[j];
                        var tLen = ten.speed * drop.life;
                        ctx.beginPath();
                        var segments = 20;
                        for (var s = 0; s <= segments; s++) {
                            var frac = s / segments;
                            var dist = tLen * frac;
                            var curlAngle = ten.angle + ten.curl * frac * frac;
                            var tx = drop.x + Math.cos(curlAngle) * dist;
                            var ty = drop.y + Math.sin(curlAngle) * dist;
                            // Add organic wobble
                            tx += Math.sin(frac * 8 + t * 0.3 + j * 2) * (3 + dist * 0.05);
                            ty += Math.cos(frac * 6 + t * 0.2 + j * 3) * (2 + dist * 0.04);
                            if (s === 0) ctx.moveTo(tx, ty);
                            else ctx.lineTo(tx, ty);
                        }
                        var tOp = opacity * (0.08 + (1 - prog) * 0.08);
                        ctx.strokeStyle = 'hsla(' + ((drop.hue + j * 10) % 360) + ', 45%, 20%, ' + tOp + ')';
                        ctx.lineWidth = ten.width * (1 - prog * 0.5);
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }
                }
            }
        };
    })();
})(window.CV.themes, window.CV.FALLBACK_DT);
