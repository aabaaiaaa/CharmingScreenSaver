(function (themes, FALLBACK_DT) {
    // --- Freefall theme ---
    // Orbital skydive: orbit → leap → entry → stratosphere → clouds → parachute → drift → land
    themes.freefall = (function () {
        var PHASES = [
            { name: 'orbit', duration: 5 },
            { name: 'leap', duration: 4 },
            { name: 'entry', duration: 5 },
            { name: 'strato', duration: 6 },
            { name: 'clouds', duration: 5 },
            { name: 'chute', duration: 4 },
            { name: 'drift', duration: 7 },
            { name: 'land', duration: 4 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'orbit', progress: 0, time: 0 };
        }
        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }

        function drawEarthCurve(ctx, w, h, curveY, colors) {
            ctx.beginPath();
            ctx.moveTo(-w * 0.3, h + 50);
            ctx.quadraticCurveTo(w * 0.5, curveY, w * 1.3, h + 50);
            ctx.closePath();
            var eG = ctx.createLinearGradient(0, curveY, 0, h + 50);
            eG.addColorStop(0, colors[0]);
            eG.addColorStop(0.4, colors[1]);
            eG.addColorStop(1, colors[2]);
            ctx.fillStyle = eG;
            ctx.fill();
        }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {},

            drawBackground: function (ctx, w, h) {
                ctx.fillStyle = '#020206';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;

                if (ph.name === 'orbit') {
                    // Floating in orbit: stars, Earth below
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    for (var i = 0; i < 100; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.7;
                        var tw = Math.sin(t * 0.5 + i * 2.3) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4 + tw * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 230, 255, ' + (0.1 + tw * 0.15) + ')';
                        ctx.fill();
                    }

                    // Earth's curved limb at bottom
                    var curveY = h * 0.75;
                    drawEarthCurve(ctx, w, h, curveY, ['#1a4080', '#0a2850', '#061830']);

                    // Atmosphere glow
                    var aG = ctx.createLinearGradient(0, curveY - 15, 0, curveY + 5);
                    aG.addColorStop(0, 'rgba(100, 180, 255, 0)');
                    aG.addColorStop(0.5, 'rgba(100, 180, 255, 0.08)');
                    aG.addColorStop(1, 'rgba(100, 180, 255, 0)');
                    ctx.fillStyle = aG;
                    ctx.fillRect(0, curveY - 15, w, 20);

                    // Station hint (small structure)
                    var stX = w * 0.7, stY = h * 0.35;
                    ctx.strokeStyle = 'rgba(200, 210, 220, 0.08)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(stX - 8, stY - 3, 16, 6);
                    ctx.beginPath();
                    ctx.moveTo(stX - 20, stY); ctx.lineTo(stX + 20, stY);
                    ctx.stroke();
                }

                else if (ph.name === 'leap') {
                    // Leaping into void, station receding
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);

                    for (var i = 0; i < 80; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 230, 255, 0.12)';
                        ctx.fill();
                    }

                    // Earth growing below
                    var curveY = h * (0.75 - p * 0.2);
                    drawEarthCurve(ctx, w, h, curveY, ['#1a4080', '#0a2850', '#061830']);

                    // Atmosphere
                    var aG = ctx.createLinearGradient(0, curveY - 15, 0, curveY + 5);
                    aG.addColorStop(0, 'rgba(100, 180, 255, 0)');
                    aG.addColorStop(0.5, 'rgba(100, 180, 255, 0.1)');
                    aG.addColorStop(1, 'rgba(100, 180, 255, 0)');
                    ctx.fillStyle = aG;
                    ctx.fillRect(0, curveY - 15, w, 20);

                    // Station shrinking above
                    var stScale = 1 - p;
                    var stX = cx + p * w * 0.2, stY = h * 0.2 - p * h * 0.1;
                    ctx.strokeStyle = 'rgba(200, 210, 220, ' + (stScale * 0.06) + ')';
                    ctx.lineWidth = stScale;
                    ctx.strokeRect(stX - 6 * stScale, stY - 2 * stScale, 12 * stScale, 4 * stScale);
                }

                else if (ph.name === 'entry') {
                    // Atmospheric entry with orange heat shimmer
                    var heat = p < 0.6 ? p / 0.6 : 1 - (p - 0.6) / 0.4;
                    var skyDark = sm(0, 1, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, '#020206');
                    skyG.addColorStop(0.5, 'rgb(' + Math.round(2 + skyDark * 5) + ',' + Math.round(2 + skyDark * 10) + ',' + Math.round(6 + skyDark * 25) + ')');
                    skyG.addColorStop(1, 'rgb(' + Math.round(5 + skyDark * 15) + ',' + Math.round(5 + skyDark * 25) + ',' + Math.round(10 + skyDark * 50) + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Stars fading
                    var starFade = 1 - skyDark;
                    for (var i = 0; i < 50; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.5;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(220, 230, 255, ' + (starFade * 0.1) + ')';
                        ctx.fill();
                    }

                    // Heat shimmer
                    if (heat > 0.1) {
                        // Orange-red glow from edges
                        var hG = ctx.createRadialGradient(cx, cy * 0.5, 0, cx, cy * 0.5, Math.max(w, h) * 0.6);
                        hG.addColorStop(0, 'rgba(255, 150, 50, 0)');
                        hG.addColorStop(0.7, 'rgba(255, 100, 30, ' + (heat * 0.06) + ')');
                        hG.addColorStop(1, 'rgba(255, 60, 10, ' + (heat * 0.1) + ')');
                        ctx.fillStyle = hG;
                        ctx.fillRect(0, 0, w, h);

                        // Streaks of plasma
                        for (var i = 0; i < 8; i++) {
                            var sx = (Math.sin(i * 4.3 + t * 0.5) * 0.5 + 0.5) * w;
                            ctx.beginPath();
                            ctx.moveTo(sx, 0);
                            ctx.lineTo(sx + Math.sin(i * 2.7) * 20, h);
                            ctx.strokeStyle = 'rgba(255, 180, 80, ' + (heat * 0.03) + ')';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    }
                }

                else if (ph.name === 'strato') {
                    // Freefall through stratosphere, bright blue sky
                    var skyBright = sm(0, 0.5, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    var topB = Math.round(30 + skyBright * 80);
                    skyG.addColorStop(0, 'rgb(' + Math.round(topB * 0.15) + ',' + Math.round(topB * 0.4) + ',' + topB + ')');
                    skyG.addColorStop(1, 'rgb(' + Math.round(topB * 0.3) + ',' + Math.round(topB * 0.6) + ',' + Math.round(topB * 1.2) + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Wind streaks rushing upward (we're falling)
                    for (var i = 0; i < 12; i++) {
                        var wx = (Math.sin(i * 5.7 + t * 0.1) * 0.5 + 0.5) * w;
                        var wy = h - ((ph.time * 200 + i * h * 0.1) % (h * 1.3)) + h * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(wx, wy);
                        ctx.lineTo(wx + (Math.random() - 0.5) * 4, wy - 30 - Math.sin(i * 3.1) * 20);
                        ctx.strokeStyle = 'rgba(200, 220, 240, 0.04)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Faint stars still visible at top
                    if (skyBright < 0.5) {
                        for (var i = 0; i < 20; i++) {
                            var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                            var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.3;
                            ctx.beginPath();
                            ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 255, 255, ' + ((1 - skyBright * 2) * 0.08) + ')';
                            ctx.fill();
                        }
                    }

                    // Earth below getting more detailed
                    if (p > 0.5) {
                        var landVis = (p - 0.5) / 0.5;
                        var landG = ctx.createLinearGradient(0, h * 0.85, 0, h);
                        landG.addColorStop(0, 'rgba(60, 120, 60, 0)');
                        landG.addColorStop(1, 'rgba(60, 120, 60, ' + (landVis * 0.06) + ')');
                        ctx.fillStyle = landG;
                        ctx.fillRect(0, h * 0.85, w, h * 0.15);
                    }
                }

                else if (ph.name === 'clouds') {
                    // Clouds rushing upward past us
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, '#3070b0');
                    skyG.addColorStop(1, '#4890d0');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Cloud layers rushing up
                    for (var i = 0; i < 12; i++) {
                        var cloudX = (Math.sin(i * 4.7 + 1.3) * 0.5 + 0.5) * w;
                        var cloudY = h - ((ph.time * 120 + i * h * 0.12) % (h * 1.4)) + h * 0.2;
                        var cloudW = 60 + Math.sin(i * 3.1) * 35;
                        var cloudH = 15 + Math.sin(i * 2.3) * 8;

                        // Cloud puff (multiple ellipses)
                        for (var j = 0; j < 3; j++) {
                            ctx.beginPath();
                            ctx.ellipse(cloudX + (j - 1) * cloudW * 0.3, cloudY + Math.sin(j * 2 + i) * 3, cloudW * 0.5, cloudH, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(240, 245, 255, 0.06)';
                            ctx.fill();
                        }
                    }

                    // Ground visible below
                    var groundVis = sm(0.3, 1, p);
                    if (groundVis > 0) {
                        var gG = ctx.createLinearGradient(0, h * 0.8, 0, h);
                        gG.addColorStop(0, 'rgba(50, 100, 50, 0)');
                        gG.addColorStop(1, 'rgba(50, 100, 50, ' + (groundVis * 0.1) + ')');
                        ctx.fillStyle = gG;
                        ctx.fillRect(0, h * 0.8, w, h * 0.2);
                    }
                }

                else if (ph.name === 'chute') {
                    // Parachute jolt — everything slows dramatically
                    var jolt = p < 0.2 ? p / 0.2 : 1;
                    var slow = sm(0, 0.3, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, '#4088c0');
                    skyG.addColorStop(1, '#60a0d0');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Parachute canopy above
                    var chuteY = h * 0.15;
                    var chuteW = w * 0.25;
                    // Canopy arc
                    ctx.beginPath();
                    ctx.ellipse(cx, chuteY, chuteW, chuteW * 0.4, 0, Math.PI, 0);
                    ctx.fillStyle = 'rgba(220, 60, 30, 0.08)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(220, 60, 30, 0.06)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    // Lines from canopy
                    for (var i = 0; i < 5; i++) {
                        var lx = cx + (i - 2) * chuteW * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(lx, chuteY);
                        ctx.lineTo(cx + (i - 2) * 5, h * 0.45);
                        ctx.strokeStyle = 'rgba(180, 180, 180, 0.04)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }

                    // Gentle wind
                    for (var i = 0; i < 6; i++) {
                        var wy = h - ((ph.time * 30 + i * h * 0.2) % (h * 1.2));
                        var wx = (Math.sin(i * 4.3 + t * 0.1) * 0.5 + 0.5) * w;
                        ctx.beginPath();
                        ctx.moveTo(wx, wy);
                        ctx.lineTo(wx + 2, wy - 10);
                        ctx.strokeStyle = 'rgba(200, 220, 240, 0.03)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }

                    // Ground getting closer
                    var groundRise = sm(0, 1, p);
                    var gY = h * (0.9 - groundRise * 0.2);
                    ctx.beginPath();
                    ctx.moveTo(0, h); ctx.lineTo(0, gY);
                    for (var x = 0; x <= w; x += 5) {
                        ctx.lineTo(x, gY + Math.sin(x * 0.01 + 0.5) * 5);
                    }
                    ctx.lineTo(w, h); ctx.closePath();
                    ctx.fillStyle = 'rgba(70, 120, 50, ' + (0.05 + groundRise * 0.1) + ')';
                    ctx.fill();

                    // Jolt flash
                    if (p < 0.1) {
                        ctx.fillStyle = 'rgba(255, 255, 255, ' + ((1 - p / 0.1) * 0.1) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'drift') {
                    // Gentle drift over patchwork fields
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#5098d0');
                    skyG.addColorStop(1, '#70b0e0');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Parachute above (gentle sway)
                    var sway = Math.sin(t * 0.5) * 10;
                    var chuteY = h * 0.1;
                    var chuteW = w * 0.2;
                    ctx.beginPath();
                    ctx.ellipse(cx + sway, chuteY, chuteW, chuteW * 0.35, 0, Math.PI, 0);
                    ctx.fillStyle = 'rgba(220, 60, 30, 0.06)';
                    ctx.fill();
                    for (var i = 0; i < 4; i++) {
                        ctx.beginPath();
                        ctx.moveTo(cx + sway + (i - 1.5) * chuteW * 0.4, chuteY);
                        ctx.lineTo(cx + (i - 1.5) * 4, h * 0.4);
                        ctx.strokeStyle = 'rgba(180, 180, 180, 0.03)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }

                    // Ground with patchwork fields
                    var groundY = h * (0.65 - p * 0.15);
                    // Fields
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, groundY, w, h - groundY);
                    ctx.clip();
                    var fieldScroll = t * 10;
                    for (var i = 0; i < 20; i++) {
                        var fx = ((Math.sin(i * 5.3) * 0.5 + 0.5) * w * 1.5 - fieldScroll * 0.5 + i * 30) % (w * 1.4) - w * 0.2;
                        var fy = groundY + (Math.sin(i * 3.7) * 0.5 + 0.5) * (h - groundY) * 0.8;
                        var fw = 40 + Math.sin(i * 2.9) * 20;
                        var hues = [90, 100, 60, 110, 80, 45];
                        ctx.fillStyle = 'hsla(' + hues[i % hues.length] + ', 30%, 35%, 0.08)';
                        ctx.fillRect(fx, fy, fw, fw * 0.6);
                    }
                    // River
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 4) {
                        var ry = groundY + (h - groundY) * 0.5 + Math.sin(x * 0.01 + 1.5) * 20;
                        if (x === 0) ctx.moveTo(x, ry); else ctx.lineTo(x, ry);
                    }
                    ctx.strokeStyle = 'rgba(80, 140, 180, 0.06)';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.restore();
                }

                else if (ph.name === 'land') {
                    // Soft landing, stillness
                    var settle = sm(0, 0.4, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#5098d0');
                    skyG.addColorStop(1, '#70b0e0');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Ground level view
                    var groundY = h * 0.55;
                    var gG = ctx.createLinearGradient(0, groundY, 0, h);
                    gG.addColorStop(0, '#4a8030');
                    gG.addColorStop(0.3, '#3a6828');
                    gG.addColorStop(1, '#2a4820');
                    ctx.fillStyle = gG;
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Parachute collapsing (only early)
                    if (p < 0.4) {
                        var collapse = p / 0.4;
                        var chuteY = h * (0.2 + collapse * 0.15);
                        var chuteW = w * 0.2 * (1 - collapse * 0.5);
                        ctx.beginPath();
                        ctx.ellipse(cx + 20 * collapse, chuteY, chuteW, chuteW * 0.3 * (1 - collapse * 0.6), collapse * 0.5, Math.PI, 0);
                        ctx.fillStyle = 'rgba(220, 60, 30, ' + (0.05 * (1 - collapse)) + ')';
                        ctx.fill();
                    }

                    // Grass details
                    for (var i = 0; i < 30; i++) {
                        var gx = (Math.sin(i * 5.7 + 0.3) * 0.5 + 0.5) * w;
                        var gy = groundY + Math.sin(i * 3.1) * 3;
                        ctx.beginPath();
                        ctx.moveTo(gx, gy);
                        ctx.lineTo(gx + Math.sin(t * 0.8 + i) * 3, gy - 5 - Math.sin(i * 2.3) * 3);
                        ctx.strokeStyle = 'rgba(80, 140, 50, 0.04)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Distant trees
                    for (var i = 0; i < 6; i++) {
                        var tx = w * (0.1 + i * 0.15);
                        var ty = groundY + 5;
                        ctx.beginPath();
                        ctx.arc(tx, ty - 10, 8, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(30, 60, 25, 0.06)';
                        ctx.fill();
                        ctx.fillStyle = 'rgba(50, 35, 20, 0.04)';
                        ctx.fillRect(tx - 1.5, ty - 5, 3, 10);
                    }

                    // Fade to black for loop
                    if (p > 0.7) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.7) / 0.3 * 0.8) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // --- Timeline theme ---
    // Journey through Earth's ages: molten → volcanic → oceans → jungle → ice age → city → future ruins
    themes.timeline = (function () {
        var PHASES = [
            { name: 'molten', duration: 7 },
            { name: 'volcanic', duration: 7 },
            { name: 'oceans', duration: 6 },
            { name: 'jungle', duration: 7 },
            { name: 'ice', duration: 7 },
            { name: 'city', duration: 6 },
            { name: 'ruins', duration: 7 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'molten', progress: 0, time: 0 };
        }
        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
        function lerp(a, b, t) { return a + (b - a) * t; }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {},

            drawBackground: function (ctx, w, h) {
                ctx.fillStyle = '#0a0404';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;

                if (ph.name === 'molten') {
                    // Primordial Earth: lava rivers, meteors, red sky
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, '#1a0804');
                    skyG.addColorStop(0.3, '#301008');
                    skyG.addColorStop(0.6, '#501810');
                    skyG.addColorStop(1, '#803018');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Lava rivers on the ground
                    var groundY = h * 0.65;
                    ctx.fillStyle = '#200808';
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Lava flows
                    for (var i = 0; i < 8; i++) {
                        ctx.beginPath();
                        var lx = w * (Math.sin(i * 4.3 + 0.5) * 0.5 + 0.5);
                        ctx.moveTo(lx, groundY);
                        for (var y = groundY; y <= h; y += 3) {
                            lx += Math.sin(y * 0.02 + t * 0.5 + i * 2) * 2;
                            ctx.lineTo(lx, y);
                        }
                        var pulse = Math.sin(t * 1.5 + i * 1.7) * 0.02;
                        ctx.strokeStyle = 'rgba(255, 100, 20, ' + (0.06 + pulse) + ')';
                        ctx.lineWidth = 3 + Math.sin(i * 2.1) * 2;
                        ctx.stroke();
                    }

                    // Lava glow from below
                    var lavaG = ctx.createLinearGradient(0, groundY, 0, h);
                    lavaG.addColorStop(0, 'rgba(255, 80, 20, 0)');
                    lavaG.addColorStop(0.5, 'rgba(255, 60, 10, 0.04)');
                    lavaG.addColorStop(1, 'rgba(255, 40, 0, 0.08)');
                    ctx.fillStyle = lavaG;
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Meteors
                    for (var i = 0; i < 4; i++) {
                        var mPhase = (t * 0.3 + i * 1.7) % 3;
                        if (mPhase < 1) {
                            var mx = w * (Math.sin(i * 5.3 + 0.7) * 0.5 + 0.5) - mPhase * w * 0.3;
                            var my = mPhase * h * 0.5;
                            ctx.beginPath();
                            ctx.arc(mx, my, 2, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
                            ctx.fill();
                            // Trail
                            ctx.beginPath();
                            ctx.moveTo(mx, my);
                            ctx.lineTo(mx + 15, my - 10);
                            ctx.strokeStyle = 'rgba(255, 180, 80, 0.08)';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }

                    // Transition fade
                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'volcanic') {
                    // Volcanic hellscape with ash clouds
                    var ashDark = sm(0, 0.5, p) * 0.3;
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, 'rgb(' + Math.round(20 + ashDark * 20) + ',' + Math.round(10 + ashDark * 10) + ',' + Math.round(8 + ashDark * 8) + ')');
                    skyG.addColorStop(0.4, '#401510');
                    skyG.addColorStop(1, '#201008');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Volcanic peaks
                    var groundY = h * 0.6;
                    for (var i = 0; i < 5; i++) {
                        var vx = w * (0.1 + i * 0.2);
                        var vw = w * 0.12;
                        var vh = h * (0.15 + Math.sin(i * 3.7) * 0.08);
                        ctx.beginPath();
                        ctx.moveTo(vx - vw, groundY);
                        ctx.lineTo(vx, groundY - vh);
                        ctx.lineTo(vx + vw, groundY);
                        ctx.closePath();
                        ctx.fillStyle = '#1a0c08';
                        ctx.fill();

                        // Eruption glow at peak
                        if (i === 2 || i === 4) {
                            var erupt = Math.sin(t * 1.2 + i * 3) * 0.5 + 0.5;
                            var eG = ctx.createRadialGradient(vx, groundY - vh, 0, vx, groundY - vh, 25);
                            eG.addColorStop(0, 'rgba(255, 120, 30, ' + (erupt * 0.12) + ')');
                            eG.addColorStop(1, 'rgba(255, 60, 10, 0)');
                            ctx.beginPath();
                            ctx.arc(vx, groundY - vh, 25, 0, Math.PI * 2);
                            ctx.fillStyle = eG;
                            ctx.fill();
                        }
                    }

                    // Ground
                    ctx.fillStyle = '#150a06';
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Ash particles falling
                    for (var i = 0; i < 25; i++) {
                        var ax = (Math.sin(i * 6.7 + t * 0.05) * 0.5 + 0.5) * w;
                        var ay = (t * 15 + i * h * 0.05) % (h * 1.1) - h * 0.05;
                        ctx.beginPath();
                        ctx.arc(ax + Math.sin(t * 0.5 + i) * 5, ay, 0.8 + Math.sin(i * 2.3) * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(100, 90, 80, 0.05)';
                        ctx.fill();
                    }

                    // Ash cloud banks
                    for (var i = 0; i < 4; i++) {
                        var cloudY = h * (0.1 + i * 0.08);
                        var cloudX = (cx + Math.sin(t * 0.1 + i * 2) * w * 0.3 + t * 5 * (i % 2 === 0 ? 1 : -1)) % (w * 1.4) - w * 0.2;
                        ctx.beginPath();
                        ctx.ellipse(cloudX, cloudY, 80, 15, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(60, 50, 40, 0.04)';
                        ctx.fill();
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'oceans') {
                    // First oceans under stormy skies
                    var calm = sm(0, 1, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, 'rgb(' + Math.round(20 + calm * 15) + ',' + Math.round(25 + calm * 20) + ',' + Math.round(35 + calm * 30) + ')');
                    skyG.addColorStop(1, 'rgb(' + Math.round(30 + calm * 20) + ',' + Math.round(40 + calm * 30) + ',' + Math.round(55 + calm * 35) + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Ocean
                    var waterY = h * 0.48;
                    var wG = ctx.createLinearGradient(0, waterY, 0, h);
                    wG.addColorStop(0, 'rgb(15,' + Math.round(40 + calm * 20) + ',' + Math.round(60 + calm * 30) + ')');
                    wG.addColorStop(1, 'rgb(8,' + Math.round(20 + calm * 10) + ',' + Math.round(35 + calm * 20) + ')');
                    ctx.fillStyle = wG;
                    ctx.fillRect(0, waterY, w, h - waterY);

                    // Waves
                    for (var i = 0; i < 6; i++) {
                        ctx.beginPath();
                        var waveY = waterY + i * 8;
                        for (var x = 0; x <= w; x += 4) {
                            var amp = 4 + (1 - calm) * 4;
                            var y = waveY + Math.sin(x * 0.008 + t * (0.6 + i * 0.15) + i) * amp;
                            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                        }
                        ctx.strokeStyle = 'rgba(80, 130, 160, 0.04)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Storm clouds (fading as it calms)
                    if (calm < 0.7) {
                        var stormOp = (1 - calm / 0.7) * 0.04;
                        for (var i = 0; i < 5; i++) {
                            var scx = (cx + Math.sin(t * 0.08 + i * 3) * w * 0.3 + t * 8) % (w * 1.3) - w * 0.15;
                            var scy = h * (0.1 + Math.sin(i * 2.7) * 0.05);
                            ctx.beginPath();
                            ctx.ellipse(scx, scy, 70, 18, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(40, 45, 55, ' + stormOp + ')';
                            ctx.fill();
                        }
                    }

                    // Lightning flash (early)
                    if (p < 0.3) {
                        var lFlash = Math.sin(t * 5 + 1.3);
                        if (lFlash > 0.95) {
                            ctx.fillStyle = 'rgba(200, 220, 255, 0.04)';
                            ctx.fillRect(0, 0, w, h * 0.5);
                        }
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'jungle') {
                    // Lush prehistoric jungle with giant ferns
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.4);
                    skyG.addColorStop(0, '#1a3520');
                    skyG.addColorStop(1, '#2a5530');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Dense foliage background
                    var groundG = ctx.createLinearGradient(0, h * 0.3, 0, h);
                    groundG.addColorStop(0, '#1a3518');
                    groundG.addColorStop(0.5, '#0a2008');
                    groundG.addColorStop(1, '#061505');
                    ctx.fillStyle = groundG;
                    ctx.fillRect(0, h * 0.3, w, h * 0.7);

                    // Giant fern fronds
                    for (var i = 0; i < 10; i++) {
                        var fx = w * (Math.sin(i * 4.7 + 0.3) * 0.5 + 0.5);
                        var fy = h * (0.2 + Math.sin(i * 3.1) * 0.1);
                        var fernLen = 60 + Math.sin(i * 2.3) * 30;
                        var sway = Math.sin(t * 0.3 + i * 1.7) * 5;

                        // Stem
                        ctx.beginPath();
                        ctx.moveTo(fx, h);
                        ctx.quadraticCurveTo(fx + sway, fy + fernLen * 0.5, fx + sway * 2, fy);
                        ctx.strokeStyle = 'rgba(30, 80, 20, 0.06)';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Leaflets
                        for (var j = 0; j < 6; j++) {
                            var lf = j / 6;
                            var lx = fx + sway * lf;
                            var ly = h - (h - fy) * lf;
                            var leafSize = 15 * (1 - lf * 0.5);
                            for (var side = -1; side <= 1; side += 2) {
                                ctx.beginPath();
                                ctx.ellipse(lx + side * leafSize, ly, leafSize, 3, side * 0.3 + sway * 0.02, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(25, 70, 15, 0.04)';
                                ctx.fill();
                            }
                        }
                    }

                    // Mist/humidity
                    for (var i = 0; i < 5; i++) {
                        var mx = (cx + Math.sin(t * 0.05 + i * 3) * w * 0.4);
                        var my = h * (0.4 + Math.sin(i * 2.7) * 0.15);
                        ctx.beginPath();
                        ctx.ellipse(mx, my, 60, 15, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(100, 150, 80, 0.015)';
                        ctx.fill();
                    }

                    // Light shafts through canopy
                    for (var i = 0; i < 3; i++) {
                        var lx = w * (0.25 + i * 0.25);
                        var lPulse = Math.sin(t * 0.2 + i * 2) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.moveTo(lx - 5, 0); ctx.lineTo(lx + 5, 0);
                        ctx.lineTo(lx + 25, h); ctx.lineTo(lx - 15, h);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(180, 220, 100, ' + (lPulse * 0.012) + ')';
                        ctx.fill();
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'ice') {
                    // Ice age: glaciers, frozen landscape, pale sky
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#c8d8e8');
                    skyG.addColorStop(1, '#90a8c0');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Frozen ground
                    var groundY = h * 0.55;
                    var gG = ctx.createLinearGradient(0, groundY, 0, h);
                    gG.addColorStop(0, '#d0dce8');
                    gG.addColorStop(0.3, '#b8c8d8');
                    gG.addColorStop(1, '#a0b0c0');
                    ctx.fillStyle = gG;
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Glacier/mountain shapes
                    for (var i = 0; i < 6; i++) {
                        var gx = w * (Math.sin(i * 4.3 + 0.5) * 0.5 + 0.5);
                        var gw = w * 0.1;
                        var gh = h * (0.1 + Math.sin(i * 2.7) * 0.06);
                        ctx.beginPath();
                        ctx.moveTo(gx - gw, groundY);
                        ctx.lineTo(gx, groundY - gh);
                        ctx.lineTo(gx + gw, groundY);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(200, 215, 230, 0.15)';
                        ctx.fill();
                        // Snow cap highlight
                        ctx.beginPath();
                        ctx.moveTo(gx - gw * 0.3, groundY - gh * 0.7);
                        ctx.lineTo(gx, groundY - gh);
                        ctx.lineTo(gx + gw * 0.3, groundY - gh * 0.7);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(240, 245, 255, 0.08)';
                        ctx.fill();
                    }

                    // Snow falling
                    for (var i = 0; i < 30; i++) {
                        var sx = (Math.sin(i * 7.3 + t * 0.03) * 0.5 + 0.5) * w;
                        var sy = (t * 12 + i * h * 0.04) % (h * 1.05) - h * 0.025;
                        var drift = Math.sin(t * 0.3 + i * 2) * 10;
                        ctx.beginPath();
                        ctx.arc(sx + drift, sy, 1 + Math.sin(i * 2.1) * 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(240, 245, 255, 0.08)';
                        ctx.fill();
                    }

                    // Pale sun
                    var sunX = w * 0.7, sunY = h * 0.15;
                    var sG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
                    sG.addColorStop(0, 'rgba(255, 250, 240, 0.1)');
                    sG.addColorStop(1, 'rgba(255, 240, 220, 0)');
                    ctx.fillStyle = sG;
                    ctx.fillRect(0, 0, w, h);

                    // Wind streaks
                    for (var i = 0; i < 5; i++) {
                        var wy = groundY + (Math.sin(i * 3.7) * 0.5 + 0.5) * (h - groundY) * 0.3;
                        ctx.beginPath();
                        var startX = ((t * 40 + i * w * 0.25) % (w * 1.3)) - w * 0.15;
                        ctx.moveTo(startX, wy);
                        ctx.lineTo(startX + 40, wy + Math.sin(i * 2.1) * 2);
                        ctx.strokeStyle = 'rgba(220, 230, 240, 0.03)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'city') {
                    // Modern cityscape at night with glowing windows
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#0a0c18');
                    skyG.addColorStop(1, '#141828');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // City light pollution glow
                    var cityG = ctx.createLinearGradient(0, h * 0.4, 0, h);
                    cityG.addColorStop(0, 'rgba(40, 30, 50, 0)');
                    cityG.addColorStop(1, 'rgba(40, 30, 50, 0.2)');
                    ctx.fillStyle = cityG;
                    ctx.fillRect(0, h * 0.4, w, h * 0.6);

                    // Stars (dimmed by light pollution)
                    for (var i = 0; i < 30; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h * 0.35;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.06)';
                        ctx.fill();
                    }

                    // Buildings (skyline)
                    var baseY = h * 0.55;
                    for (var i = 0; i < 18; i++) {
                        var bx = w * (i / 18);
                        var bw = w * 0.04 + Math.sin(i * 3.7) * w * 0.015;
                        var bh = h * (0.1 + (Math.sin(i * 2.3 + 0.5) * 0.5 + 0.5) * 0.3);
                        var by = baseY - bh;
                        ctx.fillStyle = 'rgba(20, 22, 30, 0.3)';
                        ctx.fillRect(bx, by, bw, bh);

                        // Windows
                        for (var wy = by + 4; wy < baseY - 3; wy += 6) {
                            for (var wx = bx + 2; wx < bx + bw - 2; wx += 5) {
                                var lit = Math.sin(wx * 3.7 + wy * 2.3 + t * 0.1) > 0.2;
                                if (lit) {
                                    ctx.fillStyle = 'rgba(255, 220, 120, 0.04)';
                                    ctx.fillRect(wx, wy, 2.5, 3);
                                }
                            }
                        }
                    }

                    // Street level glow
                    ctx.fillStyle = 'rgba(20, 18, 25, 0.3)';
                    ctx.fillRect(0, baseY, w, h - baseY);

                    // Street lights
                    for (var i = 0; i < 8; i++) {
                        var lx = w * (0.05 + i * 0.12);
                        var ly = baseY + 5;
                        var lG = ctx.createRadialGradient(lx, ly, 0, lx, ly, 15);
                        lG.addColorStop(0, 'rgba(255, 200, 100, 0.06)');
                        lG.addColorStop(1, 'rgba(255, 180, 80, 0)');
                        ctx.beginPath();
                        ctx.arc(lx, ly, 15, 0, Math.PI * 2);
                        ctx.fillStyle = lG;
                        ctx.fill();
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                else if (ph.name === 'ruins') {
                    // Far-future ruins overtaken by nature
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#182818');
                    skyG.addColorStop(1, '#284028');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Overgrown ground
                    var groundG = ctx.createLinearGradient(0, h * 0.5, 0, h);
                    groundG.addColorStop(0, '#1a3015');
                    groundG.addColorStop(1, '#0a1808');
                    ctx.fillStyle = groundG;
                    ctx.fillRect(0, h * 0.5, w, h * 0.5);

                    // Ruined building silhouettes with broken edges
                    for (var i = 0; i < 10; i++) {
                        var bx = w * (i / 10);
                        var bw = w * 0.06 + Math.sin(i * 3.7) * w * 0.02;
                        var bh = h * (0.05 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 0.2);
                        var by = h * 0.55 - bh;

                        // Broken top edge
                        ctx.beginPath();
                        ctx.moveTo(bx, h * 0.55);
                        ctx.lineTo(bx, by);
                        for (var x = bx; x <= bx + bw; x += 3) {
                            ctx.lineTo(x, by + Math.sin(x * 0.1 + i * 2) * 5 + Math.random() * 2);
                        }
                        ctx.lineTo(bx + bw, h * 0.55);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(30, 35, 28, 0.12)';
                        ctx.fill();
                    }

                    // Vines climbing up ruins
                    for (var i = 0; i < 12; i++) {
                        var vx = w * (Math.sin(i * 4.7 + 0.3) * 0.5 + 0.5);
                        ctx.beginPath();
                        ctx.moveTo(vx, h);
                        for (var y = h; y > h * 0.3; y -= 3) {
                            vx += Math.sin(y * 0.02 + t * 0.1 + i * 2) * 1.5;
                            ctx.lineTo(vx, y);
                        }
                        ctx.strokeStyle = 'rgba(40, 80, 30, 0.03)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Leaves
                        for (var j = 0; j < 4; j++) {
                            var ly = h - (h * 0.7) * (j / 4) + Math.sin(i + j) * 15;
                            var lx = vx + Math.sin(ly * 0.02 + i * 2) * 10;
                            ctx.beginPath();
                            ctx.ellipse(lx, ly, 4, 2, Math.sin(i + j) * 0.5, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(50, 90, 35, 0.04)';
                            ctx.fill();
                        }
                    }

                    // Fireflies/bioluminescence in the ruins
                    for (var i = 0; i < 8; i++) {
                        var fx = (Math.sin(i * 5.3 + t * 0.05 + 0.7) * 0.5 + 0.5) * w;
                        var fy = h * (0.3 + Math.sin(i * 3.7 + t * 0.08) * 0.15);
                        var pulse = Math.sin(t * (0.8 + i * 0.3) + i * 2) * 0.5 + 0.5;
                        ctx.beginPath();
                        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(150, 220, 100, ' + (pulse * 0.08) + ')';
                        ctx.fill();
                        var fG = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10);
                        fG.addColorStop(0, 'rgba(150, 220, 100, ' + (pulse * 0.03) + ')');
                        fG.addColorStop(1, 'rgba(100, 180, 60, 0)');
                        ctx.beginPath();
                        ctx.arc(fx, fy, 10, 0, Math.PI * 2);
                        ctx.fillStyle = fG;
                        ctx.fill();
                    }

                    // Soft mist
                    for (var i = 0; i < 4; i++) {
                        var mx = (cx + Math.sin(t * 0.04 + i * 3) * w * 0.3);
                        var my = h * (0.45 + Math.sin(i * 2.7) * 0.05);
                        ctx.beginPath();
                        ctx.ellipse(mx, my, 70, 12, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(80, 120, 70, 0.012)';
                        ctx.fill();
                    }

                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.85) / 0.15 * 0.4) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // --- Apollo theme ---
    // Moon mission: launch → ascent → staging → transit → moon approach → dark side → return → reentry → splashdown
    themes.apollo = (function () {
        var PHASES = [
            { name: 'launch', duration: 7 },
            { name: 'ascent', duration: 6 },
            { name: 'staging', duration: 5 },
            { name: 'transit', duration: 7 },
            { name: 'approach', duration: 6 },
            { name: 'darkside', duration: 7 },
            { name: 'return', duration: 6 },
            { name: 'reentry', duration: 5 },
            { name: 'splashdown', duration: 6 }
        ];
        var TOTAL = 0;
        for (var i = 0; i < PHASES.length; i++) TOTAL += PHASES[i].duration;

        // Detached booster state
        var boosters = [
            { x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0, active: false },
            { x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0, active: false }
        ];
        var stage2 = { x: 0, y: 0, rot: 0, vx: 0, vy: 0, vr: 0, active: false };
        var lastPhase = '';

        function getPhase(t) {
            var ct = t % TOTAL, el = 0;
            for (var i = 0; i < PHASES.length; i++) {
                if (ct < el + PHASES[i].duration)
                    return { name: PHASES[i].name, progress: (ct - el) / PHASES[i].duration, time: ct - el };
                el += PHASES[i].duration;
            }
            return { name: 'launch', progress: 0, time: 0 };
        }
        function sm(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }

        function drawRocket(ctx, rx, ry, scale, hasBoost, hasFairings) {
            ctx.save();
            ctx.translate(rx, ry);
            ctx.scale(scale, scale);

            // Main body
            ctx.fillStyle = 'rgba(220, 225, 230, 0.25)';
            ctx.fillRect(-6, -40, 12, 50);
            // Nose cone
            ctx.beginPath();
            ctx.moveTo(-6, -40);
            ctx.lineTo(0, -55);
            ctx.lineTo(6, -40);
            ctx.closePath();
            ctx.fillStyle = 'rgba(230, 235, 240, 0.3)';
            ctx.fill();

            // Side boosters
            if (hasBoost) {
                for (var side = -1; side <= 1; side += 2) {
                    ctx.fillStyle = 'rgba(200, 205, 210, 0.2)';
                    ctx.fillRect(side * 10 - 3, -25, 6, 35);
                    // Booster nose
                    ctx.beginPath();
                    ctx.moveTo(side * 10 - 3, -25);
                    ctx.lineTo(side * 10, -32);
                    ctx.lineTo(side * 10 + 3, -25);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Fairings (2nd stage marker)
            if (hasFairings) {
                ctx.fillStyle = 'rgba(180, 185, 190, 0.15)';
                ctx.fillRect(-7, -20, 14, 8);
            }

            ctx.restore();
        }

        function drawExhaust(ctx, ex, ey, scale, intensity, t) {
            var flicker = Math.sin(t * 20) * 0.3 + 0.7;
            var len = 30 * scale * intensity * flicker;
            var wid = 8 * scale;
            // Outer flame
            var fG = ctx.createRadialGradient(ex, ey + len * 0.3, 0, ex, ey + len * 0.3, len);
            fG.addColorStop(0, 'rgba(255, 200, 80, ' + (intensity * 0.15 * flicker) + ')');
            fG.addColorStop(0.4, 'rgba(255, 120, 30, ' + (intensity * 0.08 * flicker) + ')');
            fG.addColorStop(1, 'rgba(255, 60, 10, 0)');
            ctx.beginPath();
            ctx.moveTo(ex - wid, ey);
            ctx.quadraticCurveTo(ex, ey + len, ex + wid, ey);
            ctx.closePath();
            ctx.fillStyle = fG;
            ctx.fill();
            // Inner bright core
            ctx.beginPath();
            ctx.moveTo(ex - wid * 0.4, ey);
            ctx.quadraticCurveTo(ex, ey + len * 0.6, ex + wid * 0.4, ey);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 220, ' + (intensity * 0.08 * flicker) + ')';
            ctx.fill();
        }

        function drawMoon(ctx, mx, my, radius) {
            // Moon disc
            var mG = ctx.createRadialGradient(mx - radius * 0.25, my - radius * 0.2, radius * 0.1, mx, my, radius);
            mG.addColorStop(0, '#c8c4b8');
            mG.addColorStop(0.5, '#a8a498');
            mG.addColorStop(1, '#787468');
            ctx.beginPath();
            ctx.arc(mx, my, radius, 0, Math.PI * 2);
            ctx.fillStyle = mG;
            ctx.fill();
            // Craters
            var craters = [
                { x: -0.2, y: -0.15, r: 0.12 }, { x: 0.25, y: 0.1, r: 0.08 },
                { x: -0.1, y: 0.3, r: 0.1 }, { x: 0.3, y: -0.25, r: 0.06 },
                { x: -0.35, y: 0.1, r: 0.07 }, { x: 0.1, y: -0.35, r: 0.09 }
            ];
            for (var i = 0; i < craters.length; i++) {
                var c = craters[i];
                ctx.beginPath();
                ctx.arc(mx + c.x * radius, my + c.y * radius, c.r * radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(80, 78, 70, 0.12)';
                ctx.fill();
            }
        }

        function drawCapsule(ctx, capX, capY, scale) {
            ctx.save();
            ctx.translate(capX, capY);
            ctx.scale(scale, scale);
            // Cone shape
            ctx.beginPath();
            ctx.moveTo(-8, 5);
            ctx.lineTo(0, -12);
            ctx.lineTo(8, 5);
            ctx.closePath();
            ctx.fillStyle = 'rgba(210, 215, 220, 0.25)';
            ctx.fill();
            // Heat shield
            ctx.beginPath();
            ctx.ellipse(0, 6, 9, 3, 0, 0, Math.PI);
            ctx.fillStyle = 'rgba(120, 80, 50, 0.2)';
            ctx.fill();
            ctx.restore();
        }

        function drawStars(ctx, w, h, t, opacity) {
            for (var i = 0; i < 100; i++) {
                var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                var tw = Math.sin(t * 0.5 + i * 2.3) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(sx, sy, 0.4 + tw * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 230, 255, ' + (opacity * (0.08 + tw * 0.12)) + ')';
                ctx.fill();
            }
        }

        function drawEarth(ctx, ex, ey, radius) {
            var eG = ctx.createRadialGradient(ex - radius * 0.2, ey - radius * 0.2, radius * 0.1, ex, ey, radius);
            eG.addColorStop(0, '#4090c0');
            eG.addColorStop(0.4, '#2870a0');
            eG.addColorStop(0.7, '#1a5080');
            eG.addColorStop(1, '#0a2840');
            ctx.beginPath();
            ctx.arc(ex, ey, radius, 0, Math.PI * 2);
            ctx.fillStyle = eG;
            ctx.fill();
            // Continents
            ctx.save();
            ctx.beginPath();
            ctx.arc(ex, ey, radius, 0, Math.PI * 2);
            ctx.clip();
            for (var i = 0; i < 5; i++) {
                var lx = ex + Math.sin(i * 4.7 + 0.5) * radius * 0.5;
                var ly = ey + Math.cos(i * 3.3 + 1.2) * radius * 0.4;
                var ls = radius * (0.15 + Math.sin(i * 2.9) * 0.08);
                ctx.beginPath();
                ctx.ellipse(lx, ly, ls, ls * 0.7, Math.sin(i) * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(40, 100, 50, 0.12)';
                ctx.fill();
            }
            ctx.restore();
            // Atmosphere
            var aG = ctx.createRadialGradient(ex, ey, radius * 0.9, ex, ey, radius * 1.12);
            aG.addColorStop(0, 'rgba(100, 180, 255, 0)');
            aG.addColorStop(0.5, 'rgba(100, 180, 255, 0.06)');
            aG.addColorStop(1, 'rgba(100, 180, 255, 0)');
            ctx.beginPath();
            ctx.arc(ex, ey, radius * 1.12, 0, Math.PI * 2);
            ctx.fillStyle = aG;
            ctx.fill();
        }

        return {
            cycleDuration: TOTAL,
            targetCount: 0,
            spawn: function () { return { x: 0, y: 0 }; },
            update: function () { return true; },
            draw: function () {},
            onActivate: function () {
                boosters[0].active = false;
                boosters[1].active = false;
                stage2.active = false;
                lastPhase = '';
            },

            drawBackground: function (ctx, w, h) {
                ctx.fillStyle = '#020206';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                var t = state.timeElapsed;
                var ph = getPhase(t);
                var p = ph.progress;
                var cx = w * 0.5, cy = h * 0.5;

                // Reset detached parts when cycling back to launch
                if (ph.name === 'launch' && lastPhase !== 'launch') {
                    boosters[0].active = false;
                    boosters[1].active = false;
                    stage2.active = false;
                }
                lastPhase = ph.name;

                // ==================== LAUNCH ====================
                if (ph.name === 'launch') {
                    // Rocket on launch pad, engines ignite, lifts off
                    // Sky gradient: blue at top fading to orange at horizon
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, '#2050a0');
                    skyG.addColorStop(0.5, '#3070b0');
                    skyG.addColorStop(0.8, '#c08040');
                    skyG.addColorStop(1, '#604020');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Ground level
                    var groundY = h * 0.78;
                    ctx.fillStyle = '#303028';
                    ctx.fillRect(0, groundY, w, h - groundY);

                    // Launch tower
                    var towerX = cx + 25;
                    ctx.fillStyle = 'rgba(120, 120, 110, 0.08)';
                    ctx.fillRect(towerX, groundY - 80, 4, 80);
                    // Cross beams
                    for (var i = 0; i < 6; i++) {
                        ctx.beginPath();
                        ctx.moveTo(towerX, groundY - 12 * i - 5);
                        ctx.lineTo(towerX + 10, groundY - 12 * i - 12);
                        ctx.strokeStyle = 'rgba(120, 120, 110, 0.05)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Launch pad
                    ctx.fillStyle = 'rgba(80, 80, 75, 0.1)';
                    ctx.fillRect(cx - 30, groundY - 3, 60, 6);

                    // Rocket
                    var liftoff = sm(0.5, 1, p);
                    var rocketY = groundY - 10 - liftoff * h * 0.3;
                    var engineOn = sm(0.3, 0.5, p);
                    drawRocket(ctx, cx, rocketY, 1.0, true, true);

                    // Exhaust
                    if (engineOn > 0) {
                        drawExhaust(ctx, cx, rocketY + 10, 1.0, engineOn, t);
                        // Side booster exhaust
                        drawExhaust(ctx, cx - 10, rocketY + 10, 0.6, engineOn * 0.7, t + 0.5);
                        drawExhaust(ctx, cx + 10, rocketY + 10, 0.6, engineOn * 0.7, t + 1.0);

                        // Smoke billowing on the pad
                        if (liftoff < 0.3) {
                            for (var i = 0; i < 10; i++) {
                                var smx = cx + (Math.sin(i * 4.3 + t * 0.5) - 0.5) * 60;
                                var smy = groundY - 5 + Math.sin(i * 2.7) * 10;
                                var smR = 15 + i * 5 + t * 3;
                                ctx.beginPath();
                                ctx.arc(smx, smy, smR, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(180, 175, 165, ' + (engineOn * 0.02 * (1 - liftoff / 0.3)) + ')';
                                ctx.fill();
                            }
                        }
                    }

                    // Rumble/vibration hint near ignition
                    if (engineOn > 0 && engineOn < 0.5) {
                        var glow = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, h * 0.3);
                        glow.addColorStop(0, 'rgba(255, 180, 80, ' + (engineOn * 0.06) + ')');
                        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
                        ctx.fillStyle = glow;
                        ctx.fillRect(0, groundY - h * 0.3, w, h * 0.6);
                    }
                }

                // ==================== ASCENT ====================
                else if (ph.name === 'ascent') {
                    // Rising through atmosphere, sky darkening
                    var dark = sm(0, 1, p);
                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    var skyR = Math.round(32 - dark * 28);
                    var skyGv = Math.round(80 - dark * 70);
                    var skyB = Math.round(160 - dark * 150);
                    skyG.addColorStop(0, 'rgb(' + Math.round(skyR * 0.5) + ',' + Math.round(skyGv * 0.5) + ',' + Math.round(skyB * 0.8) + ')');
                    skyG.addColorStop(1, 'rgb(' + skyR + ',' + skyGv + ',' + skyB + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Stars appearing
                    if (dark > 0.3) {
                        drawStars(ctx, w, h, t, (dark - 0.3) / 0.7);
                    }

                    // Earth receding at bottom
                    if (dark > 0.4) {
                        var curveY = h * (0.8 + (dark - 0.4) * 0.5);
                        if (curveY < h + 200) {
                            ctx.beginPath();
                            ctx.moveTo(-w * 0.3, h + 100);
                            ctx.quadraticCurveTo(cx, curveY, w * 1.3, h + 100);
                            ctx.closePath();
                            ctx.fillStyle = '#1a5080';
                            ctx.fill();
                            // Atmos line
                            var aG = ctx.createLinearGradient(0, curveY - 10, 0, curveY + 5);
                            aG.addColorStop(0, 'rgba(100, 180, 255, 0)');
                            aG.addColorStop(0.5, 'rgba(100, 180, 255, 0.06)');
                            aG.addColorStop(1, 'rgba(100, 180, 255, 0)');
                            ctx.fillStyle = aG;
                            ctx.fillRect(0, curveY - 10, w, 15);
                        }
                    }

                    // Rocket (smaller as it climbs into view from our perspective)
                    var rScale = 1.0 - dark * 0.2;
                    drawRocket(ctx, cx, cy - 20, rScale, true, true);
                    drawExhaust(ctx, cx, cy - 20 + 10 * rScale, rScale, 1.0, t);
                    drawExhaust(ctx, cx - 10 * rScale, cy - 20 + 10 * rScale, rScale * 0.6, 0.7, t + 0.5);
                    drawExhaust(ctx, cx + 10 * rScale, cy - 20 + 10 * rScale, rScale * 0.6, 0.7, t + 1.0);

                    // Cloud layers rushing past
                    if (dark < 0.5) {
                        var cloudFade = 1 - dark / 0.5;
                        for (var i = 0; i < 6; i++) {
                            var cloudY = ((ph.time * 150 + i * h * 0.2) % (h * 1.4)) - h * 0.2;
                            var cloudX = (Math.sin(i * 5.7 + 1.3) * 0.5 + 0.5) * w;
                            ctx.beginPath();
                            ctx.ellipse(cloudX, cloudY, 70, 10, 0, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(220, 230, 240, ' + (cloudFade * 0.04) + ')';
                            ctx.fill();
                        }
                    }
                }

                // ==================== STAGING ====================
                else if (ph.name === 'staging') {
                    // Boosters detach, then 2nd stage separates
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);
                    drawStars(ctx, w, h, t, 1);

                    // Earth in the distance below
                    drawEarth(ctx, cx, h + h * 0.6, h * 0.8);

                    var boosterSep = sm(0, 0.35, p);
                    var stageSep = sm(0.45, 0.75, p);

                    // Initialize boosters on separation
                    if (boosterSep > 0 && !boosters[0].active) {
                        boosters[0].active = true;
                        boosters[0].x = cx - 10; boosters[0].y = cy;
                        boosters[0].vx = -15; boosters[0].vy = 8; boosters[0].vr = 0.3;
                        boosters[1].active = true;
                        boosters[1].x = cx + 10; boosters[1].y = cy;
                        boosters[1].vx = 15; boosters[1].vy = 8; boosters[1].vr = -0.3;
                    }
                    if (stageSep > 0 && !stage2.active) {
                        stage2.active = true;
                        stage2.x = cx; stage2.y = cy + 5;
                        stage2.vx = 0; stage2.vy = 12; stage2.vr = 0.1;
                    }

                    // Update detached parts
                    for (var i = 0; i < 2; i++) {
                        if (boosters[i].active) {
                            boosters[i].x += boosters[i].vx * dt;
                            boosters[i].y += boosters[i].vy * dt;
                            boosters[i].rot += boosters[i].vr * dt;
                        }
                    }
                    if (stage2.active) {
                        stage2.x += stage2.vx * dt;
                        stage2.y += stage2.vy * dt;
                        stage2.rot += stage2.vr * dt;
                    }

                    // Draw detached boosters tumbling away
                    for (var i = 0; i < 2; i++) {
                        if (boosters[i].active) {
                            ctx.save();
                            ctx.translate(boosters[i].x, boosters[i].y);
                            ctx.rotate(boosters[i].rot);
                            ctx.fillStyle = 'rgba(180, 185, 190, 0.12)';
                            ctx.fillRect(-3, -15, 6, 30);
                            ctx.beginPath();
                            ctx.moveTo(-3, -15); ctx.lineTo(0, -20); ctx.lineTo(3, -15);
                            ctx.closePath();
                            ctx.fill();
                            ctx.restore();
                        }
                    }

                    // Draw detached 2nd stage
                    if (stage2.active) {
                        ctx.save();
                        ctx.translate(stage2.x, stage2.y);
                        ctx.rotate(stage2.rot);
                        ctx.fillStyle = 'rgba(170, 175, 180, 0.1)';
                        ctx.fillRect(-5, -12, 10, 24);
                        ctx.restore();
                    }

                    // Main rocket/capsule continues
                    var hasBoost = boosterSep < 0.5;
                    var hasFairing = stageSep < 0.5;
                    if (stageSep > 0.5) {
                        // Just capsule + service module now
                        drawCapsule(ctx, cx, cy - 15, 1.2);
                        // Service module
                        ctx.fillStyle = 'rgba(200, 205, 210, 0.18)';
                        ctx.fillRect(cx - 5, cy - 5, 10, 15);
                        // Small engine
                        drawExhaust(ctx, cx, cy + 10, 0.4, 0.6, t);
                    } else {
                        drawRocket(ctx, cx, cy - 10, 0.8, hasBoost, hasFairing);
                        drawExhaust(ctx, cx, cy, 0.8, 0.8, t);
                    }

                    // Flash on separation events
                    if (p > 0.0 && p < 0.08) {
                        ctx.fillStyle = 'rgba(255, 220, 150, ' + ((1 - p / 0.08) * 0.06) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                    if (p > 0.45 && p < 0.52) {
                        ctx.fillStyle = 'rgba(255, 220, 150, ' + ((1 - (p - 0.45) / 0.07) * 0.06) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ==================== TRANSIT ====================
                else if (ph.name === 'transit') {
                    // Cruising through space toward the moon
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);
                    drawStars(ctx, w, h, t, 1);

                    // Earth shrinking behind (bottom-left)
                    var earthR = Math.max(8, w * 0.15 * (1 - p * 0.7));
                    var earthX = w * (0.3 - p * 0.15);
                    var earthY = h * (0.7 + p * 0.1);
                    drawEarth(ctx, earthX, earthY, earthR);

                    // Moon dot appearing and growing ahead (top-right)
                    var moonAppear = sm(0.2, 1, p);
                    if (moonAppear > 0) {
                        var moonR = 2 + moonAppear * 15;
                        var moonX = w * (0.7 + (1 - moonAppear) * 0.05);
                        var moonY = h * (0.3 - (1 - moonAppear) * 0.02);
                        drawMoon(ctx, moonX, moonY, moonR);
                    }

                    // Capsule in centre
                    drawCapsule(ctx, cx, cy, 1.0);
                    ctx.fillStyle = 'rgba(200, 205, 210, 0.15)';
                    ctx.fillRect(cx - 4, cy + 3, 8, 12);
                    // Gentle thrust
                    var thrustPulse = Math.sin(t * 3) * 0.3 + 0.7;
                    drawExhaust(ctx, cx, cy + 15, 0.3, 0.3 * thrustPulse, t);
                }

                // ==================== APPROACH ====================
                else if (ph.name === 'approach') {
                    // Moon growing large, capsule approaching
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);
                    drawStars(ctx, w, h, t, 1);

                    // Moon growing to fill view
                    var grow = sm(0, 1, p);
                    var moonR = 20 + grow * Math.max(w, h) * 0.5;
                    var moonX = cx + (1 - grow) * w * 0.15;
                    var moonY = cy + grow * h * 0.15;
                    drawMoon(ctx, moonX, moonY, moonR);

                    // Earth small in the distance
                    var earthR2 = Math.max(5, 12 * (1 - grow * 0.3));
                    drawEarth(ctx, w * 0.15, h * 0.2, earthR2);

                    // Capsule
                    if (grow < 0.7) {
                        var capScale = 1.0 - grow * 0.5;
                        drawCapsule(ctx, cx - grow * 30, cy - grow * 20, capScale);
                    }

                    // Lunar surface detail as we get close
                    if (grow > 0.6) {
                        var detail = (grow - 0.6) / 0.4;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
                        ctx.clip();
                        for (var i = 0; i < 12; i++) {
                            var crX = moonX + Math.sin(i * 5.3 + 0.7) * moonR * 0.6;
                            var crY = moonY + Math.cos(i * 4.1 + 1.3) * moonR * 0.5;
                            var crR = moonR * (0.02 + Math.sin(i * 2.9) * 0.01);
                            ctx.beginPath();
                            ctx.arc(crX, crY, crR, 0, Math.PI * 2);
                            ctx.strokeStyle = 'rgba(100, 96, 88, ' + (detail * 0.06) + ')';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                        ctx.restore();
                    }
                }

                // ==================== DARK SIDE ====================
                else if (ph.name === 'darkside') {
                    // Orbiting around the dark side of the moon
                    ctx.fillStyle = '#010103';
                    ctx.fillRect(0, 0, w, h);

                    // Fewer stars — dark, lonely
                    for (var i = 0; i < 60; i++) {
                        var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                        var sy = (Math.sin(i * 4.1 + 2.7) * 0.5 + 0.5) * h;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(200, 210, 230, 0.08)';
                        ctx.fill();
                    }

                    // Moon limb — huge curved edge, mostly dark
                    var limbProgress = p; // 0→1 as we go around
                    var limbX = w * (0.7 - limbProgress * 0.4);
                    // Moon edge as a massive arc taking up most of the screen
                    ctx.beginPath();
                    ctx.arc(limbX + w * 0.6, cy, w * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = '#080808';
                    ctx.fill();

                    // Faint terminator glow (sunlight just around the edge)
                    var termGlow = Math.sin(limbProgress * Math.PI) * 0.08;
                    var tG = ctx.createLinearGradient(limbX - 5, 0, limbX + 20, 0);
                    tG.addColorStop(0, 'rgba(200, 195, 180, 0)');
                    tG.addColorStop(0.4, 'rgba(200, 195, 180, ' + termGlow + ')');
                    tG.addColorStop(1, 'rgba(200, 195, 180, 0)');
                    ctx.fillStyle = tG;
                    ctx.fillRect(limbX - 5, 0, 25, h);

                    // Earth rise on the far side (appears mid-transit)
                    if (p > 0.3 && p < 0.8) {
                        var earthVis = Math.sin((p - 0.3) / 0.5 * Math.PI);
                        var erX = w * 0.1;
                        var erY = h * (0.4 - (p - 0.3) * 0.2);
                        drawEarth(ctx, erX, erY, 10 + earthVis * 8);
                    }

                    // Capsule silhouette
                    drawCapsule(ctx, w * 0.25, cy + Math.sin(t * 0.3) * 10, 0.8);

                    // Emerge back into light at end
                    if (p > 0.85) {
                        var emerge = (p - 0.85) / 0.15;
                        ctx.fillStyle = 'rgba(200, 195, 180, ' + (emerge * 0.05) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }

                // ==================== RETURN ====================
                else if (ph.name === 'return') {
                    // Heading back to Earth, moon shrinking, Earth growing
                    ctx.fillStyle = '#020206';
                    ctx.fillRect(0, 0, w, h);
                    drawStars(ctx, w, h, t, 1);

                    // Moon shrinking behind
                    var moonShrink = 1 - p;
                    var moonR2 = Math.max(5, 30 * moonShrink);
                    drawMoon(ctx, w * (0.75 + p * 0.1), h * (0.25 - p * 0.05), moonR2);

                    // Earth growing ahead
                    var earthGrow = sm(0, 1, p);
                    var earthR3 = 8 + earthGrow * 50;
                    drawEarth(ctx, w * (0.35 - earthGrow * 0.05), h * (0.6 + earthGrow * 0.05), earthR3);

                    // Capsule
                    drawCapsule(ctx, cx, cy, 1.0);
                    ctx.fillStyle = 'rgba(200, 205, 210, 0.15)';
                    ctx.fillRect(cx - 4, cy + 3, 8, 12);

                    // Correction burn
                    if (p > 0.3 && p < 0.6) {
                        var burn = Math.sin((p - 0.3) / 0.3 * Math.PI);
                        drawExhaust(ctx, cx, cy + 15, 0.3, burn * 0.4, t);
                    }
                }

                // ==================== REENTRY ====================
                else if (ph.name === 'reentry') {
                    // Heat shield, plasma, sky brightening
                    var heat = p < 0.6 ? sm(0, 0.4, p) : sm(0.4, 0.8, 1 - p);
                    var skyBright = sm(0.3, 1, p);

                    var skyG = ctx.createLinearGradient(0, 0, 0, h);
                    skyG.addColorStop(0, 'rgb(' + Math.round(2 + skyBright * 40) + ',' + Math.round(2 + skyBright * 60) + ',' + Math.round(6 + skyBright * 120) + ')');
                    skyG.addColorStop(1, 'rgb(' + Math.round(5 + skyBright * 50) + ',' + Math.round(5 + skyBright * 80) + ',' + Math.round(10 + skyBright * 140) + ')');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Fading stars
                    if (skyBright < 0.5) {
                        drawStars(ctx, w, h, t, 1 - skyBright * 2);
                    }

                    // Capsule (heat shield facing down)
                    drawCapsule(ctx, cx, cy - 10, 1.3);

                    // Plasma / heat effects
                    if (heat > 0.05) {
                        // Orange-red heat envelope
                        var hG = ctx.createRadialGradient(cx, cy + 15, 0, cx, cy + 15, 80);
                        hG.addColorStop(0, 'rgba(255, 180, 60, ' + (heat * 0.2) + ')');
                        hG.addColorStop(0.3, 'rgba(255, 100, 20, ' + (heat * 0.12) + ')');
                        hG.addColorStop(0.7, 'rgba(255, 50, 10, ' + (heat * 0.05) + ')');
                        hG.addColorStop(1, 'rgba(200, 30, 5, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy + 15, 80, 0, Math.PI * 2);
                        ctx.fillStyle = hG;
                        ctx.fill();

                        // Plasma streaks
                        for (var i = 0; i < 10; i++) {
                            var px = cx + (Math.sin(i * 4.3 + t * 2) - 0.5) * 30;
                            var py = cy + 10;
                            ctx.beginPath();
                            ctx.moveTo(px, py);
                            ctx.lineTo(px + Math.sin(i * 2.7 + t) * 8, py + 20 + Math.sin(i * 3.1) * 10);
                            ctx.strokeStyle = 'rgba(255, 160, 60, ' + (heat * 0.06) + ')';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    }

                    // Glowing edges
                    if (heat > 0.1) {
                        ctx.beginPath();
                        ctx.ellipse(cx, cy + 8, 12, 5, 0, 0, Math.PI);
                        ctx.strokeStyle = 'rgba(255, 200, 100, ' + (heat * 0.15) + ')';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }

                // ==================== SPLASHDOWN ====================
                else if (ph.name === 'splashdown') {
                    // Parachutes deploy, then ocean landing
                    var chuteOpen = sm(0, 0.25, p);
                    var descend = sm(0, 0.7, p);
                    var splash = sm(0.7, 0.85, p);
                    var settle = sm(0.85, 1, p);

                    // Blue sky
                    var skyG = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                    skyG.addColorStop(0, '#4088c0');
                    skyG.addColorStop(1, '#60a8d8');
                    ctx.fillStyle = skyG;
                    ctx.fillRect(0, 0, w, h);

                    // Ocean
                    var oceanY = h * (0.55 + descend * 0.05);
                    var oG = ctx.createLinearGradient(0, oceanY, 0, h);
                    oG.addColorStop(0, '#1a5878');
                    oG.addColorStop(1, '#0a3050');
                    ctx.fillStyle = oG;
                    ctx.fillRect(0, oceanY, w, h - oceanY);

                    // Waves
                    for (var i = 0; i < 5; i++) {
                        ctx.beginPath();
                        for (var x = 0; x <= w; x += 4) {
                            var wy = oceanY + i * 6 + Math.sin(x * 0.008 + t * (0.5 + i * 0.15) + i * 1.5) * 4;
                            if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
                        }
                        ctx.strokeStyle = 'rgba(100, 180, 210, 0.04)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Capsule position descending
                    var capY = h * 0.3 + descend * (oceanY - h * 0.32);
                    if (splash > 0) capY = oceanY - 5;

                    // Parachutes (3 main chutes)
                    if (chuteOpen > 0 && splash < 0.5) {
                        var chuteFade = splash > 0 ? 1 - splash * 2 : 1;
                        for (var i = -1; i <= 1; i++) {
                            var chuteX = cx + i * 35 * chuteOpen;
                            var chuteTopY = capY - 70 * chuteOpen;
                            var chuteW = 20 * chuteOpen;
                            // Canopy
                            ctx.beginPath();
                            ctx.ellipse(chuteX, chuteTopY, chuteW, chuteW * 0.5, 0, Math.PI, 0);
                            ctx.fillStyle = 'rgba(220, 100, 40, ' + (0.07 * chuteFade) + ')';
                            ctx.fill();
                            ctx.strokeStyle = 'rgba(200, 80, 30, ' + (0.05 * chuteFade) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                            // Shroud lines
                            ctx.beginPath();
                            ctx.moveTo(chuteX - chuteW * 0.8, chuteTopY);
                            ctx.lineTo(cx, capY - 10);
                            ctx.moveTo(chuteX + chuteW * 0.8, chuteTopY);
                            ctx.lineTo(cx, capY - 10);
                            ctx.strokeStyle = 'rgba(180, 180, 170, ' + (0.03 * chuteFade) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }

                    // Capsule
                    drawCapsule(ctx, cx, capY, 1.2);

                    // Splash effect
                    if (splash > 0 && splash < 0.8) {
                        var splashInt = splash < 0.4 ? splash / 0.4 : 1 - (splash - 0.4) / 0.4;
                        for (var i = 0; i < 10; i++) {
                            var spx = cx + (Math.sin(i * 3.7 + 0.5) - 0.5) * 60 * splashInt;
                            var spy = oceanY - Math.abs(Math.sin(i * 2.3 + 0.7)) * 40 * splashInt;
                            ctx.beginPath();
                            ctx.arc(spx, spy, 2 * splashInt, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(180, 220, 240, ' + (splashInt * 0.1) + ')';
                            ctx.fill();
                        }
                        // White water ring
                        ctx.beginPath();
                        ctx.ellipse(cx, oceanY, 30 * splashInt, 6 * splashInt, 0, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(220, 240, 250, ' + (splashInt * 0.06) + ')';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    // Bobbing on waves after landing
                    if (settle > 0) {
                        var bob = Math.sin(t * 1.5) * 3 * settle;
                        drawCapsule(ctx, cx, oceanY - 3 + bob, 1.2);
                    }

                    // Fade to black for loop
                    if (p > 0.88) {
                        ctx.fillStyle = 'rgba(0, 0, 0, ' + ((p - 0.88) / 0.12 * 0.7) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();
})(window.CV.themes, window.CV.FALLBACK_DT);
