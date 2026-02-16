(function (themes, FALLBACK_DT) {
    // --- Volcanic theme ---
    // Hawaiian-style lava flow with glowing cracks, lava rivers, steam
    themes.volcanic = (function () {
        // Lava fountain state
        var fountains = [];
        var fountainTimer = 3 + Math.random() * 5;
        var MAX_FOUNTAINS = 2;

        return {
            targetCount: 20,

            spawn: function (w, h) {
                // Steam/smoke particles rising
                return {
                    x: w * (0.1 + Math.random() * 0.8),
                    y: h * (0.5 + Math.random() * 0.3),
                    size: 5 + Math.random() * 10,
                    vy: -(8 + Math.random() * 15),
                    vx: (Math.random() - 0.5) * 6,
                    opacity: 0.03 + Math.random() * 0.04,
                    life: 0,
                    maxLife: 4 + Math.random() * 5
                };
            },

            update: function (p, dt, w, h, state) {
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                p.y += p.vy * dt;
                p.x += p.vx * dt;
                p.size += 2 * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var fade = p.life > p.maxLife * 0.5 ? (1 - (p.life - p.maxLife * 0.5) / (p.maxLife * 0.5)) : 1;
                var op = p.opacity * fade;
                if (op < 0.005) return;
                var smGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                smGrad.addColorStop(0, 'rgba(120, 110, 100, ' + op + ')');
                smGrad.addColorStop(1, 'rgba(80, 75, 70, 0)');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = smGrad;
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark basalt base
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1a0a08');
                grad.addColorStop(0.3, '#140808');
                grad.addColorStop(0.6, '#100606');
                grad.addColorStop(1, '#0c0404');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Lava glow from below
                var lavaGlow = ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h * 0.5, h * 0.8);
                lavaGlow.addColorStop(0, 'rgba(255, 80, 10, 0.08)');
                lavaGlow.addColorStop(0.4, 'rgba(200, 40, 5, 0.04)');
                lavaGlow.addColorStop(1, 'rgba(100, 20, 0, 0)');
                ctx.fillStyle = lavaGlow;
                ctx.fillRect(0, 0, w, h);

                // Glowing cracks and fissures in the cooled crust
                ctx.save();
                for (var i = 0; i < 20; i++) {
                    var x1 = (Math.sin(i * 5.3 + 0.7) * 0.5 + 0.5) * w;
                    var y1 = h * 0.4 + (Math.sin(i * 3.7 + 1.2) * 0.5 + 0.5) * h * 0.55;
                    var angle = Math.sin(i * 4.1 + 2.3) * Math.PI * 0.5;
                    var len = 20 + (Math.sin(i * 2.9) * 0.5 + 0.5) * 60;
                    var x2 = x1 + Math.cos(angle) * len;
                    var y2 = y1 + Math.sin(angle) * len;
                    var pulse = Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5;
                    var cOp = 0.1 + pulse * 0.15;

                    // Glow around crack
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = 'rgba(255, 100, 20, ' + (cOp * 0.3) + ')';
                    ctx.lineWidth = 8;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    // Crack line
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = 'rgba(255, 180, 40, ' + cOp + ')';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                ctx.restore();

                // Lava rivers - glowing flowing lines
                for (var r = 0; r < 3; r++) {
                    var ry = h * (0.55 + r * 0.15);
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 3) {
                        var rvy = ry + Math.sin(x * 0.005 + t * 0.1 + r * 2) * 15
                            + Math.sin(x * 0.012 + t * 0.15 + r * 4) * 8;
                        if (x === 0) ctx.moveTo(x, rvy);
                        else ctx.lineTo(x, rvy);
                    }
                    ctx.strokeStyle = 'rgba(255, 120, 20, 0.08)';
                    ctx.lineWidth = 6;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(255, 200, 60, 0.12)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                // Occasional lava fountain bursts
                fountainTimer -= dt;
                if (fountainTimer <= 0 && fountains.length < MAX_FOUNTAINS) {
                    var fx = w * (0.2 + Math.random() * 0.6);
                    var particles = [];
                    for (var i = 0; i < 20; i++) {
                        var angle = -Math.PI * 0.3 - Math.random() * Math.PI * 0.4;
                        var speed = 80 + Math.random() * 150;
                        particles.push({
                            x: fx, y: h * 0.6,
                            vx: Math.cos(angle) * speed * (0.4 + Math.random()),
                            vy: Math.sin(angle) * speed * (0.5 + Math.random()),
                            size: 1.5 + Math.random() * 3,
                            opacity: 0.6 + Math.random() * 0.4
                        });
                    }
                    fountains.push({ particles: particles, life: 0, maxLife: 2.5 + Math.random() * 2 });
                    fountainTimer = 4 + Math.random() * 6;
                }
                for (var f = fountains.length - 1; f >= 0; f--) {
                    var ftn = fountains[f];
                    ftn.life += dt;
                    if (ftn.life >= ftn.maxLife) { fountains.splice(f, 1); continue; }
                    var fFade = ftn.life > ftn.maxLife * 0.5 ? (1 - (ftn.life - ftn.maxLife * 0.5) / (ftn.maxLife * 0.5)) : 1;
                    for (var p = 0; p < ftn.particles.length; p++) {
                        var ep = ftn.particles[p];
                        ep.x += ep.vx * dt;
                        ep.y += ep.vy * dt;
                        ep.vy += 100 * dt;
                        var pOp = ep.opacity * fFade;
                        if (pOp < 0.02) continue;
                        ctx.beginPath();
                        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, ' + Math.floor(120 + Math.random() * 80) + ', 20, ' + pOp + ')';
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Cavern theme ---
    // Underground cave with stalactites/stalagmites, glowing minerals, underground pool
    themes.cavern = (function () {
        // Stalactite configs (hanging from top)
        var stalactites = [];
        for (var i = 0; i < 12; i++) {
            stalactites.push({
                x: (i / 12) + Math.sin(i * 4.3) * 0.02,
                length: 0.08 + (Math.sin(i * 3.1 + 0.5) * 0.5 + 0.5) * 0.15,
                width: 0.008 + (Math.sin(i * 2.7) * 0.5 + 0.5) * 0.01
            });
        }
        // Stalagmite configs (rising from bottom)
        var stalagmites = [];
        for (var i = 0; i < 10; i++) {
            stalagmites.push({
                x: 0.05 + (i / 10) * 0.9 + Math.sin(i * 5.1) * 0.03,
                height: 0.05 + (Math.sin(i * 2.3 + 1.7) * 0.5 + 0.5) * 0.12,
                width: 0.01 + (Math.sin(i * 3.9) * 0.5 + 0.5) * 0.015
            });
        }
        // Glowing mineral deposits
        var minerals = [];
        for (var i = 0; i < 15; i++) {
            minerals.push({
                x: (Math.sin(i * 6.7 + 0.3) * 0.5 + 0.5),
                y: (Math.sin(i * 4.3 + 2.1) * 0.5 + 0.5),
                hue: [170, 280, 120, 200, 50][i % 5],
                size: 0.005 + (Math.sin(i * 3.1) * 0.5 + 0.5) * 0.01,
                pulseSpeed: 0.3 + Math.sin(i * 2.7) * 0.2,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        // Water drop state
        var drops = [];
        var dropTimer = 1 + Math.random() * 2;

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                drops.length = 0;
                dropTimer = 1 + Math.random() * 2;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Very dark cave background
                var grad = ctx.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.6);
                grad.addColorStop(0, '#0e0a08');
                grad.addColorStop(0.4, '#0a0806');
                grad.addColorStop(1, '#040304');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Glowing mineral deposits in the walls
                for (var i = 0; i < minerals.length; i++) {
                    var m = minerals[i];
                    var mx = m.x * w;
                    var my = m.y * h;
                    var mSize = m.size * Math.min(w, h);
                    var pulse = Math.sin(t * m.pulseSpeed + m.pulseOffset);
                    var mOp = 0.04 + (pulse * 0.5 + 0.5) * 0.06;

                    var mGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mSize * 3);
                    mGrad.addColorStop(0, 'hsla(' + m.hue + ', 70%, 60%, ' + mOp + ')');
                    mGrad.addColorStop(0.4, 'hsla(' + m.hue + ', 60%, 50%, ' + (mOp * 0.4) + ')');
                    mGrad.addColorStop(1, 'hsla(' + m.hue + ', 50%, 40%, 0)');
                    ctx.beginPath();
                    ctx.arc(mx, my, mSize * 3, 0, Math.PI * 2);
                    ctx.fillStyle = mGrad;
                    ctx.fill();
                    // Bright core
                    ctx.beginPath();
                    ctx.arc(mx, my, mSize * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + m.hue + ', 80%, 70%, ' + (mOp * 0.6) + ')';
                    ctx.fill();
                }

                // Underground pool at the bottom (reflective surface)
                var poolY = h * 0.78;
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var py = poolY + Math.sin(x * 0.006 + t * 0.15) * 3 + Math.sin(x * 0.015 + t * 0.25) * 1.5;
                    ctx.lineTo(x, py);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(8, 15, 25, 0.4)';
                ctx.fill();

                // Pool reflections - faint copies of mineral glows
                for (var i = 0; i < minerals.length; i++) {
                    var m = minerals[i];
                    if (m.y > 0.6) continue;
                    var mx = m.x * w;
                    var reflY = poolY + (poolY - m.y * h) * 0.15;
                    var pulse = Math.sin(t * m.pulseSpeed + m.pulseOffset);
                    var rOp = (0.02 + (pulse * 0.5 + 0.5) * 0.02);
                    ctx.beginPath();
                    ctx.arc(mx + Math.sin(t * 0.5 + i) * 3, reflY, 8, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + m.hue + ', 50%, 50%, ' + rOp + ')';
                    ctx.fill();
                }

                // Stalactites
                for (var i = 0; i < stalactites.length; i++) {
                    var s = stalactites[i];
                    var sx = s.x * w;
                    var sLen = s.length * h;
                    var sW = s.width * w;
                    ctx.beginPath();
                    ctx.moveTo(sx - sW, 0);
                    ctx.lineTo(sx + sW, 0);
                    ctx.lineTo(sx, sLen);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(30, 25, 20, 0.4)';
                    ctx.fill();
                }

                // Stalagmites
                for (var i = 0; i < stalagmites.length; i++) {
                    var s = stalagmites[i];
                    var sx = s.x * w;
                    var sH = s.height * h;
                    var sW = s.width * w;
                    ctx.beginPath();
                    ctx.moveTo(sx - sW, h);
                    ctx.lineTo(sx + sW, h);
                    ctx.lineTo(sx, h - sH);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(35, 28, 22, 0.4)';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Water drops falling from stalactites
                dropTimer -= dt;
                if (dropTimer <= 0) {
                    var srcStal = stalactites[Math.floor(Math.random() * stalactites.length)];
                    drops.push({
                        x: srcStal.x * w,
                        y: srcStal.length * h,
                        vy: 0,
                        size: 2,
                        opacity: 0.3,
                        ripple: false,
                        rippleTime: 0,
                        rippleX: 0,
                        rippleY: 0
                    });
                    dropTimer = 1.5 + Math.random() * 3;
                }

                for (var i = drops.length - 1; i >= 0; i--) {
                    var d = drops[i];
                    if (!d.ripple) {
                        d.vy += 200 * dt;
                        d.y += d.vy * dt;
                        // Check if hit pool
                        var poolY = h * 0.78;
                        if (d.y >= poolY) {
                            d.ripple = true;
                            d.rippleTime = 0;
                            d.rippleX = d.x;
                            d.rippleY = poolY;
                        }
                        // Draw drop
                        ctx.beginPath();
                        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(150, 180, 210, ' + d.opacity + ')';
                        ctx.fill();
                    } else {
                        d.rippleTime += dt;
                        if (d.rippleTime > 2) { drops.splice(i, 1); continue; }
                        // Expanding ripple rings
                        for (var r = 0; r < 3; r++) {
                            var rTime = d.rippleTime - r * 0.2;
                            if (rTime < 0) continue;
                            var rRadius = rTime * 30;
                            var rOp = Math.max(0, 0.12 - rTime * 0.06);
                            ctx.beginPath();
                            ctx.ellipse(d.rippleX, d.rippleY, rRadius, rRadius * 0.2, 0, 0, Math.PI * 2);
                            ctx.strokeStyle = 'rgba(150, 180, 210, ' + rOp + ')';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            }
        };
    })();

    // --- Arctic theme ---
    // Frozen tundra with pale sun, ice crystals, icebergs, wind-blown snow
    themes.arctic = {
        targetCount: 50,

        spawn: function (w, h) {
            // Wind-blown snow particles skimming the surface
            return {
                x: -10 - Math.random() * w * 0.2,
                y: h * (0.5 + Math.random() * 0.45),
                size: 0.5 + Math.random() * 1.5,
                speed: 50 + Math.random() * 80,
                drift: -3 + Math.random() * 6,
                opacity: 0.15 + Math.random() * 0.3,
                wobbleSpeed: 0.5 + Math.random() * 1,
                wobbleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.x += p.speed * dt;
            p.y += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 5) * dt;
            if (p.x > w + 10) return false;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 240, 255, ' + p.opacity + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Pale blue-white sky gradient
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#6080a0');
            grad.addColorStop(0.25, '#8098b8');
            grad.addColorStop(0.45, '#a0b4cc');
            grad.addColorStop(0.55, '#c0d0e0');
            grad.addColorStop(0.65, '#d0dce8');
            grad.addColorStop(1, '#dce4ec');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Faint sun low on the horizon
            var sunX = w * 0.3;
            var sunY = h * 0.48;
            var sunR = Math.min(w, h) * 0.04;
            var sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 8);
            sunGlow.addColorStop(0, 'rgba(255, 240, 210, 0.15)');
            sunGlow.addColorStop(0.3, 'rgba(255, 230, 190, 0.06)');
            sunGlow.addColorStop(1, 'rgba(255, 220, 170, 0)');
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * 8, 0, Math.PI * 2);
            ctx.fillStyle = sunGlow;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 245, 225, 0.35)';
            ctx.fill();

            // Ice landscape - flat with subtle textures
            var iceY = h * 0.58;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (var x = 0; x <= w; x += 4) {
                var iy = iceY + Math.sin(x * 0.003 + 0.8) * 8 + Math.sin(x * 0.01 + 2.1) * 3;
                ctx.lineTo(x, iy);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            var iceGrad = ctx.createLinearGradient(0, iceY, 0, h);
            iceGrad.addColorStop(0, '#c8d8e8');
            iceGrad.addColorStop(0.3, '#b8cce0');
            iceGrad.addColorStop(1, '#a8c0d8');
            ctx.fillStyle = iceGrad;
            ctx.fill();

            // Long blue shadows cast by the low sun
            for (var i = 0; i < 6; i++) {
                var shX = w * (0.15 + i * 0.14);
                var shY = iceY + 5 + Math.sin(shX * 0.003 + 0.8) * 8;
                var shLen = w * (0.05 + Math.sin(i * 3.1) * 0.02);
                ctx.beginPath();
                ctx.ellipse(shX + shLen * 0.5, shY + 3, shLen, 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(80, 110, 150, 0.06)';
                ctx.fill();
            }

            // Distant icebergs / pressure ridges
            var ridgeConfigs = [
                { x: 0.15, w: 0.06, h: 0.04 },
                { x: 0.40, w: 0.08, h: 0.06 },
                { x: 0.65, w: 0.05, h: 0.035 },
                { x: 0.85, w: 0.07, h: 0.05 }
            ];
            for (var i = 0; i < ridgeConfigs.length; i++) {
                var r = ridgeConfigs[i];
                var rx = r.x * w;
                var rw = r.w * w;
                var rh = r.h * h;
                var ry = iceY - 2 + Math.sin(rx * 0.003 + 0.8) * 8;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx + rw * 0.3, ry - rh);
                ctx.lineTo(rx + rw * 0.5, ry - rh * 0.85);
                ctx.lineTo(rx + rw * 0.7, ry - rh * 0.95);
                ctx.lineTo(rx + rw, ry);
                ctx.closePath();
                ctx.fillStyle = 'rgba(190, 210, 230, 0.2)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(170, 195, 220, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Ice crystals sparkling in the air
            for (var i = 0; i < 20; i++) {
                var cx = (Math.sin(i * 7.3 + t * 0.05 + 1.2) * 0.5 + 0.5) * w;
                var cy = (Math.sin(i * 5.1 + t * 0.03 + 2.8) * 0.5 + 0.5) * h * 0.55;
                var sparkle = Math.sin(t * 2 + i * 3.7);
                if (sparkle < 0.5) continue;
                var sOp = (sparkle - 0.5) * 0.6;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(t * 0.5 + i);
                ctx.strokeStyle = 'rgba(220, 240, 255, ' + sOp + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-2, 0); ctx.lineTo(2, 0);
                ctx.moveTo(0, -2); ctx.lineTo(0, 2);
                ctx.moveTo(-1.5, -1.5); ctx.lineTo(1.5, 1.5);
                ctx.moveTo(-1.5, 1.5); ctx.lineTo(1.5, -1.5);
                ctx.stroke();
                ctx.restore();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };
})(window.CV.themes, window.CV.FALLBACK_DT);
