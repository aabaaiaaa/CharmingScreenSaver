(function (themes, FALLBACK_DT) {
    var diurnal = CV.diurnal;
    var lerpColor = diurnal.lerpColor;
    var colorToRgb = diurnal.colorToRgb;

    // Shared helper: draw sky gradient from time data
    function drawSkyGradient(ctx, w, h, td) {
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, colorToRgb(td.palette.zenith));
        grad.addColorStop(0.5, colorToRgb(td.palette.mid));
        grad.addColorStop(1, colorToRgb(td.palette.horizon));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    // Shared helper: draw stars based on brightness (more visible at night)
    function drawStars(ctx, w, h, td, t, seed) {
        var starAlpha = Math.max(0, 1 - td.brightness * 3);
        if (starAlpha < 0.01) return;
        seed = seed || 42;
        var count = 80;
        for (var i = 0; i < count; i++) {
            var sx = ((Math.sin(seed + i * 127.1) * 43758.5453) % 1 + 1) % 1;
            var sy = ((Math.sin(seed + i * 311.7) * 43758.5453) % 1 + 1) % 1 * 0.6;
            var twinkle = Math.sin(t * (0.5 + sx * 2) + i * 3.7) * 0.3 + 0.7;
            var size = 0.5 + sx * 1.5;
            ctx.beginPath();
            ctx.arc(sx * w, sy * h, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,240,' + (starAlpha * twinkle * 0.8) + ')';
            ctx.fill();
        }
    }

    // Shared helper: simple sun disc
    function drawSun(ctx, w, h, td, t) {
        if (td.brightness < 0.2) return;
        var sunProgress = Math.max(0, Math.min(1, (td.hour - 5) / 14));
        var sunX = w * (0.15 + sunProgress * 0.7);
        var sunY = h * (0.6 - Math.sin(sunProgress * Math.PI) * 0.5);
        var sunAlpha = Math.min(1, (td.brightness - 0.2) * 1.5);
        var r = Math.min(w, h) * 0.03;
        var glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, r * 6);
        glow.addColorStop(0, 'rgba(255,230,150,' + (sunAlpha * 0.3) + ')');
        glow.addColorStop(0.3, 'rgba(255,200,80,' + (sunAlpha * 0.1) + ')');
        glow.addColorStop(1, 'rgba(255,180,50,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, r * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sunX, sunY, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,240,200,' + sunAlpha + ')';
        ctx.fill();
    }

    // Shared helper: simple moon disc
    function drawMoon(ctx, w, h, td, t) {
        if (td.brightness > 0.15) return;
        var moonAlpha = Math.max(0, (0.15 - td.brightness) * 8);
        var moonX = w * 0.75;
        var moonY = h * 0.15;
        var r = Math.min(w, h) * 0.025;
        var glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, r * 5);
        glow.addColorStop(0, 'rgba(200,210,255,' + (moonAlpha * 0.15) + ')');
        glow.addColorStop(1, 'rgba(150,170,220,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX, moonY, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,225,240,' + moonAlpha + ')';
        ctx.fill();
        // Crescent shadow
        ctx.beginPath();
        ctx.arc(moonX + r * 0.4, moonY - r * 0.1, r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = colorToRgb(td.palette.zenith, moonAlpha * 0.9);
        ctx.fill();
    }

    // ====================================================================
    // MEADOW — Rolling grass, flowers, sky
    // Butterflies by day, fireflies at night, dew at dawn
    // ====================================================================
    themes.meadow = (function () {
        return {
            targetCount: 30,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                var isNight = td.brightness < 0.15;
                if (isNight) {
                    // Firefly
                    return {
                        type: 'firefly',
                        x: Math.random() * w,
                        y: h * 0.3 + Math.random() * h * 0.5,
                        vx: (Math.random() - 0.5) * 20,
                        vy: (Math.random() - 0.5) * 15,
                        phase: Math.random() * Math.PI * 2,
                        size: 2 + Math.random() * 2,
                        pulseSpeed: 1 + Math.random() * 2
                    };
                } else {
                    // Butterfly
                    return {
                        type: 'butterfly',
                        x: Math.random() * w,
                        y: h * 0.2 + Math.random() * h * 0.4,
                        vx: (Math.random() - 0.5) * 30,
                        vy: (Math.random() - 0.5) * 10,
                        wingPhase: Math.random() * Math.PI * 2,
                        size: 3 + Math.random() * 4,
                        hue: Math.random() * 60 + 20
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'firefly') {
                    p.phase += dt * p.pulseSpeed;
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.5 + p.phase) * 8 * dt;
                    p.y += p.vy * dt + Math.cos(state.timeElapsed * 0.7 + p.phase) * 5 * dt;
                    if (p.x < -20 || p.x > w + 20 || p.y < h * 0.1 || p.y > h * 0.85) return false;
                } else {
                    p.wingPhase += dt * 6;
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.3 + p.wingPhase * 0.1) * 15 * dt;
                    p.y += p.vy * dt + Math.sin(state.timeElapsed * 0.5 + p.wingPhase * 0.2) * 8 * dt;
                    if (p.x < -30 || p.x > w + 30 || p.y < -20 || p.y > h * 0.75) return false;
                }
                return true;
            },
            draw: function (p, ctx, state) {
                if (p.type === 'firefly') {
                    var glow = Math.sin(p.phase) * 0.5 + 0.5;
                    var r = p.size * (0.8 + glow * 0.5);
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
                    grad.addColorStop(0, 'rgba(200,230,100,' + (glow * 0.6) + ')');
                    grad.addColorStop(0.3, 'rgba(180,220,60,' + (glow * 0.2) + ')');
                    grad.addColorStop(1, 'rgba(150,200,40,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230,255,150,' + (glow * 0.9) + ')';
                    ctx.fill();
                } else {
                    var wingAngle = Math.sin(p.wingPhase) * 0.6;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    var alpha = 0.6 + Math.sin(p.wingPhase * 0.3) * 0.2;
                    // Left wing
                    ctx.save();
                    ctx.scale(1, wingAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, -p.size * 0.3, p.size, p.size * 1.5, -0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + p.hue + ',70%,65%,' + alpha + ')';
                    ctx.fill();
                    ctx.restore();
                    // Right wing
                    ctx.save();
                    ctx.scale(1, -wingAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, -p.size * 0.3, p.size, p.size * 1.5, 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + p.hue + ',70%,65%,' + alpha + ')';
                    ctx.fill();
                    ctx.restore();
                    // Body
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.2, p.size * 0.6, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(40,30,20,0.7)';
                    ctx.fill();
                    ctx.restore();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                drawSkyGradient(ctx, w, h, td);
                drawStars(ctx, w, h, td, t, 100);
                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                // Ground - rolling hills
                var groundY = h * 0.65;
                var grassGreen = lerpColor([30, 90, 20], [15, 45, 10], 1 - td.brightness);
                var darkGrass = lerpColor([20, 60, 10], [8, 25, 5], 1 - td.brightness);

                // Hills
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var hill = Math.sin(x * 0.003 + 1) * h * 0.05 +
                               Math.sin(x * 0.007 + 3) * h * 0.03 +
                               Math.sin(x * 0.001) * h * 0.04;
                    ctx.lineTo(x, groundY - hill);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                var groundGrad = ctx.createLinearGradient(0, groundY - h * 0.1, 0, h);
                groundGrad.addColorStop(0, colorToRgb(grassGreen));
                groundGrad.addColorStop(0.6, colorToRgb(darkGrass));
                groundGrad.addColorStop(1, colorToRgb(lerpColor(darkGrass, [5, 10, 3], 0.5)));
                ctx.fillStyle = groundGrad;
                ctx.fill();

                // Flowers
                var flowerAlpha = Math.min(1, td.brightness * 1.5);
                if (flowerAlpha > 0.05) {
                    for (var i = 0; i < 40; i++) {
                        var fx = ((Math.sin(i * 127.1 + 7) * 43758.5453) % 1 + 1) % 1 * w;
                        var fHill = Math.sin(fx * 0.003 + 1) * h * 0.05 + Math.sin(fx * 0.007 + 3) * h * 0.03 + Math.sin(fx * 0.001) * h * 0.04;
                        var fy = groundY - fHill - 2 - Math.random() * 5;
                        var fSize = 2 + (i % 3);
                        var fHue = (i * 67) % 360;
                        var sway = Math.sin(t * 0.8 + i * 2.3) * 2;
                        ctx.beginPath();
                        ctx.arc(fx + sway, fy, fSize, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + fHue + ',70%,65%,' + (flowerAlpha * 0.6) + ')';
                        ctx.fill();
                    }
                }

                // Dawn dew drops
                if (td.period === 'dawn' || (td.period === 'morning' && td.periodProgress < 0.3)) {
                    var dewAlpha = td.period === 'dawn' ? 0.4 : 0.4 * (1 - td.periodProgress / 0.3);
                    for (var i = 0; i < 25; i++) {
                        var dx = ((Math.sin(i * 83.1 + 11) * 43758.5453) % 1 + 1) % 1 * w;
                        var dHill = Math.sin(dx * 0.003 + 1) * h * 0.05 + Math.sin(dx * 0.007 + 3) * h * 0.03;
                        var dy = groundY - dHill - 1;
                        ctx.beginPath();
                        ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200,220,255,' + dewAlpha + ')';
                        ctx.fill();
                    }
                }

                // Grass blades swaying
                ctx.save();
                for (var i = 0; i < 60; i++) {
                    var gx = (i / 60) * w + ((Math.sin(i * 37.7) * 100) % 20);
                    var gHill = Math.sin(gx * 0.003 + 1) * h * 0.05 + Math.sin(gx * 0.007 + 3) * h * 0.03 + Math.sin(gx * 0.001) * h * 0.04;
                    var gy = groundY - gHill;
                    var sway = Math.sin(t * 1.2 + i * 0.7) * 4;
                    var bladeH = 8 + (i % 5) * 3;
                    ctx.beginPath();
                    ctx.moveTo(gx, gy);
                    ctx.quadraticCurveTo(gx + sway, gy - bladeH * 0.6, gx + sway * 1.5, gy - bladeH);
                    ctx.strokeStyle = colorToRgb(grassGreen, 0.3 + td.brightness * 0.3);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                ctx.restore();
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // COAST — Cliffs, ocean, birds
    // Sparkling sea at noon, phosphorescent waves at night
    // ====================================================================
    themes.coast = (function () {
        return {
            targetCount: 20,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness > 0.3) {
                    // Seabirds
                    return {
                        type: 'bird',
                        x: -20,
                        y: h * (0.1 + Math.random() * 0.3),
                        vx: 30 + Math.random() * 40,
                        vy: (Math.random() - 0.5) * 10,
                        wingPhase: Math.random() * Math.PI * 2,
                        size: 5 + Math.random() * 5
                    };
                } else {
                    // Phosphorescent sparkle
                    return {
                        type: 'phosphor',
                        x: Math.random() * w,
                        y: h * (0.5 + Math.random() * 0.3),
                        life: 0,
                        maxLife: 1 + Math.random() * 2,
                        size: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'bird') {
                    p.wingPhase += dt * 4;
                    p.x += p.vx * dt;
                    p.y += p.vy * dt + Math.sin(state.timeElapsed * 0.5 + p.wingPhase * 0.1) * 3 * dt;
                    return p.x < w + 40;
                } else {
                    p.life += dt;
                    p.phase += dt * 2;
                    return p.life < p.maxLife;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'bird') {
                    var wing = Math.sin(p.wingPhase) * 0.5;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.beginPath();
                    ctx.moveTo(-p.size, wing * p.size);
                    ctx.quadraticCurveTo(-p.size * 0.3, -wing * p.size * 0.5, 0, 0);
                    ctx.quadraticCurveTo(p.size * 0.3, -wing * p.size * 0.5, p.size, wing * p.size);
                    ctx.strokeStyle = 'rgba(40,40,50,0.6)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.restore();
                } else {
                    var fade = p.life > p.maxLife * 0.6 ? (1 - (p.life - p.maxLife * 0.6) / (p.maxLife * 0.4)) : Math.min(1, p.life * 3);
                    var glow = Math.sin(p.phase) * 0.3 + 0.7;
                    var alpha = fade * glow * 0.6;
                    if (alpha < 0.01) return;
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                    grad.addColorStop(0, 'rgba(100,200,220,' + alpha + ')');
                    grad.addColorStop(1, 'rgba(50,150,180,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                drawSkyGradient(ctx, w, h * 0.5, td);

                // Fill lower half for ocean background
                var skyBot = td.palette.horizon;
                ctx.fillStyle = colorToRgb(skyBot);
                ctx.fillRect(0, 0, w, h);
                drawSkyGradient(ctx, w, h * 0.5, td);

                drawStars(ctx, w, h * 0.5, td, t, 200);
                drawSun(ctx, w, h * 0.5, td, t);
                drawMoon(ctx, w, h * 0.5, td, t);

                // Cliff on left
                var cliffColor = lerpColor([80, 70, 55], [30, 25, 20], 1 - td.brightness);
                ctx.beginPath();
                ctx.moveTo(0, h * 0.3);
                ctx.lineTo(w * 0.08, h * 0.35);
                ctx.quadraticCurveTo(w * 0.12, h * 0.45, w * 0.15, h * 0.5);
                ctx.lineTo(w * 0.12, h);
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(cliffColor);
                ctx.fill();

                // Ocean
                var horizonY = h * 0.5;
                var oceanDeep = lerpColor([15, 50, 80], [5, 15, 30], 1 - td.brightness);
                var oceanShallow = lerpColor([30, 90, 120], [10, 30, 50], 1 - td.brightness);
                var oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h);
                oceanGrad.addColorStop(0, colorToRgb(oceanShallow));
                oceanGrad.addColorStop(1, colorToRgb(oceanDeep));
                ctx.fillStyle = oceanGrad;
                ctx.fillRect(0, horizonY, w, h - horizonY);

                // Waves
                for (var wave = 0; wave < 8; wave++) {
                    var waveY = horizonY + wave * (h - horizonY) / 8;
                    var waveAlpha = 0.03 + wave * 0.01;
                    ctx.beginPath();
                    ctx.moveTo(0, waveY);
                    for (var x = 0; x <= w; x += 6) {
                        var dy = Math.sin(x * 0.01 + t * 0.6 + wave * 2) * 4 +
                                 Math.sin(x * 0.025 + t * 0.3 + wave) * 2;
                        ctx.lineTo(x, waveY + dy);
                    }
                    ctx.lineTo(w, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(255,255,255,' + waveAlpha + ')';
                    ctx.fill();
                }

                // Midday sparkles on water
                if (td.brightness > 0.6) {
                    var sparkleAlpha = (td.brightness - 0.6) * 2;
                    for (var i = 0; i < 30; i++) {
                        var sx = ((Math.sin(i * 127.1 + t * 0.5) * 0.5 + 0.5)) * w;
                        var sy = horizonY + 10 + ((Math.sin(i * 311.7 + t * 0.3) * 0.5 + 0.5)) * (h - horizonY - 20);
                        var twinkle = Math.sin(t * 3 + i * 7.3) * 0.5 + 0.5;
                        if (twinkle > 0.7) {
                            ctx.beginPath();
                            ctx.arc(sx, sy, 1 + twinkle, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255,255,230,' + (sparkleAlpha * twinkle * 0.5) + ')';
                            ctx.fill();
                        }
                    }
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // CITYSCAPE — Urban skyline
    // Glass reflections by day, lit windows and neon at night
    // ====================================================================
    themes.cityscape = (function () {
        // Pre-generate building data
        var buildings = [];
        for (var i = 0; i < 25; i++) {
            buildings.push({
                x: i / 25,
                width: 0.025 + Math.random() * 0.03,
                height: 0.2 + Math.random() * 0.35,
                windows: Math.floor(3 + Math.random() * 6),
                windowRows: Math.floor(5 + Math.random() * 12),
                seed: Math.random() * 100
            });
        }

        return {
            targetCount: 0,
            spawn: function (w, h) {
                return { x: 0, y: 0, vx: 0, vy: 0 };
            },
            update: function () { return true; },
            draw: function () {},
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                drawSkyGradient(ctx, w, h, td);
                drawStars(ctx, w, h * 0.6, td, t, 300);
                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                var groundY = h * 0.85;

                // Buildings
                for (var i = 0; i < buildings.length; i++) {
                    var b = buildings[i];
                    var bx = b.x * w;
                    var bw = b.width * w;
                    var bh = b.height * h;
                    var by = groundY - bh;

                    // Building body
                    var buildingShade = lerpColor([60, 65, 75], [20, 22, 30], 1 - td.brightness);
                    ctx.fillStyle = colorToRgb(buildingShade);
                    ctx.fillRect(bx, by, bw, bh);

                    // Glass reflection during day
                    if (td.brightness > 0.4) {
                        var refAlpha = (td.brightness - 0.4) * 0.3;
                        var refGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
                        refGrad.addColorStop(0, 'rgba(180,200,220,' + refAlpha + ')');
                        refGrad.addColorStop(0.5, 'rgba(200,220,240,' + (refAlpha * 0.5) + ')');
                        refGrad.addColorStop(1, 'rgba(160,180,200,' + (refAlpha * 0.3) + ')');
                        ctx.fillStyle = refGrad;
                        ctx.fillRect(bx, by, bw, bh);
                    }

                    // Windows
                    var winW = bw / (b.windows * 2 + 1);
                    var winH = bh / (b.windowRows * 2 + 1);
                    for (var row = 0; row < b.windowRows; row++) {
                        for (var col = 0; col < b.windows; col++) {
                            var wx = bx + winW * (col * 2 + 1);
                            var wy = by + winH * (row * 2 + 1);

                            if (td.brightness < 0.3) {
                                // Night: lit windows
                                var lit = ((Math.sin(b.seed + row * 7 + col * 13 + Math.floor(t * 0.05) * 3) * 0.5 + 0.5) > 0.4);
                                if (lit) {
                                    var warmth = (Math.sin(b.seed + row + col * 5) * 0.5 + 0.5);
                                    var wColor = warmth > 0.5 ? 'rgba(255,230,150,0.7)' : 'rgba(200,220,255,0.5)';
                                    ctx.fillStyle = wColor;
                                    ctx.fillRect(wx, wy, winW, winH);
                                }
                            } else {
                                // Day: dark windows
                                ctx.fillStyle = 'rgba(100,120,140,' + (0.1 + td.brightness * 0.2) + ')';
                                ctx.fillRect(wx, wy, winW, winH);
                            }
                        }
                    }
                }

                // Neon signs at night
                if (td.brightness < 0.2) {
                    var neonAlpha = (0.2 - td.brightness) * 5;
                    var neonColors = ['rgba(255,50,80,' + (neonAlpha * 0.5) + ')', 'rgba(50,150,255,' + (neonAlpha * 0.5) + ')', 'rgba(255,100,255,' + (neonAlpha * 0.4) + ')'];
                    for (var i = 0; i < 5; i++) {
                        var nx = (0.1 + i * 0.2) * w;
                        var ny = groundY - buildings[i * 5 % buildings.length].height * h * 0.5;
                        var nSize = 15 + Math.sin(t * 2 + i * 3) * 3;
                        var nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, nSize * 3);
                        nGlow.addColorStop(0, neonColors[i % neonColors.length]);
                        nGlow.addColorStop(1, 'rgba(0,0,0,0)');
                        ctx.fillStyle = nGlow;
                        ctx.beginPath();
                        ctx.arc(nx, ny, nSize * 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Ground
                ctx.fillStyle = colorToRgb(lerpColor([40, 40, 45], [15, 15, 18], 1 - td.brightness));
                ctx.fillRect(0, groundY, w, h - groundY);

                // Street lights at night
                if (td.brightness < 0.3) {
                    var lightAlpha = (0.3 - td.brightness) * 3;
                    for (var i = 0; i < 8; i++) {
                        var lx = (i + 0.5) / 8 * w;
                        var ly = groundY;
                        // Pole
                        ctx.fillStyle = 'rgba(80,80,80,' + lightAlpha + ')';
                        ctx.fillRect(lx - 1, ly - 30, 2, 30);
                        // Light cone
                        var coneGrad = ctx.createRadialGradient(lx, ly - 28, 0, lx, ly, 40);
                        coneGrad.addColorStop(0, 'rgba(255,230,150,' + (lightAlpha * 0.3) + ')');
                        coneGrad.addColorStop(1, 'rgba(255,200,100,0)');
                        ctx.fillStyle = coneGrad;
                        ctx.beginPath();
                        ctx.arc(lx, ly - 28, 40, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // FOREST — Dense woodland interior
    // God-rays through canopy by day, bioluminescent fungi at night
    // ====================================================================
    themes.forest = (function () {
        // Pre-generate tree positions
        var trees = [];
        for (var i = 0; i < 15; i++) {
            trees.push({
                x: (i / 15 + (Math.sin(i * 73.7) * 0.02)),
                trunkH: 0.3 + Math.random() * 0.2,
                canopyR: 0.06 + Math.random() * 0.06,
                depth: Math.random()
            });
        }

        return {
            targetCount: 15,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness < 0.15) {
                    // Bioluminescent spore
                    return {
                        type: 'spore',
                        x: Math.random() * w,
                        y: h * (0.6 + Math.random() * 0.3),
                        vy: -(2 + Math.random() * 5),
                        vx: (Math.random() - 0.5) * 3,
                        size: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2,
                        hue: 140 + Math.random() * 40,
                        life: 0,
                        maxLife: 3 + Math.random() * 4
                    };
                } else {
                    // Dust mote / pollen
                    return {
                        type: 'mote',
                        x: Math.random() * w,
                        y: Math.random() * h * 0.7,
                        vy: 2 + Math.random() * 5,
                        vx: (Math.random() - 0.5) * 8,
                        size: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'spore') {
                    p.life += dt;
                    if (p.life > p.maxLife) return false;
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.5 + p.phase) * 2 * dt;
                    p.y += p.vy * dt;
                    p.phase += dt;
                    return p.y > 0;
                } else {
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.3 + p.phase) * 3 * dt;
                    p.y += p.vy * dt;
                    p.phase += dt * 0.5;
                    if (p.y > h * 0.9 || p.x < -10 || p.x > w + 10) return false;
                    return true;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'spore') {
                    var fade = p.life > p.maxLife * 0.7 ? (1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3)) : Math.min(1, p.life * 2);
                    var pulse = Math.sin(p.phase * 2) * 0.3 + 0.7;
                    var alpha = fade * pulse * 0.7;
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                    grad.addColorStop(0, 'hsla(' + p.hue + ',80%,60%,' + alpha + ')');
                    grad.addColorStop(1, 'hsla(' + p.hue + ',80%,40%,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    var td = diurnal.getTimeData(state.frameDate);
                    var alpha = 0.15 + td.brightness * 0.3;
                    var drift = Math.sin(p.phase) * 0.2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size + drift, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,250,200,' + alpha + ')';
                    ctx.fill();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Forest interior is always darker than open sky
                var dimFactor = 0.5;
                var dimmedPalette = {
                    zenith: lerpColor(td.palette.zenith, [5, 10, 5], dimFactor),
                    mid: lerpColor(td.palette.mid, [10, 20, 10], dimFactor),
                    horizon: lerpColor(td.palette.horizon, [15, 25, 10], dimFactor)
                };
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, colorToRgb(dimmedPalette.zenith));
                grad.addColorStop(0.5, colorToRgb(dimmedPalette.mid));
                grad.addColorStop(1, colorToRgb(dimmedPalette.horizon));
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Forest floor
                var floorY = h * 0.75;
                var floorColor = lerpColor([25, 45, 15], [8, 15, 5], 1 - td.brightness);
                var floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
                floorGrad.addColorStop(0, colorToRgb(floorColor));
                floorGrad.addColorStop(1, colorToRgb(lerpColor(floorColor, [3, 5, 2], 0.5)));
                ctx.fillStyle = floorGrad;
                ctx.fillRect(0, floorY, w, h - floorY);

                // Tree trunks and canopy
                for (var i = 0; i < trees.length; i++) {
                    var tree = trees[i];
                    var tx = tree.x * w;
                    var trunkBot = floorY;
                    var trunkTop = floorY - tree.trunkH * h;
                    var trunkW = 6 + tree.depth * 8;
                    var trunkColor = lerpColor([50, 35, 20], [20, 14, 8], 1 - td.brightness);
                    ctx.fillStyle = colorToRgb(trunkColor);
                    ctx.fillRect(tx - trunkW / 2, trunkTop, trunkW, trunkBot - trunkTop);

                    // Canopy
                    var canopyR = tree.canopyR * w;
                    var canopyColor = lerpColor([20, 60, 15], [8, 25, 6], 1 - td.brightness);
                    ctx.beginPath();
                    ctx.arc(tx, trunkTop - canopyR * 0.3, canopyR, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(canopyColor, 0.7);
                    ctx.fill();
                }

                // God-rays through canopy (daytime)
                if (td.brightness > 0.3) {
                    var rayAlpha = (td.brightness - 0.3) * 0.15;
                    for (var i = 0; i < 5; i++) {
                        var rx = (0.15 + i * 0.18) * w;
                        var sway = Math.sin(t * 0.2 + i * 2) * 15;
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(rx + sway - 8, 0);
                        ctx.lineTo(rx + sway + 8, 0);
                        ctx.lineTo(rx + sway + 40, h);
                        ctx.lineTo(rx + sway - 40, h);
                        ctx.closePath();
                        var rayGrad = ctx.createLinearGradient(0, 0, 0, h);
                        rayGrad.addColorStop(0, 'rgba(255,240,180,' + rayAlpha + ')');
                        rayGrad.addColorStop(0.5, 'rgba(255,230,150,' + (rayAlpha * 0.5) + ')');
                        rayGrad.addColorStop(1, 'rgba(255,220,120,0)');
                        ctx.fillStyle = rayGrad;
                        ctx.fill();
                        ctx.restore();
                    }
                }

                // Bioluminescent fungi on trees at night
                if (td.brightness < 0.15) {
                    var fungiAlpha = (0.15 - td.brightness) * 6;
                    for (var i = 0; i < trees.length; i++) {
                        var tree = trees[i];
                        var tx = tree.x * w;
                        var fy = floorY - tree.trunkH * h * 0.5;
                        for (var f = 0; f < 3; f++) {
                            var fx = tx + (f - 1) * 6;
                            var ffy = fy + f * 12;
                            var pulse = Math.sin(t * 1.5 + i * 3 + f * 2) * 0.3 + 0.7;
                            var fGrad = ctx.createRadialGradient(fx, ffy, 0, fx, ffy, 10);
                            fGrad.addColorStop(0, 'rgba(100,220,180,' + (fungiAlpha * pulse * 0.5) + ')');
                            fGrad.addColorStop(1, 'rgba(60,180,140,0)');
                            ctx.fillStyle = fGrad;
                            ctx.beginPath();
                            ctx.arc(fx, ffy, 10, 0, Math.PI * 2);
                            ctx.fill();
                            // Fungi cap
                            ctx.beginPath();
                            ctx.arc(fx, ffy, 3, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(120,240,200,' + (fungiAlpha * pulse * 0.7) + ')';
                            ctx.fill();
                        }
                    }
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // MOUNTAIN — Mountain panorama
    // Alpenglow at dawn, Milky Way at night
    // ====================================================================
    themes.mountain = (function () {
        return {
            targetCount: 10,
            spawn: function (w, h) {
                // Drifting cloud
                return {
                    x: -50 - Math.random() * 100,
                    y: h * (0.15 + Math.random() * 0.25),
                    vx: 5 + Math.random() * 10,
                    vy: 0,
                    size: 30 + Math.random() * 50,
                    opacity: 0.05 + Math.random() * 0.1
                };
            },
            update: function (p, dt, w, h, state) {
                p.x += p.vx * dt;
                return p.x < w + 100;
            },
            draw: function (p, ctx, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var alpha = p.opacity * Math.min(1, td.brightness * 2 + 0.2);
                if (alpha < 0.01) return;
                var cloudColor = lerpColor([255, 255, 255], [80, 80, 100], 1 - td.brightness);
                var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                grad.addColorStop(0, colorToRgb(cloudColor, alpha));
                grad.addColorStop(0.6, colorToRgb(cloudColor, alpha * 0.4));
                grad.addColorStop(1, colorToRgb(cloudColor, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                drawSkyGradient(ctx, w, h, td);
                drawStars(ctx, w, h * 0.5, td, t, 400);

                // Milky Way at night
                if (td.brightness < 0.08) {
                    var mwAlpha = (0.08 - td.brightness) * 10;
                    ctx.save();
                    ctx.translate(w * 0.5, 0);
                    ctx.rotate(0.3);
                    for (var i = 0; i < 150; i++) {
                        var mx = (Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * w * 0.4 - w * 0.2;
                        var my = (Math.sin(i * 311.7) * 43758.5453 % 1 + 1) % 1 * h * 0.5;
                        var dist = Math.abs(mx) / (w * 0.2);
                        var density = Math.exp(-dist * dist * 3);
                        ctx.beginPath();
                        ctx.arc(mx, my, 0.5 + density, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200,210,240,' + (mwAlpha * density * 0.3) + ')';
                        ctx.fill();
                    }
                    ctx.restore();
                }

                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                // Mountains - three layers
                var mountainColors = [
                    lerpColor([60, 70, 90], [15, 18, 25], 1 - td.brightness),
                    lerpColor([45, 55, 70], [12, 14, 20], 1 - td.brightness),
                    lerpColor([35, 42, 55], [8, 10, 15], 1 - td.brightness)
                ];

                for (var layer = 0; layer < 3; layer++) {
                    var baseY = h * (0.45 + layer * 0.1);
                    ctx.beginPath();
                    ctx.moveTo(0, h);
                    for (var x = 0; x <= w; x += 3) {
                        var peak = Math.sin(x * 0.003 + layer * 2) * h * (0.15 - layer * 0.03) +
                                   Math.sin(x * 0.008 + layer * 5) * h * (0.08 - layer * 0.02) +
                                   Math.sin(x * 0.015 + layer * 8) * h * 0.02;
                        ctx.lineTo(x, baseY - Math.abs(peak));
                    }
                    ctx.lineTo(w, h);
                    ctx.closePath();
                    ctx.fillStyle = colorToRgb(mountainColors[layer]);
                    ctx.fill();

                    // Snow caps on first layer
                    if (layer === 0) {
                        var snowAlpha = 0.3 + td.brightness * 0.4;
                        ctx.beginPath();
                        for (var x = 0; x <= w; x += 3) {
                            var peak = Math.sin(x * 0.003 + layer * 2) * h * 0.15 +
                                       Math.sin(x * 0.008 + layer * 5) * h * 0.08 +
                                       Math.sin(x * 0.015 + layer * 8) * h * 0.02;
                            var my = baseY - Math.abs(peak);
                            if (Math.abs(peak) > h * 0.12) {
                                ctx.moveTo(x, my);
                                ctx.lineTo(x, my + 5);
                            }
                        }
                        ctx.strokeStyle = 'rgba(220,225,240,' + snowAlpha + ')';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }
                }

                // Alpenglow at dawn/dusk
                if (td.period === 'dawn' || td.period === 'dusk') {
                    var glowAlpha = 0.15;
                    var glowColor = td.period === 'dawn' ? [255, 120, 80] : [255, 100, 60];
                    var glowGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.6);
                    glowGrad.addColorStop(0, colorToRgb(glowColor, glowAlpha));
                    glowGrad.addColorStop(1, colorToRgb(glowColor, 0));
                    ctx.fillStyle = glowGrad;
                    ctx.fillRect(0, h * 0.3, w, h * 0.3);
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // LAKE — Still water with reflections
    // Mirror-perfect sunset reflection, star reflection at night
    // ====================================================================
    themes.lake = (function () {
        return {
            targetCount: 8,
            spawn: function (w, h) {
                // Gentle ripple
                return {
                    x: Math.random() * w,
                    y: h * (0.52 + Math.random() * 0.35),
                    size: 5 + Math.random() * 15,
                    life: 0,
                    maxLife: 3 + Math.random() * 4
                };
            },
            update: function (p, dt, w, h, state) {
                p.life += dt;
                p.size += 8 * dt;
                return p.life < p.maxLife;
            },
            draw: function (p, ctx, state) {
                var fade = 1 - p.life / p.maxLife;
                if (fade < 0.01) return;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size * 0.3, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,' + (fade * 0.06) + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Sky (top half)
                var skyH = h * 0.5;
                drawSkyGradient(ctx, w, skyH, td);
                drawStars(ctx, w, skyH, td, t, 500);
                drawSun(ctx, w, skyH, td, t);
                drawMoon(ctx, w, skyH, td, t);

                // Treeline silhouette
                var treeY = skyH;
                ctx.beginPath();
                ctx.moveTo(0, treeY);
                for (var x = 0; x <= w; x += 3) {
                    var tree = Math.sin(x * 0.02) * 8 + Math.sin(x * 0.05 + 2) * 5 + Math.sin(x * 0.1 + 5) * 3;
                    ctx.lineTo(x, treeY - Math.abs(tree) - 5);
                }
                ctx.lineTo(w, treeY);
                ctx.closePath();
                var treeColor = lerpColor([15, 30, 10], [5, 10, 3], 1 - td.brightness);
                ctx.fillStyle = colorToRgb(treeColor);
                ctx.fill();

                // Water (bottom half) - reflected sky
                var waterY = skyH;
                var waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
                // Reflect horizon at top of water, zenith at bottom
                waterGrad.addColorStop(0, colorToRgb(lerpColor(td.palette.horizon, [0, 0, 0], 0.2)));
                waterGrad.addColorStop(0.5, colorToRgb(lerpColor(td.palette.mid, [0, 0, 0], 0.3)));
                waterGrad.addColorStop(1, colorToRgb(lerpColor(td.palette.zenith, [0, 0, 0], 0.4)));
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, waterY, w, h - waterY);

                // Reflected stars at night
                if (td.brightness < 0.1) {
                    var refAlpha = (0.1 - td.brightness) * 6;
                    for (var i = 0; i < 40; i++) {
                        var sx = ((Math.sin(500 + i * 127.1) * 43758.5453) % 1 + 1) % 1 * w;
                        var origY = ((Math.sin(500 + i * 311.7) * 43758.5453) % 1 + 1) % 1 * skyH * 0.6;
                        var refY = waterY + (skyH - origY) + Math.sin(t * 0.5 + i) * 2;
                        var twinkle = Math.sin(t * 0.5 + i * 3.7) * 0.3 + 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, refY, 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,240,' + (refAlpha * twinkle * 0.3) + ')';
                        ctx.fill();
                    }
                }

                // Sunset reflection path on water
                if (td.period === 'dusk' || td.period === 'dawn') {
                    var sunProgress = Math.max(0, Math.min(1, (td.hour - 5) / 14));
                    var reflX = w * (0.15 + sunProgress * 0.7);
                    var refGrad = ctx.createLinearGradient(0, waterY, 0, h);
                    refGrad.addColorStop(0, 'rgba(255,150,60,0.15)');
                    refGrad.addColorStop(0.5, 'rgba(255,100,40,0.08)');
                    refGrad.addColorStop(1, 'rgba(255,80,30,0)');
                    ctx.save();
                    ctx.beginPath();
                    for (var y = waterY; y < h; y += 3) {
                        var wobble = Math.sin(y * 0.05 + t * 0.8) * (5 + (y - waterY) * 0.05);
                        var width = 10 + (y - waterY) * 0.3;
                        ctx.rect(reflX - width / 2 + wobble, y, width, 3);
                    }
                    ctx.fillStyle = refGrad;
                    ctx.fill();
                    ctx.restore();
                }

                // Gentle water surface distortion lines
                for (var i = 0; i < 12; i++) {
                    var ly = waterY + 10 + i * (h - waterY - 10) / 12;
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 8) {
                        var dy = Math.sin(x * 0.015 + t * 0.4 + i * 2) * 1.5;
                        if (x === 0) ctx.moveTo(x, ly + dy);
                        else ctx.lineTo(x, ly + dy);
                    }
                    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // DESERT — Sand dunes, vast sky
    // Heat shimmer at noon, pristine star field at night
    // ====================================================================
    themes.desert = (function () {
        return {
            targetCount: 5,
            spawn: function (w, h) {
                // Tumbling dust
                return {
                    x: -10,
                    y: h * (0.6 + Math.random() * 0.25),
                    vx: 15 + Math.random() * 25,
                    vy: (Math.random() - 0.5) * 5,
                    size: 1 + Math.random() * 2,
                    opacity: 0.1 + Math.random() * 0.15
                };
            },
            update: function (p, dt, w, h, state) {
                p.x += p.vx * dt;
                p.y += p.vy * dt + Math.sin(state.timeElapsed + p.x * 0.01) * 2 * dt;
                return p.x < w + 20;
            },
            draw: function (p, ctx, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var alpha = p.opacity * (0.3 + td.brightness * 0.7);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(210,190,150,' + alpha + ')';
                ctx.fill();
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Desert sky - warmer than standard
                var skyZenith = lerpColor(td.palette.zenith, [40, 30, 20], 0.15);
                var skyHorizon = lerpColor(td.palette.horizon, [60, 40, 20], 0.2);
                var grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
                grad.addColorStop(0, colorToRgb(skyZenith));
                grad.addColorStop(1, colorToRgb(skyHorizon));
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                drawStars(ctx, w, h * 0.55, td, t, 600);

                // Extra dense stars at night for pristine desert sky
                if (td.brightness < 0.08) {
                    var extraAlpha = (0.08 - td.brightness) * 12;
                    for (var i = 0; i < 120; i++) {
                        var sx = ((Math.sin(700 + i * 127.1) * 43758.5453) % 1 + 1) % 1 * w;
                        var sy = ((Math.sin(700 + i * 311.7) * 43758.5453) % 1 + 1) % 1 * h * 0.55;
                        var twinkle = Math.sin(t * (0.3 + (i % 10) * 0.2) + i * 3.7) * 0.4 + 0.6;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.3 + (i % 3) * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,245,' + (extraAlpha * twinkle * 0.5) + ')';
                        ctx.fill();
                    }
                }

                drawSun(ctx, w, h * 0.65, td, t);
                drawMoon(ctx, w, h * 0.65, td, t);

                // Sand dunes
                var duneBase = h * 0.65;
                var sandDay = [220, 195, 140];
                var sandNight = [60, 50, 35];
                var sandColor = lerpColor(sandDay, sandNight, 1 - td.brightness);
                var sandDark = lerpColor(sandColor, [0, 0, 0], 0.3);

                // Background dunes
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var dy = Math.sin(x * 0.002 + 0.5) * h * 0.08 +
                             Math.sin(x * 0.005 + 2) * h * 0.04;
                    ctx.lineTo(x, duneBase - dy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                var duneGrad = ctx.createLinearGradient(0, duneBase - h * 0.12, 0, h);
                duneGrad.addColorStop(0, colorToRgb(sandColor));
                duneGrad.addColorStop(0.5, colorToRgb(lerpColor(sandColor, sandDark, 0.3)));
                duneGrad.addColorStop(1, colorToRgb(sandDark));
                ctx.fillStyle = duneGrad;
                ctx.fill();

                // Foreground dune with ridge highlight
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var dy = Math.sin(x * 0.003 + 3) * h * 0.06 +
                             Math.sin(x * 0.001) * h * 0.03;
                    ctx.lineTo(x, duneBase + h * 0.1 - dy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(lerpColor(sandColor, sandDark, 0.15));
                ctx.fill();

                // Dune ridge highlight (sun side)
                if (td.brightness > 0.3) {
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 4) {
                        var dy = Math.sin(x * 0.003 + 3) * h * 0.06 + Math.sin(x * 0.001) * h * 0.03;
                        var ry = duneBase + h * 0.1 - dy;
                        if (x === 0) ctx.moveTo(x, ry);
                        else ctx.lineTo(x, ry);
                    }
                    ctx.strokeStyle = 'rgba(255,240,200,' + ((td.brightness - 0.3) * 0.15) + ')';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Heat shimmer at midday
                if (td.period === 'midday' || (td.period === 'afternoon' && td.periodProgress < 0.3)) {
                    var shimmerAlpha = td.period === 'midday' ? 0.03 : 0.03 * (1 - td.periodProgress / 0.3);
                    for (var y = duneBase - 20; y < duneBase + 30; y += 6) {
                        ctx.beginPath();
                        for (var x = 0; x <= w; x += 4) {
                            var dx = Math.sin(x * 0.03 + t * 2 + y * 0.1) * 3;
                            if (x === 0) ctx.moveTo(x + dx, y);
                            else ctx.lineTo(x + dx, y);
                        }
                        ctx.strokeStyle = 'rgba(255,255,255,' + shimmerAlpha + ')';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // HARBOUR — Boats, lighthouse, water
    // Active harbor by day, lighthouse beam and reflections at night
    // ====================================================================
    themes.harbour = (function () {
        // Pre-generate boats
        var boats = [];
        for (var i = 0; i < 6; i++) {
            boats.push({
                x: 0.2 + Math.random() * 0.6,
                y: 0.55 + Math.random() * 0.15,
                size: 0.015 + Math.random() * 0.02,
                bobPhase: Math.random() * Math.PI * 2,
                hasMast: Math.random() > 0.4
            });
        }

        return {
            targetCount: 8,
            spawn: function (w, h) {
                // Seagull / water sparkle
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness > 0.3) {
                    return {
                        type: 'gull',
                        x: -20,
                        y: h * (0.15 + Math.random() * 0.25),
                        vx: 25 + Math.random() * 30,
                        vy: (Math.random() - 0.5) * 8,
                        wingPhase: Math.random() * Math.PI * 2,
                        size: 4 + Math.random() * 4
                    };
                } else {
                    return {
                        type: 'reflection',
                        x: Math.random() * w,
                        y: h * (0.5 + Math.random() * 0.35),
                        life: 0,
                        maxLife: 1 + Math.random() * 2,
                        size: 1 + Math.random() * 2
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'gull') {
                    p.wingPhase += dt * 5;
                    p.x += p.vx * dt;
                    p.y += p.vy * dt + Math.sin(state.timeElapsed * 0.3 + p.wingPhase * 0.1) * 3 * dt;
                    return p.x < w + 30;
                } else {
                    p.life += dt;
                    return p.life < p.maxLife;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'gull') {
                    var wing = Math.sin(p.wingPhase) * 0.6;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.beginPath();
                    ctx.moveTo(-p.size, wing * p.size * 0.5);
                    ctx.quadraticCurveTo(-p.size * 0.3, -wing * p.size * 0.4, 0, 0);
                    ctx.quadraticCurveTo(p.size * 0.3, -wing * p.size * 0.4, p.size, wing * p.size * 0.5);
                    ctx.strokeStyle = 'rgba(60,60,70,0.5)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.restore();
                } else {
                    var fade = 1 - p.life / p.maxLife;
                    var twinkle = Math.sin(p.life * 5) * 0.5 + 0.5;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,220,150,' + (fade * twinkle * 0.3) + ')';
                    ctx.fill();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Sky
                drawSkyGradient(ctx, w, h * 0.5, td);
                ctx.fillStyle = colorToRgb(td.palette.horizon);
                ctx.fillRect(0, h * 0.5, w, h * 0.5);
                drawStars(ctx, w, h * 0.45, td, t, 700);
                drawSun(ctx, w, h * 0.5, td, t);
                drawMoon(ctx, w, h * 0.5, td, t);

                // Water
                var waterY = h * 0.5;
                var waterColor = lerpColor([25, 60, 80], [8, 20, 35], 1 - td.brightness);
                var waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
                waterGrad.addColorStop(0, colorToRgb(lerpColor(waterColor, td.palette.horizon, 0.3)));
                waterGrad.addColorStop(1, colorToRgb(waterColor));
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, waterY, w, h - waterY);

                // Waves
                for (var wave = 0; wave < 6; wave++) {
                    var wy = waterY + wave * (h - waterY) / 6;
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 6) {
                        var dy = Math.sin(x * 0.012 + t * 0.5 + wave * 1.5) * 3 +
                                 Math.sin(x * 0.03 + t * 0.3) * 1.5;
                        if (x === 0) ctx.moveTo(x, wy + dy);
                        else ctx.lineTo(x, wy + dy);
                    }
                    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Boats
                for (var i = 0; i < boats.length; i++) {
                    var b = boats[i];
                    var bx = b.x * w;
                    var by = b.y * h + Math.sin(t * 0.5 + b.bobPhase) * 3;
                    var bs = b.size * w;
                    var boatColor = lerpColor([60, 50, 40], [25, 20, 18], 1 - td.brightness);

                    // Hull
                    ctx.beginPath();
                    ctx.moveTo(bx - bs, by);
                    ctx.quadraticCurveTo(bx, by + bs * 0.4, bx + bs, by);
                    ctx.lineTo(bx + bs * 0.8, by - bs * 0.1);
                    ctx.lineTo(bx - bs * 0.8, by - bs * 0.1);
                    ctx.closePath();
                    ctx.fillStyle = colorToRgb(boatColor);
                    ctx.fill();

                    // Mast
                    if (b.hasMast) {
                        ctx.beginPath();
                        ctx.moveTo(bx, by - bs * 0.1);
                        ctx.lineTo(bx, by - bs * 1.2);
                        ctx.strokeStyle = colorToRgb(lerpColor(boatColor, [100, 90, 80], 0.3));
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                }

                // Lighthouse on right
                var lhX = w * 0.88;
                var lhBase = waterY - 5;
                var lhH = h * 0.15;
                var lhW = 12;

                // Lighthouse body
                ctx.beginPath();
                ctx.moveTo(lhX - lhW, lhBase);
                ctx.lineTo(lhX - lhW * 0.6, lhBase - lhH);
                ctx.lineTo(lhX + lhW * 0.6, lhBase - lhH);
                ctx.lineTo(lhX + lhW, lhBase);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(lerpColor([200, 195, 185], [80, 78, 72], 1 - td.brightness));
                ctx.fill();

                // Stripes
                for (var s = 0; s < 4; s++) {
                    var sy = lhBase - (s + 0.5) * lhH / 4;
                    var sw = lhW * (1 - s * 0.1);
                    ctx.fillStyle = 'rgba(180,40,40,' + (0.3 + td.brightness * 0.4) + ')';
                    ctx.fillRect(lhX - sw * 0.5, sy - lhH / 8, sw, lhH / 8);
                }

                // Lighthouse lamp
                var lampY = lhBase - lhH - 5;
                ctx.beginPath();
                ctx.arc(lhX, lampY, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,240,180,0.8)';
                ctx.fill();

                // Lighthouse beam at night
                if (td.brightness < 0.25) {
                    var beamAlpha = (0.25 - td.brightness) * 2;
                    var beamAngle = (t * 0.3) % (Math.PI * 2);
                    // Only show when beam faces viewer (roughly left half sweep)
                    var beamVisible = Math.sin(beamAngle);
                    if (beamVisible > 0) {
                        ctx.save();
                        ctx.translate(lhX, lampY);
                        ctx.rotate(beamAngle);
                        ctx.beginPath();
                        ctx.moveTo(0, -3);
                        ctx.lineTo(w * 0.4, -20);
                        ctx.lineTo(w * 0.4, 20);
                        ctx.lineTo(0, 3);
                        ctx.closePath();
                        var beamGrad = ctx.createLinearGradient(0, 0, w * 0.4, 0);
                        beamGrad.addColorStop(0, 'rgba(255,240,180,' + (beamAlpha * beamVisible * 0.3) + ')');
                        beamGrad.addColorStop(1, 'rgba(255,240,180,0)');
                        ctx.fillStyle = beamGrad;
                        ctx.fill();
                        ctx.restore();
                    }
                }

                // Rocky base for lighthouse
                ctx.beginPath();
                ctx.moveTo(lhX - 25, lhBase);
                ctx.quadraticCurveTo(lhX - 20, lhBase + 10, lhX - 30, waterY + 15);
                ctx.lineTo(lhX + 30, waterY + 15);
                ctx.quadraticCurveTo(lhX + 20, lhBase + 10, lhX + 25, lhBase);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(lerpColor([70, 65, 55], [25, 23, 20], 1 - td.brightness));
                ctx.fill();
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // GARDEN — Zen garden, lanterns, blossoms
    // Cherry blossoms by day, lantern glow and fireflies at night
    // ====================================================================
    themes.garden = (function () {
        // Pre-generate lantern positions
        var lanterns = [];
        for (var i = 0; i < 6; i++) {
            lanterns.push({
                x: 0.1 + i * 0.15,
                y: 0.35 + Math.sin(i * 2.3) * 0.08,
                size: 8 + Math.random() * 4
            });
        }

        return {
            targetCount: 25,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness < 0.15) {
                    // Firefly
                    return {
                        type: 'firefly',
                        x: Math.random() * w,
                        y: h * (0.3 + Math.random() * 0.4),
                        vx: (Math.random() - 0.5) * 15,
                        vy: (Math.random() - 0.5) * 10,
                        phase: Math.random() * Math.PI * 2,
                        size: 1.5 + Math.random() * 1.5,
                        pulseSpeed: 1 + Math.random() * 2
                    };
                } else {
                    // Cherry blossom petal
                    return {
                        type: 'petal',
                        x: Math.random() * w * 1.2 - w * 0.1,
                        y: -10,
                        vx: 8 + Math.random() * 15,
                        vy: 15 + Math.random() * 20,
                        rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 3,
                        size: 2 + Math.random() * 3,
                        flutter: Math.random() * Math.PI * 2
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'firefly') {
                    p.phase += dt * p.pulseSpeed;
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.4 + p.phase) * 8 * dt;
                    p.y += p.vy * dt + Math.cos(state.timeElapsed * 0.6 + p.phase) * 5 * dt;
                    if (p.x < -20 || p.x > w + 20 || p.y < h * 0.1 || p.y > h * 0.85) return false;
                    return true;
                } else {
                    p.rotation += p.rotSpeed * dt;
                    p.flutter += dt * 2;
                    p.x += (p.vx + Math.sin(p.flutter) * 12) * dt;
                    p.y += p.vy * dt;
                    return p.y < h + 10;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'firefly') {
                    var glow = Math.sin(p.phase) * 0.5 + 0.5;
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                    grad.addColorStop(0, 'rgba(200,220,100,' + (glow * 0.5) + ')');
                    grad.addColorStop(1, 'rgba(180,210,60,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(220,240,140,' + (glow * 0.8) + ')';
                    ctx.fill();
                } else {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,180,190,0.6)';
                    ctx.fill();
                    ctx.restore();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Garden backdrop - warmer green tones
                var gardenSky = {
                    zenith: lerpColor(td.palette.zenith, [20, 30, 15], 0.2),
                    mid: lerpColor(td.palette.mid, [30, 40, 20], 0.15),
                    horizon: lerpColor(td.palette.horizon, [40, 50, 25], 0.1)
                };
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, colorToRgb(gardenSky.zenith));
                grad.addColorStop(0.4, colorToRgb(gardenSky.mid));
                grad.addColorStop(1, colorToRgb(gardenSky.horizon));
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                drawStars(ctx, w, h * 0.5, td, t, 800);
                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                // Garden ground
                var groundY = h * 0.7;
                var groundColor = lerpColor([35, 55, 25], [12, 20, 8], 1 - td.brightness);
                var groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
                groundGrad.addColorStop(0, colorToRgb(groundColor));
                groundGrad.addColorStop(1, colorToRgb(lerpColor(groundColor, [0, 0, 0], 0.4)));
                ctx.fillStyle = groundGrad;
                ctx.fillRect(0, groundY, w, h - groundY);

                // Zen sand raked patterns
                var sandY = h * 0.78;
                ctx.fillStyle = colorToRgb(lerpColor([180, 170, 140], [50, 45, 35], 1 - td.brightness), 0.3);
                ctx.fillRect(w * 0.2, sandY, w * 0.6, h * 0.12);
                for (var i = 0; i < 8; i++) {
                    var ry = sandY + 5 + i * (h * 0.12 - 10) / 8;
                    ctx.beginPath();
                    for (var x = w * 0.22; x <= w * 0.78; x += 5) {
                        var dy = Math.sin((x - w * 0.5) * 0.02 + i * 0.5) * 2;
                        if (x === w * 0.22) ctx.moveTo(x, ry + dy);
                        else ctx.lineTo(x, ry + dy);
                    }
                    ctx.strokeStyle = colorToRgb(lerpColor([160, 150, 120], [40, 38, 30], 1 - td.brightness), 0.15);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Cherry blossom tree
                var treeX = w * 0.3;
                var treeBase = groundY;
                var trunkColor = lerpColor([60, 40, 25], [25, 16, 10], 1 - td.brightness);

                // Trunk
                ctx.beginPath();
                ctx.moveTo(treeX - 8, treeBase);
                ctx.quadraticCurveTo(treeX - 5, treeBase - h * 0.15, treeX - 3, treeBase - h * 0.25);
                ctx.quadraticCurveTo(treeX + 2, treeBase - h * 0.15, treeX + 8, treeBase);
                ctx.fillStyle = colorToRgb(trunkColor);
                ctx.fill();

                // Branches with blossoms
                var branchEnds = [
                    [treeX - 40, treeBase - h * 0.3],
                    [treeX + 30, treeBase - h * 0.32],
                    [treeX - 20, treeBase - h * 0.35],
                    [treeX + 50, treeBase - h * 0.28]
                ];
                for (var i = 0; i < branchEnds.length; i++) {
                    ctx.beginPath();
                    ctx.moveTo(treeX, treeBase - h * 0.22);
                    ctx.quadraticCurveTo(
                        (treeX + branchEnds[i][0]) / 2,
                        branchEnds[i][1] + 10,
                        branchEnds[i][0], branchEnds[i][1]
                    );
                    ctx.strokeStyle = colorToRgb(trunkColor);
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Blossom cluster
                    if (td.brightness > 0.15) {
                        var clusterAlpha = 0.15 + td.brightness * 0.3;
                        for (var b = 0; b < 8; b++) {
                            var bx = branchEnds[i][0] + (Math.sin(b * 5 + i) * 15);
                            var by = branchEnds[i][1] + (Math.cos(b * 7 + i) * 10);
                            ctx.beginPath();
                            ctx.arc(bx, by, 4 + Math.sin(b) * 2, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255,200,210,' + clusterAlpha + ')';
                            ctx.fill();
                        }
                    }
                }

                // Lanterns
                for (var i = 0; i < lanterns.length; i++) {
                    var l = lanterns[i];
                    var lx = l.x * w;
                    var ly = l.y * h;
                    var ls = l.size;

                    // String
                    ctx.beginPath();
                    ctx.moveTo(lx, ly - ls);
                    ctx.lineTo(lx, ly - ls - 15);
                    ctx.strokeStyle = 'rgba(100,90,80,0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Lantern body
                    ctx.beginPath();
                    ctx.ellipse(lx, ly, ls * 0.6, ls, 0, 0, Math.PI * 2);
                    var lanternAlpha = td.brightness < 0.3 ? 0.7 : 0.3;
                    ctx.fillStyle = 'rgba(200,60,50,' + lanternAlpha + ')';
                    ctx.fill();

                    // Lantern glow at night
                    if (td.brightness < 0.3) {
                        var glowAlpha = (0.3 - td.brightness) * 2;
                        var sway = Math.sin(t * 0.3 + i * 2) * 0.1;
                        var glowGrad = ctx.createRadialGradient(lx, ly, ls * 0.3, lx, ly, ls * 5);
                        glowGrad.addColorStop(0, 'rgba(255,180,100,' + (glowAlpha * 0.3) + ')');
                        glowGrad.addColorStop(0.5, 'rgba(255,140,60,' + (glowAlpha * 0.1) + ')');
                        glowGrad.addColorStop(1, 'rgba(255,100,40,0)');
                        ctx.fillStyle = glowGrad;
                        ctx.beginPath();
                        ctx.arc(lx, ly, ls * 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Stepping stones
                for (var i = 0; i < 5; i++) {
                    var sx = w * 0.4 + i * w * 0.08;
                    var sy = groundY + 8 + Math.sin(i * 1.5) * 5;
                    var stoneColor = lerpColor([120, 115, 100], [40, 38, 32], 1 - td.brightness);
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, 12, 6, 0.1 * i, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(stoneColor, 0.6);
                    ctx.fill();
                }
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // WHEATFIELD — Rolling wheat to horizon
    // Golden waves by day, fireflies and farmhouse glow at night
    // ====================================================================
    themes.wheatfield = (function () {
        return {
            targetCount: 20,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness < 0.15) {
                    // Firefly
                    return {
                        type: 'firefly',
                        x: Math.random() * w,
                        y: h * (0.35 + Math.random() * 0.35),
                        vx: (Math.random() - 0.5) * 12,
                        vy: (Math.random() - 0.5) * 8,
                        phase: Math.random() * Math.PI * 2,
                        size: 1.5 + Math.random() * 2,
                        pulseSpeed: 0.8 + Math.random() * 1.5
                    };
                } else {
                    // Seed/chaff
                    return {
                        type: 'seed',
                        x: Math.random() * w,
                        y: h * (0.3 + Math.random() * 0.3),
                        vx: 10 + Math.random() * 15,
                        vy: -3 + Math.random() * 6,
                        size: 0.5 + Math.random() * 1.5,
                        opacity: 0.15 + Math.random() * 0.2
                    };
                }
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'firefly') {
                    p.phase += dt * p.pulseSpeed;
                    p.x += p.vx * dt + Math.sin(state.timeElapsed * 0.4 + p.phase) * 6 * dt;
                    p.y += p.vy * dt + Math.cos(state.timeElapsed * 0.5 + p.phase) * 4 * dt;
                    if (p.x < -20 || p.x > w + 20 || p.y < h * 0.15 || p.y > h * 0.85) return false;
                    return true;
                } else {
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    return p.x < w + 10 && p.y < h;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'firefly') {
                    var glow = Math.sin(p.phase) * 0.5 + 0.5;
                    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                    grad.addColorStop(0, 'rgba(200,220,100,' + (glow * 0.5) + ')');
                    grad.addColorStop(1, 'rgba(180,200,60,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230,240,140,' + (glow * 0.8) + ')';
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(220,200,120,' + p.opacity + ')';
                    ctx.fill();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Warm sky
                var warmSky = {
                    zenith: lerpColor(td.palette.zenith, [20, 15, 5], 0.1),
                    mid: lerpColor(td.palette.mid, [40, 30, 10], 0.1),
                    horizon: lerpColor(td.palette.horizon, [50, 40, 15], 0.15)
                };
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, colorToRgb(warmSky.zenith));
                grad.addColorStop(0.45, colorToRgb(warmSky.mid));
                grad.addColorStop(1, colorToRgb(warmSky.horizon));
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                drawStars(ctx, w, h * 0.4, td, t, 900);
                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                // Wheat field
                var fieldY = h * 0.55;
                var wheatDay = [200, 180, 80];
                var wheatNight = [40, 35, 18];
                var wheatColor = lerpColor(wheatDay, wheatNight, 1 - td.brightness);
                var wheatDark = lerpColor(wheatColor, [0, 0, 0], 0.35);

                // Field base
                var fieldGrad = ctx.createLinearGradient(0, fieldY, 0, h);
                fieldGrad.addColorStop(0, colorToRgb(wheatColor));
                fieldGrad.addColorStop(1, colorToRgb(wheatDark));
                ctx.fillStyle = fieldGrad;
                ctx.fillRect(0, fieldY, w, h - fieldY);

                // Wheat stalks waving
                for (var row = 0; row < 8; row++) {
                    var rowY = fieldY + row * (h - fieldY) / 8;
                    var density = 1 + row * 0.5;
                    var stalkH = 15 + row * 4;
                    var rowColor = lerpColor(wheatColor, wheatDark, row / 8);

                    for (var x = 0; x < w; x += (6 - row * 0.3)) {
                        var windPhase = t * 1.5 + x * 0.008 + row * 0.5;
                        var sway = Math.sin(windPhase) * (6 + row * 1.5) + Math.sin(windPhase * 2.3) * 2;
                        var stalkAlpha = 0.3 + td.brightness * 0.5;

                        ctx.beginPath();
                        ctx.moveTo(x, rowY);
                        ctx.quadraticCurveTo(x + sway * 0.5, rowY - stalkH * 0.5, x + sway, rowY - stalkH);
                        ctx.strokeStyle = colorToRgb(rowColor, stalkAlpha);
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        // Wheat head
                        ctx.beginPath();
                        ctx.ellipse(x + sway, rowY - stalkH - 2, 1.5, 3, sway * 0.05, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(lerpColor(rowColor, [240, 220, 120], td.brightness * 0.3), stalkAlpha);
                        ctx.fill();
                    }
                }

                // Golden hour glow during afternoon
                if (td.period === 'afternoon' || td.period === 'dusk') {
                    var goldenAlpha = td.period === 'afternoon' ? 0.06 : 0.04;
                    ctx.fillStyle = 'rgba(255,200,80,' + goldenAlpha + ')';
                    ctx.fillRect(0, 0, w, h);
                }

                // Farmhouse silhouette in distance
                var fhX = w * 0.78;
                var fhY = fieldY + 5;
                var fhColor = lerpColor([50, 40, 30], [15, 12, 8], 1 - td.brightness);

                // House body
                ctx.fillStyle = colorToRgb(fhColor);
                ctx.fillRect(fhX - 15, fhY - 20, 30, 20);
                // Roof
                ctx.beginPath();
                ctx.moveTo(fhX - 18, fhY - 20);
                ctx.lineTo(fhX, fhY - 32);
                ctx.lineTo(fhX + 18, fhY - 20);
                ctx.closePath();
                ctx.fill();

                // Window glow at night
                if (td.brightness < 0.2) {
                    var winGlow = (0.2 - td.brightness) * 5;
                    ctx.fillStyle = 'rgba(255,220,130,' + (winGlow * 0.7) + ')';
                    ctx.fillRect(fhX - 8, fhY - 15, 5, 5);
                    ctx.fillRect(fhX + 3, fhY - 15, 5, 5);

                    // Window light spill
                    var spillGrad = ctx.createRadialGradient(fhX, fhY - 12, 3, fhX, fhY - 12, 40);
                    spillGrad.addColorStop(0, 'rgba(255,210,120,' + (winGlow * 0.15) + ')');
                    spillGrad.addColorStop(1, 'rgba(255,180,80,0)');
                    ctx.fillStyle = spillGrad;
                    ctx.beginPath();
                    ctx.arc(fhX, fhY - 12, 40, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            drawForeground: function () {}
        };
    })();

})(CV.themes, CV.FALLBACK_DT);
