(function (themes, FALLBACK_DT) {
    var diurnal = CV.diurnal;
    var lerpColor = diurnal.lerpColor;
    var colorToRgb = diurnal.colorToRgb;
    var drawSkyGradient = diurnal.drawSkyGradient;
    var drawStars = diurnal.drawStars;
    var drawSun = diurnal.drawSun;
    var drawMoon = diurnal.drawMoon;


    // ====================================================================
    // MEADOW — Rolling grass, flowers, sky
    // Butterflies by day, fireflies at night, dew at dawn
    // Clouds, brook with ripples, flowers that open/close with time
    // ====================================================================
    themes.meadow = (function () {
        // Pre-generate cloud data (3 clouds)
        var clouds = [];
        for (var i = 0; i < 3; i++) {
            clouds.push({
                baseX: i * 0.35 + 0.05,
                y: 0.12 + i * 0.06,
                w1: 40 + i * 15,
                h1: 14 + i * 4,
                w2: 28 + i * 10,
                h2: 10 + i * 3,
                w3: 22 + i * 8,
                h3: 9 + i * 2,
                offX2: -18 + i * 5,
                offY2: -5,
                offX3: 20 - i * 4,
                offY3: -3,
                speed: 8 + i * 4
            });
        }

        // Pre-generate flower positions (40 flowers) with deterministic seeds
        var flowerSeeds = [];
        for (var i = 0; i < 40; i++) {
            flowerSeeds.push({
                xFrac: ((Math.sin(i * 127.1 + 7) * 43758.5453) % 1 + 1) % 1,
                sizeMod: 2 + (i % 3),
                hue: (i * 67) % 360,
                petalCount: 4 + (i % 3),
                openPhase: ((Math.sin(i * 53.7) * 43758.5453) % 1 + 1) % 1 * 0.2
            });
        }

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

                // Drifting clouds
                if (td.brightness > 0.08) {
                    var cloudAlpha = Math.min(0.35, td.brightness * 0.4);
                    var cloudColor = lerpColor([255, 255, 255], [100, 100, 120], 1 - td.brightness);
                    for (var ci = 0; ci < clouds.length; ci++) {
                        var c = clouds[ci];
                        var cx = ((c.baseX * w + t * c.speed) % (w + c.w1 * 4)) - c.w1 * 2;
                        var cy = c.y * h;
                        ctx.fillStyle = colorToRgb(cloudColor, cloudAlpha * 0.7);
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, c.w1, c.h1, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(cx + c.offX2, cy + c.offY2, c.w2, c.h2, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(cx + c.offX3, cy + c.offY3, c.w3, c.h3, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

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

                // Brook / stream running through bottom third
                var brookY = h * 0.78;
                var brookW = h * 0.025;
                var waterBlue = lerpColor([40, 100, 150], [10, 30, 55], 1 - td.brightness);
                var waterLight = lerpColor([80, 150, 200], [20, 50, 80], 1 - td.brightness);

                // Brook bed (dark line)
                ctx.beginPath();
                ctx.moveTo(0, brookY + 2);
                for (var x = 0; x <= w; x += 6) {
                    var bend = Math.sin(x * 0.005 + 2.5) * 8 + Math.sin(x * 0.012) * 4;
                    ctx.lineTo(x, brookY + bend);
                }
                ctx.lineTo(w, brookY + 5);
                ctx.lineTo(w, brookY + brookW + 5);
                for (var x = w; x >= 0; x -= 6) {
                    var bend = Math.sin(x * 0.005 + 2.5) * 8 + Math.sin(x * 0.012) * 4;
                    ctx.lineTo(x, brookY + bend + brookW);
                }
                ctx.closePath();
                ctx.fillStyle = colorToRgb(waterBlue, 0.7);
                ctx.fill();

                // Brook flowing highlights / ripples
                for (var ri = 0; ri < 5; ri++) {
                    var ripX = ((t * 30 + ri * w * 0.22) % (w + 40)) - 20;
                    var ripBend = Math.sin(ripX * 0.005 + 2.5) * 8 + Math.sin(ripX * 0.012) * 4;
                    var ripY = brookY + ripBend + brookW * 0.3 + Math.sin(t * 2 + ri * 1.7) * 2;
                    ctx.beginPath();
                    ctx.ellipse(ripX, ripY, 6 + Math.sin(t * 1.5 + ri) * 2, 1.5, 0, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(waterLight, 0.25 + Math.sin(t * 1.8 + ri * 2.3) * 0.1);
                    ctx.fill();
                }

                // Brook edge foam
                ctx.beginPath();
                for (var x = 0; x <= w; x += 8) {
                    var bend = Math.sin(x * 0.005 + 2.5) * 8 + Math.sin(x * 0.012) * 4;
                    var shimmer = Math.sin(x * 0.08 + t * 1.5) * 0.5 + 0.5;
                    if (shimmer > 0.6) {
                        ctx.moveTo(x, brookY + bend - 0.5);
                        ctx.lineTo(x + 4, brookY + bend - 0.5);
                    }
                }
                ctx.strokeStyle = 'rgba(180,210,230,' + (0.15 + td.brightness * 0.15) + ')';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Flowers that open/close based on time of day
                // openness: 0 = closed (night), 1 = fully open (midday)
                var openness = Math.max(0, Math.min(1, (td.brightness - 0.1) * 1.4));
                for (var i = 0; i < flowerSeeds.length; i++) {
                    var fs = flowerSeeds[i];
                    var fx = fs.xFrac * w;
                    var fHill = Math.sin(fx * 0.003 + 1) * h * 0.05 + Math.sin(fx * 0.007 + 3) * h * 0.03 + Math.sin(fx * 0.001) * h * 0.04;
                    var fy = groundY - fHill - 2;
                    var fSize = fs.sizeMod;
                    var sway = Math.sin(t * 0.8 + i * 2.3) * 2;
                    var fAlpha = 0.3 + td.brightness * 0.45;

                    // Stem
                    ctx.beginPath();
                    ctx.moveTo(fx + sway * 0.3, fy + 3);
                    ctx.lineTo(fx + sway, fy - fSize * openness);
                    ctx.strokeStyle = colorToRgb(grassGreen, fAlpha * 0.5);
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    if (openness > 0.05) {
                        // Open petals
                        var petalR = fSize * openness;
                        var petals = fs.petalCount;
                        var baseAngle = t * 0.1 + fs.openPhase * 10;
                        for (var p = 0; p < petals; p++) {
                            var angle = baseAngle + (p / petals) * Math.PI * 2;
                            var px = fx + sway + Math.cos(angle) * petalR * 0.8;
                            var py = fy - fSize * openness + Math.sin(angle) * petalR * 0.8;
                            ctx.beginPath();
                            ctx.arc(px, py, petalR * 0.45, 0, Math.PI * 2);
                            ctx.fillStyle = 'hsla(' + fs.hue + ',70%,65%,' + (fAlpha * 0.6) + ')';
                            ctx.fill();
                        }
                        // Center
                        ctx.beginPath();
                        ctx.arc(fx + sway, fy - fSize * openness, petalR * 0.25, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,220,80,' + (fAlpha * 0.7) + ')';
                        ctx.fill();
                    } else {
                        // Closed bud
                        ctx.beginPath();
                        ctx.ellipse(fx + sway, fy, fSize * 0.3, fSize * 0.6, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + fs.hue + ',50%,40%,' + (fAlpha * 0.4) + ')';
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
    // Foam at cliff base, sailboat, animated wave crests, gentle tide
    // ====================================================================
    themes.coast = (function () {
        // Sailboat state: position fraction across horizon
        var sailboatOffset = 0;

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

                // Gentle tide offset: oscillates the horizon slightly
                var tideOffset = Math.sin(t * 0.15) * h * 0.008;

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
                var horizonY = h * 0.5 + tideOffset;
                var oceanDeep = lerpColor([15, 50, 80], [5, 15, 30], 1 - td.brightness);
                var oceanShallow = lerpColor([30, 90, 120], [10, 30, 50], 1 - td.brightness);
                var oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h);
                oceanGrad.addColorStop(0, colorToRgb(oceanShallow));
                oceanGrad.addColorStop(1, colorToRgb(oceanDeep));
                ctx.fillStyle = oceanGrad;
                ctx.fillRect(0, horizonY, w, h - horizonY);

                // Sailboat silhouette crossing horizon
                sailboatOffset = (t * 6) % (w + 80);
                var boatX = sailboatOffset - 40;
                var boatY = horizonY + 4 + Math.sin(t * 0.6) * 2;
                var boatAlpha = 0.3 + td.brightness * 0.3;
                var boatColor = lerpColor([40, 35, 30], [20, 18, 15], 1 - td.brightness);
                // Hull
                ctx.beginPath();
                ctx.moveTo(boatX - 10, boatY);
                ctx.quadraticCurveTo(boatX, boatY + 4, boatX + 10, boatY);
                ctx.lineTo(boatX + 8, boatY - 1);
                ctx.lineTo(boatX - 8, boatY - 1);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(boatColor, boatAlpha);
                ctx.fill();
                // Mast
                ctx.beginPath();
                ctx.moveTo(boatX, boatY - 1);
                ctx.lineTo(boatX, boatY - 16);
                ctx.strokeStyle = colorToRgb(boatColor, boatAlpha);
                ctx.lineWidth = 1;
                ctx.stroke();
                // Sail
                ctx.beginPath();
                ctx.moveTo(boatX, boatY - 15);
                ctx.lineTo(boatX + 8, boatY - 5);
                ctx.lineTo(boatX, boatY - 4);
                ctx.closePath();
                ctx.fillStyle = 'rgba(220,215,200,' + (boatAlpha * 0.7) + ')';
                ctx.fill();

                // Waves with animated crests and whitecap foam
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

                    // Whitecap foam on wave crests (top 3 waves only for performance)
                    if (wave < 3) {
                        for (var x = 0; x <= w; x += 12) {
                            var dy = Math.sin(x * 0.01 + t * 0.6 + wave * 2) * 4 +
                                     Math.sin(x * 0.025 + t * 0.3 + wave) * 2;
                            // Show foam only at crest peaks
                            var crestVal = Math.sin(x * 0.01 + t * 0.6 + wave * 2);
                            if (crestVal > 0.6) {
                                var foamAlpha = (crestVal - 0.6) * 2.5 * (0.1 + td.brightness * 0.15);
                                var foamX = x + Math.sin(t * 1.2 + x * 0.02) * 2;
                                ctx.beginPath();
                                ctx.ellipse(foamX, waveY + dy - 1, 5 + crestVal * 4, 1.5, 0, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(230,240,250,' + foamAlpha + ')';
                                ctx.fill();
                            }
                        }
                    }
                }

                // Foam churning at cliff base
                var cliffBaseY = h * 0.5;
                var cliffBaseX = w * 0.13;
                for (var fi = 0; fi < 8; fi++) {
                    var foamT = t * 1.2 + fi * 0.9;
                    var foamX = cliffBaseX - 5 + Math.sin(foamT) * 8 + fi * 2;
                    var foamY = cliffBaseY + fi * 4 + Math.sin(foamT * 1.3 + fi) * 3 + tideOffset;
                    var foamSize = 3 + Math.sin(foamT * 0.8 + fi * 2.1) * 2;
                    var foamAlpha = 0.15 + Math.sin(foamT + fi * 1.7) * 0.08;
                    ctx.beginPath();
                    ctx.ellipse(foamX, foamY, foamSize * 1.5, foamSize * 0.6, 0.2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(220,235,245,' + foamAlpha + ')';
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
    // Traffic, flickering windows, airplane, clouds, chimney smoke
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
                seed: Math.random() * 100,
                hasChimney: Math.random() > 0.65
            });
        }

        // Pre-generate per-window flicker timers using deterministic hash
        // windowFlicker[buildingIndex][row][col] = random phase offset
        var windowFlicker = [];
        for (var i = 0; i < buildings.length; i++) {
            var b = buildings[i];
            var bFlicker = [];
            for (var row = 0; row < b.windowRows; row++) {
                var rFlicker = [];
                for (var col = 0; col < b.windows; col++) {
                    rFlicker.push({
                        phase: ((Math.sin(i * 73.1 + row * 17.3 + col * 31.7) * 43758.5453) % 1 + 1) % 1 * 100,
                        rate: 0.02 + ((Math.sin(i * 11.3 + row * 7.1 + col * 23.9) * 43758.5453) % 1 + 1) % 1 * 0.06,
                        warmth: ((Math.sin(i * 53.7 + row * 3.1 + col * 41.3) * 43758.5453) % 1 + 1) % 1
                    });
                }
                bFlicker.push(rFlicker);
            }
            windowFlicker.push(bFlicker);
        }

        // Airplane state
        var planeX = 0;
        var planeY = 0;
        var planeBlinkPhase = 0;

        // Daytime clouds for cityscape (3 clouds)
        var cityClouds = [];
        for (var i = 0; i < 3; i++) {
            cityClouds.push({
                baseX: i * 0.33 + 0.1,
                y: 0.1 + i * 0.08,
                w1: 35 + i * 12,
                h1: 12 + i * 3,
                speed: 5 + i * 3
            });
        }

        return {
            targetCount: 20,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                // Traffic particles: headlights (right) or taillights (left)
                // Less traffic at latenight/dawn
                var trafficDensity = 1.0;
                if (td.period === 'latenight') trafficDensity = 0.15;
                else if (td.period === 'dawn') trafficDensity = 0.3;
                else if (td.period === 'night') trafficDensity = 0.5;

                if (Math.random() > trafficDensity) {
                    // Skip this spawn (reduce traffic)
                    return { type: 'skip', x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.1 };
                }

                var goingRight = Math.random() > 0.5;
                var groundY = h * 0.85;
                var laneY = groundY + 5 + (goingRight ? 0 : 6);
                return {
                    type: 'traffic',
                    x: goingRight ? -10 : w + 10,
                    y: laneY + Math.random() * 3,
                    vx: goingRight ? (40 + Math.random() * 50) : -(40 + Math.random() * 50),
                    vy: 0,
                    goingRight: goingRight,
                    size: 2 + Math.random()
                };
            },
            update: function (p, dt, w, h, state) {
                if (p.type === 'skip') {
                    p.life = (p.life || 0) + dt;
                    return p.life < p.maxLife;
                }
                p.x += p.vx * dt;
                if (p.goingRight) {
                    return p.x < w + 20;
                } else {
                    return p.x > -20;
                }
            },
            draw: function (p, ctx, state) {
                if (p.type === 'skip') return;
                var td = diurnal.getTimeData(state.frameDate);
                // Headlights/taillights are only visible in dim conditions, but also faintly during day
                var lightAlpha = td.brightness < 0.4 ? 0.7 + (0.4 - td.brightness) * 0.75 : 0.25;
                if (p.goingRight) {
                    // Headlights (white/yellow pair)
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,245,210,' + lightAlpha + ')';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y + 3, p.size * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,245,210,' + lightAlpha + ')';
                    ctx.fill();
                    // Light glow forward
                    if (td.brightness < 0.3) {
                        var beamGrad = ctx.createRadialGradient(p.x + 5, p.y + 1.5, 0, p.x + 5, p.y + 1.5, 12);
                        beamGrad.addColorStop(0, 'rgba(255,240,180,' + (lightAlpha * 0.2) + ')');
                        beamGrad.addColorStop(1, 'rgba(255,240,180,0)');
                        ctx.fillStyle = beamGrad;
                        ctx.beginPath();
                        ctx.arc(p.x + 5, p.y + 1.5, 12, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Taillights (red pair)
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,40,30,' + lightAlpha + ')';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y + 3, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,40,30,' + lightAlpha + ')';
                    ctx.fill();
                }
            },
            drawBackground: function (ctx, w, h, state) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                drawSkyGradient(ctx, w, h, td);
                drawStars(ctx, w, h * 0.6, td, t, 300);

                // Daytime clouds drifting behind buildings
                if (td.brightness > 0.2) {
                    var cAlpha = Math.min(0.25, (td.brightness - 0.2) * 0.35);
                    for (var ci = 0; ci < cityClouds.length; ci++) {
                        var c = cityClouds[ci];
                        var cx = ((c.baseX * w + t * c.speed) % (w + c.w1 * 3)) - c.w1;
                        var cy = c.y * h;
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, c.w1, c.h1, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220,225,235,' + cAlpha + ')';
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(cx - c.w1 * 0.5, cy - 3, c.w1 * 0.7, c.h1 * 0.8, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220,225,235,' + (cAlpha * 0.8) + ')';
                        ctx.fill();
                    }
                }

                drawSun(ctx, w, h, td, t);
                drawMoon(ctx, w, h, td, t);

                // Airplane light crossing the sky
                planeX = ((t * 12) % (w + 100)) - 50;
                planeY = h * 0.12 + Math.sin(t * 0.1) * h * 0.03;
                planeBlinkPhase = t * 1.5;
                if (td.brightness < 0.35) {
                    var planeBlink = Math.sin(planeBlinkPhase * Math.PI) > 0.85 ? 1 : 0;
                    var planeAlpha = (0.35 - td.brightness) * 3;
                    // Airplane body (tiny moving red dot with blink)
                    if (planeBlink > 0) {
                        ctx.beginPath();
                        ctx.arc(planeX, planeY, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,40,40,' + (planeAlpha * 0.8) + ')';
                        ctx.fill();
                    }
                    // Constant dim white nav light
                    ctx.beginPath();
                    ctx.arc(planeX, planeY, 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200,200,210,' + (planeAlpha * 0.3) + ')';
                    ctx.fill();
                }

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

                    // Windows with individual flicker
                    var winW = bw / (b.windows * 2 + 1);
                    var winH = bh / (b.windowRows * 2 + 1);
                    for (var row = 0; row < b.windowRows; row++) {
                        for (var col = 0; col < b.windows; col++) {
                            var wx = bx + winW * (col * 2 + 1);
                            var wy = by + winH * (row * 2 + 1);

                            if (td.brightness < 0.3) {
                                // Night: lit windows with individual flicker timers
                                var wf = windowFlicker[i][row][col];
                                var flickerVal = Math.sin(wf.phase + t * wf.rate * Math.PI * 2);
                                var lit = flickerVal > -0.2;
                                if (lit) {
                                    var wColor = wf.warmth > 0.5 ? 'rgba(255,230,150,0.7)' : 'rgba(200,220,255,0.5)';
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

                    // Chimney smoke (thin wispy trails rising)
                    if (b.hasChimney && td.brightness < 0.5) {
                        var smokeAlpha = (0.5 - td.brightness) * 0.3;
                        var chimneyX = bx + bw * 0.7;
                        var chimneyTopY = by + 2;
                        for (var si = 0; si < 6; si++) {
                            var smokeAge = (t * 0.4 + si * 0.35 + b.seed * 0.1) % 3;
                            var smokeRise = smokeAge * 25;
                            var smokeDrift = Math.sin(t * 0.5 + si * 1.3 + b.seed) * (5 + smokeAge * 4);
                            var smokeR = 2 + smokeAge * 3;
                            var sAlpha = smokeAlpha * Math.max(0, 1 - smokeAge / 3) * 0.5;
                            if (sAlpha > 0.005) {
                                ctx.beginPath();
                                ctx.arc(chimneyX + smokeDrift, chimneyTopY - smokeRise, smokeR, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(160,160,170,' + sAlpha + ')';
                                ctx.fill();
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

                // Road markings
                var roadY = groundY + 8;
                for (var i = 0; i < 20; i++) {
                    var markX = ((i / 20) * w + t * 15) % w;
                    ctx.fillStyle = 'rgba(180,180,140,' + (0.1 + td.brightness * 0.15) + ')';
                    ctx.fillRect(markX, roadY, 12, 1.5);
                }

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
    // Falling leaves, swaying canopy, forest stream, woodland animals, moss
    // ====================================================================
    themes.forest = (function () {
        // Pre-generate tree positions
        var trees = [];
        for (var i = 0; i < 15; i++) {
            trees.push({
                x: (i / 15 + (Math.sin(i * 73.7) * 0.02)),
                trunkH: 0.3 + Math.random() * 0.2,
                canopyR: 0.06 + Math.random() * 0.06,
                depth: Math.random(),
                hasMoss: Math.random() > 0.5,
                mossSeed: Math.random() * 100
            });
        }

        // Pre-generate falling leaf seeds (20 leaves recycled via modular time)
        var leafSeeds = [];
        for (var i = 0; i < 20; i++) {
            leafSeeds.push({
                xStart: Math.random(),
                speed: 15 + Math.random() * 25,
                flutter: 0.5 + Math.random() * 1.5,
                flutterAmp: 20 + Math.random() * 30,
                rotSpeed: 1 + Math.random() * 3,
                size: 3 + Math.random() * 4,
                hueShift: Math.random() * 40,
                cycleDuration: 6 + Math.random() * 8
            });
        }

        // Woodland animal state
        var animalTimer = 0;
        var animalActive = false;
        var animalX = 0;
        var animalY = 0;
        var animalVx = 0;
        var animalType = 0; // 0 = rabbit, 1 = fox
        var nextAnimalTime = 15 + Math.random() * 15;

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

                // Forest floor stream running along the bottom
                var streamY = h * 0.88;
                var streamW = h * 0.02;
                var streamBlue = lerpColor([25, 60, 80], [8, 20, 35], 1 - td.brightness);
                var streamLight = lerpColor([60, 120, 160], [15, 40, 60], 1 - td.brightness);

                ctx.beginPath();
                ctx.moveTo(0, streamY);
                for (var x = 0; x <= w; x += 6) {
                    var bend = Math.sin(x * 0.008 + 1.2) * 5 + Math.sin(x * 0.003 + 4) * 8;
                    ctx.lineTo(x, streamY + bend);
                }
                ctx.lineTo(w, streamY + streamW + 5);
                for (var x = w; x >= 0; x -= 6) {
                    var bend = Math.sin(x * 0.008 + 1.2) * 5 + Math.sin(x * 0.003 + 4) * 8;
                    ctx.lineTo(x, streamY + bend + streamW);
                }
                ctx.closePath();
                ctx.fillStyle = colorToRgb(streamBlue, 0.6);
                ctx.fill();

                // Stream flow highlights
                for (var ri = 0; ri < 6; ri++) {
                    var ripX = ((t * 20 + ri * w * 0.18) % (w + 30)) - 15;
                    var ripBend = Math.sin(ripX * 0.008 + 1.2) * 5 + Math.sin(ripX * 0.003 + 4) * 8;
                    var ripY = streamY + ripBend + streamW * 0.4 + Math.sin(t * 1.8 + ri * 2.1) * 1.5;
                    ctx.beginPath();
                    ctx.ellipse(ripX, ripY, 4 + Math.sin(t * 1.3 + ri) * 1.5, 1, 0, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(streamLight, 0.2 + Math.sin(t * 1.5 + ri * 1.9) * 0.08);
                    ctx.fill();
                }

                // Tree trunks and canopy (with gentle sway)
                for (var i = 0; i < trees.length; i++) {
                    var tree = trees[i];
                    var tx = tree.x * w;
                    var trunkBot = floorY;
                    var trunkTop = floorY - tree.trunkH * h;
                    var trunkW = 6 + tree.depth * 8;
                    var trunkColor = lerpColor([50, 35, 20], [20, 14, 8], 1 - td.brightness);
                    ctx.fillStyle = colorToRgb(trunkColor);
                    ctx.fillRect(tx - trunkW / 2, trunkTop, trunkW, trunkBot - trunkTop);

                    // Moss/vine patches on trunks (pulsing green)
                    if (tree.hasMoss) {
                        var mossPulse = Math.sin(t * 0.3 + tree.mossSeed) * 0.15 + 0.85;
                        var mossAlpha = (0.2 + td.brightness * 0.25) * mossPulse;
                        var mossColor = lerpColor([30, 100, 40], [10, 40, 15], 1 - td.brightness);
                        for (var mi = 0; mi < 4; mi++) {
                            var mossY = trunkTop + (trunkBot - trunkTop) * (0.3 + mi * 0.15);
                            var mossSide = (mi % 2 === 0) ? -1 : 1;
                            var mossW = trunkW * 0.4 + Math.sin(t * 0.2 + tree.mossSeed + mi * 2.3) * 2;
                            ctx.beginPath();
                            ctx.ellipse(tx + mossSide * trunkW * 0.3, mossY, mossW, 4 + Math.sin(tree.mossSeed + mi) * 2, 0, 0, Math.PI * 2);
                            ctx.fillStyle = colorToRgb(mossColor, mossAlpha);
                            ctx.fill();
                        }
                    }

                    // Canopy with gentle sway
                    var canopyR = tree.canopyR * w;
                    var canopyColor = lerpColor([20, 60, 15], [8, 25, 6], 1 - td.brightness);
                    var canopySway = Math.sin(t * 0.4 + i * 1.7) * 3;
                    var canopyBreathe = Math.sin(t * 0.25 + i * 2.3) * canopyR * 0.04;
                    ctx.beginPath();
                    ctx.arc(tx + canopySway, trunkTop - canopyR * 0.3, canopyR + canopyBreathe, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(canopyColor, 0.7);
                    ctx.fill();
                }

                // Falling leaves
                if (td.brightness > 0.1) {
                    var leafAlpha = Math.min(0.7, td.brightness * 0.8);
                    var leafBaseHue = td.brightness > 0.5 ? 90 : 30; // greener in summer brightness, warmer otherwise
                    for (var li = 0; li < leafSeeds.length; li++) {
                        var ls = leafSeeds[li];
                        var leafCycleT = (t % ls.cycleDuration) / ls.cycleDuration;
                        var leafY = leafCycleT * (floorY + 20);
                        var leafX = ls.xStart * w + Math.sin(leafCycleT * Math.PI * ls.flutter * 2 + li) * ls.flutterAmp;
                        var leafRot = t * ls.rotSpeed + li * 3.7;
                        var leafFade = leafCycleT < 0.1 ? leafCycleT * 10 : (leafCycleT > 0.85 ? (1 - leafCycleT) / 0.15 : 1);
                        var lHue = leafBaseHue + ls.hueShift;
                        var lSat = 50 + td.brightness * 20;
                        var lLight = 35 + td.brightness * 20;

                        ctx.save();
                        ctx.translate(leafX, leafY);
                        ctx.rotate(leafRot);
                        ctx.beginPath();
                        ctx.ellipse(0, 0, ls.size, ls.size * 0.5, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + lHue + ',' + lSat + '%,' + lLight + '%,' + (leafAlpha * leafFade * 0.6) + ')';
                        ctx.fill();
                        ctx.restore();
                    }
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
            drawForeground: function (ctx, w, h, state, dt) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                var floorY = h * 0.75;

                // Woodland animal silhouette (rare appearance)
                animalTimer += dt || 0.016;
                if (!animalActive && animalTimer >= nextAnimalTime) {
                    animalActive = true;
                    animalTimer = 0;
                    animalType = Math.random() > 0.5 ? 1 : 0;
                    var goRight = Math.random() > 0.5;
                    animalX = goRight ? -20 : w + 20;
                    animalVx = goRight ? (40 + Math.random() * 30) : -(40 + Math.random() * 30);
                    animalY = floorY - 2;
                    nextAnimalTime = 15 + Math.random() * 15;
                }

                if (animalActive) {
                    animalX += animalVx * (dt || 0.016);
                    var silAlpha = 0.3 + td.brightness * 0.3;
                    var animalColor = lerpColor([30, 20, 15], [10, 8, 5], 1 - td.brightness);

                    ctx.save();
                    ctx.translate(animalX, animalY);
                    if (animalVx < 0) ctx.scale(-1, 1);

                    if (animalType === 0) {
                        // Rabbit silhouette
                        var hop = Math.abs(Math.sin(t * 8)) * 4;
                        ctx.translate(0, -hop);
                        // Body
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(animalColor, silAlpha);
                        ctx.fill();
                        // Head
                        ctx.beginPath();
                        ctx.ellipse(5, -3, 3, 2.5, -0.2, 0, Math.PI * 2);
                        ctx.fill();
                        // Ears
                        ctx.beginPath();
                        ctx.ellipse(6, -7, 1.2, 3.5, 0.15, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.ellipse(4, -7.5, 1.2, 3, -0.15, 0, Math.PI * 2);
                        ctx.fill();
                        // Tail
                        ctx.beginPath();
                        ctx.arc(-6, -1, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(lerpColor(animalColor, [80, 70, 60], 0.3), silAlpha);
                        ctx.fill();
                    } else {
                        // Fox silhouette
                        var trot = Math.sin(t * 6) * 2;
                        ctx.translate(0, -Math.abs(trot));
                        // Body
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(animalColor, silAlpha);
                        ctx.fill();
                        // Head
                        ctx.beginPath();
                        ctx.ellipse(8, -2, 4, 3, -0.1, 0, Math.PI * 2);
                        ctx.fill();
                        // Snout
                        ctx.beginPath();
                        ctx.ellipse(12, -1, 2.5, 1.5, -0.2, 0, Math.PI * 2);
                        ctx.fill();
                        // Ears
                        ctx.beginPath();
                        ctx.moveTo(7, -4);
                        ctx.lineTo(6, -8);
                        ctx.lineTo(9, -5);
                        ctx.closePath();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(9, -4);
                        ctx.lineTo(9, -8);
                        ctx.lineTo(11, -4);
                        ctx.closePath();
                        ctx.fill();
                        // Tail (bushy)
                        ctx.beginPath();
                        ctx.ellipse(-9, -2 + Math.sin(t * 3) * 1.5, 5, 2, 0.4, 0, Math.PI * 2);
                        ctx.fill();
                        // Legs
                        var legPhase = Math.sin(t * 6);
                        ctx.fillRect(3 + legPhase * 1.5, 3, 1.5, 5);
                        ctx.fillRect(-3 - legPhase * 1.5, 3, 1.5, 5);
                    }

                    ctx.restore();

                    // Check if animal has left screen
                    if (animalX < -30 || animalX > w + 30) {
                        animalActive = false;
                    }
                }
            }
        };
    })();

    // ====================================================================
    // MOUNTAIN — Mountain panorama
    // Alpenglow at dawn, Milky Way at night
    // Eagle circling, wind-blown snow, waterfall, wind gusts, pine trees
    // ====================================================================
    themes.mountain = (function () {
        // Eagle circling state
        var eagleAngle = 0;
        var eagleCenterX = 0.4;
        var eagleCenterY = 0.25;

        // Pre-generate pine tree positions in foreground valley
        var pines = [];
        for (var i = 0; i < 20; i++) {
            pines.push({
                x: (i / 20) + ((Math.sin(i * 47.3) * 0.02)),
                height: 15 + Math.random() * 20,
                width: 6 + Math.random() * 5,
                swayPhase: Math.random() * Math.PI * 2,
                swayRate: 0.6 + Math.random() * 0.6
            });
        }

        // Wind gust state
        var windGustTimer = 0;
        var windGustActive = false;
        var windGustStrength = 0;
        var windGustDuration = 0;
        var windGustElapsed = 0;

        // Waterfall position: on the second mountain layer, at roughly 60% across
        var waterfallX = 0.58;
        var waterfallTopFrac = 0.48; // relative to h
        var waterfallHeight = 0.08; // fraction of h

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
                    opacity: 0.05 + Math.random() * 0.1,
                    baseVx: 5 + Math.random() * 10
                };
            },
            update: function (p, dt, w, h, state) {
                // Apply wind gust effect to clouds
                var gustBoost = windGustActive ? windGustStrength : 0;
                p.vx = p.baseVx + gustBoost * 3;
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
                var dt = state.dt || 0.016;
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

                // Wind gust logic
                windGustTimer += dt;
                if (windGustActive) {
                    windGustElapsed += dt;
                    // Gust ramps up then decays
                    var gustProgress = windGustElapsed / windGustDuration;
                    windGustStrength = Math.sin(gustProgress * Math.PI) * 15;
                    if (windGustElapsed >= windGustDuration) {
                        windGustActive = false;
                        windGustTimer = 0;
                    }
                } else if (windGustTimer > 8 + Math.sin(t * 0.1) * 4) {
                    windGustActive = true;
                    windGustElapsed = 0;
                    windGustDuration = 2 + Math.random() * 3;
                    windGustStrength = 0;
                }

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

                // Waterfall on second mountain face
                var wfX = waterfallX * w;
                var wfTopY = waterfallTopFrac * h;
                var wfBotY = wfTopY + waterfallHeight * h;
                var wfAlpha = 0.15 + td.brightness * 0.25;

                // Main waterfall stream (thin white line with animated flow)
                for (var si = 0; si < 3; si++) {
                    var streamOffX = Math.sin(t * 2 + si * 2.1) * 1.5;
                    ctx.beginPath();
                    ctx.moveTo(wfX + streamOffX, wfTopY);
                    for (var fy = wfTopY; fy <= wfBotY; fy += 4) {
                        var frac = (fy - wfTopY) / (wfBotY - wfTopY);
                        var wobble = Math.sin(fy * 0.1 + t * 3 + si) * (1 + frac * 2);
                        ctx.lineTo(wfX + streamOffX + wobble, fy);
                    }
                    ctx.strokeStyle = 'rgba(210,225,240,' + (wfAlpha * (0.5 + si * 0.15)) + ')';
                    ctx.lineWidth = 1.5 - si * 0.3;
                    ctx.stroke();
                }

                // Mist at waterfall base
                for (var mi = 0; mi < 5; mi++) {
                    var mistX = wfX + Math.sin(t * 0.8 + mi * 1.5) * 8;
                    var mistY = wfBotY + Math.sin(t * 0.5 + mi * 2.3) * 3;
                    var mistR = 5 + Math.sin(t * 0.6 + mi * 1.7) * 3;
                    var mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistR);
                    mistGrad.addColorStop(0, 'rgba(200,215,230,' + (wfAlpha * 0.25) + ')');
                    mistGrad.addColorStop(1, 'rgba(200,215,230,0)');
                    ctx.fillStyle = mistGrad;
                    ctx.beginPath();
                    ctx.arc(mistX, mistY, mistR, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Wind-blown snow/ice particles streaming off the highest peaks
                var snowBaseY = h * 0.45;
                var gustFactor = windGustActive ? windGustStrength * 0.15 : 1;
                for (var si = 0; si < 12; si++) {
                    // Find a peak to emit snow from
                    var peakX = (0.1 + si * 0.075) * w;
                    var peakVal = Math.sin(peakX * 0.003) * h * 0.15 +
                                  Math.sin(peakX * 0.008 + 5) * h * 0.08 +
                                  Math.sin(peakX * 0.015 + 8) * h * 0.02;
                    if (Math.abs(peakVal) < h * 0.1) continue; // only from high peaks

                    var peakTopY = snowBaseY - Math.abs(peakVal);
                    var snowAge = (t * 1.5 + si * 0.7) % 2;
                    var snowX = peakX + snowAge * (15 + gustFactor * 3) + Math.sin(t * 3 + si) * 3;
                    var snowY = peakTopY + snowAge * 6 - Math.sin(t * 2 + si * 1.3) * 2;
                    var snowAlpha = (0.15 + td.brightness * 0.2) * Math.max(0, 1 - snowAge / 2);
                    if (snowAlpha > 0.01) {
                        ctx.beginPath();
                        ctx.arc(snowX, snowY, 0.8 + Math.sin(si * 3.7) * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(230,235,245,' + snowAlpha + ')';
                        ctx.fill();
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

                // Pine trees in foreground valley (bottom portion)
                var pineBaseY = h * 0.72;
                var pineColor = lerpColor([15, 40, 15], [5, 15, 5], 1 - td.brightness);
                var pineTrunkColor = lerpColor([40, 28, 15], [15, 10, 5], 1 - td.brightness);
                for (var pi = 0; pi < pines.length; pi++) {
                    var p = pines[pi];
                    var px = p.x * w;
                    var pBaseY = pineBaseY + Math.sin(px * 0.005) * 8;
                    var pSway = Math.sin(t * p.swayRate + p.swayPhase) * (2 + (windGustActive ? windGustStrength * 0.3 : 0));

                    // Trunk
                    ctx.beginPath();
                    ctx.moveTo(px, pBaseY);
                    ctx.lineTo(px + pSway * 0.3, pBaseY - p.height);
                    ctx.strokeStyle = colorToRgb(pineTrunkColor, 0.6);
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Pine tree triangular layers (3 layers)
                    for (var layer = 0; layer < 3; layer++) {
                        var layerY = pBaseY - p.height * (0.35 + layer * 0.22);
                        var layerW = p.width * (1.2 - layer * 0.3);
                        var layerH = p.height * 0.3;
                        var layerSway = pSway * (0.5 + layer * 0.2);

                        ctx.beginPath();
                        ctx.moveTo(px + layerSway, layerY - layerH);
                        ctx.lineTo(px - layerW + layerSway * 0.5, layerY);
                        ctx.lineTo(px + layerW + layerSway * 0.5, layerY);
                        ctx.closePath();
                        ctx.fillStyle = colorToRgb(pineColor, 0.5 + td.brightness * 0.3);
                        ctx.fill();
                    }
                }

                // Eagle circling high above mountains
                eagleAngle = (t * 0.3) % (Math.PI * 2);
                var ecx = eagleCenterX * w + Math.sin(t * 0.05) * w * 0.1;
                var ecy = eagleCenterY * h + Math.sin(t * 0.07) * h * 0.03;
                var eagleOrbitR = Math.min(w, h) * 0.08;
                var eX = ecx + Math.cos(eagleAngle) * eagleOrbitR;
                var eY = ecy + Math.sin(eagleAngle) * eagleOrbitR * 0.4; // flattened orbit

                var eagleAlpha = 0.3 + td.brightness * 0.4;
                var eagleSpan = 12 + Math.sin(eagleAngle * 0.5) * 2;
                var wingBeat = Math.sin(t * 0.8) * 0.15; // very gentle soaring wobble

                ctx.save();
                ctx.translate(eX, eY);
                // Rotate eagle to face direction of travel
                var eagleFacing = eagleAngle + Math.PI * 0.5;
                ctx.rotate(eagleFacing);
                ctx.beginPath();
                // Left wing
                ctx.moveTo(-eagleSpan, wingBeat * eagleSpan);
                ctx.quadraticCurveTo(-eagleSpan * 0.4, -wingBeat * eagleSpan * 0.6, 0, 0);
                // Right wing
                ctx.quadraticCurveTo(eagleSpan * 0.4, -wingBeat * eagleSpan * 0.6, eagleSpan, wingBeat * eagleSpan);
                ctx.strokeStyle = 'rgba(30,25,20,' + eagleAlpha + ')';
                ctx.lineWidth = 1.8;
                ctx.stroke();
                // Body
                ctx.beginPath();
                ctx.ellipse(0, 0, 1.5, 4, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(30,25,20,' + eagleAlpha + ')';
                ctx.fill();
                ctx.restore();
            },
            drawForeground: function () {}
        };
    })();

})(CV.themes, CV.FALLBACK_DT);
