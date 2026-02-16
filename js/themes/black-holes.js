(function (themes) {
    // --- Black Holes themes ---

    // 1. Singularity — Lone Black Hole with Accretion Disk
    themes.singularity = (function () {
        return {
            targetCount: 60,

            spawn: function (w, h) {
                var angle = Math.random() * Math.PI * 2;
                var dist = 0.08 + Math.random() * 0.28;
                return {
                    angle: angle,
                    dist: dist,
                    speed: 0.4 + (1 - dist) * 1.2,
                    inward: 0.008 + Math.random() * 0.012,
                    size: 0.5 + Math.random() * 2,
                    hue: 20 + Math.random() * 30
                };
            },

            update: function (p, dt, w, h, state) {
                p.angle += p.speed * dt;
                p.dist -= p.inward * dt;
                if (p.dist < 0.03) {
                    p.dist = 0.08 + Math.random() * 0.28;
                    p.angle = Math.random() * Math.PI * 2;
                }
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var px = cx + Math.cos(p.angle) * p.dist * minDim;
                var py = cy + Math.sin(p.angle) * p.dist * minDim * 0.35;
                var heat = 1 - (p.dist - 0.03) / 0.33;
                var r = Math.floor(255 * Math.min(1, 0.5 + heat * 0.5));
                var g = Math.floor(180 * heat);
                var b = Math.floor(60 * heat);
                var op = 0.3 + heat * 0.5;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                // Dark space
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim distant stars
                for (var i = 0; i < 150; i++) {
                    var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.1 + 2.1) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * (0.3 + i * 0.02) + i) * 0.5 + 0.5) * 0.2;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 3.1) * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
                // Black hole
                var bhR = minDim * 0.06;
                var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var bhR = minDim * 0.06;
                // Photon ring glow
                for (var r = 0; r < 3; r++) {
                    var ringR = bhR + 2 + r * 3;
                    var ringOp = 0.2 - r * 0.05;
                    var grd = ctx.createRadialGradient(cx, cy, ringR - 2, cx, cy, ringR + 4);
                    grd.addColorStop(0, 'rgba(180,200,255,' + ringOp + ')');
                    grd.addColorStop(1, 'rgba(100,150,255,0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, ringR + 4, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }
                // Subtle lensing distortion ring
                var lensR = bhR * 2.5;
                var lensGrad = ctx.createRadialGradient(cx, cy, bhR, cx, cy, lensR);
                lensGrad.addColorStop(0, 'rgba(150,180,255,0.04)');
                lensGrad.addColorStop(0.5, 'rgba(120,150,220,0.02)');
                lensGrad.addColorStop(1, 'rgba(80,100,200,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, lensR, 0, Math.PI * 2);
                ctx.fillStyle = lensGrad;
                ctx.fill();
            }
        };
    })();

    // 2. Orbiting — Binary Black Holes
    themes.orbiting = (function () {
        var orbitRadius = 0.12;
        var orbitSpeed = 0.25;
        var waveRings = [];
        for (var i = 0; i < 8; i++) {
            waveRings.push({ birthTime: -100, radius: 0 });
        }
        var waveIdx = 0;
        var waveTimer = 0;

        return {
            targetCount: 80,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.2,
                    baseOpacity: 0.15 + Math.random() * 0.35,
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
                ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 130; i++) {
                    var sx = (Math.sin(i * 6.9 + 0.7) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 10.7 + 1.9) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * 0.3 + i * 0.8) * 0.5 + 0.5) * 0.18;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 2.7) * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || 0.016;
                var t = state.timeElapsed;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var orbR = orbitRadius * minDim;
                var angle = t * orbitSpeed;

                var bh1x = cx + Math.cos(angle) * orbR;
                var bh1y = cy + Math.sin(angle) * orbR * 0.4;
                var bh2x = cx + Math.cos(angle + Math.PI) * orbR;
                var bh2y = cy + Math.sin(angle + Math.PI) * orbR * 0.4;
                var bhR = minDim * 0.035;

                // Draw both black holes with photon rings
                for (var b = 0; b < 2; b++) {
                    var bx = b === 0 ? bh1x : bh2x;
                    var by = b === 0 ? bh1y : bh2y;
                    // Photon ring
                    var grd = ctx.createRadialGradient(bx, by, bhR - 1, bx, by, bhR + 6);
                    grd.addColorStop(0, 'rgba(150,180,255,0.25)');
                    grd.addColorStop(1, 'rgba(100,130,255,0)');
                    ctx.beginPath();
                    ctx.arc(bx, by, bhR + 6, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                    // Black hole
                    var bhGrd = ctx.createRadialGradient(bx, by, bhR * 0.85, bx, by, bhR);
                    bhGrd.addColorStop(0, '#000000');
                    bhGrd.addColorStop(0.85, '#000000');
                    bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(bx, by, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = bhGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Matter bridge between holes
                ctx.save();
                ctx.globalAlpha = 0.4;
                for (var i = 0; i < 20; i++) {
                    var frac = i / 20;
                    var mx = bh1x + (bh2x - bh1x) * frac;
                    var my = bh1y + (bh2y - bh1y) * frac;
                    var wobble = Math.sin(frac * Math.PI * 3 + t * 2) * 5;
                    mx += wobble * Math.cos(angle + Math.PI * 0.5);
                    my += wobble * Math.sin(angle + Math.PI * 0.5) * 0.4;
                    ctx.beginPath();
                    ctx.arc(mx, my, 1, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(180,200,255,' + (0.1 + Math.sin(frac * Math.PI) * 0.15) + ')';
                    ctx.fill();
                }
                ctx.restore();

                // Gravitational wave ripples
                waveTimer += dt;
                if (waveTimer > 1.5) {
                    waveTimer = 0;
                    waveRings[waveIdx].birthTime = t;
                    waveRings[waveIdx].radius = 0;
                    waveIdx = (waveIdx + 1) % waveRings.length;
                }
                for (var i = 0; i < waveRings.length; i++) {
                    var age = t - waveRings[i].birthTime;
                    if (age < 0 || age > 4) continue;
                    var rr = age * minDim * 0.12;
                    var rop = (1 - age / 4) * 0.08;
                    ctx.beginPath();
                    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(150,180,255,' + rop + ')';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        };
    })();

    // 3. Accreting — Star Being Devoured
    themes.accreting = (function () {
        var CYCLE = 20;

        return {
            cycleDuration: CYCLE,
            targetCount: 50,

            spawn: function (w, h) {
                return {
                    streamPos: Math.random(),
                    speed: 0.3 + Math.random() * 0.4,
                    size: 0.8 + Math.random() * 1.5,
                    offset: (Math.random() - 0.5) * 0.02
                };
            },

            update: function (p, dt, w, h, state) {
                p.streamPos += p.speed * dt * 0.05;
                if (p.streamPos > 1) p.streamPos -= 1;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var cycle = (state.timeElapsed % CYCLE) / CYCLE;
                // Star position (top-right, drifting toward center)
                var starDist = 0.35 - cycle * 0.15;
                var starX = cx + minDim * starDist * 0.7;
                var starY = cy - minDim * starDist * 0.5;
                // Bezier stream from star to black hole
                var t = p.streamPos;
                var cpx = cx + minDim * 0.15;
                var cpy = cy - minDim * 0.2;
                var px = (1 - t) * (1 - t) * starX + 2 * (1 - t) * t * cpx + t * t * cx;
                var py = (1 - t) * (1 - t) * starY + 2 * (1 - t) * t * cpy + t * t * cy;
                px += p.offset * minDim;
                var heat = t;
                var r = Math.floor(255);
                var g = Math.floor(200 * (1 - heat) + 100 * heat);
                var b = Math.floor(100 * (1 - heat));
                ctx.beginPath();
                ctx.arc(px, py, p.size * (1 - t * 0.5), 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.3 + t * 0.4) + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 120; i++) {
                    var sx = (Math.sin(i * 7.7 + 0.3) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.3 + 1.7) * 0.5 + 0.5) * h;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.sin(state.timeElapsed * 0.5 + i) * 0.05) + ')';
                    ctx.fill();
                }
                // Black hole
                var cx = w * 0.5, cy = h * 0.5;
                var bhR = Math.min(w, h) * 0.05;
                var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE) / CYCLE;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var bhR = minDim * 0.05;
                // Photon ring
                var grd = ctx.createRadialGradient(cx, cy, bhR, cx, cy, bhR + 8);
                grd.addColorStop(0, 'rgba(150,180,255,0.2)');
                grd.addColorStop(1, 'rgba(100,130,255,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR + 8, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
                // Star (shrinking over cycle)
                var starDist = 0.35 - cycle * 0.15;
                var starX = cx + minDim * starDist * 0.7;
                var starY = cy - minDim * starDist * 0.5;
                var starR = minDim * (0.03 - cycle * 0.015);
                if (starR > 1) {
                    var sGrad = ctx.createRadialGradient(starX, starY, 0, starX, starY, starR * 3);
                    sGrad.addColorStop(0, 'rgba(255,240,200,0.6)');
                    sGrad.addColorStop(0.3, 'rgba(255,200,100,0.2)');
                    sGrad.addColorStop(1, 'rgba(255,150,50,0)');
                    ctx.beginPath();
                    ctx.arc(starX, starY, starR * 3, 0, Math.PI * 2);
                    ctx.fillStyle = sGrad;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(starX, starY, starR, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,245,220,0.8)';
                    ctx.fill();
                }
                // X-ray jet flares at poles
                var jetOp = 0.03 + Math.sin(t * 3) * 0.02;
                for (var j = -1; j <= 1; j += 2) {
                    var jetGrad = ctx.createLinearGradient(cx, cy, cx, cy + j * minDim * 0.3);
                    jetGrad.addColorStop(0, 'rgba(100,150,255,' + jetOp + ')');
                    jetGrad.addColorStop(1, 'rgba(100,150,255,0)');
                    ctx.beginPath();
                    ctx.moveTo(cx - 3, cy);
                    ctx.lineTo(cx + 3, cy);
                    ctx.lineTo(cx + 8, cy + j * minDim * 0.3);
                    ctx.lineTo(cx - 8, cy + j * minDim * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = jetGrad;
                    ctx.fill();
                }
            }
        };
    })();

    // 4. Collapsing — Stellar Collapse into Black Hole
    themes.collapsing = (function () {
        var CYCLE_DURATION = 16;

        return {
            cycleDuration: CYCLE_DURATION,
            targetCount: 80,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.2 + Math.random() * 0.4,
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
                var shake = (cycle > 0.2 && cycle < 0.45) ? (1 - (cycle - 0.2) / 0.25) * 4 : 0;
                var sx = p.x + Math.sin(t * 25 + p.twinkleOffset) * shake * p.shakeAmp;
                var sy = p.y + Math.cos(t * 22 + p.twinkleOffset * 2) * shake * p.shakeAmp;
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 130; i++) {
                    var sx = (Math.sin(i * 8.1 + 0.4) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 12.3 + 2.6) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * 0.3 + i * 0.9) * 0.5 + 0.5) * 0.18;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 3.3) * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var maxDim = Math.max(w, h);

                // Phase 1: Bright star (0 - 0.15)
                if (cycle < 0.15) {
                    var p = cycle / 0.15;
                    var starR = minDim * (0.04 + p * 0.02);
                    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, starR * 3);
                    grd.addColorStop(0, 'rgba(255,240,220,' + (0.4 + p * 0.5) + ')');
                    grd.addColorStop(0.3, 'rgba(255,200,150,' + (0.15 + p * 0.2) + ')');
                    grd.addColorStop(1, 'rgba(200,100,50,0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, starR * 3, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }

                // Phase 2: Core collapse (0.15 - 0.3)
                if (cycle >= 0.15 && cycle < 0.3) {
                    var p = (cycle - 0.15) / 0.15;
                    var colR = minDim * (0.06 * (1 - p * 0.8));
                    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, colR * 2);
                    grd.addColorStop(0, 'rgba(255,255,255,' + (0.8 * (1 - p)) + ')');
                    grd.addColorStop(0.5, 'rgba(200,150,255,' + (0.3 * (1 - p)) + ')');
                    grd.addColorStop(1, 'rgba(100,50,200,0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, colR * 2, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }

                // Phase 3: Shockwave ring expanding (0.3 - 0.6)
                if (cycle >= 0.3 && cycle < 0.6) {
                    var p = (cycle - 0.3) / 0.3;
                    // White flash at start
                    if (p < 0.1) {
                        ctx.fillStyle = 'rgba(255,255,255,' + ((1 - p / 0.1) * 0.3) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                    // Expanding ring
                    var ringR = p * maxDim * 0.7;
                    var ringOp = (1 - p) * 0.2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(150,200,255,' + ringOp + ')';
                    ctx.lineWidth = 4 + p * 10;
                    ctx.stroke();
                }

                // Phase 4: Darkness consuming center (0.4 - 0.7)
                if (cycle >= 0.4 && cycle < 0.7) {
                    var p = (cycle - 0.4) / 0.3;
                    var bhR = minDim * 0.005 + p * minDim * 0.05;
                    var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                    bhGrd.addColorStop(0, '#000000');
                    bhGrd.addColorStop(0.85, '#000000');
                    bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = bhGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,' + (p * 0.3) + ')';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Phase 5: Black hole with faint ring settled (0.7 - 1.0)
                if (cycle >= 0.7) {
                    var p = (cycle - 0.7) / 0.3;
                    var bhR = minDim * 0.055;
                    var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                    bhGrd.addColorStop(0, '#000000');
                    bhGrd.addColorStop(0.85, '#000000');
                    bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = bhGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // Photon ring fading in
                    var ringOp = p * 0.2;
                    var grd = ctx.createRadialGradient(cx, cy, bhR, cx, cy, bhR + 8);
                    grd.addColorStop(0, 'rgba(150,180,255,' + ringOp + ')');
                    grd.addColorStop(1, 'rgba(100,130,255,0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR + 8, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                    // Fade to black for loop
                    if (p > 0.8) {
                        ctx.fillStyle = 'rgba(2,2,8,' + ((p - 0.8) / 0.2 * 0.8) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // 5. Lensing — Gravitational Lensing
    themes.lensing = (function () {
        var bhAngle = 0;
        var bhSpeed = 0.05;

        return {
            targetCount: 120,

            spawn: function (w, h) {
                return {
                    baseX: Math.random() * w,
                    baseY: Math.random() * h,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.15 + Math.random() * 0.5,
                    twinkleSpeed: 0.3 + Math.random() * 1.5,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) { return true; },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var t = state.timeElapsed;
                // Black hole drifts in a slow figure-8
                var bhX = cx + Math.sin(t * bhSpeed) * w * 0.25;
                var bhY = cy + Math.sin(t * bhSpeed * 1.7) * h * 0.15;

                var dx = p.baseX - bhX;
                var dy = p.baseY - bhY;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var schwarzR = minDim * 0.04;
                var lensStr = schwarzR * schwarzR * 2;
                var dispX = 0, dispY = 0;
                if (dist > schwarzR * 0.5) {
                    var force = lensStr / (dist * dist);
                    force = Math.min(force, 0.5);
                    // Tangential displacement (Einstein ring effect)
                    var nx = dx / dist, ny = dy / dist;
                    dispX = -ny * force * dist * 0.5 + nx * force * dist * 0.3;
                    dispY = nx * force * dist * 0.5 + ny * force * dist * 0.3;
                }

                var drawX = p.baseX + dispX;
                var drawY = p.baseY + dispY;
                var twinkle = Math.sin(t * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                // Brighten stars near the hole (lensing amplification)
                if (dist < minDim * 0.15) {
                    op *= 1 + (1 - dist / (minDim * 0.15)) * 2;
                    op = Math.min(op, 1);
                }
                // Hide if inside event horizon
                if (dist < schwarzR * 0.8) return;
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                // Deep dark blue-black gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#020210');
                grad.addColorStop(0.5, '#030218');
                grad.addColorStop(1, '#020210');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var bhX = cx + Math.sin(t * bhSpeed) * w * 0.25;
                var bhY = cy + Math.sin(t * bhSpeed * 1.7) * h * 0.15;
                var schwarzR = minDim * 0.04;
                // Black hole
                var bhGrd = ctx.createRadialGradient(bhX, bhY, schwarzR * 0.85, bhX, bhY, schwarzR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(bhX, bhY, schwarzR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Photon ring
                var grd = ctx.createRadialGradient(bhX, bhY, schwarzR - 1, bhX, bhY, schwarzR + 5);
                grd.addColorStop(0, 'rgba(160,190,255,0.2)');
                grd.addColorStop(1, 'rgba(120,150,255,0)');
                ctx.beginPath();
                ctx.arc(bhX, bhY, schwarzR + 5, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }
        };
    })();

    // 6. Spaghettified — Spaghettification
    themes.spaghettified = (function () {
        var CYCLE_DURATION = 12;

        return {
            cycleDuration: CYCLE_DURATION,
            targetCount: 40,

            spawn: function (w, h) {
                return {
                    angle: Math.random() * Math.PI * 2,
                    dist: 0.05 + Math.random() * 0.15,
                    speed: 0.5 + Math.random() * 1,
                    size: 0.5 + Math.random() * 1.5
                };
            },

            update: function (p, dt, w, h, state) {
                var cycle = (state.timeElapsed % CYCLE_DURATION) / CYCLE_DURATION;
                if (cycle > 0.3 && cycle < 0.85) {
                    p.dist -= 0.02 * dt;
                    if (p.dist < 0.01) p.dist = 0.05 + Math.random() * 0.15;
                }
                p.angle += p.speed * dt * 0.3;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.65;
                var minDim = Math.min(w, h);
                var px = cx + Math.cos(p.angle) * p.dist * minDim;
                var py = cy + Math.sin(p.angle) * p.dist * minDim;
                var op = 0.2 + (1 - p.dist / 0.2) * 0.4;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,200,150,' + Math.max(0, op) + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Accretion disk from the side (thin bright line)
                var cx = w * 0.5, cy = h * 0.65;
                var diskW = Math.min(w, h) * 0.3;
                var grad = ctx.createLinearGradient(cx - diskW, cy, cx + diskW, cy);
                grad.addColorStop(0, 'rgba(255,150,50,0)');
                grad.addColorStop(0.3, 'rgba(255,200,100,0.1)');
                grad.addColorStop(0.5, 'rgba(255,220,150,0.15)');
                grad.addColorStop(0.7, 'rgba(255,200,100,0.1)');
                grad.addColorStop(1, 'rgba(255,150,50,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(cx - diskW, cy - 2, diskW * 2, 4);
                // Black hole
                var bhR = Math.min(w, h) * 0.04;
                var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var cx = w * 0.5, cy = h * 0.65;
                var minDim = Math.min(w, h);

                // Infalling object: approach (0-0.3), stretch (0.3-0.85), vanish (0.85-1)
                if (cycle < 0.85) {
                    var objY, stretchH, stretchW;
                    if (cycle < 0.3) {
                        // Approach from top
                        var p = cycle / 0.3;
                        objY = h * 0.1 + p * (cy - h * 0.1 - minDim * 0.15);
                        stretchH = minDim * 0.02;
                        stretchW = minDim * 0.015;
                    } else {
                        // Stretching
                        var p = (cycle - 0.3) / 0.55;
                        objY = cy - minDim * 0.15 + p * minDim * 0.12;
                        stretchH = minDim * (0.02 + p * 0.08);
                        stretchW = minDim * (0.015 * (1 - p * 0.7));
                    }
                    var objOp = cycle > 0.75 ? (1 - (cycle - 0.75) / 0.1) : 1;
                    ctx.save();
                    ctx.globalAlpha = objOp * 0.7;
                    ctx.fillStyle = 'rgba(255,220,180,0.8)';
                    ctx.beginPath();
                    ctx.ellipse(cx, objY, stretchW, stretchH, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Glow
                    var grd = ctx.createRadialGradient(cx, objY, 0, cx, objY, stretchH * 2);
                    grd.addColorStop(0, 'rgba(255,200,150,0.15)');
                    grd.addColorStop(1, 'rgba(255,150,100,0)');
                    ctx.beginPath();
                    ctx.arc(cx, objY, stretchH * 2, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                    ctx.restore();
                }

                // Tidal force field lines
                ctx.save();
                ctx.globalAlpha = 0.04;
                for (var i = 0; i < 12; i++) {
                    var a = (i / 12) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + Math.cos(a) * minDim * 0.2, cy + Math.sin(a) * minDim * 0.2);
                    ctx.strokeStyle = 'rgba(180,200,255,1)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                ctx.restore();
            }
        };
    })();

    // 7. Wormhole — Wormhole Transit
    themes.wormhole = (function () {
        var STAR_COUNT = 350;
        var stars = [];
        var inited = false;

        function initStars() {
            stars.length = 0;
            for (var i = 0; i < STAR_COUNT; i++) {
                var angle = Math.random() * Math.PI * 2;
                var radius = 0.3 + Math.random() * 0.7;
                stars.push({
                    angle: angle,
                    radius: radius,
                    z: Math.random() * 3,
                    speed: 0.5 + Math.random() * 0.5,
                    hue: Math.random() < 0.5 ? 240 + Math.random() * 40 : 30 + Math.random() * 20
                });
            }
            inited = true;
        }

        return {
            targetCount: 0,
            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () { initStars(); },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || 0.016;
                if (!inited) initStars();
                var t = state.timeElapsed;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var speed = 0.7 + Math.sin(t * 0.12) * 0.3;
                // Color transition through the wormhole
                var colorPhase = (Math.sin(t * 0.08) * 0.5 + 0.5);

                // Draw energy rings along the tunnel
                for (var r = 0; r < 10; r++) {
                    var rz = ((r * 0.3 + t * speed) % 3);
                    if (rz < 0.1) continue;
                    var proj = 1 / rz;
                    var ringR = minDim * 0.4 * proj;
                    if (ringR > minDim * 0.6 || ringR < 5) continue;
                    var pulse = Math.sin(t * 2 + r * 1.5) * 0.5 + 0.5;
                    var hue = 260 * (1 - colorPhase) + 30 * colorPhase;
                    var ringOp = (0.02 + pulse * 0.03) * Math.min(1, rz / 0.5);
                    ctx.beginPath();
                    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
                    ctx.strokeStyle = 'hsla(' + hue + ',70%,60%,' + ringOp + ')';
                    ctx.lineWidth = 2 * proj;
                    ctx.stroke();
                }

                // Star streaks
                for (var i = 0; i < stars.length; i++) {
                    var s = stars[i];
                    s.z -= speed * dt;
                    if (s.z <= 0.05) {
                        s.angle = Math.random() * Math.PI * 2;
                        s.radius = 0.3 + Math.random() * 0.7;
                        s.z = 2.5 + Math.random() * 0.5;
                        continue;
                    }
                    var proj = 1 / s.z;
                    var sx = cx + Math.cos(s.angle) * s.radius * minDim * 0.4 * proj;
                    var sy = cy + Math.sin(s.angle) * s.radius * minDim * 0.4 * proj;
                    if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) {
                        s.z = 2.5 + Math.random() * 0.5;
                        continue;
                    }
                    var brightness = Math.min(1, (3 - s.z) / 2);
                    var size = Math.max(0.5, (1 - s.z / 3) * 2.5);
                    // Hue shifts from blue/purple to orange/gold
                    var hue = s.hue * (1 - colorPhase) + (s.hue < 200 ? 260 : 35) * colorPhase;
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + hue + ',70%,70%,' + brightness + ')';
                    ctx.fill();
                    // Streak
                    var prevProj = 1 / (s.z + speed * dt);
                    var psx = cx + Math.cos(s.angle) * s.radius * minDim * 0.4 * prevProj;
                    var psy = cy + Math.sin(s.angle) * s.radius * minDim * 0.4 * prevProj;
                    ctx.beginPath();
                    ctx.moveTo(psx, psy);
                    ctx.lineTo(sx, sy);
                    ctx.strokeStyle = 'hsla(' + hue + ',60%,60%,' + (brightness * 0.4) + ')';
                    ctx.lineWidth = size * 0.6;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }

                // Exit light at far end
                var exitHue = 30 * colorPhase + 260 * (1 - colorPhase);
                var exitGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.05);
                exitGrad.addColorStop(0, 'hsla(' + exitHue + ',50%,80%,0.08)');
                exitGrad.addColorStop(1, 'hsla(' + exitHue + ',50%,50%,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, minDim * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = exitGrad;
                ctx.fill();
            }
        };
    })();

    // 8. Tidal Locked — Planets Orbiting a Black Hole
    themes.tidallocked = (function () {
        var planets = [
            { dist: 0.12, speed: 1.2, size: 4, angle: 0, color: [180, 160, 140] },
            { dist: 0.2, speed: 0.6, size: 6, angle: Math.PI * 0.7, color: [100, 140, 200] },
            { dist: 0.3, speed: 0.3, size: 8, angle: Math.PI * 1.3, color: [140, 180, 120] },
            { dist: 0.4, speed: 0.15, size: 5, angle: Math.PI * 0.3, color: [200, 160, 120] }
        ];

        return {
            targetCount: 60,

            spawn: function (w, h) {
                var angle = Math.random() * Math.PI * 2;
                var dist = 0.06 + Math.random() * 0.08;
                return {
                    angle: angle,
                    dist: dist,
                    speed: 0.8 + (1 - dist / 0.14) * 0.8,
                    size: 0.3 + Math.random() * 0.8,
                    opacity: 0.1 + Math.random() * 0.15
                };
            },

            update: function (p, dt, w, h, state) {
                p.angle += p.speed * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var px = cx + Math.cos(p.angle) * p.dist * minDim;
                var py = cy + Math.sin(p.angle) * p.dist * minDim * 0.3;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,200,150,' + p.opacity + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 130; i++) {
                    var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.1 + 2.1) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * 0.3 + i) * 0.5 + 0.5) * 0.15;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
                // Black hole
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var bhR = minDim * 0.045;
                // Glow ring
                var grd = ctx.createRadialGradient(cx, cy, bhR, cx, cy, bhR + 10);
                grd.addColorStop(0, 'rgba(150,180,255,0.2)');
                grd.addColorStop(1, 'rgba(100,130,255,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR + 10, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
                var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);

                // Orbital path lines
                ctx.save();
                for (var i = 0; i < planets.length; i++) {
                    var pl = planets[i];
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, pl.dist * minDim, pl.dist * minDim * 0.3, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(100,130,180,0.04)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                ctx.restore();

                // Draw planets
                for (var i = 0; i < planets.length; i++) {
                    var pl = planets[i];
                    var a = pl.angle + t * pl.speed;
                    var px = cx + Math.cos(a) * pl.dist * minDim;
                    var py = cy + Math.sin(a) * pl.dist * minDim * 0.3;
                    // Lit sphere effect
                    var grd = ctx.createRadialGradient(px - pl.size * 0.3, py - pl.size * 0.3, 0, px, py, pl.size);
                    grd.addColorStop(0, 'rgba(' + Math.min(255, pl.color[0] + 60) + ',' + Math.min(255, pl.color[1] + 60) + ',' + Math.min(255, pl.color[2] + 60) + ',0.8)');
                    grd.addColorStop(1, 'rgba(' + Math.floor(pl.color[0] * 0.3) + ',' + Math.floor(pl.color[1] * 0.3) + ',' + Math.floor(pl.color[2] * 0.3) + ',0.8)');
                    ctx.beginPath();
                    ctx.arc(px, py, pl.size, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                }
            }
        };
    })();

    // 9. Hawking — Hawking Radiation
    themes.hawking = (function () {
        var CYCLE_DURATION = 30;
        var pairs = [];
        var MAX_PAIRS = 15;
        var pairTimer = 0;

        return {
            cycleDuration: CYCLE_DURATION,
            targetCount: 30,

            onActivate: function () {
                pairs.length = 0;
                pairTimer = 0;
            },

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.2 + Math.random() * 0.8,
                    baseOpacity: 0.05 + Math.random() * 0.1,
                    twinkleSpeed: 0.3 + Math.random() * 1,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) { return true; },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                if (op < 0.02) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#010108';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 130; i++) {
                    var sx = (Math.sin(i * 7.1 + 0.9) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 10.3 + 2.3) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * 0.3 + i * 0.7) * 0.5 + 0.5) * 0.15;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 2.9) * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || 0.016;
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                // Black hole shrinks over cycle
                var bhR = minDim * (0.06 - cycle * 0.04);

                if (bhR > 2) {
                    // Black hole
                    var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                    bhGrd.addColorStop(0, '#000000');
                    bhGrd.addColorStop(0.85, '#000000');
                    bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = bhGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // Quantum foam edge
                    for (var i = 0; i < 20; i++) {
                        var a = (i / 20) * Math.PI * 2 + t * 0.5;
                        var flicker = Math.sin(t * 10 + i * 3.7) * 0.5 + 0.5;
                        var fx = cx + Math.cos(a) * (bhR + flicker * 3);
                        var fy = cy + Math.sin(a) * (bhR + flicker * 3);
                        ctx.beginPath();
                        ctx.arc(fx, fy, 0.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(100,200,200,' + (flicker * 0.15) + ')';
                        ctx.fill();
                    }
                }

                // Spawn particle pairs
                pairTimer += dt;
                if (pairTimer > 0.5 && bhR > 2) {
                    pairTimer = 0;
                    if (pairs.length < MAX_PAIRS * 2) {
                        var a = Math.random() * Math.PI * 2;
                        var spawnR = bhR + 4;
                        var sx = cx + Math.cos(a) * spawnR;
                        var sy = cy + Math.sin(a) * spawnR;
                        // Escaping particle
                        pairs.push({ x: sx, y: sy, vx: Math.cos(a) * 15, vy: Math.sin(a) * 15, life: 0, maxLife: 3, escaping: true });
                        // Infalling particle
                        pairs.push({ x: sx, y: sy, vx: -Math.cos(a) * 8, vy: -Math.sin(a) * 8, life: 0, maxLife: 1.5, escaping: false });
                    }
                }

                // Update and draw pairs
                for (var i = pairs.length - 1; i >= 0; i--) {
                    var pp = pairs[i];
                    pp.life += dt;
                    if (pp.life >= pp.maxLife) { pairs.splice(i, 1); continue; }
                    pp.x += pp.vx * dt;
                    pp.y += pp.vy * dt;
                    var fade = pp.escaping ? Math.min(1, pp.life * 2) * (1 - pp.life / pp.maxLife) : (1 - pp.life / pp.maxLife);
                    var op = fade * 0.4;
                    if (op < 0.01) continue;
                    ctx.beginPath();
                    ctx.arc(pp.x, pp.y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = pp.escaping ? 'rgba(100,220,200,' + op + ')' : 'rgba(200,100,100,' + op + ')';
                    ctx.fill();
                }

                // Final evaporation flash
                if (cycle > 0.92 && bhR <= 2) {
                    var flashP = (cycle - 0.92) / 0.08;
                    if (flashP < 0.3) {
                        var flashOp = flashP / 0.3 * 0.3;
                        ctx.fillStyle = 'rgba(200,255,255,' + flashOp + ')';
                        ctx.fillRect(0, 0, w, h);
                    } else {
                        var fadeOp = (1 - (flashP - 0.3) / 0.7) * 0.3;
                        ctx.fillStyle = 'rgba(200,255,255,' + Math.max(0, fadeOp) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // 10. Jettison — Relativistic Jets
    themes.jettison = (function () {
        return {
            targetCount: 70,

            spawn: function (w, h) {
                var isJet = Math.random() < 0.7;
                if (isJet) {
                    var dir = Math.random() < 0.5 ? -1 : 1;
                    return {
                        isJet: true,
                        dir: dir,
                        x: (Math.random() - 0.5) * 0.03,
                        y: 0,
                        speed: 80 + Math.random() * 120,
                        helical: Math.random() * Math.PI * 2,
                        helicalSpeed: 2 + Math.random() * 3,
                        helicalAmp: 0.005 + Math.random() * 0.01,
                        size: 0.5 + Math.random() * 1.5,
                        life: 0,
                        maxLife: 1.5 + Math.random() * 1
                    };
                } else {
                    return {
                        isJet: false,
                        x: Math.random() * w,
                        y: Math.random() * h,
                        size: 0.3 + Math.random() * 1,
                        baseOpacity: 0.1 + Math.random() * 0.25,
                        twinkleSpeed: 0.5 + Math.random() * 1.5,
                        twinkleOffset: Math.random() * Math.PI * 2
                    };
                }
            },

            update: function (p, dt, w, h, state) {
                if (!p.isJet) return true;
                p.life += dt;
                if (p.life >= p.maxLife) return false;
                p.y += p.dir * p.speed * dt;
                p.helical += p.helicalSpeed * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                if (!p.isJet) {
                    var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                    var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                    if (op < 0.04) return;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                    ctx.fill();
                    return;
                }
                var px = cx + (p.x + Math.sin(p.helical) * p.helicalAmp) * minDim;
                var py = cy + p.y * p.dir;
                var fade = Math.min(1, p.life * 3) * (1 - p.life / p.maxLife);
                var r = 180 + Math.floor(fade * 75);
                var g = 200 + Math.floor(fade * 55);
                var b = 255;
                ctx.beginPath();
                ctx.arc(px, py, p.size * fade, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (fade * 0.6) + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                // Accretion disk at an angle (ellipse)
                var diskRx = minDim * 0.15;
                var diskRy = minDim * 0.04;
                ctx.save();
                // Blue-shifted near side, red-shifted far side
                var diskGrad = ctx.createLinearGradient(cx - diskRx, cy, cx + diskRx, cy);
                diskGrad.addColorStop(0, 'rgba(100,150,255,0.12)');
                diskGrad.addColorStop(0.5, 'rgba(255,220,150,0.15)');
                diskGrad.addColorStop(1, 'rgba(255,100,50,0.1)');
                ctx.beginPath();
                ctx.ellipse(cx, cy, diskRx, diskRy, 0, 0, Math.PI * 2);
                ctx.fillStyle = diskGrad;
                ctx.fill();
                ctx.restore();
                // Black hole
                var bhR = minDim * 0.035;
                var bhGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                bhGrd.addColorStop(0, '#000000');
                bhGrd.addColorStop(0.85, '#000000');
                bhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                ctx.beginPath();
                ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                ctx.fillStyle = bhGrd;
                ctx.fill();
                ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);
                var t = state.timeElapsed;
                // Jet cones
                for (var j = -1; j <= 1; j += 2) {
                    var jetLen = minDim * 0.35;
                    var jetGrad = ctx.createLinearGradient(cx, cy, cx, cy + j * jetLen);
                    jetGrad.addColorStop(0, 'rgba(150,180,255,0.08)');
                    jetGrad.addColorStop(0.5, 'rgba(120,140,220,0.04)');
                    jetGrad.addColorStop(1, 'rgba(80,100,200,0)');
                    ctx.beginPath();
                    ctx.moveTo(cx - 4, cy);
                    ctx.lineTo(cx + 4, cy);
                    ctx.lineTo(cx + 20, cy + j * jetLen);
                    ctx.lineTo(cx - 20, cy + j * jetLen);
                    ctx.closePath();
                    ctx.fillStyle = jetGrad;
                    ctx.fill();
                }
                // Magnetic field spiral lines
                ctx.save();
                ctx.globalAlpha = 0.03;
                for (var i = 0; i < 6; i++) {
                    var sAngle = t * 0.2 + (i / 6) * Math.PI * 2;
                    ctx.beginPath();
                    for (var s = 0; s < 50; s++) {
                        var ss = s / 50;
                        var spiralR = 5 + ss * minDim * 0.02;
                        var sa = sAngle + ss * Math.PI * 4;
                        var sx = cx + Math.cos(sa) * spiralR;
                        var sy = cy + (ss - 0.5) * minDim * 0.3;
                        if (s === 0) ctx.moveTo(sx, sy);
                        else ctx.lineTo(sx, sy);
                    }
                    ctx.strokeStyle = 'rgba(150,180,255,1)';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
                ctx.restore();
            }
        };
    })();

    // 11. Merging — Black Hole Merger
    themes.merging = (function () {
        var CYCLE_DURATION = 22;

        return {
            cycleDuration: CYCLE_DURATION,
            targetCount: 80,

            spawn: function (w, h) {
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.15 + Math.random() * 0.4,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    wobbleAmp: Math.random() * 3
                };
            },

            update: function (p, dt, w, h, state) { return true; },

            draw: function (p, ctx, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var twinkle = Math.sin(t * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                // Gravitational wave wobble intensifies before merger
                var wobbleStr = cycle < 0.7 ? cycle / 0.7 : (cycle < 0.8 ? 1 : 1 - (cycle - 0.8) / 0.2);
                var wobble = Math.sin(t * (5 + wobbleStr * 15) + p.twinkleOffset) * p.wobbleAmp * wobbleStr;
                var sx = p.x + wobble;
                var sy = p.y + Math.cos(t * (4 + wobbleStr * 12) + p.twinkleOffset * 2) * p.wobbleAmp * wobbleStr * 0.5;
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                ctx.fillStyle = '#020208';
                ctx.fillRect(0, 0, w, h);
                // Dim stars
                for (var i = 0; i < 130; i++) {
                    var sx = (Math.sin(i * 7.5 + 0.2) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.7 + 1.4) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(state.timeElapsed * 0.3 + i * 0.6) * 0.5 + 0.5) * 0.18;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5 + Math.sin(i * 3.7) * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,' + sOp + ')';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cycle = (t % CYCLE_DURATION) / CYCLE_DURATION;
                var cx = w * 0.5, cy = h * 0.5;
                var minDim = Math.min(w, h);

                if (cycle < 0.75) {
                    // Inspiral phase: two black holes spiraling inward
                    var p = cycle / 0.75;
                    var orbR = minDim * (0.15 * (1 - p * 0.9));
                    var orbSpeed = 0.5 + p * 4;
                    var angle = t * orbSpeed;
                    var bh1x = cx + Math.cos(angle) * orbR;
                    var bh1y = cy + Math.sin(angle) * orbR;
                    var bh2x = cx + Math.cos(angle + Math.PI) * orbR;
                    var bh2y = cy + Math.sin(angle + Math.PI) * orbR;
                    var bhR = minDim * 0.025;

                    // Gravitational wave ripples
                    var waveCount = Math.floor(3 + p * 5);
                    for (var i = 0; i < waveCount; i++) {
                        var waveR = minDim * (0.05 + i * 0.06) * (1 + p * 0.5);
                        var waveOp = (0.02 + p * 0.04) * (1 - i / waveCount);
                        var wavePhase = Math.sin(t * 3 + i * 1.2);
                        waveR += wavePhase * 3;
                        ctx.beginPath();
                        ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(150,180,255,' + waveOp + ')';
                        ctx.lineWidth = 1 + p;
                        ctx.stroke();
                    }

                    // Draw black holes with photon rings
                    for (var b = 0; b < 2; b++) {
                        var bx = b === 0 ? bh1x : bh2x;
                        var by = b === 0 ? bh1y : bh2y;
                        var grd = ctx.createRadialGradient(bx, by, bhR - 1, bx, by, bhR + 5);
                        grd.addColorStop(0, 'rgba(150,180,255,0.25)');
                        grd.addColorStop(1, 'rgba(100,130,255,0)');
                        ctx.beginPath();
                        ctx.arc(bx, by, bhR + 5, 0, Math.PI * 2);
                        ctx.fillStyle = grd;
                        ctx.fill();
                        var mBhGrd = ctx.createRadialGradient(bx, by, bhR * 0.85, bx, by, bhR);
                        mBhGrd.addColorStop(0, '#000000');
                        mBhGrd.addColorStop(0.85, '#000000');
                        mBhGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                        ctx.beginPath();
                        ctx.arc(bx, by, bhR, 0, Math.PI * 2);
                        ctx.fillStyle = mBhGrd;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                } else if (cycle < 0.8) {
                    // Merger flash
                    var p = (cycle - 0.75) / 0.05;
                    var flashOp = (1 - p) * 0.25;
                    ctx.fillStyle = 'rgba(200,220,255,' + flashOp + ')';
                    ctx.fillRect(0, 0, w, h);
                    // Merged hole appearing
                    var bhR = minDim * 0.04;
                    var mfGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                    mfGrd.addColorStop(0, '#000000');
                    mfGrd.addColorStop(0.85, '#000000');
                    mfGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = mfGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else {
                    // Ringdown phase: single hole oscillating
                    var p = (cycle - 0.8) / 0.2;
                    var ringdown = Math.sin(t * 12) * (1 - p) * 0.3;
                    var bhR = minDim * (0.04 + ringdown * 0.01);
                    // Photon ring
                    var grd = ctx.createRadialGradient(cx, cy, bhR, cx, cy, bhR + 8);
                    grd.addColorStop(0, 'rgba(150,180,255,' + (0.2 * (1 - p * 0.5)) + ')');
                    grd.addColorStop(1, 'rgba(100,130,255,0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR + 8, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                    var rdGrd = ctx.createRadialGradient(cx, cy, bhR * 0.85, cx, cy, bhR);
                    rdGrd.addColorStop(0, '#000000');
                    rdGrd.addColorStop(0.85, '#000000');
                    rdGrd.addColorStop(1, 'rgba(40,60,120,0.4)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
                    ctx.fillStyle = rdGrd;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(80,120,200,0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    // Fading gravitational wave ripples
                    for (var i = 0; i < 4; i++) {
                        var waveR = minDim * (0.08 + i * 0.08 + p * 0.15);
                        var waveOp = (1 - p) * 0.04 * (1 - i / 4);
                        ctx.beginPath();
                        ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(150,180,255,' + waveOp + ')';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    // Fade to black for loop
                    if (p > 0.85) {
                        ctx.fillStyle = 'rgba(2,2,8,' + ((p - 0.85) / 0.15 * 0.8) + ')';
                        ctx.fillRect(0, 0, w, h);
                    }
                }
            }
        };
    })();

    // 12. Event Horizon — View From the Event Horizon
    themes.eventhorizon = (function () {
        return {
            targetCount: 180,

            spawn: function (w, h) {
                // Stars compressed into a circular band overhead
                var angle = Math.random() * Math.PI * 2;
                var bandDist = 0.15 + Math.random() * 0.1;
                return {
                    angle: angle,
                    bandDist: bandDist,
                    size: 0.3 + Math.random() * 1.5,
                    baseOpacity: 0.3 + Math.random() * 0.5,
                    speed: 0.05 + Math.random() * 0.1,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    hueShift: Math.random()
                };
            },

            update: function (p, dt, w, h, state) {
                // Slow swirl
                p.angle += p.speed * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width, h = ctx.canvas.height;
                var cx = w * 0.5, cy = h * 0.35;
                var minDim = Math.min(w, h);
                var px = cx + Math.cos(p.angle) * p.bandDist * minDim;
                var py = cy + Math.sin(p.angle) * p.bandDist * minDim * 0.5;
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                if (op < 0.04) return;
                // Blue-shifted stars
                var blue = Math.floor(200 + p.hueShift * 55);
                var green = Math.floor(200 + p.hueShift * 40);
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + green + ',' + green + ',' + blue + ',' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                // Pure black below, compressed universe disc above
                var cx = w * 0.5, cy = h * 0.35;
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, w, h);
                // Aberrated star ring glow
                var minDim = Math.min(w, h);
                var ringR = minDim * 0.2;
                var grd = ctx.createRadialGradient(cx, cy, ringR * 0.6, cx, cy, ringR * 1.3);
                grd.addColorStop(0, 'rgba(100,120,200,0)');
                grd.addColorStop(0.4, 'rgba(120,140,220,0.03)');
                grd.addColorStop(0.7, 'rgba(140,160,240,0.05)');
                grd.addColorStop(1, 'rgba(100,120,200,0)');
                ctx.beginPath();
                ctx.arc(cx, cy, ringR * 1.3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cx = w * 0.5, cy = h * 0.35;
                var minDim = Math.min(w, h);

                // Horizon edge glow
                var horizY = h * 0.65;
                var horizGrad = ctx.createLinearGradient(0, horizY - 30, 0, horizY + 30);
                horizGrad.addColorStop(0, 'rgba(80,100,180,0)');
                horizGrad.addColorStop(0.5, 'rgba(60,80,150,0.03)');
                horizGrad.addColorStop(1, 'rgba(40,60,120,0)');
                ctx.fillStyle = horizGrad;
                ctx.fillRect(0, horizY - 30, w, 60);

                // Quantum fluctuations near horizon edge (firefly-like)
                for (var i = 0; i < 15; i++) {
                    var fx = (Math.sin(i * 5.7 + t * 0.3) * 0.5 + 0.5) * w;
                    var fy = horizY + Math.sin(i * 3.3 + t * 0.7) * 20;
                    var flicker = Math.sin(t * 3 + i * 2.1) * 0.5 + 0.5;
                    if (flicker < 0.3) continue;
                    var fOp = (flicker - 0.3) * 0.15;
                    ctx.beginPath();
                    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(100,200,220,' + fOp + ')';
                    ctx.fill();
                }
            }
        };
    })();
})(window.CV.themes);
