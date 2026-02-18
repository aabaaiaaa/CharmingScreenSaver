(function (themes, FALLBACK_DT) {
    var diurnal = CV.diurnal;
    var lerpColor = diurnal.lerpColor;
    var colorToRgb = diurnal.colorToRgb;
    var drawSkyGradient = diurnal.drawSkyGradient;
    var drawStars = diurnal.drawStars;
    var drawSun = diurnal.drawSun;
    var drawMoon = diurnal.drawMoon;


    // ====================================================================
    // LAKE — Still water with reflections (ENHANCED)
    // Fish jumping, dragonflies, canoe, mist, wobbling reflections
    // ====================================================================
    themes.lake = (function () {
        // Pre-baked canoe state
        var canoeStartTime = 0;
        var canoeCrossTime = 60;

        // Pre-baked dragonfly anchors
        var dfAnchors = [];
        for (var i = 0; i < 4; i++) {
            dfAnchors.push({
                homeX: 0.15 + i * 0.22,
                homeY: 0.42 + Math.sin(i * 3.1) * 0.06,
                seed: i * 137.5
            });
        }

        // Fish jump state
        var fishJumpTimer = 5;
        var fishJumpX = 0.5;
        var fishJumpPhase = 0;
        var fishJumpActive = false;
        var fishRippleTime = 0;
        var fishRippleX = 0.5;
        var fishRippleActive = false;

        // Lizard / scurry state (reused for small critter)
        var lastFishInterval = 6;

        return {
            targetCount: 10,
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
                waterGrad.addColorStop(0, colorToRgb(lerpColor(td.palette.horizon, [0, 0, 0], 0.2)));
                waterGrad.addColorStop(0.5, colorToRgb(lerpColor(td.palette.mid, [0, 0, 0], 0.3)));
                waterGrad.addColorStop(1, colorToRgb(lerpColor(td.palette.zenith, [0, 0, 0], 0.4)));
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, waterY, w, h - waterY);

                // Reflected treeline that wobbles with water motion
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, waterY, w, h - waterY);
                ctx.clip();
                for (var x = 0; x <= w; x += 3) {
                    var tree = Math.sin(x * 0.02) * 8 + Math.sin(x * 0.05 + 2) * 5 + Math.sin(x * 0.1 + 5) * 3;
                    var origTreeTop = treeY - Math.abs(tree) - 5;
                    var reflDist = treeY - origTreeTop;
                    var wobble = Math.sin(x * 0.03 + t * 0.7) * 3 + Math.sin(x * 0.07 + t * 1.1) * 1.5;
                    var reflY = treeY + reflDist + wobble;
                    ctx.fillStyle = colorToRgb(lerpColor(treeColor, [0, 0, 0], 0.25), 0.5);
                    ctx.fillRect(x, treeY, 3, reflY - treeY);
                }
                ctx.restore();

                // Reflected stars at night
                if (td.brightness < 0.1) {
                    var refAlpha = (0.1 - td.brightness) * 6;
                    for (var i = 0; i < 40; i++) {
                        var sx = ((Math.sin(500 + i * 127.1) * 43758.5453) % 1 + 1) % 1 * w;
                        var origSY = ((Math.sin(500 + i * 311.7) * 43758.5453) % 1 + 1) % 1 * skyH * 0.6;
                        var refSY = waterY + (skyH - origSY) + Math.sin(t * 0.5 + i) * 2;
                        var twinkle = Math.sin(t * 0.5 + i * 3.7) * 0.3 + 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, refSY, 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,240,' + (refAlpha * twinkle * 0.3) + ')';
                        ctx.fill();
                    }
                }

                // Sunset/sunrise reflection path on water
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
                        var wobble2 = Math.sin(y * 0.05 + t * 0.8) * (5 + (y - waterY) * 0.05);
                        var width = 10 + (y - waterY) * 0.3;
                        ctx.rect(reflX - width / 2 + wobble2, y, width, 3);
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

                // Canoe silhouette drifting across the lake
                var canoeProgress = ((t - canoeStartTime) % canoeCrossTime) / canoeCrossTime;
                var canoeX = -40 + canoeProgress * (w + 80);
                var canoeY = waterY + h * 0.12 + Math.sin(t * 0.4) * 2;
                var canoeLen = 30;
                var canoeColorVal = lerpColor([30, 25, 18], [12, 10, 6], 1 - td.brightness);
                ctx.beginPath();
                ctx.moveTo(canoeX - canoeLen, canoeY);
                ctx.quadraticCurveTo(canoeX, canoeY + 6, canoeX + canoeLen, canoeY);
                ctx.quadraticCurveTo(canoeX, canoeY - 3, canoeX - canoeLen, canoeY);
                ctx.fillStyle = colorToRgb(canoeColorVal, 0.7);
                ctx.fill();
                // Person silhouette in canoe
                ctx.beginPath();
                ctx.ellipse(canoeX, canoeY - 5, 3, 6, 0, 0, Math.PI * 2);
                ctx.fillStyle = colorToRgb(canoeColorVal, 0.6);
                ctx.fill();
                // Paddle
                var paddleAngle = Math.sin(t * 1.5) * 0.6;
                ctx.save();
                ctx.translate(canoeX + 5, canoeY - 3);
                ctx.rotate(paddleAngle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 14);
                ctx.strokeStyle = colorToRgb(canoeColorVal, 0.5);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(0, 15, 2, 4, 0, 0, Math.PI * 2);
                ctx.fillStyle = colorToRgb(canoeColorVal, 0.4);
                ctx.fill();
                ctx.restore();
                // Canoe wake
                for (var wk = 1; wk <= 3; wk++) {
                    var wkX = canoeX - canoeLen - wk * 12;
                    var wkSpread = wk * 4;
                    var wkAlpha = 0.04 / wk;
                    ctx.beginPath();
                    ctx.moveTo(wkX, canoeY - wkSpread);
                    ctx.lineTo(wkX + 8, canoeY);
                    ctx.lineTo(wkX, canoeY + wkSpread);
                    ctx.strokeStyle = 'rgba(255,255,255,' + wkAlpha + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Fish jumping animation
                fishJumpTimer -= (1 / 60);
                if (fishJumpTimer <= 0 && !fishJumpActive) {
                    fishJumpActive = true;
                    fishJumpPhase = 0;
                    fishJumpX = 0.15 + Math.random() * 0.7;
                    lastFishInterval = 5 + Math.random() * 3;
                    fishJumpTimer = lastFishInterval;
                }
                if (fishJumpActive) {
                    fishJumpPhase += (1 / 60) * 2.5;
                    if (fishJumpPhase > Math.PI) {
                        fishJumpActive = false;
                        fishRippleActive = true;
                        fishRippleTime = 0;
                        fishRippleX = fishJumpX;
                    } else {
                        var fjx = fishJumpX * w;
                        var arcHeight = 18;
                        var fjy = waterY + 5 - Math.sin(fishJumpPhase) * arcHeight;
                        var fishAngle = -Math.cos(fishJumpPhase) * 1.2;
                        ctx.save();
                        ctx.translate(fjx, fjy);
                        ctx.rotate(fishAngle);
                        // Fish body
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
                        var fishCol = lerpColor([80, 100, 120], [40, 50, 60], 1 - td.brightness);
                        ctx.fillStyle = colorToRgb(fishCol, 0.7);
                        ctx.fill();
                        // Fish tail
                        ctx.beginPath();
                        ctx.moveTo(-6, 0);
                        ctx.lineTo(-10, -3);
                        ctx.lineTo(-10, 3);
                        ctx.closePath();
                        ctx.fillStyle = colorToRgb(fishCol, 0.5);
                        ctx.fill();
                        ctx.restore();
                    }
                }
                // Fish landing ripples
                if (fishRippleActive) {
                    fishRippleTime += (1 / 60);
                    if (fishRippleTime > 2.5) {
                        fishRippleActive = false;
                    } else {
                        var frx = fishRippleX * w;
                        var fry = waterY + 5;
                        for (var ring = 0; ring < 3; ring++) {
                            var ringDelay = ring * 0.3;
                            var ringTime = fishRippleTime - ringDelay;
                            if (ringTime > 0 && ringTime < 2) {
                                var ringR = ringTime * 20 + ring * 5;
                                var ringFade = 1 - ringTime / 2;
                                ctx.beginPath();
                                ctx.ellipse(frx, fry, ringR, ringR * 0.3, 0, 0, Math.PI * 2);
                                ctx.strokeStyle = 'rgba(255,255,255,' + (ringFade * 0.1) + ')';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                        }
                    }
                }
            },
            drawForeground: function (ctx, w, h, state, dt) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                var waterY = h * 0.5;

                // Dragonflies by day
                if (td.brightness > 0.25) {
                    var dfAlpha = Math.min(1, (td.brightness - 0.25) * 2);
                    for (var i = 0; i < dfAnchors.length; i++) {
                        var df = dfAnchors[i];
                        // Erratic darting: move toward random target, hover, then zip
                        var dartCycle = (t * 0.3 + df.seed) % 4;
                        var dfx, dfy;
                        if (dartCycle < 1) {
                            // Hovering near home
                            dfx = df.homeX * w + Math.sin(t * 2 + df.seed) * 8;
                            dfy = df.homeY * h + Math.cos(t * 1.7 + df.seed) * 5;
                        } else if (dartCycle < 1.3) {
                            // Zipping to new position
                            var zipT = (dartCycle - 1) / 0.3;
                            dfx = df.homeX * w + Math.sin(df.seed + 5) * w * 0.08 * zipT;
                            dfy = df.homeY * h + Math.cos(df.seed + 3) * h * 0.05 * zipT;
                        } else if (dartCycle < 3) {
                            // Hovering at new position
                            dfx = df.homeX * w + Math.sin(df.seed + 5) * w * 0.08 + Math.sin(t * 2.5 + df.seed * 2) * 6;
                            dfy = df.homeY * h + Math.cos(df.seed + 3) * h * 0.05 + Math.cos(t * 2.1 + df.seed * 2) * 4;
                        } else {
                            // Zipping back
                            var zipT2 = (dartCycle - 3) / 1;
                            dfx = df.homeX * w + Math.sin(df.seed + 5) * w * 0.08 * (1 - zipT2);
                            dfy = df.homeY * h + Math.cos(df.seed + 3) * h * 0.05 * (1 - zipT2);
                        }
                        // Wings
                        var wingBeat = Math.sin(t * 25 + df.seed) * 0.5;
                        ctx.save();
                        ctx.translate(dfx, dfy);
                        ctx.globalAlpha = dfAlpha * 0.6;
                        // Left wing
                        ctx.beginPath();
                        ctx.ellipse(-3, wingBeat * 2, 6, 2, -0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(180,220,255,0.35)';
                        ctx.fill();
                        // Right wing
                        ctx.beginPath();
                        ctx.ellipse(3, -wingBeat * 2, 6, 2, 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(180,220,255,0.35)';
                        ctx.fill();
                        // Body
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 1.5, 5, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(40,80,120,' + (dfAlpha * 0.7) + ')';
                        ctx.fill();
                        ctx.globalAlpha = 1;
                        ctx.restore();
                    }
                }

                // Mist rolling across water at dawn/evening
                if (td.period === 'dawn' || td.period === 'evening' || (td.period === 'morning' && td.periodProgress < 0.2)) {
                    var mistAlpha;
                    if (td.period === 'dawn') {
                        mistAlpha = 0.08 + td.periodProgress * 0.04;
                    } else if (td.period === 'evening') {
                        mistAlpha = 0.06 + td.periodProgress * 0.05;
                    } else {
                        mistAlpha = 0.08 * (1 - td.periodProgress / 0.2);
                    }
                    for (var m = 0; m < 6; m++) {
                        var mx = ((t * 8 + m * w / 6 + Math.sin(m * 47.3) * 100) % (w + 200)) - 100;
                        var my = waterY + 15 + m * 20 + Math.sin(t * 0.2 + m * 2.1) * 8;
                        var mw = 80 + Math.sin(m * 3.7) * 30;
                        var mh = 12 + Math.sin(m * 2.3) * 5;
                        var mGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mw);
                        mGrad.addColorStop(0, 'rgba(220,225,235,' + mistAlpha + ')');
                        mGrad.addColorStop(0.5, 'rgba(200,210,225,' + (mistAlpha * 0.5) + ')');
                        mGrad.addColorStop(1, 'rgba(180,190,210,0)');
                        ctx.fillStyle = mGrad;
                        ctx.beginPath();
                        ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // ====================================================================
    // DESERT — Sand dunes, vast sky (ENHANCED)
    // Tumbleweeds, shooting stars, camel caravan, blowing sand, critters
    // ====================================================================
    themes.desert = (function () {
        // Tumbleweed state (up to 2)
        var tumbleweeds = [
            { x: -30, y: 0.7, speed: 18 + Math.random() * 12, rot: 0, size: 6 + Math.random() * 4, active: true },
            { x: -80 - Math.random() * 200, y: 0.73, speed: 15 + Math.random() * 10, rot: 0, size: 5 + Math.random() * 3, active: true }
        ];

        // Shooting star state
        var shootingStarTimer = 10 + Math.random() * 5;
        var shootingStar = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, trail: [] };

        // Camel caravan (3-4 camels)
        var camelCount = 3 + Math.floor(Math.random() * 2);
        var camelBaseX = -100;
        var camelSpeed = 8;

        // Sand blowing state
        var sandWisps = [];
        for (var i = 0; i < 8; i++) {
            sandWisps.push({
                x: Math.random(),
                y: 0.62 + Math.random() * 0.08,
                speed: 20 + Math.random() * 15,
                length: 15 + Math.random() * 20,
                seed: Math.random() * 100
            });
        }

        // Critter state
        var critter = { active: false, x: -20, y: 0, speed: 0, timer: 15 + Math.random() * 20, type: 0 };

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

                // Shooting stars at night
                if (td.brightness < 0.1) {
                    shootingStarTimer -= (1 / 60);
                    if (shootingStarTimer <= 0 && !shootingStar.active) {
                        shootingStar.active = true;
                        shootingStar.x = Math.random() * w * 0.7 + w * 0.1;
                        shootingStar.y = Math.random() * h * 0.25 + h * 0.05;
                        shootingStar.vx = 200 + Math.random() * 200;
                        shootingStar.vy = 60 + Math.random() * 80;
                        shootingStar.life = 0;
                        shootingStar.trail = [];
                        shootingStarTimer = 10 + Math.random() * 5;
                    }
                    if (shootingStar.active) {
                        shootingStar.life += (1 / 60);
                        shootingStar.x += shootingStar.vx * (1 / 60);
                        shootingStar.y += shootingStar.vy * (1 / 60);
                        shootingStar.trail.push({ x: shootingStar.x, y: shootingStar.y });
                        if (shootingStar.trail.length > 15) shootingStar.trail.shift();
                        if (shootingStar.life > 0.8 || shootingStar.x > w || shootingStar.y > h * 0.55) {
                            shootingStar.active = false;
                        }
                        // Draw shooting star trail
                        var ssAlpha = (0.1 - td.brightness) * 10;
                        for (var si = 0; si < shootingStar.trail.length; si++) {
                            var trailAlpha = (si / shootingStar.trail.length) * ssAlpha * 0.6;
                            var trailSize = (si / shootingStar.trail.length) * 2;
                            ctx.beginPath();
                            ctx.arc(shootingStar.trail[si].x, shootingStar.trail[si].y, trailSize, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255,255,230,' + trailAlpha + ')';
                            ctx.fill();
                        }
                        // Bright head
                        ctx.beginPath();
                        ctx.arc(shootingStar.x, shootingStar.y, 2, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,240,' + (ssAlpha * 0.8) + ')';
                        ctx.fill();
                    }
                }

                drawSun(ctx, w, h * 0.65, td, t);
                drawMoon(ctx, w, h * 0.65, td, t);

                // Distant camel caravan silhouette on horizon
                var duneBase = h * 0.65;
                var camelProgX = (camelBaseX + t * camelSpeed) % (w + 200) - 100;
                if (td.brightness > 0.1 || td.brightness < 0.05) {
                    var camelAlpha = td.brightness > 0.2 ? Math.min(0.4, td.brightness * 0.5) : 0.3;
                    var camelCol = lerpColor([60, 45, 25], [15, 12, 8], 1 - td.brightness);
                    for (var ci = 0; ci < camelCount; ci++) {
                        var cx = camelProgX + ci * 28;
                        var cy = duneBase - 3;
                        // Account for dune shape at this x position
                        var duneDy = Math.sin(cx * 0.002 + 0.5) * h * 0.08 + Math.sin(cx * 0.005 + 2) * h * 0.04;
                        cy = duneBase - duneDy - 2;
                        // Camel body
                        ctx.beginPath();
                        ctx.ellipse(cx, cy - 6, 8, 4, 0, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(camelCol, camelAlpha);
                        ctx.fill();
                        // Hump
                        ctx.beginPath();
                        ctx.arc(cx - 2, cy - 10, 3, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(camelCol, camelAlpha);
                        ctx.fill();
                        // Head/neck
                        ctx.beginPath();
                        ctx.moveTo(cx + 6, cy - 7);
                        ctx.lineTo(cx + 10, cy - 14);
                        ctx.lineTo(cx + 13, cy - 13);
                        ctx.strokeStyle = colorToRgb(camelCol, camelAlpha);
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        // Legs (walking animation)
                        var legPhase = t * 2 + ci * 1.5;
                        for (var leg = 0; leg < 4; leg++) {
                            var legX = cx - 4 + leg * 3;
                            var legSwing = Math.sin(legPhase + leg * Math.PI * 0.5) * 2;
                            ctx.beginPath();
                            ctx.moveTo(legX, cy - 3);
                            ctx.lineTo(legX + legSwing, cy + 5);
                            ctx.strokeStyle = colorToRgb(camelCol, camelAlpha);
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    }
                }

                // Sand dunes
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
                    var dy2 = Math.sin(x * 0.003 + 3) * h * 0.06 +
                             Math.sin(x * 0.001) * h * 0.03;
                    ctx.lineTo(x, duneBase + h * 0.1 - dy2);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(lerpColor(sandColor, sandDark, 0.15));
                ctx.fill();

                // Dune ridge highlight (sun side)
                if (td.brightness > 0.3) {
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 4) {
                        var dy3 = Math.sin(x * 0.003 + 3) * h * 0.06 + Math.sin(x * 0.001) * h * 0.03;
                        var ry = duneBase + h * 0.1 - dy3;
                        if (x === 0) ctx.moveTo(x, ry);
                        else ctx.lineTo(x, ry);
                    }
                    ctx.strokeStyle = 'rgba(255,240,200,' + ((td.brightness - 0.3) * 0.15) + ')';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Sand blowing off dune ridges
                if (td.brightness > 0.15) {
                    for (var wi = 0; wi < sandWisps.length; wi++) {
                        var sw = sandWisps[wi];
                        var swx = (sw.x * w + t * sw.speed) % w;
                        var swy = sw.y * h;
                        var duneSurf = Math.sin(swx * 0.003 + 3) * h * 0.06 + Math.sin(swx * 0.001) * h * 0.03;
                        swy = duneBase + h * 0.1 - duneSurf - 2;
                        ctx.beginPath();
                        ctx.moveTo(swx, swy);
                        for (var sp = 1; sp <= 5; sp++) {
                            var spx = swx + sp * sw.length / 5;
                            var spy = swy - sp * 1.5 + Math.sin(t * 3 + sw.seed + sp * 2) * 2;
                            ctx.lineTo(spx, spy);
                        }
                        ctx.strokeStyle = 'rgba(210,190,150,' + (0.08 * td.brightness) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
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

                // Tumbleweeds rolling across dune crests
                for (var ti = 0; ti < tumbleweeds.length; ti++) {
                    var tw = tumbleweeds[ti];
                    tw.x += tw.speed * (1 / 60);
                    tw.rot += tw.speed * 0.05 * (1 / 60);
                    if (tw.x > w + 40) {
                        tw.x = -30 - Math.random() * 60;
                        tw.speed = 15 + Math.random() * 15;
                        tw.size = 5 + Math.random() * 4;
                    }
                    var twDuneY = Math.sin(tw.x * 0.003 + 3) * h * 0.06 + Math.sin(tw.x * 0.001) * h * 0.03;
                    var twy = duneBase + h * 0.1 - twDuneY - tw.size;
                    // Bounce over ridges
                    var bounce = Math.abs(Math.sin(tw.x * 0.008 + 2)) * 6;
                    twy -= bounce;
                    var twCol = lerpColor([120, 90, 50], [45, 35, 20], 1 - td.brightness);
                    ctx.save();
                    ctx.translate(tw.x, twy);
                    ctx.rotate(tw.rot);
                    // Draw tumbleweed as scratchy circle
                    ctx.beginPath();
                    for (var a = 0; a < Math.PI * 2; a += 0.3) {
                        var r = tw.size + Math.sin(a * 5 + tw.rot * 3) * tw.size * 0.3;
                        var tx = Math.cos(a) * r;
                        var ty = Math.sin(a) * r;
                        if (a === 0) ctx.moveTo(tx, ty);
                        else ctx.lineTo(tx, ty);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = colorToRgb(twCol, 0.5);
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // Inner scratchy lines
                    for (var l = 0; l < 4; l++) {
                        var la = l * 0.8 + tw.rot;
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(la) * tw.size * 0.3, Math.sin(la) * tw.size * 0.3);
                        ctx.lineTo(Math.cos(la + 1.5) * tw.size * 0.7, Math.sin(la + 1.5) * tw.size * 0.7);
                        ctx.strokeStyle = colorToRgb(twCol, 0.3);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            },
            drawForeground: function (ctx, w, h, state, dt) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;
                var duneBase = h * 0.65;

                // Critter (scorpion/lizard) occasionally scurrying across foreground
                critter.timer -= (1 / 60);
                if (critter.timer <= 0 && !critter.active) {
                    critter.active = true;
                    critter.x = -15;
                    critter.speed = 60 + Math.random() * 40;
                    critter.type = Math.random() > 0.5 ? 1 : 0; // 0=scorpion, 1=lizard
                    critter.timer = 15 + Math.random() * 20;
                }
                if (critter.active) {
                    critter.x += critter.speed * (1 / 60);
                    if (critter.x > w + 20) {
                        critter.active = false;
                    } else {
                        var fgDuneY = Math.sin(critter.x * 0.003 + 3) * h * 0.06 + Math.sin(critter.x * 0.001) * h * 0.03;
                        var cy = duneBase + h * 0.1 - fgDuneY + 10 + Math.sin(t * 8) * 0.5;
                        var cCol = lerpColor([50, 40, 25], [20, 18, 10], 1 - td.brightness);
                        var cAlpha = 0.5 + td.brightness * 0.3;
                        if (critter.type === 0) {
                            // Scorpion - small body + tail curve
                            ctx.beginPath();
                            ctx.ellipse(critter.x, cy, 4, 2, 0, 0, Math.PI * 2);
                            ctx.fillStyle = colorToRgb(cCol, cAlpha);
                            ctx.fill();
                            // Tail
                            ctx.beginPath();
                            ctx.moveTo(critter.x - 4, cy);
                            ctx.quadraticCurveTo(critter.x - 8, cy - 6, critter.x - 6, cy - 9);
                            ctx.strokeStyle = colorToRgb(cCol, cAlpha);
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                            // Pincers
                            ctx.beginPath();
                            ctx.moveTo(critter.x + 4, cy - 1);
                            ctx.lineTo(critter.x + 7, cy - 3);
                            ctx.moveTo(critter.x + 4, cy + 1);
                            ctx.lineTo(critter.x + 7, cy + 3);
                            ctx.strokeStyle = colorToRgb(cCol, cAlpha);
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        } else {
                            // Lizard - elongated body + tail
                            ctx.beginPath();
                            ctx.ellipse(critter.x, cy, 5, 1.5, 0, 0, Math.PI * 2);
                            ctx.fillStyle = colorToRgb(cCol, cAlpha);
                            ctx.fill();
                            // Tail
                            var tailWag = Math.sin(t * 12) * 3;
                            ctx.beginPath();
                            ctx.moveTo(critter.x - 5, cy);
                            ctx.quadraticCurveTo(critter.x - 10, cy + tailWag, critter.x - 14, cy + tailWag * 0.5);
                            ctx.strokeStyle = colorToRgb(cCol, cAlpha);
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            // Legs
                            for (var lg = 0; lg < 4; lg++) {
                                var lgx = critter.x - 2 + lg * 2.5;
                                var lgSide = lg < 2 ? -1 : 1;
                                var lgWalk = Math.sin(t * 10 + lg * 2) * 1.5;
                                ctx.beginPath();
                                ctx.moveTo(lgx, cy);
                                ctx.lineTo(lgx + lgWalk, cy + lgSide * 3);
                                ctx.strokeStyle = colorToRgb(cCol, cAlpha * 0.7);
                                ctx.lineWidth = 0.8;
                                ctx.stroke();
                            }
                        }
                    }
                }
            }
        };
    })();

    // ====================================================================
    // HARBOUR — Boats, lighthouse, water (ENHANCED)
    // Fishing boat, chimney smoke, flag, wave crashes, running lights, buoy
    // ====================================================================
    themes.harbour = (function () {
        // Pre-generate moored boats
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

        // Fishing boat state
        var fishBoat = { x: -60, speed: 12 };

        // Chimney smoke (shore buildings)
        var chimneys = [
            { x: 0.08, y: 0.44 },
            { x: 0.18, y: 0.42 },
            { x: 0.35, y: 0.445 }
        ];

        // Flag on lighthouse
        var flagPhase = 0;

        // Wave crash state on lighthouse base
        var crashTimer = 0;
        var crashPhase = 0;
        var crashActive = false;

        // Bell buoy
        var buoyX = 0.55;
        var buoyFlashTimer = 0;
        var buoyFlashOn = false;

        return {
            targetCount: 8,
            spawn: function (w, h) {
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

                // Distant shore buildings silhouette
                var shoreY = h * 0.46;
                var shoreColor = lerpColor([45, 40, 38], [18, 16, 14], 1 - td.brightness);
                ctx.beginPath();
                ctx.moveTo(0, h * 0.5);
                var bldgPos = [0, 0.05, 0.08, 0.1, 0.13, 0.15, 0.18, 0.22, 0.25, 0.28, 0.32, 0.35, 0.38, 0.42];
                var bldgHts = [6, 12, 8, 18, 10, 14, 6, 20, 12, 8, 15, 10, 22, 8];
                for (var bi = 0; bi < bldgPos.length; bi++) {
                    var blx = bldgPos[bi] * w;
                    var blHt = bldgHts[bi];
                    ctx.lineTo(blx, shoreY - blHt);
                    ctx.lineTo(blx + w * 0.025, shoreY - blHt);
                    ctx.lineTo(blx + w * 0.025, shoreY - blHt + 3);
                }
                ctx.lineTo(w * 0.45, shoreY);
                ctx.lineTo(0, h * 0.5);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(shoreColor);
                ctx.fill();

                // Chimney smoke from shore buildings
                for (var chi = 0; chi < chimneys.length; chi++) {
                    var ch = chimneys[chi];
                    var chx = ch.x * w;
                    var chy = ch.y * h;
                    var smokeAlpha = 0.04 + td.brightness * 0.03;
                    for (var sp = 0; sp < 8; sp++) {
                        var spY = chy - sp * 6;
                        var spDrift = Math.sin(t * 0.5 + chi * 3 + sp * 0.8) * (3 + sp * 1.5);
                        var spSize = 3 + sp * 1.2;
                        ctx.beginPath();
                        ctx.arc(chx + spDrift, spY, spSize, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(150,150,160,' + (smokeAlpha * (1 - sp / 8)) + ')';
                        ctx.fill();
                    }
                }

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

                // Moored boats
                for (var i = 0; i < boats.length; i++) {
                    var b = boats[i];
                    var bx = b.x * w;
                    var by = b.y * h + Math.sin(t * 0.5 + b.bobPhase) * 3;
                    var bs = b.size * w;
                    var boatColor = lerpColor([60, 50, 40], [25, 20, 18], 1 - td.brightness);
                    var boatRock = Math.sin(t * 0.7 + b.bobPhase) * 0.08;

                    ctx.save();
                    ctx.translate(bx, by);
                    ctx.rotate(boatRock);
                    // Hull
                    ctx.beginPath();
                    ctx.moveTo(-bs, 0);
                    ctx.quadraticCurveTo(0, bs * 0.4, bs, 0);
                    ctx.lineTo(bs * 0.8, -bs * 0.1);
                    ctx.lineTo(-bs * 0.8, -bs * 0.1);
                    ctx.closePath();
                    ctx.fillStyle = colorToRgb(boatColor);
                    ctx.fill();
                    // Mast
                    if (b.hasMast) {
                        ctx.beginPath();
                        ctx.moveTo(0, -bs * 0.1);
                        ctx.lineTo(0, -bs * 1.2);
                        ctx.strokeStyle = colorToRgb(lerpColor(boatColor, [100, 90, 80], 0.3));
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    // Running lights at night
                    if (td.brightness < 0.2) {
                        var rlAlpha = (0.2 - td.brightness) * 5;
                        ctx.beginPath();
                        ctx.arc(-bs * 0.6, -bs * 0.1, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,50,50,' + (rlAlpha * 0.6) + ')';
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(bs * 0.6, -bs * 0.1, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(50,255,50,' + (rlAlpha * 0.6) + ')';
                        ctx.fill();
                    }
                    ctx.restore();
                }

                // Fishing boat chugging across harbor
                fishBoat.x += fishBoat.speed * (1 / 60);
                if (fishBoat.x > w + 80) {
                    fishBoat.x = -60;
                    fishBoat.speed = 10 + Math.random() * 8;
                }
                var fbx = fishBoat.x;
                var fby = waterY + h * 0.1 + Math.sin(t * 0.6) * 2;
                var fbCol = lerpColor([55, 45, 35], [22, 18, 14], 1 - td.brightness);
                // Hull
                ctx.beginPath();
                ctx.moveTo(fbx - 18, fby);
                ctx.quadraticCurveTo(fbx, fby + 5, fbx + 18, fby);
                ctx.lineTo(fbx + 15, fby - 4);
                ctx.lineTo(fbx - 15, fby - 4);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(fbCol, 0.8);
                ctx.fill();
                // Cabin
                ctx.fillStyle = colorToRgb(lerpColor(fbCol, [80, 70, 60], 0.3), 0.7);
                ctx.fillRect(fbx - 6, fby - 10, 12, 6);
                // Chimney with smoke
                ctx.fillStyle = colorToRgb(fbCol, 0.6);
                ctx.fillRect(fbx + 2, fby - 15, 2, 5);
                for (var fbs = 0; fbs < 4; fbs++) {
                    var fbsDrift = Math.sin(t * 0.8 + fbs * 1.2) * (2 + fbs * 2) - fbs * 2;
                    ctx.beginPath();
                    ctx.arc(fbx + 3 + fbsDrift, fby - 16 - fbs * 5, 2 + fbs * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(140,140,150,' + (0.06 * (1 - fbs / 4)) + ')';
                    ctx.fill();
                }
                // Wake trail
                for (var wk = 1; wk <= 5; wk++) {
                    var wkx = fbx - 18 - wk * 10;
                    var wkSpread = wk * 3;
                    var wkAlpha = 0.04 / wk;
                    ctx.beginPath();
                    ctx.moveTo(wkx, fby - wkSpread);
                    ctx.quadraticCurveTo(wkx + 5, fby, wkx, fby + wkSpread);
                    ctx.strokeStyle = 'rgba(255,255,255,' + wkAlpha + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Bell buoy
                var buoyPx = buoyX * w;
                var buoyPy = waterY + h * 0.22 + Math.sin(t * 0.8 + 1.5) * 4;
                var buoyRock = Math.sin(t * 0.8 + 1.5) * 0.15;
                ctx.save();
                ctx.translate(buoyPx, buoyPy);
                ctx.rotate(buoyRock);
                ctx.beginPath();
                ctx.moveTo(-5, 0);
                ctx.lineTo(-4, -10);
                ctx.lineTo(4, -10);
                ctx.lineTo(5, 0);
                ctx.quadraticCurveTo(0, 4, -5, 0);
                ctx.closePath();
                var buoyCol = lerpColor([180, 40, 40], [70, 15, 15], 1 - td.brightness);
                ctx.fillStyle = colorToRgb(buoyCol, 0.7);
                ctx.fill();
                ctx.fillStyle = colorToRgb(lerpColor([100, 100, 100], [40, 40, 40], 1 - td.brightness), 0.6);
                ctx.fillRect(-3, -14, 6, 4);
                buoyFlashTimer += (1 / 60);
                if (buoyFlashTimer > 3) {
                    buoyFlashTimer = 0;
                    buoyFlashOn = !buoyFlashOn;
                }
                if (buoyFlashOn && td.brightness < 0.3) {
                    var bfAlpha = (0.3 - td.brightness) * 3;
                    ctx.beginPath();
                    ctx.arc(0, -12, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,230,100,' + (bfAlpha * 0.8) + ')';
                    ctx.fill();
                    var bfGlow = ctx.createRadialGradient(0, -12, 0, 0, -12, 15);
                    bfGlow.addColorStop(0, 'rgba(255,230,100,' + (bfAlpha * 0.3) + ')');
                    bfGlow.addColorStop(1, 'rgba(255,230,100,0)');
                    ctx.fillStyle = bfGlow;
                    ctx.beginPath();
                    ctx.arc(0, -12, 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // Lighthouse on right
                var lhX = w * 0.88;
                var lhBase = waterY - 5;
                var lhH = h * 0.15;
                var lhW = 12;

                // Rocky base
                ctx.beginPath();
                ctx.moveTo(lhX - 25, lhBase);
                ctx.quadraticCurveTo(lhX - 20, lhBase + 10, lhX - 30, waterY + 15);
                ctx.lineTo(lhX + 30, waterY + 15);
                ctx.quadraticCurveTo(lhX + 20, lhBase + 10, lhX + 25, lhBase);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(lerpColor([70, 65, 55], [25, 23, 20], 1 - td.brightness));
                ctx.fill();

                // Wave crash on lighthouse rocks
                crashTimer += (1 / 60);
                if (crashTimer > 3 + Math.sin(t * 0.1) * 1.5) {
                    crashTimer = 0;
                    crashActive = true;
                    crashPhase = 0;
                }
                if (crashActive) {
                    crashPhase += (1 / 60) * 2;
                    if (crashPhase > 1) {
                        crashActive = false;
                    } else {
                        var crashRise = Math.sin(crashPhase * Math.PI);
                        var cAlpha = crashRise * 0.3;
                        for (var cf = 0; cf < 5; cf++) {
                            var cfx = lhX - 25 + cf * 10 + Math.sin(cf * 3 + t * 5) * 3;
                            var cfy = lhBase + 5 - crashRise * (15 + cf * 4);
                            var cfSize = 3 + cf * 1.5;
                            ctx.beginPath();
                            ctx.arc(cfx, cfy, cfSize, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(220,230,240,' + (cAlpha * (1 - cf * 0.15)) + ')';
                            ctx.fill();
                        }
                    }
                }

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
                    var sty = lhBase - (s + 0.5) * lhH / 4;
                    var stW = lhW * (1 - s * 0.1);
                    ctx.fillStyle = 'rgba(180,40,40,' + (0.3 + td.brightness * 0.4) + ')';
                    ctx.fillRect(lhX - stW * 0.5, sty - lhH / 8, stW, lhH / 8);
                }

                // Flag on lighthouse
                flagPhase += (1 / 60) * 4;
                var flagPoleTop = lhBase - lhH - 20;
                ctx.beginPath();
                ctx.moveTo(lhX, lhBase - lhH);
                ctx.lineTo(lhX, flagPoleTop);
                ctx.strokeStyle = colorToRgb(lerpColor([120, 110, 100], [50, 45, 40], 1 - td.brightness), 0.6);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lhX, flagPoleTop);
                for (var fp = 1; fp <= 4; fp++) {
                    ctx.lineTo(lhX + fp * 4, flagPoleTop + 2 + Math.sin(flagPhase + fp * 0.8) * 2);
                }
                for (var fp2 = 4; fp2 >= 1; fp2--) {
                    ctx.lineTo(lhX + fp2 * 4, flagPoleTop + 8 + Math.sin(flagPhase + fp2 * 0.8 + 0.5) * 1.5);
                }
                ctx.lineTo(lhX, flagPoleTop + 9);
                ctx.closePath();
                ctx.fillStyle = 'rgba(180,30,30,' + (0.5 + td.brightness * 0.3) + ')';
                ctx.fill();

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
            },
            drawForeground: function () {}
        };
    })();

    // ====================================================================
    // GARDEN — Zen garden, lanterns, cherry blossom tree (ENHANCED)
    // Koi pond, bamboo water feature, swaying lanterns, zen sand ripples,
    // butterfly, cat silhouette
    // ====================================================================
    themes.garden = (function () {
        // Pre-generate lantern positions
        var lanterns = [];
        for (var i = 0; i < 6; i++) {
            lanterns.push({
                x: 0.1 + i * 0.15,
                y: 0.35 + Math.sin(i * 2.3) * 0.08,
                size: 8 + Math.random() * 4,
                swayPhase: Math.random() * Math.PI * 2
            });
        }

        // Koi fish in pond
        var koiFish = [];
        for (var i = 0; i < 4; i++) {
            koiFish.push({
                angle: i * Math.PI * 0.5,
                speed: 0.3 + Math.random() * 0.3,
                radiusX: 0.04 + Math.random() * 0.02,
                radiusY: 0.015 + Math.random() * 0.01,
                isOrange: i < 3,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Bamboo water feature (shishi-odoshi)
        var bambooTimer = 0;
        var bambooCycleTime = 9;
        var bambooTipPhase = 0;

        // Butterfly state
        var butterfly = {
            x: 0.3, y: 0.5,
            targetX: 0.3, targetY: 0.5,
            wingPhase: 0,
            moveTimer: 0
        };

        // Cat state
        var catTailPhase = 0;
        var catTailFlick = false;
        var catTailTimer = 0;

        return {
            targetCount: 25,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness < 0.15) {
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

                // Zen sand raked patterns with wind ripples
                var sandY = h * 0.78;
                var sandColor = lerpColor([180, 170, 140], [50, 45, 35], 1 - td.brightness);
                ctx.fillStyle = colorToRgb(sandColor, 0.3);
                ctx.fillRect(w * 0.2, sandY, w * 0.6, h * 0.12);
                for (var i = 0; i < 8; i++) {
                    var ry = sandY + 5 + i * (h * 0.12 - 10) / 8;
                    ctx.beginPath();
                    for (var x = w * 0.22; x <= w * 0.78; x += 5) {
                        var windRipple = Math.sin(t * 0.5 + x * 0.02 + i * 0.3) * 1;
                        var dy = Math.sin((x - w * 0.5) * 0.02 + i * 0.5) * 2 + windRipple;
                        if (x === w * 0.22) ctx.moveTo(x, ry + dy);
                        else ctx.lineTo(x, ry + dy);
                    }
                    ctx.strokeStyle = colorToRgb(lerpColor([160, 150, 120], [40, 38, 30], 1 - td.brightness), 0.15);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Koi pond in zen sand area
                var pondCx = w * 0.55;
                var pondCy = sandY + h * 0.06;
                var pondRx = w * 0.07;
                var pondRy = h * 0.035;
                // Pond shape
                ctx.beginPath();
                ctx.ellipse(pondCx, pondCy, pondRx, pondRy, 0, 0, Math.PI * 2);
                var pondCol = lerpColor([20, 50, 60], [8, 18, 22], 1 - td.brightness);
                ctx.fillStyle = colorToRgb(pondCol, 0.7);
                ctx.fill();
                // Pond rim
                ctx.strokeStyle = colorToRgb(lerpColor([100, 95, 80], [35, 32, 28], 1 - td.brightness), 0.4);
                ctx.lineWidth = 2;
                ctx.stroke();

                // Koi fish swimming in pond
                for (var ki = 0; ki < koiFish.length; ki++) {
                    var koi = koiFish[ki];
                    koi.angle += koi.speed * (1 / 60);
                    // Figure-8 pattern
                    var koiX = pondCx + Math.sin(koi.angle) * pondRx * 0.65;
                    var koiY = pondCy + Math.sin(koi.angle * 2 + koi.phase) * pondRy * 0.5;
                    var koiDir = Math.atan2(
                        Math.cos(koi.angle * 2 + koi.phase) * pondRy * 0.5 * 2 * koi.speed,
                        Math.cos(koi.angle) * pondRx * 0.65 * koi.speed
                    );
                    ctx.save();
                    ctx.translate(koiX, koiY);
                    ctx.rotate(koiDir);
                    // Body
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 4, 1.8, 0, 0, Math.PI * 2);
                    if (koi.isOrange) {
                        ctx.fillStyle = 'rgba(220,120,40,' + (0.5 + td.brightness * 0.3) + ')';
                    } else {
                        ctx.fillStyle = 'rgba(230,225,210,' + (0.5 + td.brightness * 0.3) + ')';
                    }
                    ctx.fill();
                    // Tail
                    var tailSwish = Math.sin(t * 6 + ki * 2) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(-4, 0);
                    ctx.lineTo(-7, -2 + tailSwish);
                    ctx.lineTo(-7, 2 + tailSwish);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
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
                            var blx = branchEnds[i][0] + (Math.sin(b * 5 + i) * 15);
                            var bly = branchEnds[i][1] + (Math.cos(b * 7 + i) * 10);
                            ctx.beginPath();
                            ctx.arc(blx, bly, 4 + Math.sin(b) * 2, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255,200,210,' + clusterAlpha + ')';
                            ctx.fill();
                        }
                    }
                }

                // Bamboo water feature (shishi-odoshi)
                var bambooX = w * 0.72;
                var bambooY = groundY + 5;
                bambooTimer += (1 / 60);
                var bambooProg = (bambooTimer % bambooCycleTime) / bambooCycleTime;
                var bambooAngle;
                if (bambooProg < 0.85) {
                    // Filling - slowly tilting
                    bambooAngle = -0.3 + bambooProg / 0.85 * 0.6;
                } else if (bambooProg < 0.9) {
                    // Tipping over quickly
                    var tipProg = (bambooProg - 0.85) / 0.05;
                    bambooAngle = 0.3 + tipProg * 0.8;
                } else {
                    // Springing back
                    var backProg = (bambooProg - 0.9) / 0.1;
                    bambooAngle = 1.1 - backProg * 1.4;
                    // Damped oscillation on return
                    bambooAngle += Math.sin(backProg * Math.PI * 3) * 0.15 * (1 - backProg);
                }

                ctx.save();
                ctx.translate(bambooX, bambooY);
                // Support post
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -20);
                ctx.strokeStyle = colorToRgb(lerpColor([100, 85, 40], [35, 30, 15], 1 - td.brightness), 0.6);
                ctx.lineWidth = 3;
                ctx.stroke();
                // Pivoting arm
                ctx.save();
                ctx.translate(0, -18);
                ctx.rotate(bambooAngle);
                ctx.beginPath();
                ctx.moveTo(-18, 0);
                ctx.lineTo(12, 0);
                ctx.strokeStyle = colorToRgb(lerpColor([120, 100, 45], [40, 35, 18], 1 - td.brightness), 0.7);
                ctx.lineWidth = 3;
                ctx.stroke();
                // Water cup at end
                ctx.beginPath();
                ctx.arc(-18, 1, 3, 0, Math.PI);
                ctx.strokeStyle = colorToRgb(lerpColor([120, 100, 45], [40, 35, 18], 1 - td.brightness), 0.5);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                // Water drip when tipping
                if (bambooProg > 0.85 && bambooProg < 0.92) {
                    var dripProg = (bambooProg - 0.85) / 0.07;
                    var dripY = bambooY - 15 + dripProg * 20;
                    ctx.beginPath();
                    ctx.arc(bambooX - 12, dripY, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(150,180,200,' + (0.3 * (1 - dripProg)) + ')';
                    ctx.fill();
                    // Splash at bottom
                    if (dripProg > 0.6) {
                        var splashAlpha = (1 - dripProg) * 0.4;
                        for (var spl = 0; spl < 3; spl++) {
                            ctx.beginPath();
                            ctx.arc(bambooX - 12 + (spl - 1) * 4, bambooY + 3, 1.5, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(150,180,200,' + splashAlpha + ')';
                            ctx.fill();
                        }
                    }
                }
                ctx.restore();

                // Lanterns with gentle swaying
                for (var i = 0; i < lanterns.length; i++) {
                    var l = lanterns[i];
                    var lx = l.x * w;
                    var ly = l.y * h;
                    var ls = l.size;
                    var sway = Math.sin(t * 0.5 + l.swayPhase) * 3;

                    // String
                    ctx.beginPath();
                    ctx.moveTo(lx, ly - ls - 15);
                    ctx.quadraticCurveTo(lx + sway * 0.5, ly - ls - 8, lx + sway, ly - ls);
                    ctx.strokeStyle = 'rgba(100,90,80,0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Lantern body (swaying)
                    ctx.save();
                    ctx.translate(lx + sway, ly);
                    ctx.rotate(sway * 0.02);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, ls * 0.6, ls, 0, 0, Math.PI * 2);
                    var lanternAlpha = td.brightness < 0.3 ? 0.7 : 0.3;
                    ctx.fillStyle = 'rgba(200,60,50,' + lanternAlpha + ')';
                    ctx.fill();

                    // Lantern glow at night
                    if (td.brightness < 0.3) {
                        var glowAlpha = (0.3 - td.brightness) * 2;
                        var glowGrad = ctx.createRadialGradient(0, 0, ls * 0.3, 0, 0, ls * 5);
                        glowGrad.addColorStop(0, 'rgba(255,180,100,' + (glowAlpha * 0.3) + ')');
                        glowGrad.addColorStop(0.5, 'rgba(255,140,60,' + (glowAlpha * 0.1) + ')');
                        glowGrad.addColorStop(1, 'rgba(255,100,40,0)');
                        ctx.fillStyle = glowGrad;
                        ctx.beginPath();
                        ctx.arc(0, 0, ls * 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }

                // Stepping stones
                for (var i = 0; i < 5; i++) {
                    var stx = w * 0.4 + i * w * 0.08;
                    var sty = groundY + 8 + Math.sin(i * 1.5) * 5;
                    var stoneColor = lerpColor([120, 115, 100], [40, 38, 32], 1 - td.brightness);
                    ctx.beginPath();
                    ctx.ellipse(stx, sty, 12, 6, 0.1 * i, 0, Math.PI * 2);
                    ctx.fillStyle = colorToRgb(stoneColor, 0.6);
                    ctx.fill();
                }

                // Cat silhouette near stepping stones
                var catX = w * 0.63;
                var catY = groundY + 6;
                var catCol = lerpColor([30, 28, 25], [12, 11, 10], 1 - td.brightness);
                var catAlpha = 0.5 + td.brightness * 0.2;
                // Body
                ctx.beginPath();
                ctx.ellipse(catX, catY - 5, 7, 5, 0, 0, Math.PI * 2);
                ctx.fillStyle = colorToRgb(catCol, catAlpha);
                ctx.fill();
                // Head
                ctx.beginPath();
                ctx.arc(catX + 6, catY - 9, 4, 0, Math.PI * 2);
                ctx.fillStyle = colorToRgb(catCol, catAlpha);
                ctx.fill();
                // Ears
                ctx.beginPath();
                ctx.moveTo(catX + 4, catY - 12);
                ctx.lineTo(catX + 5, catY - 16);
                ctx.lineTo(catX + 7, catY - 12);
                ctx.moveTo(catX + 7, catY - 12);
                ctx.lineTo(catX + 8, catY - 16);
                ctx.lineTo(catX + 10, catY - 12);
                ctx.fillStyle = colorToRgb(catCol, catAlpha);
                ctx.fill();
                // Tail with occasional flick
                catTailTimer += (1 / 60);
                if (catTailTimer > 3 + Math.sin(t * 0.07) * 2) {
                    catTailTimer = 0;
                    catTailFlick = !catTailFlick;
                }
                var tailCurve = catTailFlick ? Math.sin(t * 4) * 6 : Math.sin(t * 0.5) * 2;
                ctx.beginPath();
                ctx.moveTo(catX - 7, catY - 4);
                ctx.quadraticCurveTo(catX - 12, catY - 10 + tailCurve, catX - 10, catY - 16 + tailCurve);
                ctx.strokeStyle = colorToRgb(catCol, catAlpha);
                ctx.lineWidth = 2;
                ctx.stroke();
            },
            drawForeground: function (ctx, w, h, state, dt) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Butterfly visiting tree flowers during day
                if (td.brightness > 0.3) {
                    var bfAlpha = Math.min(1, (td.brightness - 0.3) * 2);
                    butterfly.wingPhase += (1 / 60) * 6;
                    butterfly.moveTimer -= (1 / 60);
                    if (butterfly.moveTimer <= 0) {
                        butterfly.targetX = 0.2 + Math.random() * 0.25;
                        butterfly.targetY = 0.35 + Math.random() * 0.25;
                        butterfly.moveTimer = 2 + Math.random() * 3;
                    }
                    butterfly.x += (butterfly.targetX - butterfly.x) * 0.02;
                    butterfly.y += (butterfly.targetY - butterfly.y) * 0.02;
                    butterfly.x += Math.sin(t * 1.5) * 0.001;
                    butterfly.y += Math.cos(t * 1.2) * 0.0008;

                    var bx = butterfly.x * w;
                    var by = butterfly.y * h;
                    var wingAngle = Math.sin(butterfly.wingPhase) * 0.6;
                    ctx.save();
                    ctx.translate(bx, by);
                    ctx.globalAlpha = bfAlpha * 0.7;
                    // Left wing
                    ctx.save();
                    ctx.scale(1, wingAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, -2, 4, 6, -0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(280,60%,65%,0.6)';
                    ctx.fill();
                    ctx.restore();
                    // Right wing
                    ctx.save();
                    ctx.scale(1, -wingAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, -2, 4, 6, 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(280,60%,65%,0.6)';
                    ctx.fill();
                    ctx.restore();
                    // Body
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 1, 3, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(40,30,20,0.5)';
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.restore();
                }
            }
        };
    })();

    // ====================================================================
    // WHEATFIELD — Rolling wheat to horizon (ENHANCED)
    // Windmill, crows, fence-line birds, dirt path dust, chimney smoke,
    // cloud shadows
    // ====================================================================
    themes.wheatfield = (function () {
        // Windmill state
        var windmillBladeAngle = 0;

        // Crows state (2-3 birds)
        var crows = [];
        for (var i = 0; i < 3; i++) {
            crows.push({
                x: 0.2 + Math.random() * 0.5,
                y: 0.25 + Math.random() * 0.15,
                circleR: 0.05 + Math.random() * 0.04,
                circleSpeed: 0.3 + Math.random() * 0.2,
                angle: Math.random() * Math.PI * 2,
                wingPhase: Math.random() * Math.PI * 2,
                diving: false,
                diveTimer: 8 + Math.random() * 12,
                divePhase: 0
            });
        }

        // Fence line birds
        var fenceBirds = [];
        for (var i = 0; i < 5; i++) {
            fenceBirds.push({
                x: 0.1 + i * 0.15 + Math.random() * 0.05,
                perched: true,
                flightPhase: 0,
                flightTimer: 5 + Math.random() * 15
            });
        }

        // Cloud shadows
        var cloudShadows = [];
        for (var i = 0; i < 3; i++) {
            cloudShadows.push({
                x: Math.random(),
                speed: 0.01 + Math.random() * 0.008,
                width: 0.1 + Math.random() * 0.1,
                height: 0.06 + Math.random() * 0.04
            });
        }

        // Chimney smoke state
        var chimneySmoke = true;

        // Dirt path dust
        var dustPuffs = [];
        for (var i = 0; i < 4; i++) {
            dustPuffs.push({
                x: 0.45 + Math.random() * 0.1,
                phase: Math.random() * Math.PI * 2,
                speed: 5 + Math.random() * 8
            });
        }

        return {
            targetCount: 20,
            spawn: function (w, h) {
                var td = CV.diurnal.getTimeData(CV.state && CV.state.frameDate);
                if (td.brightness < 0.15) {
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

                // Cloud shadows sweeping across field
                if (td.brightness > 0.3) {
                    for (var csi = 0; csi < cloudShadows.length; csi++) {
                        var cs = cloudShadows[csi];
                        var csx = ((cs.x + t * cs.speed) % 1.4) - 0.2;
                        var csAlpha = 0.06 * (td.brightness - 0.3);
                        ctx.beginPath();
                        ctx.ellipse(csx * w, fieldY + h * 0.15, cs.width * w, cs.height * h, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(0,0,0,' + csAlpha + ')';
                        ctx.fill();
                    }
                }

                // Dirt path through the wheat
                var pathX = w * 0.48;
                var pathW = 12;
                var pathCol = lerpColor([140, 120, 70], [35, 30, 18], 1 - td.brightness);
                ctx.beginPath();
                ctx.moveTo(pathX - pathW, fieldY);
                ctx.quadraticCurveTo(pathX - pathW * 0.8, fieldY + (h - fieldY) * 0.5, pathX - pathW * 1.5, h);
                ctx.lineTo(pathX + pathW * 1.5, h);
                ctx.quadraticCurveTo(pathX + pathW * 0.8, fieldY + (h - fieldY) * 0.5, pathX + pathW, fieldY);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(pathCol, 0.5);
                ctx.fill();

                // Dust kicked up by wind on path
                if (td.brightness > 0.2) {
                    for (var di = 0; di < dustPuffs.length; di++) {
                        var dp = dustPuffs[di];
                        var dpx = dp.x * w + Math.sin(t * 0.5 + dp.phase) * 5;
                        var dpy = fieldY + 15 + di * 20 + Math.sin(t * 0.3 + dp.phase) * 3;
                        var dpAlpha = Math.sin(t * 0.8 + dp.phase * 2) * 0.5 + 0.5;
                        if (dpAlpha > 0.3) {
                            var dpSize = 4 + Math.sin(t + di) * 2;
                            ctx.beginPath();
                            ctx.arc(dpx + Math.sin(t * 2 + di * 3) * 8, dpy, dpSize, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(180,160,100,' + (dpAlpha * 0.06 * td.brightness) + ')';
                            ctx.fill();
                        }
                    }
                }

                // Wheat stalks waving
                for (var row = 0; row < 8; row++) {
                    var rowY = fieldY + row * (h - fieldY) / 8;
                    var stalkH = 15 + row * 4;
                    var rowColor = lerpColor(wheatColor, wheatDark, row / 8);

                    for (var x = 0; x < w; x += (6 - row * 0.3)) {
                        // Skip stalks on the path
                        var distFromPath = Math.abs(x - pathX);
                        if (distFromPath < pathW * (0.8 + row * 0.1)) continue;

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

                // Fence/power line across the field
                var fenceY = fieldY + 8;
                var fenceCol = lerpColor([60, 50, 40], [22, 18, 14], 1 - td.brightness);
                var fenceAlpha = 0.4 + td.brightness * 0.3;
                // Posts
                for (var fp = 0; fp < 7; fp++) {
                    var fpx = w * 0.05 + fp * w * 0.14;
                    ctx.beginPath();
                    ctx.moveTo(fpx, fenceY + 5);
                    ctx.lineTo(fpx, fenceY - 12);
                    ctx.strokeStyle = colorToRgb(fenceCol, fenceAlpha);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                // Wire
                ctx.beginPath();
                for (var x = w * 0.05; x <= w * 0.89; x += 4) {
                    var wireSag = Math.sin(((x - w * 0.05) % (w * 0.14)) / (w * 0.14) * Math.PI) * 3;
                    if (x === w * 0.05) ctx.moveTo(x, fenceY - 10 + wireSag);
                    else ctx.lineTo(x, fenceY - 10 + wireSag);
                }
                ctx.strokeStyle = colorToRgb(fenceCol, fenceAlpha * 0.5);
                ctx.lineWidth = 1;
                ctx.stroke();

                // Birds perched on fence
                for (var fbi = 0; fbi < fenceBirds.length; fbi++) {
                    var fb = fenceBirds[fbi];
                    fb.flightTimer -= (1 / 60);
                    var fbx = fb.x * w;
                    var fbBaseY = fenceY - 12;

                    if (fb.perched) {
                        if (fb.flightTimer <= 0) {
                            fb.perched = false;
                            fb.flightPhase = 0;
                            fb.flightTimer = 3 + Math.random() * 4;
                        }
                        // Draw perched bird
                        ctx.beginPath();
                        ctx.ellipse(fbx, fbBaseY - 2, 3, 2, 0, 0, Math.PI * 2);
                        ctx.fillStyle = colorToRgb(lerpColor([35, 30, 25], [15, 13, 10], 1 - td.brightness), fenceAlpha);
                        ctx.fill();
                        // Head
                        ctx.beginPath();
                        ctx.arc(fbx + 2, fbBaseY - 4, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        fb.flightPhase += (1 / 60) * 2;
                        if (fb.flightTimer <= 0) {
                            fb.perched = true;
                            fb.flightTimer = 5 + Math.random() * 15;
                        }
                        // Draw flying bird (small arc above fence)
                        var flyY = fbBaseY - 10 - Math.sin(fb.flightPhase * Math.PI / (3 + Math.random())) * 15;
                        var flyX = fbx + Math.sin(fb.flightPhase * 2) * 15;
                        var fwing = Math.sin(t * 8 + fbi * 3) * 0.5;
                        ctx.save();
                        ctx.translate(flyX, flyY);
                        ctx.beginPath();
                        ctx.moveTo(-4, fwing * 3);
                        ctx.quadraticCurveTo(-1, -fwing * 2, 0, 0);
                        ctx.quadraticCurveTo(1, -fwing * 2, 4, fwing * 3);
                        ctx.strokeStyle = colorToRgb(lerpColor([35, 30, 25], [15, 13, 10], 1 - td.brightness), fenceAlpha);
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        ctx.restore();
                    }
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

                // Windmill next to farmhouse
                var wmX = fhX + 35;
                var wmY = fhY - 5;
                var wmH = 35;
                // Tower
                ctx.beginPath();
                ctx.moveTo(wmX - 4, wmY);
                ctx.lineTo(wmX - 2.5, wmY - wmH);
                ctx.lineTo(wmX + 2.5, wmY - wmH);
                ctx.lineTo(wmX + 4, wmY);
                ctx.closePath();
                ctx.fillStyle = colorToRgb(fhColor);
                ctx.fill();
                // Rotating blades
                windmillBladeAngle += (1 / 60) * 0.8;
                var bladeLen = 18;
                ctx.save();
                ctx.translate(wmX, wmY - wmH);
                for (var blade = 0; blade < 4; blade++) {
                    var bAngle = windmillBladeAngle + blade * Math.PI * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    var bEndX = Math.cos(bAngle) * bladeLen;
                    var bEndY = Math.sin(bAngle) * bladeLen;
                    ctx.lineTo(bEndX, bEndY);
                    // Blade surface
                    var perpX = -Math.sin(bAngle) * 3;
                    var perpY = Math.cos(bAngle) * 3;
                    ctx.lineTo(bEndX + perpX, bEndY + perpY);
                    ctx.lineTo(perpX * 0.3, perpY * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = colorToRgb(fhColor, 0.7);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(bEndX, bEndY);
                    ctx.strokeStyle = colorToRgb(fhColor, 0.8);
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                // Hub
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fillStyle = colorToRgb(fhColor, 0.9);
                ctx.fill();
                ctx.restore();

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

                // Farmhouse chimney smoke in evening/night
                if (td.period === 'evening' || td.period === 'night' || td.period === 'latenight' || td.period === 'dusk') {
                    var cSmkAlpha = 0.04;
                    if (td.period === 'dusk') cSmkAlpha = 0.03 * td.periodProgress;
                    var chimX = fhX - 5;
                    var chimY = fhY - 30;
                    for (var sp = 0; sp < 6; sp++) {
                        var spY2 = chimY - sp * 7;
                        var spDrift2 = Math.sin(t * 0.4 + sp * 0.9) * (2 + sp * 2);
                        var spSize2 = 2.5 + sp * 1.3;
                        ctx.beginPath();
                        ctx.arc(chimX + spDrift2, spY2, spSize2, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(140,140,150,' + (cSmkAlpha * (1 - sp / 6)) + ')';
                        ctx.fill();
                    }
                }
            },
            drawForeground: function (ctx, w, h, state, dt) {
                var td = diurnal.getTimeData(state.frameDate);
                var t = state.timeElapsed;

                // Crows circling above the field
                for (var ci = 0; ci < crows.length; ci++) {
                    var crow = crows[ci];
                    crow.wingPhase += (1 / 60) * 5;
                    crow.diveTimer -= (1 / 60);

                    var crowX, crowY;
                    if (crow.diving) {
                        crow.divePhase += (1 / 60) * 1.5;
                        if (crow.divePhase > Math.PI) {
                            crow.diving = false;
                            crow.diveTimer = 8 + Math.random() * 12;
                        }
                        // Dive arc
                        crowX = crow.x * w + Math.sin(crow.angle) * crow.circleR * w;
                        crowY = crow.y * h + Math.sin(crow.divePhase) * h * 0.15;
                    } else {
                        if (crow.diveTimer <= 0) {
                            crow.diving = true;
                            crow.divePhase = 0;
                        }
                        crow.angle += crow.circleSpeed * (1 / 60);
                        crowX = crow.x * w + Math.cos(crow.angle) * crow.circleR * w;
                        crowY = crow.y * h + Math.sin(crow.angle) * crow.circleR * h * 0.5;
                    }

                    var cwing = Math.sin(crow.wingPhase) * 0.5;
                    var crowAlpha = 0.4 + td.brightness * 0.3;
                    ctx.save();
                    ctx.translate(crowX, crowY);
                    ctx.beginPath();
                    ctx.moveTo(-6, cwing * 4);
                    ctx.quadraticCurveTo(-2, -cwing * 3, 0, 0);
                    ctx.quadraticCurveTo(2, -cwing * 3, 6, cwing * 4);
                    ctx.strokeStyle = 'rgba(15,12,10,' + crowAlpha + ')';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Body
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 2, 1, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(15,12,10,' + crowAlpha + ')';
                    ctx.fill();
                    ctx.restore();
                }
            }
        };
    })();


})(CV.themes, CV.FALLBACK_DT);
