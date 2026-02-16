(function (themes, FALLBACK_DT) {
    // --- Mercurial theme ---
    // Sun-blasted cratered surface with harsh light/dark divide
    themes.mercurial = (function () {
        // Micro-meteorite impact state
        const impacts = [];
        const MAX_IMPACTS = 3;

        return {
            targetCount: 25,

            spawn: function (w, h) {
                // Tiny dust particles drifting in the void
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 1.5,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 2,
                    opacity: 0.1 + Math.random() * 0.2,
                    twinkleSpeed: 0.5 + Math.random() * 1.5,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.x < -5 || p.x > w + 5 || p.y < -5 || p.y > h + 5) return false;
                return true;
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.opacity * (0.5 + twinkle * 0.5);
                if (op < 0.02) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 200, 210, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Stark light/dark divide: hot sun side on left, cold shadow on right
                var grad = ctx.createLinearGradient(0, 0, w, 0);
                grad.addColorStop(0, '#e8dcc8');
                grad.addColorStop(0.25, '#c0a880');
                grad.addColorStop(0.45, '#6a5a48');
                grad.addColorStop(0.55, '#2a2228');
                grad.addColorStop(0.75, '#0e0c10');
                grad.addColorStop(1, '#060408');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Shadow creep: the terminator line slowly shifts
                var termX = w * (0.48 + Math.sin(t * 0.015) * 0.04);
                var shadowGrad = ctx.createLinearGradient(termX - w * 0.08, 0, termX + w * 0.08, 0);
                shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
                shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = shadowGrad;
                ctx.fillRect(0, 0, w, h);

                // Craters on the surface (drawn as subtle circles)
                ctx.save();
                for (var i = 0; i < 18; i++) {
                    // Deterministic positions
                    var cx = (Math.sin(i * 7.3 + 1.2) * 0.5 + 0.5) * w;
                    var cy = h * 0.55 + (Math.sin(i * 4.1 + 2.8) * 0.5 + 0.5) * h * 0.4;
                    var cr = 8 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 35;
                    // Side of the terminator determines brightness
                    var brightness = cx < termX ? 0.08 : 0.04;
                    ctx.beginPath();
                    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(180, 160, 140, ' + brightness + ')';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // Crater shadow
                    ctx.beginPath();
                    ctx.arc(cx + cr * 0.15, cy + cr * 0.1, cr * 0.9, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 0, 0, ' + (brightness * 0.4) + ')';
                    ctx.fill();
                }
                ctx.restore();

                // White-hot sun on the left edge
                var sunGrad = ctx.createRadialGradient(-w * 0.15, h * 0.3, 0, -w * 0.15, h * 0.3, w * 0.5);
                sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.3)');
                sunGrad.addColorStop(0.2, 'rgba(255, 250, 220, 0.12)');
                sunGrad.addColorStop(0.5, 'rgba(255, 240, 200, 0.04)');
                sunGrad.addColorStop(1, 'rgba(255, 220, 180, 0)');
                ctx.fillStyle = sunGrad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                // Micro-meteorite impacts: brief bright flashes on the surface
                // Spawn new impacts occasionally
                if (Math.random() < dt * 0.15 && impacts.length < MAX_IMPACTS) {
                    impacts.push({
                        x: Math.random() * w,
                        y: h * 0.5 + Math.random() * h * 0.45,
                        life: 0,
                        maxLife: 0.3 + Math.random() * 0.3,
                        size: 3 + Math.random() * 8
                    });
                }
                for (var i = impacts.length - 1; i >= 0; i--) {
                    var imp = impacts[i];
                    imp.life += dt;
                    if (imp.life >= imp.maxLife) {
                        impacts.splice(i, 1);
                        continue;
                    }
                    var prog = imp.life / imp.maxLife;
                    var fade = 1 - prog;
                    var impGrad = ctx.createRadialGradient(imp.x, imp.y, 0, imp.x, imp.y, imp.size * (1 + prog));
                    impGrad.addColorStop(0, 'rgba(255, 255, 240, ' + (fade * 0.7) + ')');
                    impGrad.addColorStop(0.4, 'rgba(255, 200, 120, ' + (fade * 0.3) + ')');
                    impGrad.addColorStop(1, 'rgba(255, 150, 80, 0)');
                    ctx.beginPath();
                    ctx.arc(imp.x, imp.y, imp.size * (1 + prog), 0, Math.PI * 2);
                    ctx.fillStyle = impGrad;
                    ctx.fill();
                }
            }
        };
    })();

    // --- Venusian theme ---
    // Thick swirling sulfuric-yellow/orange atmosphere with deep lightning
    themes.venusian = (function () {
        // Deep lightning state
        var deepLightning = {
            active: false,
            opacity: 0,
            x: 0,
            y: 0,
            timer: 4 + Math.random() * 8
        };

        // Cloud band configs
        var cloudBands = [
            { yBase: 0.15, amp: 25, freq: 0.003, speed: 0.08, opacity: 0.06 },
            { yBase: 0.28, amp: 30, freq: 0.0025, speed: 0.06, opacity: 0.07 },
            { yBase: 0.40, amp: 20, freq: 0.004, speed: 0.10, opacity: 0.05 },
            { yBase: 0.52, amp: 35, freq: 0.002, speed: 0.05, opacity: 0.08 },
            { yBase: 0.65, amp: 28, freq: 0.0035, speed: 0.07, opacity: 0.06 },
            { yBase: 0.78, amp: 22, freq: 0.003, speed: 0.09, opacity: 0.07 },
            { yBase: 0.88, amp: 18, freq: 0.0045, speed: 0.11, opacity: 0.05 }
        ];

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                deepLightning.active = false;
                deepLightning.opacity = 0;
                deepLightning.timer = 4 + Math.random() * 8;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Thick sulfuric yellow-orange atmosphere gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#8a6a20');
                grad.addColorStop(0.2, '#9e7828');
                grad.addColorStop(0.4, '#b08830');
                grad.addColorStop(0.6, '#c49838');
                grad.addColorStop(0.8, '#a07828');
                grad.addColorStop(1, '#7a5818');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Diffused hazy glow overlay
                var hazeGrad = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, Math.max(w, h) * 0.7);
                hazeGrad.addColorStop(0, 'rgba(220, 190, 100, 0.08)');
                hazeGrad.addColorStop(0.5, 'rgba(200, 170, 80, 0.04)');
                hazeGrad.addColorStop(1, 'rgba(180, 150, 60, 0)');
                ctx.fillStyle = hazeGrad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Scrolling cloud bands at different speeds
                for (var i = 0; i < cloudBands.length; i++) {
                    var cb = cloudBands[i];
                    var baseY = h * cb.yBase;
                    ctx.beginPath();
                    ctx.moveTo(0, h);
                    for (var x = 0; x <= w; x += 4) {
                        var y = baseY
                            + Math.sin(x * cb.freq + t * cb.speed) * cb.amp
                            + Math.sin(x * cb.freq * 0.6 + t * cb.speed * 1.4 + i * 1.2) * cb.amp * 0.5
                            + Math.cos(x * cb.freq * 0.3 + t * cb.speed * 0.8 + i * 2.5) * cb.amp * 0.3;
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(w, h);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(180, 150, 60, ' + cb.opacity + ')';
                    ctx.fill();
                }

                // Swirling haze particles (deterministic)
                for (var i = 0; i < 40; i++) {
                    var sx = (Math.sin(i * 5.7 + t * 0.03) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 3.3 + t * 0.02 + 1.8) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(t * 0.8 + i * 2.3) * 0.5 + 0.5) * 0.06;
                    var sR = 20 + Math.sin(i * 2.1) * 15;
                    var swGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sR);
                    swGrad.addColorStop(0, 'rgba(200, 180, 80, ' + sOp + ')');
                    swGrad.addColorStop(1, 'rgba(180, 160, 60, 0)');
                    ctx.beginPath();
                    ctx.arc(sx, sy, sR, 0, Math.PI * 2);
                    ctx.fillStyle = swGrad;
                    ctx.fill();
                }

                // Deep lightning flickers within clouds
                deepLightning.timer -= dt;
                if (!deepLightning.active && deepLightning.timer <= 0) {
                    deepLightning.active = true;
                    deepLightning.opacity = 0.15 + Math.random() * 0.15;
                    deepLightning.x = w * (0.2 + Math.random() * 0.6);
                    deepLightning.y = h * (0.2 + Math.random() * 0.6);
                    deepLightning.timer = 4 + Math.random() * 8;
                }
                if (deepLightning.active) {
                    var lgGrad = ctx.createRadialGradient(deepLightning.x, deepLightning.y, 0, deepLightning.x, deepLightning.y, w * 0.2);
                    lgGrad.addColorStop(0, 'rgba(255, 240, 180, ' + deepLightning.opacity + ')');
                    lgGrad.addColorStop(0.3, 'rgba(255, 220, 140, ' + (deepLightning.opacity * 0.5) + ')');
                    lgGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
                    ctx.beginPath();
                    ctx.arc(deepLightning.x, deepLightning.y, w * 0.2, 0, Math.PI * 2);
                    ctx.fillStyle = lgGrad;
                    ctx.fill();
                    deepLightning.opacity -= 2.5 * dt;
                    if (deepLightning.opacity <= 0) {
                        deepLightning.active = false;
                        deepLightning.opacity = 0;
                    }
                }
            }
        };
    })();

    // --- Martian theme ---
    // Rust-red dust storms, mesa silhouettes, butterscotch sky
    themes.martian = (function () {
        // Dust devil state
        var dustDevils = [];
        var MAX_DEVILS = 2;

        // Mesa silhouette configs
        var mesas = [
            { x: 0.08, w: 0.06, h: 0.12, flat: 0.04 },
            { x: 0.22, w: 0.08, h: 0.18, flat: 0.05 },
            { x: 0.45, w: 0.05, h: 0.10, flat: 0.03 },
            { x: 0.62, w: 0.10, h: 0.22, flat: 0.06 },
            { x: 0.80, w: 0.07, h: 0.14, flat: 0.04 },
            { x: 0.92, w: 0.06, h: 0.09, flat: 0.03 }
        ];

        function getWindStrength(t) {
            return 1.0 + Math.sin(t * 0.2) * 0.5 + Math.sin(t * 0.5 + 1.5) * 0.3;
        }

        return {
            targetCount: 60,

            spawn: function (w, h) {
                return {
                    x: -10 - Math.random() * w * 0.3,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 2,
                    speed: 40 + Math.random() * 80,
                    drift: -3 + Math.random() * 6,
                    opacity: 0.15 + Math.random() * 0.3,
                    wobbleSpeed: 0.3 + Math.random() * 0.5,
                    wobbleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                var wind = getWindStrength(state.timeElapsed);
                p.x += p.speed * wind * dt;
                p.y += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 4) * dt;
                if (p.x > w + 10) return false;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
                return true;
            },

            draw: function (p, ctx) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(180, 100, 60, ' + p.opacity + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Butterscotch sky gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#c8a060');
                grad.addColorStop(0.3, '#b88848');
                grad.addColorStop(0.5, '#a06838');
                grad.addColorStop(0.7, '#884830');
                grad.addColorStop(1, '#6a3020');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Pale distant sun
                var sunX = w * 0.7;
                var sunY = h * 0.18;
                var sunR = Math.min(w, h) * 0.035;
                var sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 6);
                sunGlow.addColorStop(0, 'rgba(255, 240, 200, 0.2)');
                sunGlow.addColorStop(0.3, 'rgba(255, 230, 180, 0.08)');
                sunGlow.addColorStop(1, 'rgba(255, 220, 160, 0)');
                ctx.beginPath();
                ctx.arc(sunX, sunY, sunR * 6, 0, Math.PI * 2);
                ctx.fillStyle = sunGlow;
                ctx.fill();
                var sunBody = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
                sunBody.addColorStop(0, 'rgba(255, 245, 220, 0.6)');
                sunBody.addColorStop(0.7, 'rgba(255, 235, 200, 0.3)');
                sunBody.addColorStop(1, 'rgba(255, 225, 180, 0.1)');
                ctx.beginPath();
                ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
                ctx.fillStyle = sunBody;
                ctx.fill();

                // Mesa/canyon silhouettes at the horizon
                var horizonY = h * 0.72;
                // Flat terrain below horizon
                ctx.fillStyle = 'rgba(90, 40, 25, 0.6)';
                ctx.fillRect(0, horizonY, w, h - horizonY);

                for (var i = 0; i < mesas.length; i++) {
                    var m = mesas[i];
                    var mx = m.x * w;
                    var mw = m.w * w;
                    var mh = m.h * h;
                    var flat = m.flat * w;
                    ctx.beginPath();
                    ctx.moveTo(mx, horizonY);
                    ctx.lineTo(mx + mw * 0.2, horizonY - mh);
                    ctx.lineTo(mx + mw * 0.2 + flat, horizonY - mh);
                    ctx.lineTo(mx + mw, horizonY);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(70, 30, 18, 0.7)';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                // Dust devils - spiraling columns of dust
                if (Math.random() < dt * 0.03 && dustDevils.length < MAX_DEVILS) {
                    dustDevils.push({
                        x: Math.random() * w,
                        baseY: h * 0.72,
                        life: 0,
                        maxLife: 4 + Math.random() * 4,
                        height: h * (0.15 + Math.random() * 0.2),
                        width: 10 + Math.random() * 15,
                        speed: 15 + Math.random() * 25
                    });
                }
                for (var i = dustDevils.length - 1; i >= 0; i--) {
                    var dd = dustDevils[i];
                    dd.life += dt;
                    dd.x += dd.speed * dt;
                    if (dd.life >= dd.maxLife || dd.x > w + 50) {
                        dustDevils.splice(i, 1);
                        continue;
                    }
                    var fade = Math.min(1, dd.life * 2) * Math.max(0, 1 - (dd.life / dd.maxLife));
                    // Draw as a tapered column of semi-transparent particles
                    for (var j = 0; j < 20; j++) {
                        var frac = j / 20;
                        var py = dd.baseY - frac * dd.height;
                        var spread = dd.width * (1 - frac * 0.6);
                        var px = dd.x + Math.sin(t * 3 + frac * 8) * spread;
                        var pOp = fade * (0.08 + (1 - frac) * 0.08);
                        ctx.beginPath();
                        ctx.arc(px, py, 2 + (1 - frac) * 3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(160, 90, 50, ' + pOp + ')';
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Jovian theme ---
    // Horizontal banded stripes, Great Red Spot, turbulent swirls
    themes.jovian = (function () {
        // Band configurations (color, y-position, scroll speed)
        var bands = [
            { yStart: 0.00, yEnd: 0.08, r: 200, g: 180, b: 140, speed: 0.012 },
            { yStart: 0.08, yEnd: 0.18, r: 160, g: 120, b: 80,  speed: -0.008 },
            { yStart: 0.18, yEnd: 0.28, r: 210, g: 190, b: 150, speed: 0.015 },
            { yStart: 0.28, yEnd: 0.38, r: 180, g: 130, b: 80,  speed: -0.010 },
            { yStart: 0.38, yEnd: 0.48, r: 220, g: 200, b: 160, speed: 0.018 },
            { yStart: 0.48, yEnd: 0.55, r: 190, g: 100, b: 60,  speed: -0.006 },
            { yStart: 0.55, yEnd: 0.65, r: 210, g: 180, b: 130, speed: 0.014 },
            { yStart: 0.65, yEnd: 0.75, r: 170, g: 120, b: 70,  speed: -0.012 },
            { yStart: 0.75, yEnd: 0.85, r: 200, g: 185, b: 145, speed: 0.010 },
            { yStart: 0.85, yEnd: 1.00, r: 155, g: 110, b: 65,  speed: -0.009 }
        ];

        // Impact flash state
        var impactFlash = { active: false, opacity: 0, x: 0, y: 0, timer: 20 + Math.random() * 30 };

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                impactFlash.active = false;
                impactFlash.timer = 20 + Math.random() * 30;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Base warm gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#c8a870');
                grad.addColorStop(0.5, '#a88050');
                grad.addColorStop(1, '#886030');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Draw scrolling bands
                for (var i = 0; i < bands.length; i++) {
                    var b = bands[i];
                    var y1 = b.yStart * h;
                    var y2 = b.yEnd * h;
                    var bandH = y2 - y1;

                    // Wavy band edges
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 4) {
                        var edgeWave = Math.sin((x + t * b.speed * w) * 0.008 + i * 1.5) * 4
                            + Math.sin((x + t * b.speed * w * 0.7) * 0.015 + i * 2.3) * 2;
                        if (x === 0) ctx.moveTo(x, y1 + edgeWave);
                        else ctx.lineTo(x, y1 + edgeWave);
                    }
                    for (var x = w; x >= 0; x -= 4) {
                        var edgeWave2 = Math.sin((x + t * b.speed * w) * 0.008 + i * 1.5 + 1.0) * 4
                            + Math.sin((x + t * b.speed * w * 0.7) * 0.015 + i * 2.3 + 1.0) * 2;
                        ctx.lineTo(x, y2 + edgeWave2);
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + b.r + ', ' + b.g + ', ' + b.b + ', 0.35)';
                    ctx.fill();
                }

                // Great Red Spot - oval that drifts across
                var spotX = (w * 0.5 + Math.sin(t * 0.02) * w * 0.3);
                var spotY = h * 0.52;
                var spotRx = w * 0.07;
                var spotRy = h * 0.05;
                ctx.save();
                ctx.translate(spotX, spotY);
                ctx.scale(1, spotRy / spotRx);
                var spotGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, spotRx);
                spotGrad.addColorStop(0, 'rgba(200, 80, 40, 0.25)');
                spotGrad.addColorStop(0.4, 'rgba(180, 60, 30, 0.18)');
                spotGrad.addColorStop(0.7, 'rgba(160, 50, 25, 0.08)');
                spotGrad.addColorStop(1, 'rgba(140, 40, 20, 0)');
                ctx.beginPath();
                ctx.arc(0, 0, spotRx, 0, Math.PI * 2);
                ctx.fillStyle = spotGrad;
                ctx.fill();
                // Swirl lines inside the spot
                ctx.rotate(t * 0.1);
                for (var s = 0; s < 5; s++) {
                    var sAngle = (s / 5) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, spotRx * (0.3 + s * 0.12), sAngle, sAngle + Math.PI * 0.8);
                    ctx.strokeStyle = 'rgba(220, 100, 50, 0.06)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                ctx.restore();

                // Turbulent swirls at band edges
                for (var i = 0; i < 25; i++) {
                    var sx = (Math.sin(i * 6.3 + t * 0.04) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 4.1 + 0.7) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(t * 0.6 + i * 1.9) * 0.5 + 0.5) * 0.04;
                    var sR = 15 + Math.sin(i * 2.8) * 10;
                    ctx.beginPath();
                    ctx.arc(sx, sy, sR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(210, 180, 130, ' + sOp + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                // Rare bright impact flashes
                impactFlash.timer -= dt;
                if (!impactFlash.active && impactFlash.timer <= 0) {
                    impactFlash.active = true;
                    impactFlash.opacity = 0.2 + Math.random() * 0.15;
                    impactFlash.x = Math.random() * w;
                    impactFlash.y = Math.random() * h;
                    impactFlash.timer = 20 + Math.random() * 30;
                }
                if (impactFlash.active) {
                    var fGrad = ctx.createRadialGradient(impactFlash.x, impactFlash.y, 0, impactFlash.x, impactFlash.y, 30);
                    fGrad.addColorStop(0, 'rgba(255, 255, 220, ' + impactFlash.opacity + ')');
                    fGrad.addColorStop(0.5, 'rgba(255, 240, 180, ' + (impactFlash.opacity * 0.4) + ')');
                    fGrad.addColorStop(1, 'rgba(255, 220, 140, 0)');
                    ctx.beginPath();
                    ctx.arc(impactFlash.x, impactFlash.y, 30, 0, Math.PI * 2);
                    ctx.fillStyle = fGrad;
                    ctx.fill();
                    impactFlash.opacity -= 1.5 * dt;
                    if (impactFlash.opacity <= 0) {
                        impactFlash.active = false;
                        impactFlash.opacity = 0;
                    }
                }
            }
        };
    })();

    // --- Saturnine theme ---
    // Pale gold planet body with elegant ring arcs, ice particles glitter
    themes.saturnine = {
        targetCount: 50,

        spawn: function (w, h) {
            // Ice particles drifting within the ring plane
            var angle = Math.random() * Math.PI * 2;
            var dist = w * (0.2 + Math.random() * 0.35);
            return {
                x: w * 0.5 + Math.cos(angle) * dist,
                y: h * 0.45 + Math.sin(angle) * dist * 0.15, // flattened to ring plane
                size: 0.5 + Math.random() * 2,
                orbitSpeed: 0.02 + Math.random() * 0.04,
                orbitAngle: angle,
                orbitDist: dist,
                opacity: 0.2 + Math.random() * 0.5,
                twinkleSpeed: 1 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.orbitAngle += p.orbitSpeed * dt;
            p.x = w * 0.5 + Math.cos(p.orbitAngle) * p.orbitDist;
            p.y = h * 0.45 + Math.sin(p.orbitAngle) * p.orbitDist * 0.15;
            return true;
        },

        draw: function (p, ctx, state) {
            var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
            var op = p.opacity * (0.4 + twinkle * 0.6);
            if (op < 0.03) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 240, 255, ' + op + ')';
            ctx.fill();
            if (p.size > 1 && op > 0.3) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 220, 255, ' + (op * 0.1) + ')';
                ctx.fill();
            }
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Dark space background
            var grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h));
            grad.addColorStop(0, '#0c0a12');
            grad.addColorStop(0.3, '#08060e');
            grad.addColorStop(1, '#040308');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Background stars
            for (var i = 0; i < 80; i++) {
                var sx = (Math.sin(i * 7.1 + 0.5) * 0.5 + 0.5) * w;
                var sy = (Math.sin(i * 11.3 + 2.1) * 0.5 + 0.5) * h;
                var sOp = (Math.sin(t * (0.5 + i * 0.03) + i * 1.7) * 0.5 + 0.5) * 0.4;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.5 + Math.sin(i * 2.3) * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + sOp + ')';
                ctx.fill();
            }

            // Saturn body - pale gold planet
            var cx = w * 0.5;
            var cy = h * 0.45;
            var planetR = Math.min(w, h) * 0.15;
            var planetGrad = ctx.createRadialGradient(cx - planetR * 0.2, cy - planetR * 0.1, 0, cx, cy, planetR);
            planetGrad.addColorStop(0, '#e8d8a8');
            planetGrad.addColorStop(0.3, '#d8c890');
            planetGrad.addColorStop(0.6, '#c8b878');
            planetGrad.addColorStop(0.85, '#b8a868');
            planetGrad.addColorStop(1, '#a09058');
            ctx.beginPath();
            ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
            ctx.fillStyle = planetGrad;
            ctx.fill();

            // Subtle banding on the planet
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
            ctx.clip();
            for (var i = 0; i < 8; i++) {
                var bandY = cy - planetR + (i / 8) * planetR * 2;
                ctx.fillStyle = (i % 2 === 0) ? 'rgba(180, 160, 120, 0.06)' : 'rgba(200, 180, 140, 0.04)';
                ctx.fillRect(cx - planetR, bandY, planetR * 2, planetR * 2 / 8);
            }
            ctx.restore();

            // Ring system - elegant elliptical arcs
            ctx.save();
            ctx.translate(cx, cy);
            // Ring shadow on planet (behind planet is already covered)
            // Draw rings
            var ringColors = [
                { inner: 1.3, outer: 1.5, opacity: 0.12 },
                { inner: 1.55, outer: 1.9, opacity: 0.18 },
                { inner: 1.95, outer: 2.1, opacity: 0.08 },
                { inner: 2.15, outer: 2.6, opacity: 0.15 },
                { inner: 2.65, outer: 2.8, opacity: 0.06 }
            ];
            for (var r = 0; r < ringColors.length; r++) {
                var ring = ringColors[r];
                var innerR = planetR * ring.inner;
                var outerR = planetR * ring.outer;
                // Draw as a flattened elliptical ring
                ctx.beginPath();
                ctx.ellipse(0, 0, outerR, outerR * 0.15, 0, 0, Math.PI * 2);
                ctx.ellipse(0, 0, innerR, innerR * 0.15, 0, 0, Math.PI * 2);
                // Use even-odd rule to create ring shape
                ctx.fillStyle = 'rgba(200, 190, 170, ' + ring.opacity + ')';
                ctx.fill('evenodd');
            }
            ctx.restore();

            // Shadow of rings on planet body
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.beginPath();
            ctx.ellipse(cx, cy - planetR * 0.15, planetR * 2.6, planetR * 2.6 * 0.15, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Neptunian theme ---
    // Deep electric-blue with racing white clouds and a faint dark spot
    themes.neptunian = {
        targetCount: 40,

        spawn: function (w, h) {
            // Methane-blue shimmering particles
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                size: 1 + Math.random() * 3,
                opacity: 0.1 + Math.random() * 0.2,
                twinkleSpeed: 0.8 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 5,
                driftY: (Math.random() - 0.5) * 3
            };
        },

        update: function (p, dt, w, h, state) {
            p.x += p.driftX * dt;
            p.y += p.driftY * dt;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
            return true;
        },

        draw: function (p, ctx, state) {
            var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
            var op = p.opacity * (0.4 + twinkle * 0.6);
            if (op < 0.02) return;
            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            grad.addColorStop(0, 'rgba(100, 180, 255, ' + op + ')');
            grad.addColorStop(1, 'rgba(60, 140, 220, 0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Deep electric blue gradient
            var grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
            grad.addColorStop(0, '#1840a0');
            grad.addColorStop(0.3, '#143588');
            grad.addColorStop(0.6, '#102870');
            grad.addColorStop(1, '#0a1848');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Subtle darker bands
            for (var i = 0; i < 6; i++) {
                var bandY = h * (0.1 + i * 0.15);
                var bandH = h * 0.06;
                ctx.fillStyle = 'rgba(10, 20, 60, 0.12)';
                ctx.beginPath();
                for (var x = 0; x <= w; x += 4) {
                    var by = bandY + Math.sin(x * 0.005 + t * 0.03 + i * 2) * 8;
                    if (x === 0) ctx.moveTo(x, by);
                    else ctx.lineTo(x, by);
                }
                for (var x = w; x >= 0; x -= 4) {
                    var by2 = bandY + bandH + Math.sin(x * 0.005 + t * 0.03 + i * 2 + 0.5) * 8;
                    ctx.lineTo(x, by2);
                }
                ctx.closePath();
                ctx.fill();
            }

            // Faint dark spot drifting slowly
            var spotX = w * (0.4 + Math.sin(t * 0.01) * 0.15);
            var spotY = h * 0.55;
            var spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, w * 0.05);
            spotGrad.addColorStop(0, 'rgba(10, 20, 50, 0.2)');
            spotGrad.addColorStop(0.5, 'rgba(10, 20, 50, 0.1)');
            spotGrad.addColorStop(1, 'rgba(10, 20, 50, 0)');
            ctx.beginPath();
            ctx.arc(spotX, spotY, w * 0.05, 0, Math.PI * 2);
            ctx.fillStyle = spotGrad;
            ctx.fill();
        },

        drawForeground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Wispy white cloud streaks racing across at high speed
            for (var i = 0; i < 8; i++) {
                var cloudY = h * (0.1 + (Math.sin(i * 5.7 + 1.3) * 0.5 + 0.5) * 0.8);
                var cloudSpeed = 80 + i * 30;
                var cloudX = ((t * cloudSpeed + i * w * 0.3) % (w * 1.5)) - w * 0.25;
                var cloudLen = w * (0.1 + Math.sin(i * 3.2) * 0.05);
                var cloudOp = 0.04 + Math.sin(t * 0.5 + i * 1.8) * 0.02;

                ctx.beginPath();
                ctx.moveTo(cloudX, cloudY);
                for (var x = 0; x <= cloudLen; x += 4) {
                    var cy = cloudY + Math.sin(x * 0.02 + t * 2 + i) * 3;
                    ctx.lineTo(cloudX + x, cy);
                }
                ctx.strokeStyle = 'rgba(220, 240, 255, ' + cloudOp + ')';
                ctx.lineWidth = 6 + Math.sin(i * 2.1) * 3;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
    };

    // --- Europan theme ---
    // Icy cracked surface, water geysers, Jupiter looming in sky
    themes.europan = (function () {
        // Geyser state
        var geysers = [];
        var MAX_GEYSERS = 3;
        var geyserTimer = 3 + Math.random() * 5;

        // Crack line configs (deterministic)
        var cracks = [];
        for (var i = 0; i < 15; i++) {
            cracks.push({
                x1: Math.sin(i * 5.7 + 1.2) * 0.5 + 0.5,
                y1: 0.55 + (Math.sin(i * 3.3 + 0.8) * 0.5 + 0.5) * 0.4,
                angle: Math.sin(i * 4.1 + 2.5) * Math.PI * 0.4,
                length: 0.05 + (Math.sin(i * 2.9 + 1.1) * 0.5 + 0.5) * 0.15,
                branches: Math.floor(2 + Math.sin(i * 6.3) * 2)
            });
        }

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                geysers.length = 0;
                geyserTimer = 3 + Math.random() * 5;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Icy pale blue-white surface gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#0a0e18');
                grad.addColorStop(0.35, '#101828');
                grad.addColorStop(0.5, '#8098b8');
                grad.addColorStop(0.65, '#a0b8d0');
                grad.addColorStop(0.8, '#b8cce0');
                grad.addColorStop(1, '#c8d8e8');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Jupiter looming in the sky as a massive banded crescent
                var jx = w * 0.75;
                var jy = h * 0.15;
                var jr = Math.min(w, h) * 0.22;
                // Jupiter body
                var jupGrad = ctx.createRadialGradient(jx - jr * 0.3, jy, 0, jx, jy, jr);
                jupGrad.addColorStop(0, 'rgba(200, 170, 120, 0.25)');
                jupGrad.addColorStop(0.5, 'rgba(180, 140, 90, 0.15)');
                jupGrad.addColorStop(0.8, 'rgba(160, 120, 70, 0.08)');
                jupGrad.addColorStop(1, 'rgba(140, 100, 60, 0)');
                ctx.beginPath();
                ctx.arc(jx, jy, jr, 0, Math.PI * 2);
                ctx.fillStyle = jupGrad;
                ctx.fill();
                // Jupiter bands
                ctx.save();
                ctx.beginPath();
                ctx.arc(jx, jy, jr, 0, Math.PI * 2);
                ctx.clip();
                for (var i = 0; i < 8; i++) {
                    var by = jy - jr + (i / 8) * jr * 2;
                    ctx.fillStyle = (i % 2 === 0) ? 'rgba(180, 130, 70, 0.06)' : 'rgba(200, 160, 100, 0.04)';
                    ctx.fillRect(jx - jr, by, jr * 2, jr * 2 / 8);
                }
                ctx.restore();
                // Crescent shadow on Jupiter
                ctx.beginPath();
                ctx.arc(jx + jr * 0.5, jy, jr * 0.85, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(10, 14, 24, 0.2)';
                ctx.fill();

                // Fracture/crack lines on the surface
                ctx.save();
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';
                for (var i = 0; i < cracks.length; i++) {
                    var c = cracks[i];
                    var cx = c.x1 * w;
                    var cy = c.y1 * h;
                    var len = c.length * w;
                    // Shift slightly over time
                    var shift = Math.sin(t * 0.02 + i * 1.5) * 5;

                    ctx.strokeStyle = 'rgba(120, 70, 50, 0.12)';
                    ctx.beginPath();
                    ctx.moveTo(cx + shift, cy);
                    var ex = cx + shift + Math.cos(c.angle) * len;
                    var ey = cy + Math.sin(c.angle) * len;
                    ctx.lineTo(ex, ey);
                    ctx.stroke();

                    // Branches
                    for (var b = 0; b < c.branches; b++) {
                        var bFrac = (b + 1) / (c.branches + 1);
                        var bx = cx + shift + Math.cos(c.angle) * len * bFrac;
                        var by = cy + Math.sin(c.angle) * len * bFrac;
                        var bAngle = c.angle + (Math.sin(i * 3.1 + b * 2.7) * 0.8);
                        var bLen = len * (0.2 + Math.sin(i * 2.3 + b * 1.9) * 0.15);
                        ctx.beginPath();
                        ctx.moveTo(bx, by);
                        ctx.lineTo(bx + Math.cos(bAngle) * bLen, by + Math.sin(bAngle) * bLen);
                        ctx.strokeStyle = 'rgba(120, 70, 50, 0.08)';
                        ctx.stroke();
                    }
                }
                ctx.restore();
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Geyser eruptions
                geyserTimer -= dt;
                if (geyserTimer <= 0 && geysers.length < MAX_GEYSERS) {
                    geysers.push({
                        x: w * (0.2 + Math.random() * 0.6),
                        baseY: h * (0.65 + Math.random() * 0.2),
                        life: 0,
                        maxLife: 2 + Math.random() * 3,
                        height: h * (0.15 + Math.random() * 0.2),
                        spread: 15 + Math.random() * 20,
                        particleCount: 25
                    });
                    geyserTimer = 3 + Math.random() * 5;
                }

                for (var g = geysers.length - 1; g >= 0; g--) {
                    var gey = geysers[g];
                    gey.life += dt;
                    if (gey.life >= gey.maxLife) {
                        geysers.splice(g, 1);
                        continue;
                    }
                    var gProg = gey.life / gey.maxLife;
                    var gFade = gProg < 0.2 ? gProg / 0.2 : (gProg > 0.7 ? (1 - gProg) / 0.3 : 1);

                    // Draw geyser particles arcing upward
                    for (var p = 0; p < gey.particleCount; p++) {
                        var pFrac = p / gey.particleCount;
                        var pTime = (gey.life + pFrac * 0.5) * 2;
                        var px = gey.x + Math.sin(pFrac * 17 + t) * gey.spread * pFrac;
                        var py = gey.baseY - pFrac * gey.height + pFrac * pFrac * gey.height * 0.4; // arc
                        var pOp = gFade * (1 - pFrac) * 0.3;
                        ctx.beginPath();
                        ctx.arc(px, py, 1.5 + (1 - pFrac) * 2, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 230, 255, ' + pOp + ')';
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Titanesque theme ---
    // Thick orange-brown haze, methane rain, dark hydrocarbon lakes
    themes.titanesque = {
        targetCount: 60,

        spawn: function (w, h) {
            // Methane rain drops - slow, heavy
            return {
                x: Math.random() * w,
                y: -Math.random() * h * 0.3,
                speed: 40 + Math.random() * 60,
                length: 6 + Math.random() * 10,
                opacity: 0.08 + Math.random() * 0.15,
                drift: -2 + Math.random() * 4
            };
        },

        update: function (p, dt, w, h, state) {
            p.y += p.speed * dt;
            p.x += p.drift * dt;
            if (p.y > h + 20) return false;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.drift * 0.1, p.y + p.length);
            ctx.strokeStyle = 'rgba(160, 130, 80, ' + p.opacity + ')';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.stroke();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Thick orange-brown haze gradient
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#5a4020');
            grad.addColorStop(0.2, '#6a4828');
            grad.addColorStop(0.4, '#7a5530');
            grad.addColorStop(0.6, '#685028');
            grad.addColorStop(0.8, '#504020');
            grad.addColorStop(1, '#382818');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Dim distant sun - occasional break in haze
            var sunOp = 0.05 + Math.sin(t * 0.1) * 0.03;
            var sunGrad = ctx.createRadialGradient(w * 0.35, h * 0.12, 0, w * 0.35, h * 0.12, Math.min(w, h) * 0.12);
            sunGrad.addColorStop(0, 'rgba(255, 240, 200, ' + sunOp + ')');
            sunGrad.addColorStop(0.5, 'rgba(255, 220, 160, ' + (sunOp * 0.4) + ')');
            sunGrad.addColorStop(1, 'rgba(255, 200, 120, 0)');
            ctx.beginPath();
            ctx.arc(w * 0.35, h * 0.12, Math.min(w, h) * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = sunGrad;
            ctx.fill();

            // Haze layers (horizontal)
            for (var i = 0; i < 10; i++) {
                var hazeY = h * (i / 10);
                var hazeOp = 0.03 + Math.sin(t * 0.08 + i * 1.5) * 0.015;
                ctx.fillStyle = 'rgba(120, 90, 50, ' + hazeOp + ')';
                ctx.fillRect(0, hazeY, w, h / 10);
            }

            // Dark hydrocarbon lake shapes at the bottom
            var lakeY = h * 0.82;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (var x = 0; x <= w; x += 4) {
                var ly = lakeY + Math.sin(x * 0.005 + t * 0.04) * 12
                    + Math.sin(x * 0.012 + t * 0.07 + 1.5) * 6;
                ctx.lineTo(x, ly);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fillStyle = 'rgba(30, 22, 12, 0.5)';
            ctx.fill();

            // Lake ripples
            for (var i = 0; i < 5; i++) {
                var rx = w * (0.15 + i * 0.18);
                var ry = lakeY + 15 + Math.sin(t * 0.3 + i * 2) * 5;
                ctx.beginPath();
                ctx.ellipse(rx, ry, 20 + Math.sin(t * 0.5 + i) * 5, 3, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(80, 60, 35, 0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Ionian theme ---
    // Sulfurous yellow-green surface, volcanic plumes, Jupiter looming
    themes.ionian = (function () {
        // Volcanic eruption particles
        var eruptions = [];
        var MAX_ERUPTIONS = 2;
        var eruptTimer = 1 + Math.random() * 3;

        // Lava glow spots
        var lavaSpots = [];
        for (var i = 0; i < 8; i++) {
            lavaSpots.push({
                x: (Math.sin(i * 5.3 + 1.7) * 0.5 + 0.5),
                y: 0.7 + (Math.sin(i * 3.9 + 0.4) * 0.5 + 0.5) * 0.25,
                size: 0.01 + (Math.sin(i * 2.7) * 0.5 + 0.5) * 0.02,
                pulseSpeed: 0.5 + Math.sin(i * 4.1) * 0.3,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                eruptions.length = 0;
                eruptTimer = 1 + Math.random() * 3;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Sulfurous yellow-green surface
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#0a0c14');
                grad.addColorStop(0.3, '#101418');
                grad.addColorStop(0.55, '#686030');
                grad.addColorStop(0.7, '#8a8028');
                grad.addColorStop(0.85, '#a09030');
                grad.addColorStop(1, '#807020');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Jupiter looming huge in the sky
                var jx = w * 0.3;
                var jy = h * 0.05;
                var jr = Math.min(w, h) * 0.35;
                var jupGrad = ctx.createRadialGradient(jx, jy + jr * 0.3, 0, jx, jy, jr);
                jupGrad.addColorStop(0, 'rgba(200, 170, 110, 0.2)');
                jupGrad.addColorStop(0.4, 'rgba(180, 140, 80, 0.12)');
                jupGrad.addColorStop(0.7, 'rgba(160, 120, 60, 0.06)');
                jupGrad.addColorStop(1, 'rgba(140, 100, 50, 0)');
                ctx.beginPath();
                ctx.arc(jx, jy, jr, 0, Math.PI * 2);
                ctx.fillStyle = jupGrad;
                ctx.fill();
                // Jupiter bands
                ctx.save();
                ctx.beginPath();
                ctx.arc(jx, jy, jr, 0, Math.PI * 2);
                ctx.clip();
                for (var i = 0; i < 10; i++) {
                    var by = jy - jr + (i / 10) * jr * 2;
                    ctx.fillStyle = (i % 2 === 0) ? 'rgba(170, 120, 60, 0.04)' : 'rgba(190, 150, 90, 0.03)';
                    ctx.fillRect(jx - jr, by, jr * 2, jr * 2 / 10);
                }
                ctx.restore();

                // Lava glow spots on the surface
                for (var i = 0; i < lavaSpots.length; i++) {
                    var ls = lavaSpots[i];
                    var lx = ls.x * w;
                    var ly = ls.y * h;
                    var lr = ls.size * Math.min(w, h);
                    var pulse = Math.sin(t * ls.pulseSpeed + ls.pulseOffset);
                    var lOp = 0.15 + pulse * 0.1;
                    var lGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * (2 + pulse * 0.5));
                    lGrad.addColorStop(0, 'rgba(255, 120, 20, ' + lOp + ')');
                    lGrad.addColorStop(0.3, 'rgba(255, 80, 10, ' + (lOp * 0.6) + ')');
                    lGrad.addColorStop(0.6, 'rgba(200, 50, 5, ' + (lOp * 0.3) + ')');
                    lGrad.addColorStop(1, 'rgba(150, 30, 0, 0)');
                    ctx.beginPath();
                    ctx.arc(lx, ly, lr * (2 + pulse * 0.5), 0, Math.PI * 2);
                    ctx.fillStyle = lGrad;
                    ctx.fill();
                    // Core bright spot
                    ctx.beginPath();
                    ctx.arc(lx, ly, lr * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 200, 80, ' + (lOp * 0.5) + ')';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Volcanic eruption particles - fountain arcs
                eruptTimer -= dt;
                if (eruptTimer <= 0 && eruptions.length < MAX_ERUPTIONS) {
                    var eruptX = w * (0.15 + Math.random() * 0.7);
                    var particles = [];
                    for (var i = 0; i < 30; i++) {
                        var angle = -Math.PI * 0.3 - Math.random() * Math.PI * 0.4;
                        var speed = 100 + Math.random() * 200;
                        particles.push({
                            x: eruptX,
                            y: h * (0.65 + Math.random() * 0.1),
                            vx: Math.cos(angle) * speed * (0.5 + Math.random()),
                            vy: Math.sin(angle) * speed * (0.5 + Math.random()),
                            size: 1 + Math.random() * 3,
                            opacity: 0.5 + Math.random() * 0.5
                        });
                    }
                    eruptions.push({
                        particles: particles,
                        life: 0,
                        maxLife: 3 + Math.random() * 2
                    });
                    eruptTimer = 2 + Math.random() * 4;
                }

                for (var e = eruptions.length - 1; e >= 0; e--) {
                    var erupt = eruptions[e];
                    erupt.life += dt;
                    if (erupt.life >= erupt.maxLife) {
                        eruptions.splice(e, 1);
                        continue;
                    }
                    var eFade = erupt.life > erupt.maxLife * 0.6 ? (1 - (erupt.life - erupt.maxLife * 0.6) / (erupt.maxLife * 0.4)) : 1;
                    for (var p = 0; p < erupt.particles.length; p++) {
                        var ep = erupt.particles[p];
                        ep.x += ep.vx * dt;
                        ep.y += ep.vy * dt;
                        ep.vy += 80 * dt; // gravity
                        var pOp = ep.opacity * eFade;
                        if (pOp < 0.02) continue;
                        ctx.beginPath();
                        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, ' + Math.floor(100 + Math.random() * 80) + ', 20, ' + pOp + ')';
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Enceladean theme ---
    // Brilliant white ice surface, dramatic ice geysers, Saturn's rings in sky
    themes.enceladean = (function () {
        // Geyser state
        var geysers = [];
        var MAX_GEYSERS = 4;
        var geyserTimer = 1 + Math.random() * 2;

        return {
            targetCount: 35,

            spawn: function (w, h) {
                // Tiny ice crystal particles
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 1.5,
                    opacity: 0.1 + Math.random() * 0.3,
                    twinkleSpeed: 1 + Math.random() * 3,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    driftX: (Math.random() - 0.5) * 3,
                    driftY: -(1 + Math.random() * 3)
                };
            },

            update: function (p, dt, w, h, state) {
                p.x += p.driftX * dt;
                p.y += p.driftY * dt;
                if (p.y < -5) return false;
                if (p.x < -5) p.x = w + 5;
                if (p.x > w + 5) p.x = -5;
                return true;
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.opacity * (0.3 + twinkle * 0.7);
                if (op < 0.02) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(230, 245, 255, ' + op + ')';
                ctx.fill();
                if (op > 0.2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 225, 255, ' + (op * 0.08) + ')';
                    ctx.fill();
                }
            },

            onActivate: function () {
                geysers.length = 0;
                geyserTimer = 1 + Math.random() * 2;
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Black space / brilliant white ice divide
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#040608');
                grad.addColorStop(0.35, '#080c14');
                grad.addColorStop(0.5, '#c8d4e0');
                grad.addColorStop(0.65, '#d8e4ee');
                grad.addColorStop(0.8, '#e4ecf4');
                grad.addColorStop(1, '#f0f4f8');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Background stars in the upper sky
                for (var i = 0; i < 60; i++) {
                    var sx = (Math.sin(i * 8.3 + 0.7) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 12.1 + 3.2) * 0.5 + 0.5) * h * 0.45;
                    var sOp = (Math.sin(t * (0.6 + i * 0.04) + i * 2.1) * 0.5 + 0.5) * 0.5;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 1.7) * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + sOp + ')';
                    ctx.fill();
                }

                // Saturn's rings arcing across the sky as thin luminous lines
                ctx.save();
                ctx.translate(w * 0.5, h * -0.3);
                var ringAngles = [0.18, 0.22, 0.28, 0.32, 0.38];
                for (var r = 0; r < ringAngles.length; r++) {
                    var rr = Math.max(w, h) * ringAngles[r];
                    ctx.beginPath();
                    ctx.ellipse(0, 0, rr, rr * 0.3, 0.2, 0.3, Math.PI - 0.3);
                    ctx.strokeStyle = 'rgba(200, 190, 170, ' + (0.06 + r * 0.02) + ')';
                    ctx.lineWidth = 1 + r * 0.5;
                    ctx.stroke();
                }
                ctx.restore();
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;

                // Ice geysers from the south (bottom) of the surface
                geyserTimer -= dt;
                if (geyserTimer <= 0 && geysers.length < MAX_GEYSERS) {
                    var gx = w * (0.2 + Math.random() * 0.6);
                    var particles = [];
                    for (var i = 0; i < 40; i++) {
                        var angle = -Math.PI * 0.35 - Math.random() * Math.PI * 0.3;
                        var speed = 120 + Math.random() * 180;
                        particles.push({
                            x: gx + (Math.random() - 0.5) * 10,
                            y: h * 0.55,
                            vx: Math.cos(angle) * speed * (0.3 + Math.random() * 0.7),
                            vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
                            size: 0.5 + Math.random() * 2,
                            opacity: 0.3 + Math.random() * 0.5
                        });
                    }
                    geysers.push({
                        particles: particles,
                        life: 0,
                        maxLife: 3 + Math.random() * 3
                    });
                    geyserTimer = 2 + Math.random() * 3;
                }

                for (var g = geysers.length - 1; g >= 0; g--) {
                    var gey = geysers[g];
                    gey.life += dt;
                    if (gey.life >= gey.maxLife) {
                        geysers.splice(g, 1);
                        continue;
                    }
                    var gFade = gey.life > gey.maxLife * 0.5 ? (1 - (gey.life - gey.maxLife * 0.5) / (gey.maxLife * 0.5)) : 1;
                    for (var p = 0; p < gey.particles.length; p++) {
                        var ep = gey.particles[p];
                        ep.x += ep.vx * dt;
                        ep.y += ep.vy * dt;
                        ep.vy += 20 * dt; // weak gravity (low mass)
                        ep.vx *= 0.998; // slight deceleration
                        var pOp = ep.opacity * gFade;
                        if (pOp < 0.02) continue;
                        ctx.beginPath();
                        ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 240, 255, ' + pOp + ')';
                        ctx.fill();
                        // Subtle glow
                        if (ep.size > 1) {
                            ctx.beginPath();
                            ctx.arc(ep.x, ep.y, ep.size * 3, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(200, 225, 255, ' + (pOp * 0.06) + ')';
                            ctx.fill();
                        }
                    }
                }
            }
        };
    })();

    // --- Tritonian theme ---
    // Pale pink cantaloupe terrain, nitrogen frost, dark geyser plumes, Neptune crescent
    themes.tritonian = {
        targetCount: 20,

        spawn: function (w, h) {
            // Dark geyser plume particles streaking sideways in thin atmosphere
            return {
                x: w * (0.3 + Math.random() * 0.4),
                y: h * (0.6 + Math.random() * 0.15),
                size: 1 + Math.random() * 2,
                vx: 30 + Math.random() * 60,
                vy: -(5 + Math.random() * 15),
                opacity: 0.08 + Math.random() * 0.12,
                life: 0,
                maxLife: 3 + Math.random() * 4
            };
        },

        update: function (p, dt, w, h, state) {
            p.life += dt;
            if (p.life >= p.maxLife) return false;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 2 * dt; // slight gravity pull
            if (p.x > w + 10) return false;
            return true;
        },

        draw: function (p, ctx, state) {
            var fade = p.life > p.maxLife * 0.6 ? (1 - (p.life - p.maxLife * 0.6) / (p.maxLife * 0.4)) : 1;
            var op = p.opacity * fade;
            if (op < 0.01) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(40, 35, 30, ' + op + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Dark space sky transitioning to pale pink terrain
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#060810');
            grad.addColorStop(0.3, '#0a0e18');
            grad.addColorStop(0.5, '#a08880');
            grad.addColorStop(0.65, '#c0a098');
            grad.addColorStop(0.8, '#d0b0a8');
            grad.addColorStop(1, '#c8a8a0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Neptune as a deep blue crescent in the sky
            var nx = w * 0.8;
            var ny = h * 0.2;
            var nr = Math.min(w, h) * 0.08;
            var nepGrad = ctx.createRadialGradient(nx - nr * 0.3, ny, 0, nx, ny, nr);
            nepGrad.addColorStop(0, 'rgba(40, 80, 180, 0.35)');
            nepGrad.addColorStop(0.6, 'rgba(30, 60, 150, 0.2)');
            nepGrad.addColorStop(1, 'rgba(20, 40, 120, 0)');
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fillStyle = nepGrad;
            ctx.fill();
            // Crescent shadow on Neptune
            ctx.beginPath();
            ctx.arc(nx + nr * 0.45, ny - nr * 0.1, nr * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 8, 16, 0.3)';
            ctx.fill();

            // Background stars
            for (var i = 0; i < 50; i++) {
                var sx = (Math.sin(i * 9.1 + 0.3) * 0.5 + 0.5) * w;
                var sy = (Math.sin(i * 13.7 + 2.6) * 0.5 + 0.5) * h * 0.45;
                var sOp = (Math.sin(t * (0.4 + i * 0.05) + i * 1.3) * 0.5 + 0.5) * 0.4;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.5 + Math.sin(i * 2.1) * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + sOp + ')';
                ctx.fill();
            }

            // Cantaloupe terrain texture - subtle dimpled pattern on the surface
            ctx.save();
            for (var i = 0; i < 30; i++) {
                var cx = (Math.sin(i * 6.7 + 0.9) * 0.5 + 0.5) * w;
                var cy = h * 0.55 + (Math.sin(i * 4.3 + 1.6) * 0.5 + 0.5) * h * 0.4;
                var cr = 8 + Math.sin(i * 3.1) * 6;
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(180, 150, 140, 0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();

            // Nitrogen frost patches - subtle white-pink shimmer
            for (var i = 0; i < 12; i++) {
                var fx = (Math.sin(i * 8.3 + 2.1) * 0.5 + 0.5) * w;
                var fy = h * 0.6 + (Math.sin(i * 5.7 + 0.8) * 0.5 + 0.5) * h * 0.35;
                var fr = 15 + Math.sin(i * 3.9 + t * 0.1) * 8;
                var fOp = 0.03 + Math.sin(t * 0.2 + i * 1.4) * 0.015;
                var fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
                fGrad.addColorStop(0, 'rgba(255, 230, 240, ' + fOp + ')');
                fGrad.addColorStop(1, 'rgba(240, 210, 220, 0)');
                ctx.beginPath();
                ctx.arc(fx, fy, fr, 0, Math.PI * 2);
                ctx.fillStyle = fGrad;
                ctx.fill();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };
})(window.CV.themes, window.CV.FALLBACK_DT);
