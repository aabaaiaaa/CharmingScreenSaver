(function (themes, FALLBACK_DT) {
    // --- Voyager theme ---
    // Epic interplanetary journey: surface → launch → space → hyperspace → decelerate → planet approach → descent → surface (loops)
    themes.voyager = (function () {
        // Phase durations (seconds)
        var PHASES = [
            { name: 'surface', duration: 6 },
            { name: 'ascent', duration: 8 },
            { name: 'space', duration: 5 },
            { name: 'hyperEntry', duration: 3 },
            { name: 'hyperspace', duration: 7 },
            { name: 'decelerate', duration: 5 },
            { name: 'arrival', duration: 4 },
            { name: 'descent', duration: 8 }
        ];
        var TOTAL_CYCLE = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL_CYCLE += PHASES[i].duration;

        // Starfield
        var STAR_COUNT = 300;
        var stars = [];

        // Origin planet colours (reds/oranges — Mars-like)
        var originSky = ['#c46030', '#a04020', '#601810'];
        var originGround = ['#8b4513', '#6b3410', '#4a2008'];
        // Destination planet colours (blues/greens — Earth-like)
        var destSky = ['#4080c0', '#2060a0', '#102040'];
        var destGround = ['#2a6040', '#1a4a30', '#0a2a18'];

        // Terrain mountains (procedural, seeded)
        var originMountains = [];
        var destMountains = [];
        for (var i = 0; i < 30; i++) {
            originMountains.push({
                x: i / 30,
                h: 0.08 + (Math.sin(i * 3.7 + 0.5) * 0.5 + 0.5) * 0.18,
                w: 0.04 + (Math.sin(i * 5.3) * 0.5 + 0.5) * 0.06
            });
            destMountains.push({
                x: i / 30,
                h: 0.06 + (Math.sin(i * 4.1 + 2.3) * 0.5 + 0.5) * 0.14,
                w: 0.05 + (Math.sin(i * 6.7 + 1.1) * 0.5 + 0.5) * 0.05
            });
        }

        function initStars() {
            stars.length = 0;
            for (var i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: Math.random() * 3,
                    prevSx: 0, prevSy: 0,
                    hasPrev: false,
                    hue: Math.random() < 0.1 ? (180 + Math.random() * 60) : 0,
                    bright: 0.3 + Math.random() * 0.7
                });
            }
        }

        function getPhaseInfo(t) {
            var cycleT = t % TOTAL_CYCLE;
            var elapsed = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (cycleT < elapsed + PHASES[i].duration) {
                    return {
                        index: i,
                        name: PHASES[i].name,
                        progress: (cycleT - elapsed) / PHASES[i].duration,
                        phaseTime: cycleT - elapsed
                    };
                }
                elapsed += PHASES[i].duration;
            }
            return { index: 0, name: 'surface', progress: 0, phaseTime: 0 };
        }

        function smoothstep(a, b, t) {
            t = Math.max(0, Math.min(1, (t - a) / (b - a)));
            return t * t * (3 - 2 * t);
        }

        function lerpColor(c1, c2, t) {
            // Parse hex colours and lerp
            var r1 = parseInt(c1.substr(1, 2), 16), g1 = parseInt(c1.substr(3, 2), 16), b1 = parseInt(c1.substr(5, 2), 16);
            var r2 = parseInt(c2.substr(1, 2), 16), g2 = parseInt(c2.substr(3, 2), 16), b2 = parseInt(c2.substr(5, 2), 16);
            var r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        function drawTerrain(ctx, w, h, mountains, groundColors, skyHorizonColor, scrollOffset, heightScale) {
            // Mountain silhouettes
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (var i = 0; i < mountains.length; i++) {
                var m = mountains[i];
                var mx = ((m.x + scrollOffset * 0.01) % 1.2 - 0.1) * w;
                var mh = m.h * h * heightScale;
                ctx.lineTo(mx - m.w * w, h);
                ctx.lineTo(mx, h - mh);
                ctx.lineTo(mx + m.w * w, h);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fillStyle = groundColors[0];
            ctx.fill();

            // Ground base
            ctx.fillStyle = groundColors[1];
            ctx.fillRect(0, h * 0.92, w, h * 0.08);

            // Horizon glow
            var hGrad = ctx.createLinearGradient(0, h * 0.7, 0, h * 0.85);
            hGrad.addColorStop(0, 'rgba(0,0,0,0)');
            hGrad.addColorStop(1, skyHorizonColor);
            ctx.fillStyle = hGrad;
            ctx.fillRect(0, h * 0.7, w, h * 0.15);
        }

        function drawPlanetSphere(ctx, cx, cy, radius, colors) {
            // Planet disc with atmosphere
            var pGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
            pGrad.addColorStop(0, colors[0]);
            pGrad.addColorStop(0.6, colors[1]);
            pGrad.addColorStop(1, colors[2]);
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = pGrad;
            ctx.fill();

            // Atmosphere rim
            var aGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.15);
            aGrad.addColorStop(0, 'rgba(150, 200, 255, 0)');
            aGrad.addColorStop(0.5, 'rgba(150, 200, 255, 0.08)');
            aGrad.addColorStop(1, 'rgba(150, 200, 255, 0)');
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
            ctx.fillStyle = aGrad;
            ctx.fill();
        }

        return {
            cycleDuration: TOTAL_CYCLE,
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                initStars();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020206';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                if (stars.length === 0) initStars();
                var t = state.timeElapsed;
                var phase = getPhaseInfo(t);
                var p = phase.progress;
                var cx = w * 0.5;
                var cy = h * 0.5;

                // ===================== PHASE: SURFACE =====================
                if (phase.name === 'surface') {
                    // Standing on an alien planet, looking up at the sky
                    // Sky fades from rusty horizon to dark zenith
                    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
                    skyGrad.addColorStop(0, '#180808');
                    skyGrad.addColorStop(0.4, originSky[1]);
                    skyGrad.addColorStop(0.7, originSky[0]);
                    skyGrad.addColorStop(1, '#602810');
                    ctx.fillStyle = skyGrad;
                    ctx.fillRect(0, 0, w, h);

                    // A few stars visible in the dark sky
                    for (var i = 0; i < 40; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.5;
                        var twinkle = Math.sin(t * (1 + i * 0.1) + i * 3.3) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.5 + twinkle * 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 230, 200, ' + (0.1 + twinkle * 0.3) + ')';
                        ctx.fill();
                    }

                    // Terrain with slow scroll
                    drawTerrain(ctx, w, h, originMountains, originGround, 'rgba(160, 80, 30, 0.1)', t * 0.5, 1.0);

                    // Rumble/shake near end (launch imminent)
                    if (p > 0.7) {
                        var shake = (p - 0.7) / 0.3;
                        var shakeAmt = shake * 3;
                        // Glow from below (rocket engines)
                        var engineGlow = ctx.createRadialGradient(cx, h, 0, cx, h, h * 0.4 * shake);
                        engineGlow.addColorStop(0, 'rgba(255, 200, 100, ' + (shake * 0.15) + ')');
                        engineGlow.addColorStop(0.5, 'rgba(255, 120, 40, ' + (shake * 0.08) + ')');
                        engineGlow.addColorStop(1, 'rgba(255, 80, 20, 0)');
                        ctx.fillStyle = engineGlow;
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Flash white at very end
                    if (p > 0.92) {
                        var flash = (p - 0.92) / 0.08;
                        ctx.fillStyle = 'rgba(255, 255, 255, ' + (flash * 0.4) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ===================== PHASE: ASCENT =====================
                else if (phase.name === 'ascent') {
                    // Launching upward — sky darkens, terrain shrinks below, atmosphere thins
                    // Sky transition: rusty planet sky → black space
                    var skyDark = smoothstep(0, 0.8, p);
                    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
                    skyGrad.addColorStop(0, lerpColor('#180808', '#020206', skyDark));
                    skyGrad.addColorStop(0.5, lerpColor(originSky[1], '#050510', skyDark));
                    skyGrad.addColorStop(1, lerpColor(originSky[0], '#0a0a14', skyDark));
                    ctx.fillStyle = skyGrad;
                    ctx.fillRect(0, 0, w, h);

                    // Stars become visible as sky darkens
                    if (skyDark > 0.2) {
                        var starVis = (skyDark - 0.2) / 0.8;
                        for (var i = 0; i < 80; i++) {
                            var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                            var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.7;
                            var twinkle = Math.sin(t * (1 + i * 0.1) + i * 3.3) * 0.5 + 0.5;
                            ctx.beginPath();
                            ctx.arc(sx, sy, 0.5 + twinkle * 0.5, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 240, 220, ' + (starVis * (0.1 + twinkle * 0.3)) + ')';
                            ctx.fill();
                        }
                    }

                    // Planet surface receding below — curved horizon dropping
                    var horizonY = h * (0.7 + p * 0.5);  // Drops below screen
                    var curveAmt = 0.1 + p * 0.4;  // Curvature increases
                    if (horizonY < h + 200) {
                        ctx.beginPath();
                        ctx.moveTo(-w * 0.2, h + 100);
                        ctx.quadraticCurveTo(cx, horizonY, w * 1.2, h + 100);
                        ctx.closePath();
                        var planetGrad = ctx.createLinearGradient(0, horizonY, 0, h + 100);
                        planetGrad.addColorStop(0, originGround[0]);
                        planetGrad.addColorStop(0.4, originGround[1]);
                        planetGrad.addColorStop(1, originGround[2]);
                        ctx.fillStyle = planetGrad;
                        ctx.fill();

                        // Atmosphere glow at the limb
                        var atmosY = horizonY - 5;
                        var atmosGrad = ctx.createLinearGradient(0, atmosY - 20, 0, atmosY + 10);
                        atmosGrad.addColorStop(0, 'rgba(255, 150, 80, 0)');
                        atmosGrad.addColorStop(0.5, 'rgba(255, 150, 80, ' + (0.15 * (1 - p)) + ')');
                        atmosGrad.addColorStop(1, 'rgba(255, 100, 40, 0)');
                        ctx.fillStyle = atmosGrad;
                        ctx.fillRect(0, atmosY - 20, w, 30);
                    }

                    // Cloud layers whipping past
                    if (p < 0.5) {
                        var cloudFade = 1 - p / 0.5;
                        for (var i = 0; i < 8; i++) {
                            var cloudY = (h * 0.3 + i * h * 0.08 + phase.phaseTime * 200) % (h * 1.5) - h * 0.25;
                            var cloudX = (Math.sin(i * 5.7 + 1.3) * 0.5 + 0.5) * w;
                            var cloudW = 60 + Math.sin(i * 3.1) * 30;
                            ctx.beginPath();
                            ctx.ellipse(cloudX, cloudY, cloudW, 8, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(200, 160, 130, ' + (cloudFade * 0.06) + ')';
                            ctx.fill();
                        }
                    }

                    // Engine glow fading out
                    var engineFade = 1 - smoothstep(0, 0.3, p);
                    if (engineFade > 0) {
                        var eGlow = ctx.createRadialGradient(cx, h, 0, cx, h, h * 0.3);
                        eGlow.addColorStop(0, 'rgba(255, 200, 100, ' + (engineFade * 0.1) + ')');
                        eGlow.addColorStop(1, 'rgba(255, 100, 30, 0)');
                        ctx.fillStyle = eGlow;
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ===================== PHASE: SPACE =====================
                else if (phase.name === 'space') {
                    // Cruising through space — peaceful starfield, origin planet shrinking behind
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    // Gentle starfield (static, slight drift)
                    for (var i = 0; i < stars.length; i++) {
                        var s = stars[i];
                        var sx = ((s.x * 0.5 + 0.5) * w + t * 2 * (s.z * 0.3 + 0.1)) % w;
                        var sy = ((s.y * 0.5 + 0.5) * h + t * 0.5 * (s.z * 0.2)) % h;
                        var bright = s.bright * (0.5 + Math.sin(t * 0.7 + i * 2.3) * 0.3);
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4 + s.z * 0.3, 0, Math.PI * 2);
                        if (s.hue > 0) {
                            ctx.fillStyle = 'hsla(' + s.hue + ', 50%, 70%, ' + (bright * 0.6) + ')';
                        } else {
                            ctx.fillStyle = 'rgba(220, 230, 255, ' + (bright * 0.5) + ')';
                        }
                        ctx.fill();
                    }

                    // Origin planet shrinking behind (bottom-left)
                    var planetR = Math.max(5, w * 0.15 * (1 - p));
                    var planetX = w * (0.3 - p * 0.15);
                    var planetY = h * (0.7 + p * 0.1);
                    drawPlanetSphere(ctx, planetX, planetY, planetR, [originSky[0], originGround[0], originGround[2]]);

                    // Nebula wisps passing
                    for (var i = 0; i < 4; i++) {
                        var nx = ((Math.sin(i * 4.7) * 0.5 + 0.5) * w + t * 8) % (w * 1.4) - w * 0.2;
                        var ny = (Math.sin(i * 3.3 + 1.7) * 0.5 + 0.5) * h;
                        var nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 40 + Math.sin(i * 2.9) * 15);
                        var nHue = 200 + i * 40;
                        nGrad.addColorStop(0, 'hsla(' + nHue + ', 40%, 50%, 0.02)');
                        nGrad.addColorStop(1, 'hsla(' + nHue + ', 40%, 30%, 0)');
                        ctx.beginPath();
                        ctx.arc(nx, ny, 50, 0, Math.PI * 2);
                        ctx.fillStyle = nGrad;
                        ctx.fill();
                    }
                }

                // ===================== PHASE: HYPER ENTRY =====================
                else if (phase.name === 'hyperEntry') {
                    // Stars stretch into streaks, blue-shift, tunnel forms
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    var stretch = smoothstep(0, 1, p);  // 0 to 1 over this phase
                    var speed = 0.5 + stretch * 4;

                    for (var i = 0; i < stars.length; i++) {
                        var s = stars[i];
                        s.z -= speed * dt;
                        if (s.z <= 0.01) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var sx = cx + (s.x / s.z) * w * 0.5;
                        var sy = cy + (s.y / s.z) * h * 0.5;

                        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var brightness = Math.min(1, (3 - s.z) / 2) * s.bright;
                        var streakLen = stretch * 20;

                        // Draw streaked star
                        if (s.hasPrev && streakLen > 1) {
                            ctx.beginPath();
                            ctx.moveTo(s.prevSx, s.prevSy);
                            ctx.lineTo(sx, sy);
                            // Blue-shift as speed increases
                            var bShift = stretch;
                            var r = Math.round(200 * (1 - bShift * 0.6));
                            var g = Math.round(220 * (1 - bShift * 0.2));
                            var b = 255;
                            ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (brightness * 0.6) + ')';
                            ctx.lineWidth = 0.5 + (1 - s.z / 3) * 2;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                        }

                        ctx.beginPath();
                        ctx.arc(sx, sy, Math.max(0.3, (1 - s.z / 3) * 2), 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(180, 210, 255, ' + brightness + ')';
                        ctx.fill();

                        s.prevSx = sx;
                        s.prevSy = sy;
                        s.hasPrev = true;
                    }

                    // Growing central tunnel glow
                    var glowR = 30 + stretch * 80;
                    var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
                    cGrad.addColorStop(0, 'rgba(150, 180, 255, ' + (stretch * 0.12) + ')');
                    cGrad.addColorStop(0.5, 'rgba(100, 140, 255, ' + (stretch * 0.05) + ')');
                    cGrad.addColorStop(1, 'rgba(60, 100, 220, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
                    ctx.fillStyle = cGrad;
                    ctx.fill();

                    // Flash at the end
                    if (p > 0.85) {
                        var flash = (p - 0.85) / 0.15;
                        ctx.fillStyle = 'rgba(200, 220, 255, ' + (flash * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ===================== PHASE: HYPERSPACE =====================
                else if (phase.name === 'hyperspace') {
                    // Full warp tunnel with colour streaks, energy ribbons
                    ctx.fillStyle = '#010108';
                    ctx.fillRect(0, 0, w, h);

                    var speed = 4.5;

                    // Stars as long streaks
                    for (var i = 0; i < stars.length; i++) {
                        var s = stars[i];
                        s.z -= speed * dt;
                        if (s.z <= 0.01) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var sx = cx + (s.x / s.z) * w * 0.5;
                        var sy = cy + (s.y / s.z) * h * 0.5;

                        if (sx < -100 || sx > w + 100 || sy < -100 || sy > h + 100) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var brightness = Math.min(1, (3 - s.z) / 2) * s.bright;

                        if (s.hasPrev) {
                            ctx.beginPath();
                            ctx.moveTo(s.prevSx, s.prevSy);
                            ctx.lineTo(sx, sy);
                            ctx.strokeStyle = 'rgba(140, 170, 255, ' + (brightness * 0.5) + ')';
                            ctx.lineWidth = 0.5 + (1 - s.z / 3) * 2.5;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                        }

                        ctx.beginPath();
                        ctx.arc(sx, sy, Math.max(0.3, (1 - s.z / 3) * 1.5), 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 220, 255, ' + brightness + ')';
                        ctx.fill();

                        s.prevSx = sx;
                        s.prevSy = sy;
                        s.hasPrev = true;
                    }

                    // Coloured energy ribbons spiralling around the tunnel
                    for (var r = 0; r < 5; r++) {
                        var ribbonHue = (t * 30 + r * 72) % 360;
                        var ribbonPhase = t * 1.5 + r * Math.PI * 0.4;
                        ctx.beginPath();
                        for (var s = 0; s <= 40; s++) {
                            var frac = s / 40;
                            var dist = 20 + frac * Math.min(w, h) * 0.45;
                            var angle = ribbonPhase + frac * Math.PI * 3;
                            var rx = cx + Math.cos(angle) * dist;
                            var ry = cy + Math.sin(angle) * dist * 0.6;
                            if (s === 0) ctx.moveTo(rx, ry);
                            else ctx.lineTo(rx, ry);
                        }
                        ctx.strokeStyle = 'hsla(' + ribbonHue + ', 70%, 60%, 0.06)';
                        ctx.lineWidth = 2 + Math.sin(t + r) * 1;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }

                    // Central warp glow
                    var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
                    cGrad.addColorStop(0, 'rgba(180, 200, 255, 0.1)');
                    cGrad.addColorStop(0.4, 'rgba(120, 150, 255, 0.04)');
                    cGrad.addColorStop(1, 'rgba(80, 100, 220, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
                    ctx.fillStyle = cGrad;
                    ctx.fill();

                    // Occasional bright flashes along the tunnel
                    for (var i = 0; i < 3; i++) {
                        var flashPhase = Math.sin(t * 2.3 + i * 2.1);
                        if (flashPhase > 0.85) {
                            var fAngle = t * 0.7 + i * Math.PI * 0.67;
                            var fDist = 50 + (flashPhase - 0.85) * 400;
                            var fx = cx + Math.cos(fAngle) * fDist;
                            var fy = cy + Math.sin(fAngle) * fDist * 0.6;
                            var fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 15);
                            fGrad.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
                            fGrad.addColorStop(1, 'rgba(150, 180, 255, 0)');
                            ctx.beginPath();
                            ctx.arc(fx, fy, 15, 0, Math.PI * 2);
                            ctx.fillStyle = fGrad;
                            ctx.fill();
                        }
                    }
                }

                // ===================== PHASE: DECELERATE =====================
                else if (phase.name === 'decelerate') {
                    // Streaks shorten, a dot appears and grows — destination planet
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    var slowdown = smoothstep(0, 1, p);  // 0→1
                    var speed = 4.5 * (1 - slowdown * 0.85);  // Fast→slow

                    for (var i = 0; i < stars.length; i++) {
                        var s = stars[i];
                        s.z -= speed * dt;
                        if (s.z <= 0.01) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var sx = cx + (s.x / s.z) * w * 0.5;
                        var sy = cy + (s.y / s.z) * h * 0.5;

                        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
                            s.x = (Math.random() - 0.5) * 2;
                            s.y = (Math.random() - 0.5) * 2;
                            s.z = 2.5 + Math.random() * 0.5;
                            s.hasPrev = false;
                            continue;
                        }

                        var brightness = Math.min(1, (3 - s.z) / 2) * s.bright;
                        var streakFade = 1 - slowdown;

                        if (s.hasPrev && streakFade > 0.1) {
                            ctx.beginPath();
                            ctx.moveTo(s.prevSx, s.prevSy);
                            ctx.lineTo(sx, sy);
                            ctx.strokeStyle = 'rgba(180, 200, 255, ' + (brightness * 0.4 * streakFade) + ')';
                            ctx.lineWidth = 0.5 + (1 - s.z / 3) * 2 * streakFade;
                            ctx.lineCap = 'round';
                            ctx.stroke();
                        }

                        ctx.beginPath();
                        ctx.arc(sx, sy, Math.max(0.3, (1 - s.z / 3) * (1 + streakFade)), 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 230, 255, ' + brightness + ')';
                        ctx.fill();

                        s.prevSx = sx;
                        s.prevSy = sy;
                        s.hasPrev = true;
                    }

                    // Fading energy ribbons
                    if (slowdown < 0.7) {
                        var ribbonFade = 1 - slowdown / 0.7;
                        for (var r = 0; r < 3; r++) {
                            var ribbonHue = (t * 30 + r * 72) % 360;
                            var ribbonPhase = t * 1.5 * (1 - slowdown * 0.5) + r * Math.PI * 0.4;
                            ctx.beginPath();
                            for (var s = 0; s <= 30; s++) {
                                var frac = s / 30;
                                var dist = 20 + frac * Math.min(w, h) * 0.35;
                                var angle = ribbonPhase + frac * Math.PI * 2.5;
                                var rx = cx + Math.cos(angle) * dist;
                                var ry = cy + Math.sin(angle) * dist * 0.6;
                                if (s === 0) ctx.moveTo(rx, ry);
                                else ctx.lineTo(rx, ry);
                            }
                            ctx.strokeStyle = 'hsla(' + ribbonHue + ', 60%, 55%, ' + (0.04 * ribbonFade) + ')';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    }

                    // Destination planet dot appearing and growing
                    var dotAppear = smoothstep(0.15, 1, p);
                    var dotR = 1 + dotAppear * 12;
                    drawPlanetSphere(ctx, cx, cy, dotR, [destSky[0], destGround[0], destGround[2]]);

                    // Central glow fading
                    var glowFade = 1 - slowdown;
                    if (glowFade > 0) {
                        var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
                        cGrad.addColorStop(0, 'rgba(150, 180, 255, ' + (glowFade * 0.06) + ')');
                        cGrad.addColorStop(1, 'rgba(80, 100, 220, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
                        ctx.fillStyle = cGrad;
                        ctx.fill();
                    }
                }

                // ===================== PHASE: ARRIVAL =====================
                else if (phase.name === 'arrival') {
                    // Drop out of hyperspace — planet rushes toward us and fills the view
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    // Static starfield behind
                    for (var i = 0; i < 120; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        var twinkle = Math.sin(t * 0.5 + i * 2.3) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4 + twinkle * 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 230, 255, ' + (0.15 + twinkle * 0.2) + ')';
                        ctx.fill();
                    }

                    // Planet growing rapidly — from small disc to filling most of the screen
                    var grow = smoothstep(0, 1, p);
                    var planetR = 15 + grow * Math.max(w, h) * 0.7;
                    // Planet drops slightly below centre as we approach
                    var planetCY = cy + grow * h * 0.2;
                    drawPlanetSphere(ctx, cx, planetCY, planetR, [destSky[0], destGround[0], destGround[2]]);

                    // Cloud bands on the planet
                    if (planetR > 50) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(cx, planetCY, planetR, 0, Math.PI * 2);
                        ctx.clip();
                        for (var i = 0; i < 8; i++) {
                            var bandY = planetCY - planetR + (i / 8) * planetR * 2;
                            var bandH = planetR * 0.05;
                            var bandOp = 0.03 + Math.sin(i * 2.3 + t * 0.1) * 0.01;
                            ctx.beginPath();
                            ctx.ellipse(cx + Math.sin(i * 3.7 + t * 0.05) * 10, bandY, planetR * 0.9, bandH, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 255, 255, ' + bandOp + ')';
                            ctx.fill();
                        }
                        ctx.restore();
                    }

                    // Atmospheric entry glow at the end
                    if (p > 0.7) {
                        var entryGlow = (p - 0.7) / 0.3;
                        var eGrad = ctx.createRadialGradient(cx, h * 0.3, 0, cx, h * 0.3, h * 0.6);
                        eGrad.addColorStop(0, 'rgba(255, 180, 100, ' + (entryGlow * 0.15) + ')');
                        eGrad.addColorStop(0.5, 'rgba(255, 120, 60, ' + (entryGlow * 0.08) + ')');
                        eGrad.addColorStop(1, 'rgba(255, 80, 30, 0)');
                        ctx.fillStyle = eGrad;
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Flash into descent
                    if (p > 0.9) {
                        var flash = (p - 0.9) / 0.1;
                        ctx.fillStyle = 'rgba(255, 255, 255, ' + (flash * 0.5) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ===================== PHASE: DESCENT =====================
                else if (phase.name === 'descent') {
                    // Descending through atmosphere to the new planet's surface
                    // Sky lightens, clouds appear, terrain rises to meet us
                    var skyLight = smoothstep(0, 0.7, p);
                    var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
                    skyGrad.addColorStop(0, lerpColor('#020210', destSky[2], skyLight));
                    skyGrad.addColorStop(0.4, lerpColor('#050515', destSky[1], skyLight));
                    skyGrad.addColorStop(0.7, lerpColor('#0a0a20', destSky[0], skyLight));
                    skyGrad.addColorStop(1, lerpColor('#101030', '#80c0a0', skyLight));
                    ctx.fillStyle = skyGrad;
                    ctx.fillRect(0, 0, w, h);

                    // Stars fading as atmosphere thickens
                    if (skyLight < 0.8) {
                        var starFade = 1 - skyLight / 0.8;
                        for (var i = 0; i < 60; i++) {
                            var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                            var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.5;
                            ctx.beginPath();
                            ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 255, 255, ' + (starFade * 0.2) + ')';
                            ctx.fill();
                        }
                    }

                    // Clouds appearing and rushing upward
                    if (p > 0.15) {
                        var cloudIntensity = smoothstep(0.15, 0.5, p);
                        for (var i = 0; i < 10; i++) {
                            var cloudY = h - ((phase.phaseTime * 80 + i * h * 0.15) % (h * 1.3)) + h * 0.3;
                            var cloudX = (Math.sin(i * 5.7 + 1.3) * 0.5 + 0.5) * w;
                            var cloudW = 80 + Math.sin(i * 3.1) * 40;
                            ctx.beginPath();
                            ctx.ellipse(cloudX, cloudY, cloudW, 12, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(220, 240, 250, ' + (cloudIntensity * 0.05) + ')';
                            ctx.fill();
                        }
                    }

                    // Terrain rising from below
                    var terrainRise = smoothstep(0.35, 1, p);
                    if (terrainRise > 0) {
                        // Curved horizon rising
                        var horizonY = h + h * 0.4 * (1 - terrainRise);
                        ctx.beginPath();
                        ctx.moveTo(-w * 0.2, h + 50);
                        ctx.quadraticCurveTo(cx, horizonY, w * 1.2, h + 50);
                        ctx.closePath();
                        ctx.fillStyle = destGround[0];
                        ctx.fill();

                        // Mountains appearing
                        if (terrainRise > 0.3) {
                            var mtScale = (terrainRise - 0.3) / 0.7;
                            drawTerrain(ctx, w, h, destMountains, destGround, 'rgba(60, 120, 80, 0.08)', t * 0.3, mtScale * 0.6);
                        }

                        // Atmosphere haze near horizon
                        var hazeGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 10);
                        hazeGrad.addColorStop(0, 'rgba(160, 200, 180, 0)');
                        hazeGrad.addColorStop(1, 'rgba(160, 200, 180, ' + (terrainRise * 0.08) + ')');
                        ctx.fillStyle = hazeGrad;
                        ctx.fillRect(0, horizonY - 40, w, 50);
                    }

                    // Re-entry heat dissipating
                    if (p < 0.2) {
                        var heat = 1 - p / 0.2;
                        ctx.fillStyle = 'rgba(255, 200, 150, ' + (heat * 0.1) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Fade to surface phase at end
                    if (p > 0.9) {
                        var fade = (p - 0.9) / 0.1;
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + (fade * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // --- Odyssey theme ---
    // Deep ocean dive: surface → sunlit → twilight → midnight → abyss → ascent → breach
    themes.odyssey = (function () {
        var PHASES = [
            { name: 'surface', duration: 5 },
            { name: 'sunlit', duration: 6 },
            { name: 'twilight', duration: 6 },
            { name: 'midnight', duration: 7 },
            { name: 'abyss', duration: 7 },
            { name: 'ascent', duration: 8 },
            { name: 'breach', duration: 4 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        // Bioluminescent creatures
        var bioCreatures = [];
        for (var i = 0; i < 20; i++) {
            bioCreatures.push({
                x: Math.random(), y: Math.random(),
                size: 2 + Math.random() * 6,
                hue: 180 + Math.random() * 60,
                pulseSpeed: 0.5 + Math.random() * 2,
                pulseOff: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.02,
                driftY: (Math.random() - 0.5) * 0.01,
                tentacles: Math.random() < 0.4
            });
        }

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'surface', progress: 0, time: 0 };
        }

        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }

        function drawWaves(ctx, w, h, t, baseY, amp, count, color) {
            for (var i = 0; i < count; i++) {
                ctx.beginPath();
                var waveY = baseY + i * 6;
                for (var x = 0; x <= w; x += 4) {
                    var y = waveY + Math.sin(x * 0.008 + t * (0.8 + i * 0.2) + i * 1.5) * amp
                                  + Math.sin(x * 0.015 + t * 1.2 + i * 0.7) * amp * 0.5;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        function drawBubbles(ctx, w, h, t, count, rise, op) {
            for (var i = 0; i < count; i++) {
                var bx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                var by = h - ((t * rise + i * h * 0.1) % (h * 1.2)) + h * 0.1;
                var br = 1 + Math.sin(i * 3.1) * 0.8;
                ctx.beginPath();
                ctx.arc(bx + Math.sin(t * 1.5 + i * 2) * 5, by, br, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 230, 255, ' + op + ')';
                ctx.fill();
            }
        }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {},

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#040810';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;

                if (ph.name === 'surface') {
                    // Ocean surface: sky above, water below, gentle waves
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.45);
                    skyG.addColorStop(0, '#1a3050');
                    skyG.addColorStop(1, '#305878');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h * 0.45);
                    var waterG = ctx.createLinearGradient(0, h * 0.45, 0, h);
                    waterG.addColorStop(0, '#1a5070');
                    waterG.addColorStop(1, '#0a2840');
                    ctx.fillStyle = waterG;
                    ctx.fillRect(0, h * 0.45, w, h * 0.55);

                    // Sun reflection
                    var sunX = w * 0.6, sunY = h * 0.15;
                    var sG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
                    sG.addColorStop(0, 'rgba(255, 230, 180, 0.3)');
                    sG.addColorStop(1, 'rgba(255, 200, 130, 0)');
                    ctx.fillStyle = sG;
                    ctx.fillRect(0, 0, w, h * 0.45);

                    drawWaves(ctx, w, h, t, h * 0.43, 8, 5, 'rgba(100, 180, 220, 0.08)');

                    // Submerge at end
                    if (p > 0.6) {
                        var sub = (p - 0.6) / 0.4;
                        ctx.fillStyle = 'rgba(10, 40, 70, ' + (sub * 0.6) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'sunlit') {
                    // Bright blue water, light rays from above, fish shadows
                    var wG = ctx.createLinearGradient(0, 0, 0, h);
                    var darkening = sm(0, 1, p);
                    var topR = Math.round(20 - darkening * 10), topG2 = Math.round(100 - darkening * 40), topB = Math.round(140 - darkening * 40);
                    var botR = Math.round(8 - darkening * 4), botG2 = Math.round(50 - darkening * 25), botB = Math.round(90 - darkening * 30);
                    wG.addColorStop(0, 'rgb(' + topR + ',' + topG2 + ',' + topB + ')');
                    wG.addColorStop(1, 'rgb(' + botR + ',' + botG2 + ',' + botB + ')');
                    ctx.fillStyle = wG;
                    ctx.fillRect(0, 0, w, h);

                    // Light rays from surface
                    var rayOp = 0.04 * (1 - darkening * 0.7);
                    for (var i = 0; i < 6; i++) {
                        var rx = w * (0.2 + i * 0.12) + Math.sin(t * 0.3 + i) * 20;
                        ctx.beginPath();
                        ctx.moveTo(rx - 15, 0);
                        ctx.lineTo(rx + 15, 0);
                        ctx.lineTo(rx + 40 + Math.sin(t * 0.5 + i * 2) * 10, h);
                        ctx.lineTo(rx - 10 + Math.sin(t * 0.4 + i * 3) * 10, h);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(100, 200, 255, ' + rayOp + ')';
                        ctx.fill();
                    }

                    // Fish silhouettes
                    for (var i = 0; i < 5; i++) {
                        var fx = ((t * 30 + i * w * 0.25) % (w * 1.4)) - w * 0.2;
                        var fy = h * (0.3 + Math.sin(i * 3.7) * 0.2) + Math.sin(t * 0.8 + i * 2) * 15;
                        var fs = 8 + Math.sin(i * 5.1) * 4;
                        ctx.beginPath();
                        ctx.ellipse(fx, fy, fs, fs * 0.35, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(5, 30, 50, 0.08)';
                        ctx.fill();
                        // Tail
                        ctx.beginPath();
                        ctx.moveTo(fx + fs, fy);
                        ctx.lineTo(fx + fs + fs * 0.5, fy - fs * 0.3);
                        ctx.lineTo(fx + fs + fs * 0.5, fy + fs * 0.3);
                        ctx.closePath();
                        ctx.fill();
                    }

                    drawBubbles(ctx, w, h, t, 12, 25, 0.06);
                }

                else if (ph.name === 'twilight') {
                    // Dimming blue, jellyfish silhouettes
                    var darkening = sm(0, 1, p);
                    var wG = ctx.createLinearGradient(0, 0, 0, h);
                    var tR = Math.round(10 - darkening * 6), tGv = Math.round(50 - darkening * 30), tBv = Math.round(90 - darkening * 40);
                    var bR = Math.round(5 - darkening * 3), bGv = Math.round(20 - darkening * 12), bBv = Math.round(60 - darkening * 35);
                    wG.addColorStop(0, 'rgb(' + tR + ',' + tGv + ',' + tBv + ')');
                    wG.addColorStop(1, 'rgb(' + bR + ',' + bGv + ',' + bBv + ')');
                    ctx.fillStyle = wG;
                    ctx.fillRect(0, 0, w, h);

                    // Faint light from above fading
                    var topGlow = (1 - darkening) * 0.03;
                    if (topGlow > 0.005) {
                        var tG = ctx.createLinearGradient(0, 0, 0, h * 0.4);
                        tG.addColorStop(0, 'rgba(60, 120, 160, ' + topGlow + ')');
                        tG.addColorStop(1, 'rgba(30, 60, 80, 0)');
                        ctx.fillStyle = tG;
                        ctx.fillRect(0, 0, w, h * 0.4);
                    }

                    // Jellyfish
                    for (var i = 0; i < 6; i++) {
                        var jx = (Math.sin(i * 5.3 + t * 0.05) * 0.5 + 0.5) * w;
                        var jy = ((t * 12 + i * h * 0.2) % (h * 1.3)) - h * 0.15;
                        jy = h - jy; // Rising
                        var jSize = 12 + Math.sin(i * 3.7) * 6;
                        var pulse = Math.sin(t * 1.2 + i * 2) * 0.3 + 0.7;
                        // Bell
                        ctx.beginPath();
                        ctx.ellipse(jx, jy, jSize * pulse, jSize * 0.6 * pulse, 0, Math.PI, 0);
                        ctx.fillStyle = 'rgba(100, 140, 180, 0.06)';
                        ctx.fill();
                        // Tentacles
                        for (var tn = 0; tn < 4; tn++) {
                            ctx.beginPath();
                            var tx = jx + (tn - 1.5) * jSize * 0.3;
                            ctx.moveTo(tx, jy);
                            ctx.quadraticCurveTo(tx + Math.sin(t * 2 + i + tn) * 8, jy + jSize * 1.2, tx + Math.sin(t * 1.5 + tn * 3) * 5, jy + jSize * 2);
                            ctx.strokeStyle = 'rgba(80, 130, 170, 0.04)';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }

                    // Marine snow (particles drifting down)
                    for (var i = 0; i < 20; i++) {
                        var mx = (Math.sin(i * 6.7 + t * 0.02) * 0.5 + 0.5) * w;
                        var my = (t * 8 + i * h * 0.06) % h;
                        ctx.beginPath();
                        ctx.arc(mx + Math.sin(t * 0.5 + i) * 3, my, 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(150, 180, 200, 0.06)';
                        ctx.fill();
                    }
                }

                else if (ph.name === 'midnight') {
                    // Pitch black with bioluminescent creatures
                    ctx.fillStyle = '#020408';
                    ctx.fillRect(0, 0, w, h);

                    for (var i = 0; i < bioCreatures.length; i++) {
                        var c = bioCreatures[i];
                        var bx = (c.x + Math.sin(t * c.driftX * 10 + i * 2) * 0.05) * w;
                        var by = (c.y + Math.sin(t * c.driftY * 10 + i * 3) * 0.04) * h;
                        var pulse = Math.sin(t * c.pulseSpeed + c.pulseOff) * 0.5 + 0.5;
                        var glow = pulse * 0.15;

                        // Glow halo
                        var gR = ctx.createRadialGradient(bx, by, 0, bx, by, c.size * 4);
                        gR.addColorStop(0, 'hsla(' + c.hue + ', 80%, 60%, ' + (glow * 0.6) + ')');
                        gR.addColorStop(1, 'hsla(' + c.hue + ', 80%, 40%, 0)');
                        ctx.beginPath();
                        ctx.arc(bx, by, c.size * 4, 0, Math.PI * 2);
                        ctx.fillStyle = gR;
                        ctx.fill();

                        // Body
                        ctx.beginPath();
                        ctx.arc(bx, by, c.size * (0.8 + pulse * 0.2), 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + c.hue + ', 70%, 55%, ' + (glow + 0.03) + ')';
                        ctx.fill();

                        // Tentacles for jellyfish types
                        if (c.tentacles) {
                            for (var tn = 0; tn < 3; tn++) {
                                ctx.beginPath();
                                ctx.moveTo(bx, by + c.size);
                                ctx.quadraticCurveTo(
                                    bx + Math.sin(t * 1.5 + i + tn * 2) * 10,
                                    by + c.size * 3,
                                    bx + Math.sin(t + tn * 3) * 6,
                                    by + c.size * 5
                                );
                                ctx.strokeStyle = 'hsla(' + c.hue + ', 70%, 50%, ' + (glow * 0.4) + ')';
                                ctx.lineWidth = 0.8;
                                ctx.stroke();
                            }
                        }
                    }

                    // Occasional flash (anglerfish lure)
                    var flashPhase = Math.sin(t * 0.4);
                    if (flashPhase > 0.9) {
                        var ff = (flashPhase - 0.9) * 10;
                        var flx = w * 0.3 + Math.sin(t * 0.1) * w * 0.2;
                        var fly = h * 0.5 + Math.sin(t * 0.15 + 1) * h * 0.2;
                        var fG = ctx.createRadialGradient(flx, fly, 0, flx, fly, 25);
                        fG.addColorStop(0, 'rgba(200, 255, 200, ' + (ff * 0.2) + ')');
                        fG.addColorStop(1, 'rgba(100, 200, 150, 0)');
                        ctx.beginPath();
                        ctx.arc(flx, fly, 25, 0, Math.PI * 2);
                        ctx.fillStyle = fG;
                        ctx.fill();
                    }
                }

                else if (ph.name === 'abyss') {
                    // Hydrothermal vents, smoky plumes, orange glow
                    ctx.fillStyle = '#020305';
                    ctx.fillRect(0, 0, w, h);

                    // Vent structures on the floor
                    var floorY = h * 0.82;
                    // Rocky floor
                    ctx.beginPath();
                    ctx.moveTo(0, h);
                    for (var x = 0; x <= w; x += 3) {
                        var fy = floorY + Math.sin(x * 0.02 + 0.5) * 8 + Math.sin(x * 0.05 + 1.3) * 4;
                        ctx.lineTo(x, fy);
                    }
                    ctx.lineTo(w, h);
                    ctx.closePath();
                    ctx.fillStyle = '#0a0a08';
                    ctx.fill();

                    // Vent chimneys
                    for (var i = 0; i < 4; i++) {
                        var vx = w * (0.2 + i * 0.2) + Math.sin(i * 5.3) * 20;
                        var vw = 12 + Math.sin(i * 3.1) * 5;
                        var vh = 30 + Math.sin(i * 4.7) * 15;
                        ctx.fillStyle = '#0c0c08';
                        ctx.fillRect(vx - vw / 2, floorY - vh, vw, vh);

                        // Hot glow at vent opening
                        var ventGlow = ctx.createRadialGradient(vx, floorY - vh, 0, vx, floorY - vh, 20);
                        ventGlow.addColorStop(0, 'rgba(255, 120, 30, ' + (0.12 + Math.sin(t * 2 + i * 3) * 0.04) + ')');
                        ventGlow.addColorStop(1, 'rgba(255, 60, 10, 0)');
                        ctx.beginPath();
                        ctx.arc(vx, floorY - vh, 20, 0, Math.PI * 2);
                        ctx.fillStyle = ventGlow;
                        ctx.fill();

                        // Smoke plumes rising
                        for (var s = 0; s < 8; s++) {
                            var sy = floorY - vh - (t * 20 + s * 25 + i * 40) % (h * 0.7);
                            var sx = vx + Math.sin(t * 0.8 + s * 1.5 + i) * (10 + s * 2);
                            var sr = 4 + s * 2;
                            var sop = Math.max(0, 0.04 - s * 0.004);
                            ctx.beginPath();
                            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(80, 80, 60, ' + sop + ')';
                            ctx.fill();
                        }
                    }

                    // Scattered bioluminescence
                    for (var i = 0; i < 8; i++) {
                        var c = bioCreatures[i];
                        var bx = (c.x + Math.sin(t * 0.03 + i * 2) * 0.05) * w;
                        var by = (c.y * 0.6 + 0.1) * h;
                        var pulse = Math.sin(t * c.pulseSpeed + c.pulseOff) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.arc(bx, by, c.size * 0.6, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + c.hue + ', 70%, 50%, ' + (pulse * 0.08) + ')';
                        ctx.fill();
                    }
                }

                else if (ph.name === 'ascent') {
                    // Rising back through zones — reverse the journey
                    // Blend from dark abyss to twilight to sunlit
                    var zone = p * 3; // 0-1 abyss→midnight, 1-2 twilight, 2-3 sunlit
                    if (zone < 1) {
                        // Abyss to midnight
                        var blend = zone;
                        var wG = ctx.createLinearGradient(0, 0, 0, h);
                        wG.addColorStop(0, 'rgb(' + Math.round(2 + blend * 2) + ',' + Math.round(3 + blend * 2) + ',' + Math.round(5 + blend * 3) + ')');
                        wG.addColorStop(1, 'rgb(2,4,8)');
                        ctx.fillStyle = wG;
                        ctx.fillRect(0, 0, w, h);
                        // Fading bioluminescence
                        for (var i = 0; i < 10; i++) {
                            var c = bioCreatures[i];
                            var pulse = Math.sin(t * c.pulseSpeed + c.pulseOff) * 0.5 + 0.5;
                            var bx = (c.x + Math.sin(t * 0.03 + i) * 0.05) * w;
                            var by = (c.y + blend * 0.3) * h;
                            ctx.beginPath();
                            ctx.arc(bx, by, c.size, 0, Math.PI * 2);
                            ctx.fillStyle = 'hsla(' + c.hue + ', 70%, 50%, ' + (pulse * 0.08 * (1 - blend * 0.5)) + ')';
                            ctx.fill();
                        }
                    } else if (zone < 2) {
                        // Midnight to twilight
                        var blend = zone - 1;
                        var wG = ctx.createLinearGradient(0, 0, 0, h);
                        var tR = Math.round(4 + blend * 6), tGv = Math.round(8 + blend * 30), tBv = Math.round(14 + blend * 50);
                        wG.addColorStop(0, 'rgb(' + tR + ',' + tGv + ',' + tBv + ')');
                        wG.addColorStop(1, 'rgb(' + Math.round(2 + blend * 3) + ',' + Math.round(5 + blend * 15) + ',' + Math.round(8 + blend * 30) + ')');
                        ctx.fillStyle = wG;
                        ctx.fillRect(0, 0, w, h);
                        // Jellyfish passing
                        for (var i = 0; i < 4; i++) {
                            var jx = (Math.sin(i * 5.3 + t * 0.05) * 0.5 + 0.5) * w;
                            var jy = ((t * 15 + i * h * 0.3) % (h * 1.3)) - h * 0.15;
                            var jSize = 10 + Math.sin(i * 3.7) * 4;
                            ctx.beginPath();
                            ctx.ellipse(jx, jy, jSize, jSize * 0.5, 0, Math.PI, 0);
                            ctx.fillStyle = 'rgba(100, 160, 200, ' + (blend * 0.04) + ')';
                            ctx.fill();
                        }
                    } else {
                        // Twilight to sunlit
                        var blend = zone - 2;
                        var wG = ctx.createLinearGradient(0, 0, 0, h);
                        var tR = Math.round(10 + blend * 10), tGv = Math.round(40 + blend * 60), tBv = Math.round(70 + blend * 70);
                        wG.addColorStop(0, 'rgb(' + tR + ',' + tGv + ',' + tBv + ')');
                        wG.addColorStop(1, 'rgb(' + Math.round(5 + blend * 5) + ',' + Math.round(20 + blend * 30) + ',' + Math.round(40 + blend * 50) + ')');
                        ctx.fillStyle = wG;
                        ctx.fillRect(0, 0, w, h);
                        // Light rays returning
                        var rayOp = blend * 0.03;
                        for (var i = 0; i < 5; i++) {
                            var rx = w * (0.2 + i * 0.15) + Math.sin(t * 0.3 + i) * 15;
                            ctx.beginPath();
                            ctx.moveTo(rx - 10, 0); ctx.lineTo(rx + 10, 0);
                            ctx.lineTo(rx + 30, h); ctx.lineTo(rx - 5, h);
                            ctx.closePath();
                            ctx.fillStyle = 'rgba(100, 200, 255, ' + rayOp + ')';
                            ctx.fill();
                        }
                    }
                    drawBubbles(ctx, w, h, t, 15, 35, 0.05);
                }

                else if (ph.name === 'breach') {
                    // Bursting through the surface
                    var rise = sm(0, 0.5, p);
                    var settle = sm(0.5, 1, p);
                    // Water to sky transition
                    var waterLevel = h * (0.5 - rise * 0.5 + settle * 0.05);
                    // Sky
                    var skyG = ctx.createLinearGradient(0, 0, 0, waterLevel);
                    skyG.addColorStop(0, '#1a3050');
                    skyG.addColorStop(1, '#305878');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, waterLevel);
                    // Water
                    var wG = ctx.createLinearGradient(0, waterLevel, 0, h);
                    wG.addColorStop(0, '#1a6080');
                    wG.addColorStop(1, '#0a3050');
                    ctx.fillStyle = wG;
                    ctx.fillRect(0, waterLevel, w, h - waterLevel);

                    drawWaves(ctx, w, h, t, waterLevel - 5, 6, 3, 'rgba(120, 200, 230, 0.06)');

                    // Spray/splash at the breach moment
                    if (p < 0.4) {
                        var splash = 1 - p / 0.4;
                        for (var i = 0; i < 12; i++) {
                            var sx = cx + (Math.sin(i * 4.3 + 0.7) - 0.5) * 100 * splash;
                            var sy = waterLevel - Math.abs(Math.sin(i * 2.9 + 0.3)) * 80 * splash;
                            ctx.beginPath();
                            ctx.arc(sx, sy, 2 * splash, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(200, 230, 255, ' + (splash * 0.12) + ')';
                            ctx.fill();
                        }
                    }

                    // Sun
                    var sunX = w * 0.6, sunY = h * 0.15;
                    var sG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
                    sG.addColorStop(0, 'rgba(255, 230, 180, 0.25)');
                    sG.addColorStop(1, 'rgba(255, 200, 130, 0)');
                    ctx.fillStyle = sG;
                    ctx.fillRect(0, 0, w, h * 0.45);
                }
            }
        };
    })();

    // --- Genesis theme ---
    // Birth of a star system: dust → collapse → ignition → disc → planets → cooling → oceans
    themes.genesis = (function () {
        var PHASES = [
            { name: 'dust', duration: 6 },
            { name: 'collapse', duration: 6 },
            { name: 'ignition', duration: 4 },
            { name: 'disc', duration: 7 },
            { name: 'planets', duration: 7 },
            { name: 'cooling', duration: 6 },
            { name: 'oceans', duration: 6 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        // Dust motes
        var dustMotes = [];
        for (var i = 0; i < 150; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random();
            dustMotes.push({
                angle: angle, dist: dist,
                size: 0.5 + Math.random() * 2,
                speed: 0.02 + Math.random() * 0.06,
                bright: 0.2 + Math.random() * 0.6,
                hue: 20 + Math.random() * 30,
                radialDrift: (Math.random() - 0.5) * 0.01
            });
        }

        // Orbiting planets
        var orbitPlanets = [];
        for (var i = 0; i < 5; i++) {
            orbitPlanets.push({
                dist: 0.2 + i * 0.15,
                angle: Math.random() * Math.PI * 2,
                speed: 0.15 / (1 + i * 0.6),
                size: 4 + Math.sin(i * 2.7) * 2,
                hue: [30, 180, 100, 340, 40][i],
                sat: [40, 50, 40, 30, 45][i]
            });
        }

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'dust', progress: 0, time: 0 };
        }
        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {},

            drawBackground: function (ctx, w, h) {
                ctx.fillStyle = '#020204';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;
                var minD = Math.min(w, h);

                if (ph.name === 'dust') {
                    // Dark void with drifting cosmic dust
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    // Background stars
                    for (var i = 0; i < 60; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.15)';
                        ctx.fill();
                    }

                    // Dust cloud — particles drift loosely
                    for (var i = 0; i < dustMotes.length; i++) {
                        var m = dustMotes[i];
                        var a = m.angle + t * m.speed * 0.3;
                        var d = m.dist * minD * 0.45;
                        var mx = cx + Math.cos(a) * d + Math.sin(t * 0.1 + i) * 10;
                        var my = cy + Math.sin(a) * d * 0.7 + Math.cos(t * 0.08 + i * 2) * 8;
                        ctx.beginPath();
                        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + m.hue + ', 30%, 50%, ' + (m.bright * 0.04) + ')';
                        ctx.fill();
                    }

                    // Nebula glow patches
                    for (var i = 0; i < 5; i++) {
                        var nx = cx + Math.sin(i * 3.7 + 0.5) * minD * 0.2;
                        var ny = cy + Math.cos(i * 4.3 + 1.2) * minD * 0.15;
                        var nG = ctx.createRadialGradient(nx, ny, 0, nx, ny, 60);
                        nG.addColorStop(0, 'hsla(' + (20 + i * 15) + ', 40%, 40%, 0.02)');
                        nG.addColorStop(1, 'hsla(' + (20 + i * 15) + ', 40%, 30%, 0)');
                        ctx.fillStyle = nG;
                        ctx.fillRect(nx - 60, ny - 60, 120, 120);
                    }
                }

                else if (ph.name === 'collapse') {
                    // Dust cloud condenses, swirling inward
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    var contract = sm(0, 1, p);
                    var spinUp = 1 + contract * 3;

                    for (var i = 0; i < 60; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.12)';
                        ctx.fill();
                    }

                    for (var i = 0; i < dustMotes.length; i++) {
                        var m = dustMotes[i];
                        var a = m.angle + t * m.speed * spinUp;
                        var d = m.dist * minD * 0.45 * (1 - contract * 0.7);
                        var mx = cx + Math.cos(a) * d;
                        var my = cy + Math.sin(a) * d * (0.7 - contract * 0.2);
                        var mBright = m.bright * (0.04 + contract * 0.06);
                        ctx.beginPath();
                        ctx.arc(mx, my, m.size * (1 - contract * 0.3), 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + m.hue + ', ' + (30 + contract * 20) + '%, 50%, ' + mBright + ')';
                        ctx.fill();
                    }

                    // Core brightening
                    var coreGlow = contract * 0.1;
                    var cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, minD * 0.08);
                    cG.addColorStop(0, 'rgba(255, 200, 100, ' + coreGlow + ')');
                    cG.addColorStop(1, 'rgba(255, 150, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, minD * 0.08, 0, Math.PI * 2);
                    ctx.fillStyle = cG;
                    ctx.fill();
                }

                else if (ph.name === 'ignition') {
                    // Protostar ignites — flash and intense light
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    var flash = p < 0.3 ? p / 0.3 : 1;
                    var settle = sm(0.3, 1, p);

                    // Background stars dimmed by glare
                    for (var i = 0; i < 40; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, ' + (0.1 * (1 - flash * 0.5)) + ')';
                        ctx.fill();
                    }

                    // Remaining dust spiralling tightly
                    for (var i = 0; i < dustMotes.length; i += 2) {
                        var m = dustMotes[i];
                        var a = m.angle + t * m.speed * 4;
                        var d = m.dist * minD * (0.12 + settle * 0.15);
                        var mx = cx + Math.cos(a) * d;
                        var my = cy + Math.sin(a) * d * 0.3;
                        ctx.beginPath();
                        ctx.arc(mx, my, m.size * 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + m.hue + ', 50%, 55%, ' + (m.bright * 0.06) + ')';
                        ctx.fill();
                    }

                    // Bright star core
                    var coreR = minD * (0.03 + flash * 0.04 - settle * 0.02);
                    var coreOp = 0.15 + flash * 0.4 - settle * 0.2;
                    var cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
                    cG.addColorStop(0, 'rgba(255, 255, 240, ' + coreOp + ')');
                    cG.addColorStop(0.3, 'rgba(255, 220, 150, ' + (coreOp * 0.6) + ')');
                    cG.addColorStop(1, 'rgba(255, 150, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
                    ctx.fillStyle = cG;
                    ctx.fill();

                    // Initial flash
                    if (p < 0.15) {
                        var ff = 1 - p / 0.15;
                        ctx.fillStyle = 'rgba(255, 255, 230, ' + (ff * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'disc') {
                    // Spinning accretion disc with rocky debris
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    // Stars
                    for (var i = 0; i < 50; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.1)';
                        ctx.fill();
                    }

                    // Disc — elliptical ring of dust
                    var discSpread = sm(0, 0.4, p);
                    for (var i = 0; i < dustMotes.length; i++) {
                        var m = dustMotes[i];
                        var a = m.angle + t * m.speed * 3;
                        var d = (0.08 + m.dist * 0.35 * (0.5 + discSpread * 0.5)) * minD;
                        var mx = cx + Math.cos(a) * d;
                        var my = cy + Math.sin(a) * d * 0.2;
                        ctx.beginPath();
                        ctx.arc(mx, my, m.size * 0.6, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + m.hue + ', 40%, 50%, ' + (m.bright * 0.07) + ')';
                        ctx.fill();
                    }

                    // Central star
                    var cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, minD * 0.06);
                    cG.addColorStop(0, 'rgba(255, 255, 230, 0.35)');
                    cG.addColorStop(0.4, 'rgba(255, 220, 150, 0.15)');
                    cG.addColorStop(1, 'rgba(255, 150, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, minD * 0.06, 0, Math.PI * 2);
                    ctx.fillStyle = cG;
                    ctx.fill();

                    // Disc glow
                    ctx.save();
                    ctx.scale(1, 0.2);
                    var dG = ctx.createRadialGradient(cx, cy * 5, minD * 0.06, cx, cy * 5, minD * 0.4);
                    dG.addColorStop(0, 'rgba(255, 180, 80, 0.03)');
                    dG.addColorStop(0.5, 'rgba(200, 120, 50, 0.015)');
                    dG.addColorStop(1, 'rgba(150, 80, 30, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy * 5, minD * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = dG;
                    ctx.fill();
                    ctx.restore();
                }

                else if (ph.name === 'planets') {
                    // Planets coalescing and orbiting
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    for (var i = 0; i < 50; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.1)';
                        ctx.fill();
                    }

                    // Fading disc debris
                    var discFade = 1 - sm(0, 0.5, p);
                    for (var i = 0; i < dustMotes.length; i += 3) {
                        var m = dustMotes[i];
                        var a = m.angle + t * m.speed * 2;
                        var d = (0.08 + m.dist * 0.35) * minD;
                        var mx = cx + Math.cos(a) * d;
                        var my = cy + Math.sin(a) * d * 0.25;
                        ctx.beginPath();
                        ctx.arc(mx, my, m.size * 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + m.hue + ', 30%, 45%, ' + (m.bright * 0.03 * discFade) + ')';
                        ctx.fill();
                    }

                    // Star
                    var cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, minD * 0.05);
                    cG.addColorStop(0, 'rgba(255, 255, 230, 0.3)');
                    cG.addColorStop(0.5, 'rgba(255, 220, 150, 0.1)');
                    cG.addColorStop(1, 'rgba(255, 150, 50, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, minD * 0.05, 0, Math.PI * 2);
                    ctx.fillStyle = cG;
                    ctx.fill();

                    // Orbit lines and planets
                    var appear = sm(0, 0.4, p);
                    for (var i = 0; i < orbitPlanets.length; i++) {
                        var pl = orbitPlanets[i];
                        var od = pl.dist * minD * 0.5;
                        // Orbit path
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, od, od * 0.25, 0, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(100, 120, 150, 0.03)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();

                        var pa = pl.angle + t * pl.speed;
                        var px = cx + Math.cos(pa) * od;
                        var py = cy + Math.sin(pa) * od * 0.25;
                        var pSize = pl.size * appear;
                        ctx.beginPath();
                        ctx.arc(px, py, pSize, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + pl.hue + ', ' + pl.sat + '%, 45%, 0.4)';
                        ctx.fill();
                    }
                }

                else if (ph.name === 'cooling') {
                    // Zoom into one planet: molten surface cooling
                    var coolDown = sm(0, 1, p);
                    // Background: dark space with star
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    // Planet fills the view
                    var pR = minD * 0.4;
                    // Molten → cooling gradient
                    var hotR = Math.round(180 - coolDown * 140);
                    var hotG = Math.round(60 - coolDown * 30);
                    var hotB = Math.round(10 + coolDown * 30);
                    var pG = ctx.createRadialGradient(cx - pR * 0.2, cy - pR * 0.2, pR * 0.1, cx, cy, pR);
                    pG.addColorStop(0, 'rgb(' + hotR + ',' + hotG + ',' + hotB + ')');
                    pG.addColorStop(0.7, 'rgb(' + Math.round(hotR * 0.6) + ',' + Math.round(hotG * 0.6) + ',' + Math.round(hotB * 0.6) + ')');
                    pG.addColorStop(1, 'rgb(' + Math.round(hotR * 0.3) + ',' + Math.round(hotG * 0.3) + ',' + hotB + ')');
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR, 0, Math.PI * 2);
                    ctx.fillStyle = pG;
                    ctx.fill();

                    // Lava cracks fading
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR, 0, Math.PI * 2);
                    ctx.clip();
                    var crackOp = (1 - coolDown) * 0.15;
                    for (var i = 0; i < 15; i++) {
                        ctx.beginPath();
                        var lx = cx + Math.sin(i * 5.3) * pR * 0.7;
                        var ly = cy + Math.cos(i * 4.1) * pR * 0.7;
                        ctx.moveTo(lx, ly);
                        for (var s = 0; s < 4; s++) {
                            lx += Math.sin(i * 3 + s * 2.7) * 20;
                            ly += Math.cos(i * 2 + s * 3.1) * 20;
                            ctx.lineTo(lx, ly);
                        }
                        ctx.strokeStyle = 'rgba(255, 150, 30, ' + crackOp + ')';
                        ctx.lineWidth = 2 * (1 - coolDown);
                        ctx.stroke();
                    }
                    ctx.restore();

                    // Atmosphere forming
                    if (coolDown > 0.5) {
                        var atmosOp = (coolDown - 0.5) * 0.1;
                        var aG = ctx.createRadialGradient(cx, cy, pR * 0.9, cx, cy, pR * 1.1);
                        aG.addColorStop(0, 'rgba(100, 150, 200, 0)');
                        aG.addColorStop(0.5, 'rgba(100, 150, 200, ' + atmosOp + ')');
                        aG.addColorStop(1, 'rgba(100, 150, 200, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, pR * 1.1, 0, Math.PI * 2);
                        ctx.fillStyle = aG;
                        ctx.fill();
                    }
                }

                else if (ph.name === 'oceans') {
                    // First rain, oceans forming
                    var oceanRise = sm(0, 1, p);
                    ctx.fillStyle = '#020204';
                    ctx.fillRect(0, 0, w, h);

                    var pR = minD * 0.4;
                    // Planet surface now dark rock + blue water
                    var rockR = Math.round(40 + (1 - oceanRise) * 40);
                    var rockG = Math.round(30 + oceanRise * 20);
                    var rockB = Math.round(40 + oceanRise * 60);
                    var pG = ctx.createRadialGradient(cx - pR * 0.2, cy - pR * 0.2, pR * 0.1, cx, cy, pR);
                    pG.addColorStop(0, 'rgb(' + rockR + ',' + rockG + ',' + rockB + ')');
                    pG.addColorStop(1, 'rgb(' + Math.round(rockR * 0.5) + ',' + Math.round(rockG * 0.5) + ',' + Math.round(rockB * 0.5) + ')');
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR, 0, Math.PI * 2);
                    ctx.fillStyle = pG;
                    ctx.fill();

                    // Ocean patches forming
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR, 0, Math.PI * 2);
                    ctx.clip();
                    for (var i = 0; i < 8; i++) {
                        var ox = cx + Math.sin(i * 4.7 + 0.5) * pR * 0.5;
                        var oy = cy + Math.cos(i * 3.3 + 1.2) * pR * 0.5;
                        var oSize = (15 + Math.sin(i * 2.9) * 10) * oceanRise;
                        ctx.beginPath();
                        ctx.ellipse(ox, oy, oSize, oSize * 0.7, Math.sin(i) * 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(30, 80, 140, ' + (oceanRise * 0.12) + ')';
                        ctx.fill();
                    }

                    // Rain streaks (early phase)
                    if (p < 0.6) {
                        var rainOp = (1 - p / 0.6) * 0.04;
                        for (var i = 0; i < 30; i++) {
                            var rx = cx + (Math.sin(i * 6.7 + t * 0.1) - 0.5) * pR * 1.5;
                            var ry = cy + (Math.cos(i * 4.3 + t * 0.15) - 0.5) * pR * 1.5;
                            ctx.beginPath();
                            ctx.moveTo(rx, ry);
                            ctx.lineTo(rx + 1, ry + 6);
                            ctx.strokeStyle = 'rgba(150, 200, 230, ' + rainOp + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                    ctx.restore();

                    // Atmosphere
                    var aG = ctx.createRadialGradient(cx, cy, pR * 0.9, cx, cy, pR * 1.12);
                    aG.addColorStop(0, 'rgba(80, 140, 200, 0)');
                    aG.addColorStop(0.5, 'rgba(80, 140, 200, ' + (0.06 + oceanRise * 0.04) + ')');
                    aG.addColorStop(1, 'rgba(80, 140, 200, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR * 1.12, 0, Math.PI * 2);
                    ctx.fillStyle = aG;
                    ctx.fill();

                    // Cloud wisps
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cx, cy, pR, 0, Math.PI * 2);
                    ctx.clip();
                    for (var i = 0; i < 6; i++) {
                        var ca = t * 0.04 + i * Math.PI / 3;
                        var ccx = cx + Math.cos(ca) * pR * 0.4;
                        var ccy = cy + Math.sin(ca) * pR * 0.3;
                        ctx.beginPath();
                        ctx.ellipse(ccx, ccy, 25, 6, ca, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 220, 240, ' + (oceanRise * 0.04) + ')';
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
        };
    })();

    // --- Spelunker theme ---
    // Cave expedition: forest → cave mouth → stalactites → crystal cavern → river → waterfall → underwater → daylight
    themes.spelunker = (function () {
        var PHASES = [
            { name: 'forest', duration: 5 },
            { name: 'entrance', duration: 5 },
            { name: 'stalactites', duration: 6 },
            { name: 'crystal', duration: 7 },
            { name: 'river', duration: 6 },
            { name: 'waterfall', duration: 5 },
            { name: 'underwater', duration: 5 },
            { name: 'emerge', duration: 5 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        // Crystal configs
        var crystals = [];
        for (var i = 0; i < 25; i++) {
            crystals.push({
                x: Math.random(), y: 0.2 + Math.random() * 0.6,
                angle: -Math.PI * 0.3 + Math.random() * Math.PI * 0.6,
                len: 20 + Math.random() * 40,
                width: 3 + Math.random() * 6,
                hue: 180 + Math.random() * 80,
                bright: 0.3 + Math.random() * 0.5
            });
        }

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'forest', progress: 0, time: 0 };
        }
        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }

        function drawStalactites(ctx, w, h, t, op) {
            for (var i = 0; i < 15; i++) {
                var sx = (Math.sin(i * 5.7 + 0.3) * 0.5 + 0.5) * w;
                var sLen = 30 + Math.sin(i * 3.1) * 20;
                var drip = Math.sin(t * 0.5 + i * 2.3) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.moveTo(sx - 4, 0);
                ctx.lineTo(sx, sLen);
                ctx.lineTo(sx + 4, 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(120, 110, 90, ' + op + ')';
                ctx.fill();
                // Drip
                if (drip > 0.8) {
                    var dy = sLen + (drip - 0.8) * 100;
                    ctx.beginPath();
                    ctx.arc(sx, dy, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(150, 180, 200, ' + (op * 0.5) + ')';
                    ctx.fill();
                }
            }
            // Stalagmites from below
            for (var i = 0; i < 10; i++) {
                var mx = (Math.sin(i * 4.3 + 1.7) * 0.5 + 0.5) * w;
                var mLen = 15 + Math.sin(i * 2.9) * 10;
                ctx.beginPath();
                ctx.moveTo(mx - 5, h);
                ctx.lineTo(mx, h - mLen);
                ctx.lineTo(mx + 5, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(100, 95, 75, ' + op + ')';
                ctx.fill();
            }
        }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {},

            drawBackground: function (ctx, w, h) {
                ctx.fillStyle = '#0a0a08';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;

                if (ph.name === 'forest') {
                    // Forest clearing with dark cave mouth ahead
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#1a3020');
                    skyG.addColorStop(1, '#2a5030');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Forest canopy
                    var groundG = ctx.createLinearGradient(0, h * 0.5, 0, h);
                    groundG.addColorStop(0, '#1a3518');
                    groundG.addColorStop(1, '#0a1a0a');
                    ctx.fillStyle = groundG;
                    ctx.fillRect(0, h * 0.5, w, h * 0.5);

                    // Tree trunks
                    for (var i = 0; i < 8; i++) {
                        var tx = w * (0.05 + i * 0.13) + Math.sin(i * 3.7) * 15;
                        var tw = 6 + Math.sin(i * 2.3) * 3;
                        ctx.fillStyle = 'rgba(40, 30, 20, 0.15)';
                        ctx.fillRect(tx - tw / 2, h * 0.2, tw, h * 0.8);
                        // Foliage
                        ctx.beginPath();
                        ctx.arc(tx, h * 0.25 + Math.sin(i * 4.1) * 15, 20 + Math.sin(i * 2.7) * 10, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(30, 60, 25, 0.1)';
                        ctx.fill();
                    }

                    // Cave mouth — dark opening in the centre
                    var caveW = w * 0.25 + sm(0.5, 1, p) * w * 0.15;
                    var caveH = h * 0.4 + sm(0.5, 1, p) * h * 0.1;
                    ctx.beginPath();
                    ctx.ellipse(cx, h * 0.6, caveW, caveH, 0, 0, Math.PI * 2);
                    ctx.fillStyle = '#050505';
                    ctx.fill();

                    // Light filtering through trees
                    for (var i = 0; i < 4; i++) {
                        var lx = w * (0.2 + i * 0.2);
                        ctx.beginPath();
                        ctx.moveTo(lx - 5, 0); ctx.lineTo(lx + 5, 0);
                        ctx.lineTo(lx + 20, h * 0.6); ctx.lineTo(lx - 10, h * 0.6);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(150, 200, 100, 0.015)';
                        ctx.fill();
                    }

                    // Darken as we approach
                    if (p > 0.6) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.6) / 0.4 * 0.7) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'entrance') {
                    // Entering cave, daylight shrinking behind
                    var dark = sm(0, 1, p);
                    ctx.fillStyle = '#060604';
                    ctx.fillRect(0, 0, w, h);

                    // Daylight opening behind us (shrinking oval of light)
                    var lightR = (1 - dark) * Math.min(w, h) * 0.35;
                    if (lightR > 5) {
                        var lG = ctx.createRadialGradient(cx, cy, 0, cx, cy, lightR);
                        lG.addColorStop(0, 'rgba(180, 200, 160, ' + (0.15 * (1 - dark)) + ')');
                        lG.addColorStop(0.5, 'rgba(100, 130, 80, ' + (0.05 * (1 - dark)) + ')');
                        lG.addColorStop(1, 'rgba(50, 60, 40, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, lightR, 0, Math.PI * 2);
                        ctx.fillStyle = lG;
                        ctx.fill();
                    }

                    // Rough cave walls hinted
                    ctx.strokeStyle = 'rgba(80, 70, 55, ' + (0.03 + dark * 0.02) + ')';
                    ctx.lineWidth = 2;
                    for (var side = -1; side <= 1; side += 2) {
                        ctx.beginPath();
                        for (var y = 0; y <= h; y += 4) {
                            var wx = (side === -1 ? w * 0.1 : w * 0.9) + Math.sin(y * 0.02 + t * 0.1) * 15 * side;
                            if (y === 0) ctx.moveTo(wx, y); else ctx.lineTo(wx, y);
                        }
                        ctx.stroke();
                    }

                    // Faint headlamp cone
                    var lampG = ctx.createRadialGradient(cx, cy, 0, cx, cy * 0.6, h * 0.6);
                    lampG.addColorStop(0, 'rgba(255, 240, 200, ' + (dark * 0.04) + ')');
                    lampG.addColorStop(1, 'rgba(255, 220, 150, 0)');
                    ctx.fillStyle = lampG;
                    ctx.fillRect(0, 0, w, h);
                }

                else if (ph.name === 'stalactites') {
                    // Narrow passage with formations
                    ctx.fillStyle = '#080806';
                    ctx.fillRect(0, 0, w, h);

                    // Headlamp light
                    var lampG = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy * 0.7, h * 0.5);
                    lampG.addColorStop(0, 'rgba(255, 240, 200, 0.05)');
                    lampG.addColorStop(1, 'rgba(255, 220, 150, 0)');
                    ctx.fillStyle = lampG;
                    ctx.fillRect(0, 0, w, h);

                    // Scrolling stalactites and stalagmites
                    ctx.save();
                    ctx.translate(0, -(ph.time * 15) % 60);
                    drawStalactites(ctx, w, h + 60, t, 0.12);
                    ctx.restore();

                    // Dripping water sounds (visual: drops)
                    for (var i = 0; i < 8; i++) {
                        var dx = (Math.sin(i * 6.7 + 0.3) * 0.5 + 0.5) * w;
                        var dy = (t * 40 + i * h * 0.15) % h;
                        ctx.beginPath();
                        ctx.arc(dx, dy, 1, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(150, 180, 200, 0.06)';
                        ctx.fill();
                    }

                    // Cave walls narrowing and widening
                    var wallOp = 0.2;
                    for (var side = -1; side <= 1; side += 2) {
                        ctx.beginPath();
                        ctx.moveTo(side === -1 ? 0 : w, 0);
                        for (var y = 0; y <= h; y += 3) {
                            var offset = w * (0.15 + Math.sin(y * 0.01 + ph.time * 0.3) * 0.05);
                            var wx = side === -1 ? offset : w - offset;
                            ctx.lineTo(wx, y);
                        }
                        ctx.lineTo(side === -1 ? 0 : w, h);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(50, 45, 35, ' + wallOp + ')';
                        ctx.fill();
                    }
                }

                else if (ph.name === 'crystal') {
                    // Vast crystal cavern glittering
                    ctx.fillStyle = '#060810';
                    ctx.fillRect(0, 0, w, h);

                    // Ambient glow from crystals
                    var ambG = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
                    ambG.addColorStop(0, 'rgba(100, 160, 200, 0.03)');
                    ambG.addColorStop(1, 'rgba(60, 100, 140, 0)');
                    ctx.fillStyle = ambG;
                    ctx.fillRect(0, 0, w, h);

                    // Crystal formations
                    for (var i = 0; i < crystals.length; i++) {
                        var c = crystals[i];
                        var cxp = c.x * w, cyp = c.y * h;
                        var shimmer = Math.sin(t * 1.5 + i * 2.7) * 0.5 + 0.5;
                        var op = c.bright * (0.06 + shimmer * 0.08);

                        ctx.save();
                        ctx.translate(cxp, cyp);
                        ctx.rotate(c.angle);
                        // Crystal body
                        ctx.beginPath();
                        ctx.moveTo(-c.width / 2, 0);
                        ctx.lineTo(0, -c.len);
                        ctx.lineTo(c.width / 2, 0);
                        ctx.closePath();
                        ctx.fillStyle = 'hsla(' + c.hue + ', 50%, 60%, ' + op + ')';
                        ctx.fill();
                        // Bright edge
                        ctx.beginPath();
                        ctx.moveTo(-c.width / 2, 0);
                        ctx.lineTo(0, -c.len);
                        ctx.strokeStyle = 'hsla(' + c.hue + ', 60%, 75%, ' + (op * 0.8) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.restore();

                        // Sparkle at tip
                        if (shimmer > 0.8) {
                            var sparkX = cxp + Math.cos(c.angle - Math.PI / 2) * c.len;
                            var sparkY = cyp + Math.sin(c.angle - Math.PI / 2) * c.len;
                            var spG = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, 8);
                            spG.addColorStop(0, 'hsla(' + c.hue + ', 70%, 80%, ' + ((shimmer - 0.8) * 0.5) + ')');
                            spG.addColorStop(1, 'hsla(' + c.hue + ', 70%, 60%, 0)');
                            ctx.beginPath();
                            ctx.arc(sparkX, sparkY, 8, 0, Math.PI * 2);
                            ctx.fillStyle = spG;
                            ctx.fill();
                        }
                    }

                    // Cave ceiling and floor
                    ctx.fillStyle = 'rgba(30, 28, 35, 0.25)';
                    ctx.fillRect(0, 0, w, h * 0.05);
                    ctx.fillRect(0, h * 0.95, w, h * 0.05);
                }

                else if (ph.name === 'river') {
                    // Underground river carrying us forward
                    ctx.fillStyle = '#060808';
                    ctx.fillRect(0, 0, w, h);

                    // Water surface
                    var waterY = h * 0.55;
                    var waterG = ctx.createLinearGradient(0, waterY, 0, h);
                    waterG.addColorStop(0, 'rgba(20, 50, 60, 0.4)');
                    waterG.addColorStop(1, 'rgba(10, 30, 40, 0.5)');
                    ctx.fillStyle = waterG;
                    ctx.fillRect(0, waterY, w, h - waterY);

                    // Water flow lines
                    for (var i = 0; i < 12; i++) {
                        var wy = waterY + 5 + i * ((h - waterY) / 12);
                        ctx.beginPath();
                        for (var x = 0; x <= w; x += 4) {
                            var yOff = Math.sin(x * 0.01 + t * 1.5 + i * 0.7) * 3;
                            if (x === 0) ctx.moveTo(x, wy + yOff); else ctx.lineTo(x, wy + yOff);
                        }
                        ctx.strokeStyle = 'rgba(80, 130, 150, 0.03)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Cave ceiling with rough texture
                    var ceilG = ctx.createLinearGradient(0, 0, 0, h * 0.3);
                    ceilG.addColorStop(0, 'rgba(40, 35, 30, 0.4)');
                    ceilG.addColorStop(1, 'rgba(30, 25, 20, 0)');
                    ctx.fillStyle = ceilG;
                    ctx.fillRect(0, 0, w, h * 0.3);

                    // Reflected light on ceiling from water
                    for (var i = 0; i < 10; i++) {
                        var rx = (Math.sin(i * 5.3 + t * 0.4) * 0.5 + 0.5) * w;
                        var ry = h * 0.1 + Math.sin(i * 3.7 + t * 0.6) * h * 0.08;
                        var rSize = 15 + Math.sin(t * 0.8 + i * 2) * 8;
                        ctx.beginPath();
                        ctx.ellipse(rx, ry, rSize, rSize * 0.3, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(60, 120, 140, 0.015)';
                        ctx.fill();
                    }

                    // Passage ahead getting brighter (approaching waterfall)
                    if (p > 0.6) {
                        var ahead = (p - 0.6) / 0.4;
                        var aG = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.3);
                        aG.addColorStop(0, 'rgba(180, 200, 220, ' + (ahead * 0.05) + ')');
                        aG.addColorStop(1, 'rgba(100, 140, 160, 0)');
                        ctx.fillStyle = aG;
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'waterfall') {
                    // Plunging down a waterfall in a cathedral chamber
                    ctx.fillStyle = '#080a0c';
                    ctx.fillRect(0, 0, w, h);

                    // Vast chamber walls
                    for (var side = -1; side <= 1; side += 2) {
                        var wallX = side === -1 ? w * 0.05 : w * 0.95;
                        ctx.beginPath();
                        for (var y = 0; y <= h; y += 3) {
                            ctx.lineTo(wallX + Math.sin(y * 0.015 + 0.5) * 10 * side, y);
                        }
                        ctx.strokeStyle = 'rgba(70, 65, 55, 0.06)';
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }

                    // Waterfall streams
                    for (var i = 0; i < 6; i++) {
                        var fx = cx + (i - 2.5) * 20;
                        ctx.beginPath();
                        for (var y = 0; y <= h; y += 3) {
                            var wobble = Math.sin(y * 0.02 + t * 3 + i * 1.5) * (3 + y * 0.005);
                            if (y === 0) ctx.moveTo(fx + wobble, y); else ctx.lineTo(fx + wobble, y);
                        }
                        ctx.strokeStyle = 'rgba(160, 200, 220, 0.04)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    // Mist/spray
                    for (var i = 0; i < 15; i++) {
                        var mx = cx + (Math.sin(i * 4.7 + t * 0.5) - 0.5) * w * 0.4;
                        var my = (t * 60 + i * h * 0.08) % h;
                        var mSize = 15 + Math.sin(i * 2.9 + t) * 8;
                        ctx.beginPath();
                        ctx.arc(mx, my, mSize, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(180, 210, 230, 0.012)';
                        ctx.fill();
                    }

                    // Pool glow at bottom
                    var poolG = ctx.createRadialGradient(cx, h, 0, cx, h, h * 0.3);
                    poolG.addColorStop(0, 'rgba(80, 150, 180, 0.06)');
                    poolG.addColorStop(1, 'rgba(40, 80, 100, 0)');
                    ctx.fillStyle = poolG;
                    ctx.fillRect(0, h * 0.7, w, h * 0.3);
                }

                else if (ph.name === 'underwater') {
                    // Underwater passage with filtered light
                    var lightUp = sm(0, 1, p);
                    var wG = ctx.createLinearGradient(0, 0, 0, h);
                    var tBright = Math.round(15 + lightUp * 15);
                    wG.addColorStop(0, 'rgb(8,' + tBright + ',' + Math.round(tBright * 1.3) + ')');
                    wG.addColorStop(1, 'rgb(5,' + Math.round(tBright * 0.7) + ',' + Math.round(tBright * 1.1) + ')');
                    ctx.fillStyle = wG;
                    ctx.fillRect(0, 0, w, h);

                    // Light rays from ahead
                    var rayOp = lightUp * 0.03;
                    for (var i = 0; i < 5; i++) {
                        var rx = cx + (i - 2) * w * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(rx - 8, 0); ctx.lineTo(rx + 8, 0);
                        ctx.lineTo(rx + 25, h); ctx.lineTo(rx - 15, h);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(100, 200, 220, ' + rayOp + ')';
                        ctx.fill();
                    }

                    // Bubbles
                    for (var i = 0; i < 15; i++) {
                        var bx = (Math.sin(i * 5.3 + t * 0.1) * 0.5 + 0.5) * w;
                        var by = h - ((t * 30 + i * h * 0.08) % (h * 1.1));
                        ctx.beginPath();
                        ctx.arc(bx + Math.sin(t + i * 2) * 5, by, 1.5 + Math.sin(i * 2.7) * 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(180, 220, 240, 0.06)';
                        ctx.fill();
                    }

                    // Rock passage edges
                    for (var side = -1; side <= 1; side += 2) {
                        ctx.beginPath();
                        var baseX = side === -1 ? w * 0.15 : w * 0.85;
                        for (var y = 0; y <= h; y += 3) {
                            ctx.lineTo(baseX + Math.sin(y * 0.015 + 1.3) * 15 * side, y);
                        }
                        ctx.lineTo(side === -1 ? 0 : w, h);
                        ctx.lineTo(side === -1 ? 0 : w, 0);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(20, 25, 22, 0.3)';
                        ctx.fill();
                    }

                    // Bright exit ahead
                    if (p > 0.7) {
                        var exitGlow = (p - 0.7) / 0.3;
                        ctx.fillStyle = 'rgba(200, 230, 240, ' + (exitGlow * 0.15) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'emerge') {
                    // Bursting out of cliffside into bright daylight
                    var bright = sm(0, 0.5, p);
                    var settle = sm(0.5, 1, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    var skyBright = Math.round(30 + bright * 60);
                    skyG.addColorStop(0, 'rgb(' + Math.round(skyBright * 0.4) + ',' + Math.round(skyBright * 0.7) + ',' + skyBright + ')');
                    skyG.addColorStop(0.6, 'rgb(' + Math.round(skyBright * 0.5) + ',' + Math.round(skyBright * 0.8) + ',' + Math.round(skyBright * 1.1) + ')');
                    skyG.addColorStop(1, 'rgb(' + Math.round(skyBright * 0.3) + ',' + Math.round(skyBright * 0.5) + ',' + Math.round(skyBright * 0.3) + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Cliff face receding
                    var cliffFade = 1 - bright;
                    if (cliffFade > 0.05) {
                        for (var side = -1; side <= 1; side += 2) {
                            var edgeX = side === -1 ? w * (0.3 - bright * 0.3) : w * (0.7 + bright * 0.3);
                            ctx.beginPath();
                            for (var y = 0; y <= h; y += 3) {
                                ctx.lineTo(edgeX + Math.sin(y * 0.02 + 0.7) * 10 * side, y);
                            }
                            ctx.lineTo(side === -1 ? 0 : w, h);
                            ctx.lineTo(side === -1 ? 0 : w, 0);
                            ctx.closePath();
                            ctx.fillStyle = 'rgba(60, 55, 45, ' + (cliffFade * 0.3) + ')';
                            ctx.fill();
                        }
                    }

                    // Waterfall pouring out of the cliff
                    if (cliffFade > 0.1) {
                        for (var i = 0; i < 3; i++) {
                            ctx.beginPath();
                            var fx = cx + (i - 1) * 15;
                            for (var y = h * 0.4; y <= h; y += 3) {
                                ctx.lineTo(fx + Math.sin(y * 0.03 + t * 2 + i) * 4, y);
                            }
                            ctx.strokeStyle = 'rgba(180, 210, 230, ' + (cliffFade * 0.04) + ')';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    }

                    // Sun
                    var sunX = w * 0.65, sunY = h * 0.2;
                    var sG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
                    sG.addColorStop(0, 'rgba(255, 250, 220, ' + (bright * 0.2) + ')');
                    sG.addColorStop(1, 'rgba(255, 200, 100, 0)');
                    ctx.fillStyle = sG;
                    ctx.fillRect(0, 0, w, h);

                    // Valley/landscape in the distance
                    if (bright > 0.3) {
                        var viewOp = (bright - 0.3) / 0.7;
                        // Distant hills
                        ctx.beginPath();
                        ctx.moveTo(0, h);
                        for (var x = 0; x <= w; x += 5) {
                            var hy = h * 0.7 + Math.sin(x * 0.005 + 0.5) * 30 + Math.sin(x * 0.012 + 2) * 15;
                            ctx.lineTo(x, hy);
                        }
                        ctx.lineTo(w, h);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(40, 70, 35, ' + (viewOp * 0.15) + ')';
                        ctx.fill();
                    }

                    // Fade to dark at end (loop to forest)
                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.5) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();
})(window.CV.themes, window.CV.FALLBACK_DT);
