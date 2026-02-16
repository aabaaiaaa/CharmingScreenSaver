(function (themes, FALLBACK_DT) {
    // --- Drifting theme ---
    // Floating down a calm river with parallax banks, lily pads, dappled light
    themes.drifting = (function () {
        // Parallax bank layers (left and right)
        var bankLayers = [
            { depth: 0.3, color: '25, 50, 20', y: 0.35, height: 0.7 },
            { depth: 0.5, color: '35, 65, 25', y: 0.40, height: 0.65 },
            { depth: 0.8, color: '45, 80, 30', y: 0.45, height: 0.6 }
        ];

        // Overhanging branch configs
        var branches = [];
        for (var i = 0; i < 6; i++) {
            branches.push({
                xOffset: Math.random() * 2,
                y: 0.05 + Math.random() * 0.25,
                sag: 0.05 + Math.random() * 0.1,
                length: 0.2 + Math.random() * 0.3,
                side: i % 2 === 0 ? -1 : 1,
                speed: 0.03 + Math.random() * 0.02
            });
        }

        return {
            targetCount: 25,

            spawn: function (w, h) {
                // Lily pads and leaves on the water surface
                var isLeaf = Math.random() < 0.4;
                return {
                    x: w + Math.random() * w * 0.3,
                    y: h * (0.4 + Math.random() * 0.25),
                    size: isLeaf ? (3 + Math.random() * 5) : (8 + Math.random() * 15),
                    speed: 30 + Math.random() * 20,
                    wobbleAmp: 3 + Math.random() * 5,
                    wobbleSpeed: 0.3 + Math.random() * 0.5,
                    wobbleOffset: Math.random() * Math.PI * 2,
                    opacity: 0.2 + Math.random() * 0.3,
                    isLeaf: isLeaf,
                    hue: isLeaf ? (80 + Math.random() * 40) : (110 + Math.random() * 30),
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.3
                };
            },

            update: function (p, dt, w, h, state) {
                p.x -= p.speed * dt;
                p.y += Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * dt;
                p.rotation += p.rotSpeed * dt;
                if (p.x < -p.size * 2) return false;
                return true;
            },

            draw: function (p, ctx, state) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                if (p.isLeaf) {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                } else {
                    // Lily pad - circle with a wedge cut
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0.15, Math.PI * 2 - 0.15);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                }
                ctx.fillStyle = 'hsla(' + p.hue + ', 40%, 35%, ' + p.opacity + ')';
                ctx.fill();
                ctx.restore();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Water surface gradient (looking down at the river)
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#2a5a30');
                grad.addColorStop(0.3, '#1a6848');
                grad.addColorStop(0.5, '#1a7858');
                grad.addColorStop(0.7, '#1a6848');
                grad.addColorStop(1, '#1a5838');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Water current lines scrolling past
                ctx.save();
                ctx.strokeStyle = 'rgba(100, 180, 140, 0.04)';
                ctx.lineWidth = 1;
                for (var i = 0; i < 15; i++) {
                    var ly = h * (0.3 + (i / 15) * 0.45);
                    var scrollX = (t * (20 + i * 3)) % w;
                    ctx.beginPath();
                    for (var x = 0; x <= w; x += 4) {
                        var wy = ly + Math.sin((x + scrollX) * 0.01 + i * 2) * 3;
                        if (x === 0) ctx.moveTo(x, wy);
                        else ctx.lineTo(x, wy);
                    }
                    ctx.stroke();
                }
                ctx.restore();

                // Dappled light through canopy
                for (var i = 0; i < 12; i++) {
                    var dx = ((Math.sin(i * 5.3 + t * 0.04) * 0.5 + 0.5) * 1.2 - 0.1) * w;
                    var dy = (Math.sin(i * 3.7 + t * 0.03 + 1.5) * 0.5 + 0.5) * h * 0.6;
                    var dr = 20 + Math.sin(i * 2.1 + t * 0.2) * 10;
                    var dOp = 0.03 + Math.sin(t * 0.3 + i * 1.8) * 0.015;
                    var dGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr);
                    dGrad.addColorStop(0, 'rgba(200, 240, 180, ' + dOp + ')');
                    dGrad.addColorStop(1, 'rgba(160, 220, 140, 0)');
                    ctx.beginPath();
                    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                    ctx.fillStyle = dGrad;
                    ctx.fill();
                }

                // Riverbank edges scrolling past (parallax layers)
                for (var l = bankLayers.length - 1; l >= 0; l--) {
                    var bl = bankLayers[l];
                    var scrollSpeed = 15 * bl.depth;
                    var scroll = t * scrollSpeed;
                    // Top bank
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    for (var x = 0; x <= w; x += 4) {
                        var bankY = h * bl.y + Math.sin((x + scroll) * 0.008 + l * 2) * 15 + Math.sin((x + scroll) * 0.02 + l * 4) * 5;
                        ctx.lineTo(x, bankY);
                    }
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + bl.color + ', 0.35)';
                    ctx.fill();
                    // Bottom bank (mirrored)
                    ctx.beginPath();
                    ctx.moveTo(0, h);
                    for (var x = 0; x <= w; x += 4) {
                        var bankY2 = h * (1 - bl.y + 0.15) + Math.sin((x + scroll * 1.1) * 0.008 + l * 3 + 1) * 15;
                        ctx.lineTo(x, bankY2);
                    }
                    ctx.lineTo(w, h);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + bl.color + ', 0.3)';
                    ctx.fill();
                }
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Overhanging branches passing overhead
                for (var i = 0; i < branches.length; i++) {
                    var br = branches[i];
                    var bx = ((br.xOffset - t * br.speed) % 2.5) * w;
                    if (bx < -w * 0.4 || bx > w * 1.4) continue;
                    var startX = br.side > 0 ? bx : bx;
                    var startY = br.y * h;
                    var endX = startX + br.side * br.length * w;
                    var endY = startY + br.sag * h;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.quadraticCurveTo(startX + br.side * br.length * w * 0.5, endY + br.sag * h * 0.5, endX, endY);
                    ctx.strokeStyle = 'rgba(30, 50, 20, 0.15)';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    // Leaves on branch
                    for (var j = 0; j < 5; j++) {
                        var frac = (j + 1) / 6;
                        var lx = startX + (endX - startX) * frac + Math.sin(t * 0.5 + i + j) * 3;
                        var ly = startY + (endY - startY) * frac + Math.sin(frac * Math.PI) * br.sag * h * 0.3;
                        ctx.beginPath();
                        ctx.ellipse(lx, ly, 5, 3, t * 0.2 + j, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(40, 80, 30, 0.12)';
                        ctx.fill();
                    }
                }
            }
        };
    })();

    // --- Soaring theme ---
    // Gliding over rolling hills with parallax layers, clouds at eye level
    themes.soaring = {
        targetCount: 15,

        spawn: function (w, h) {
            // Wispy clouds passing by at eye level
            return {
                x: w + Math.random() * w * 0.5,
                y: h * (0.15 + Math.random() * 0.35),
                rx: 40 + Math.random() * 80,
                ry: 10 + Math.random() * 20,
                speed: 40 + Math.random() * 60,
                opacity: 0.06 + Math.random() * 0.08,
                blobs: 2 + Math.floor(Math.random() * 3)
            };
        },

        update: function (p, dt, w, h, state) {
            p.x -= p.speed * dt;
            if (p.x < -p.rx * 3) return false;
            return true;
        },

        draw: function (p, ctx) {
            for (var b = 0; b < p.blobs; b++) {
                var ox = (b - p.blobs * 0.5) * p.rx * 0.5;
                var oy = Math.sin(b * 2.3) * p.ry * 0.3;
                ctx.beginPath();
                ctx.ellipse(p.x + ox, p.y + oy, p.rx * (0.5 + b * 0.15), p.ry * (0.7 + b * 0.1), 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(240, 245, 255, ' + p.opacity + ')';
                ctx.fill();
            }
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Sky gradient - looking slightly downward
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#4a80c0');
            grad.addColorStop(0.2, '#6098d0');
            grad.addColorStop(0.4, '#80b0dd');
            grad.addColorStop(0.55, '#a0c8e8');
            grad.addColorStop(0.65, '#90b8a0');
            grad.addColorStop(1, '#608848');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Rolling hill layers (parallax, scrolling right to left)
            var hillLayers = [
                { y: 0.62, amp: 40, freq: 0.002, speed: 5, color: '70, 120, 60', opacity: 0.15 },
                { y: 0.68, amp: 35, freq: 0.003, speed: 10, color: '60, 110, 50', opacity: 0.2 },
                { y: 0.74, amp: 30, freq: 0.004, speed: 18, color: '50, 100, 40', opacity: 0.25 },
                { y: 0.80, amp: 25, freq: 0.005, speed: 30, color: '45, 90, 35', opacity: 0.3 },
                { y: 0.86, amp: 20, freq: 0.007, speed: 50, color: '40, 80, 30', opacity: 0.35 },
                { y: 0.92, amp: 15, freq: 0.01, speed: 80, color: '35, 70, 28', opacity: 0.4 }
            ];

            for (var l = 0; l < hillLayers.length; l++) {
                var hl = hillLayers[l];
                var scroll = t * hl.speed;
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 3) {
                    var hy = h * hl.y
                        + Math.sin((x + scroll) * hl.freq) * hl.amp
                        + Math.sin((x + scroll) * hl.freq * 2.3 + l * 1.5) * hl.amp * 0.4
                        + Math.cos((x + scroll) * hl.freq * 0.5 + l * 3) * hl.amp * 0.25;
                    ctx.lineTo(x, hy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(' + hl.color + ', ' + hl.opacity + ')';
                ctx.fill();
            }

            // Patchwork field patterns on nearer hills
            for (var i = 0; i < 10; i++) {
                var scroll = t * 40;
                var fx = ((i * 0.12 + Math.sin(i * 3.7) * 0.03 - scroll * 0.001) % 1.2 - 0.1) * w;
                var fy = h * (0.78 + Math.sin(i * 5.1) * 0.04);
                var fw = w * (0.03 + Math.sin(i * 2.3) * 0.01);
                var fh = h * 0.02;
                ctx.fillStyle = 'rgba(' + (35 + i * 3) + ', ' + (75 + i * 5) + ', ' + (25 + i * 2) + ', 0.08)';
                ctx.fillRect(fx, fy, fw, fh);
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Cruising theme ---
    // Flying through clouds with volumetric layers and sun halos
    themes.cruising = {
        targetCount: 0,

        spawn: function (w, h) { return { x: 0, y: 0 }; },
        update: function (p, dt, w, h, state) { return true; },
        draw: function (p, ctx, state) {},

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Blue sky gradient
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#3068b0');
            grad.addColorStop(0.4, '#5088c8');
            grad.addColorStop(0.7, '#70a0d8');
            grad.addColorStop(1, '#90b8e4');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Sun position (upper right, behind clouds)
            var sunX = w * 0.75;
            var sunY = h * 0.2;
            var sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.min(w, h) * 0.4);
            sunGlow.addColorStop(0, 'rgba(255, 250, 230, 0.15)');
            sunGlow.addColorStop(0.2, 'rgba(255, 240, 200, 0.08)');
            sunGlow.addColorStop(0.5, 'rgba(255, 230, 180, 0.03)');
            sunGlow.addColorStop(1, 'rgba(255, 220, 160, 0)');
            ctx.beginPath();
            ctx.arc(sunX, sunY, Math.min(w, h) * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = sunGlow;
            ctx.fill();
        },

        drawForeground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Cloud layers at different depths scrolling past
            var cloudLayers = [
                { speed: 12, y: 0.1, count: 4, scale: 1.5, opacity: 0.06 },
                { speed: 25, y: 0.25, count: 5, scale: 1.2, opacity: 0.08 },
                { speed: 45, y: 0.4, count: 6, scale: 1.0, opacity: 0.1 },
                { speed: 70, y: 0.55, count: 5, scale: 0.8, opacity: 0.12 },
                { speed: 100, y: 0.7, count: 4, scale: 0.6, opacity: 0.1 },
                { speed: 140, y: 0.85, count: 3, scale: 0.5, opacity: 0.08 }
            ];

            for (var l = 0; l < cloudLayers.length; l++) {
                var cl = cloudLayers[l];
                for (var c = 0; c < cl.count; c++) {
                    var seed = l * 10 + c;
                    var baseX = (Math.sin(seed * 5.7 + 0.3) * 0.5 + 0.5) * w * 2;
                    var cx = ((baseX - t * cl.speed) % (w * 1.8)) - w * 0.4;
                    var cy = cl.y * h + Math.sin(seed * 3.1 + 0.8) * h * 0.06;

                    // Cloud as overlapping soft ellipses
                    var cloudW = (60 + Math.sin(seed * 2.3) * 30) * cl.scale;
                    var cloudH = (20 + Math.sin(seed * 4.1) * 10) * cl.scale;

                    for (var b = 0; b < 4; b++) {
                        var bx = cx + (b - 1.5) * cloudW * 0.35;
                        var by = cy + Math.sin(b * 2.7 + seed) * cloudH * 0.2;
                        var brx = cloudW * (0.4 + b * 0.08);
                        var bry = cloudH * (0.5 + b * 0.1);
                        ctx.beginPath();
                        ctx.ellipse(bx, by, brx, bry, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(240, 245, 255, ' + cl.opacity + ')';
                        ctx.fill();
                    }

                    // Sun halo effect when cloud is near the sun
                    var sunX = w * 0.75;
                    var sunY = h * 0.2;
                    var distToSun = Math.sqrt((cx - sunX) * (cx - sunX) + (cy - sunY) * (cy - sunY));
                    if (distToSun < w * 0.3) {
                        var haloOp = (1 - distToSun / (w * 0.3)) * 0.04 * cl.opacity * 8;
                        var haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudW);
                        haloGrad.addColorStop(0, 'rgba(255, 245, 220, ' + haloOp + ')');
                        haloGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
                        ctx.beginPath();
                        ctx.arc(cx, cy, cloudW, 0, Math.PI * 2);
                        ctx.fillStyle = haloGrad;
                        ctx.fill();
                    }
                }
            }

            // Subtle vignette at edges to enhance the "window" feeling
            var vigGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.3, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
            vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
            ctx.fillStyle = vigGrad;
            ctx.fillRect(0, 0, w, h);
        }
    };

    // --- Tunnelling theme ---
    // Stars streaming outward from central vanishing point (starfield warp)
    themes.tunnelling = (function () {
        var STAR_COUNT = 200;
        var stars = [];
        var inited = false;

        function initStars() {
            stars.length = 0;
            for (var i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: Math.random() * 3,
                    prevSx: 0, prevSy: 0,
                    hasPrev: false
                });
            }
            inited = true;
        }

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            onActivate: function () {
                initStars();
            },

            drawBackground: function (ctx, w, h, state) {
                // Deep black
                ctx.fillStyle = '#010104';
                ctx.fillRect(0, 0, w, h);
            },

            drawForeground: function (ctx, w, h, state, dt) {
                dt = dt || FALLBACK_DT;
                if (!inited) initStars();
                var t = state.timeElapsed;
                var cx = w * 0.5;
                var cy = h * 0.5;
                // Speed varies gently
                var speed = 0.8 + Math.sin(t * 0.15) * 0.3 + Math.sin(t * 0.37 + 1.2) * 0.2;

                for (var i = 0; i < stars.length; i++) {
                    var s = stars[i];
                    // Move star toward viewer
                    s.z -= speed * dt;
                    if (s.z <= 0.01) {
                        s.x = (Math.random() - 0.5) * 2;
                        s.y = (Math.random() - 0.5) * 2;
                        s.z = 2.5 + Math.random() * 0.5;
                        s.hasPrev = false;
                        continue;
                    }

                    // Project to screen
                    var sx = cx + (s.x / s.z) * w * 0.5;
                    var sy = cy + (s.y / s.z) * h * 0.5;

                    // Check bounds
                    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) {
                        s.x = (Math.random() - 0.5) * 2;
                        s.y = (Math.random() - 0.5) * 2;
                        s.z = 2.5 + Math.random() * 0.5;
                        s.hasPrev = false;
                        continue;
                    }

                    var brightness = Math.min(1, (3 - s.z) / 2);
                    var size = Math.max(0.5, (1 - s.z / 3) * 3);

                    // Draw streak from previous to current position
                    if (s.hasPrev) {
                        ctx.beginPath();
                        ctx.moveTo(s.prevSx, s.prevSy);
                        ctx.lineTo(sx, sy);
                        ctx.strokeStyle = 'rgba(200, 220, 255, ' + (brightness * 0.5) + ')';
                        ctx.lineWidth = size * 0.7;
                        ctx.lineCap = 'round';
                        ctx.stroke();
                    }

                    // Star point
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230, 240, 255, ' + brightness + ')';
                    ctx.fill();

                    s.prevSx = sx;
                    s.prevSy = sy;
                    s.hasPrev = true;
                }

                // Occasional colour streaks
                for (var i = 0; i < 3; i++) {
                    var streakPhase = Math.sin(t * 0.2 + i * 2.3);
                    if (streakPhase < 0.7) continue;
                    var sAngle = t * 0.3 + i * Math.PI * 0.67;
                    var sLen = (streakPhase - 0.7) * 300;
                    var sx1 = cx + Math.cos(sAngle) * 20;
                    var sy1 = cy + Math.sin(sAngle) * 20;
                    var sx2 = cx + Math.cos(sAngle) * (20 + sLen);
                    var sy2 = cy + Math.sin(sAngle) * (20 + sLen);
                    var hues = [200, 280, 340];
                    ctx.beginPath();
                    ctx.moveTo(sx1, sy1);
                    ctx.lineTo(sx2, sy2);
                    ctx.strokeStyle = 'hsla(' + hues[i] + ', 70%, 60%, ' + ((streakPhase - 0.7) * 0.15) + ')';
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }

                // Central glow
                var cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
                cGrad.addColorStop(0, 'rgba(180, 200, 255, 0.06)');
                cGrad.addColorStop(1, 'rgba(120, 150, 220, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                ctx.fillStyle = cGrad;
                ctx.fill();
            }
        };
    })();

    // --- Coasting theme ---
    // Night drive with perspective road, streetlights, distant city glow
    themes.coasting = (function () {
        // Road lines state
        var ROAD_LINE_COUNT = 12;

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark night sky
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#060814');
                grad.addColorStop(0.3, '#0a0e1a');
                grad.addColorStop(0.45, '#0c1020');
                grad.addColorStop(0.5, '#101828');
                grad.addColorStop(1, '#141c2a');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Distant city glow on the horizon
                var horizonY = h * 0.48;
                var cityGlow = ctx.createRadialGradient(w * 0.5, horizonY, 0, w * 0.5, horizonY, w * 0.5);
                cityGlow.addColorStop(0, 'rgba(255, 180, 80, 0.06)');
                cityGlow.addColorStop(0.4, 'rgba(255, 150, 60, 0.03)');
                cityGlow.addColorStop(1, 'rgba(255, 120, 40, 0)');
                ctx.beginPath();
                ctx.arc(w * 0.5, horizonY, w * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = cityGlow;
                ctx.fill();

                // Stars in the sky
                for (var i = 0; i < 40; i++) {
                    var sx = (Math.sin(i * 7.3 + 0.5) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.1 + 2.1) * 0.5 + 0.5) * h * 0.4;
                    var sOp = (Math.sin(t * (0.4 + i * 0.03) + i * 1.5) * 0.5 + 0.5) * 0.3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + sOp + ')';
                    ctx.fill();
                }

                // Road surface (perspective trapezoid)
                var roadTop = horizonY;
                var roadTopW = w * 0.02;
                var roadBottomW = w * 0.6;
                ctx.beginPath();
                ctx.moveTo(w * 0.5 - roadTopW, roadTop);
                ctx.lineTo(w * 0.5 + roadTopW, roadTop);
                ctx.lineTo(w * 0.5 + roadBottomW, h);
                ctx.lineTo(w * 0.5 - roadBottomW, h);
                ctx.closePath();
                ctx.fillStyle = '#1a1a22';
                ctx.fill();

                // Road edge lines
                ctx.beginPath();
                ctx.moveTo(w * 0.5 - roadTopW, roadTop);
                ctx.lineTo(w * 0.5 - roadBottomW, h);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(w * 0.5 + roadTopW, roadTop);
                ctx.lineTo(w * 0.5 + roadBottomW, h);
                ctx.stroke();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var horizonY = h * 0.48;
                var speed = 60;

                // Centre dashed road lines scrolling toward viewer
                var dashLen = 0.08;
                var gapLen = 0.06;
                var cycleLen = dashLen + gapLen;
                var scrollOffset = (t * speed * 0.01) % cycleLen;

                for (var d = 0; d < 20; d++) {
                    var zStart = scrollOffset + d * cycleLen;
                    var zEnd = zStart + dashLen;
                    if (zStart > 2) break;

                    // Perspective: convert z to screen y
                    var y1 = horizonY + (h - horizonY) / (1 + zStart * 3);
                    var y2 = horizonY + (h - horizonY) / (1 + zEnd * 3);
                    if (y1 > h || y2 < horizonY) continue;
                    y1 = Math.max(horizonY, y1);
                    y2 = Math.min(h, y2);

                    var lineW1 = 1 + (y1 - horizonY) / (h - horizonY) * 3;
                    var lineOp = 0.1 + (y1 - horizonY) / (h - horizonY) * 0.15;

                    ctx.beginPath();
                    ctx.moveTo(w * 0.5, y1);
                    ctx.lineTo(w * 0.5, y2);
                    ctx.strokeStyle = 'rgba(255, 255, 200, ' + lineOp + ')';
                    ctx.lineWidth = lineW1;
                    ctx.stroke();
                }

                // Streetlights passing overhead
                var lightSpacing = 0.3;
                var lightScroll = (t * speed * 0.005) % lightSpacing;
                for (var l = 0; l < 8; l++) {
                    var lz = lightScroll + l * lightSpacing;
                    if (lz > 2) break;
                    var ly = horizonY + (h - horizonY) / (1 + lz * 3);
                    if (ly > h || ly < horizonY) continue;
                    var perspective = (ly - horizonY) / (h - horizonY);
                    var lx = w * 0.5 + (w * 0.02 + perspective * w * 0.35) * (l % 2 === 0 ? -1 : 1);
                    var lightR = 3 + perspective * 8;
                    var lightOp = 0.05 + perspective * 0.15;

                    // Light pole (thin line)
                    ctx.beginPath();
                    ctx.moveTo(lx, ly);
                    ctx.lineTo(lx, ly - lightR * 3);
                    ctx.strokeStyle = 'rgba(80, 80, 90, ' + (lightOp * 0.5) + ')';
                    ctx.lineWidth = 1 + perspective;
                    ctx.stroke();

                    // Light glow
                    var lgGrad = ctx.createRadialGradient(lx, ly - lightR * 3, 0, lx, ly - lightR * 3, lightR * 4);
                    lgGrad.addColorStop(0, 'rgba(255, 220, 150, ' + lightOp + ')');
                    lgGrad.addColorStop(0.3, 'rgba(255, 200, 120, ' + (lightOp * 0.4) + ')');
                    lgGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');
                    ctx.beginPath();
                    ctx.arc(lx, ly - lightR * 3, lightR * 4, 0, Math.PI * 2);
                    ctx.fillStyle = lgGrad;
                    ctx.fill();
                }

                // Fog in headlights
                var fogGrad = ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h * 0.6, h * 0.5);
                fogGrad.addColorStop(0, 'rgba(200, 200, 180, 0.02)');
                fogGrad.addColorStop(0.5, 'rgba(180, 180, 160, 0.01)');
                fogGrad.addColorStop(1, 'rgba(150, 150, 140, 0)');
                ctx.fillStyle = fogGrad;
                ctx.fillRect(0, h * 0.4, w, h * 0.6);
            }
        };
    })();

    // --- Diving theme ---
    // Descending through ocean depth zones, light fading, creatures passing
    themes.diving = {
        targetCount: 30,

        spawn: function (w, h) {
            // Marine life silhouettes drifting upward past the viewer
            var types = ['jellyfish', 'fish', 'plankton'];
            var type = types[Math.floor(Math.random() * types.length)];
            return {
                x: Math.random() * w,
                y: h + 10 + Math.random() * h * 0.3,
                type: type,
                size: type === 'plankton' ? (1 + Math.random() * 2) : (5 + Math.random() * 15),
                speed: 20 + Math.random() * 40,
                drift: (Math.random() - 0.5) * 15,
                opacity: 0.06 + Math.random() * 0.12,
                wobbleSpeed: 0.5 + Math.random() * 1,
                wobbleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.y -= p.speed * dt;
            p.x += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 8) * dt;
            if (p.y < -p.size * 2) return false;
            return true;
        },

        draw: function (p, ctx, state) {
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.type === 'jellyfish') {
                // Bell shape
                var pulse = Math.sin(state.timeElapsed * 2 + p.wobbleOffset) * 0.15;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * (1 + pulse), Math.PI, 0);
                ctx.fillStyle = 'rgba(150, 180, 220, ' + p.opacity + ')';
                ctx.fill();
                // Tentacles
                for (var t = 0; t < 4; t++) {
                    var tx = (t - 1.5) * p.size * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(tx, 0);
                    ctx.quadraticCurveTo(tx + Math.sin(state.timeElapsed * 1.5 + t) * 5, p.size * 0.8, tx + Math.sin(state.timeElapsed + t * 2) * 3, p.size * 1.5);
                    ctx.strokeStyle = 'rgba(150, 180, 220, ' + (p.opacity * 0.5) + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            } else if (p.type === 'fish') {
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(120, 150, 180, ' + p.opacity + ')';
                ctx.fill();
                // Tail
                ctx.beginPath();
                ctx.moveTo(p.size * 0.8, 0);
                ctx.lineTo(p.size * 1.3, -p.size * 0.3);
                ctx.lineTo(p.size * 1.3, p.size * 0.3);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(140, 170, 200, ' + p.opacity + ')';
                ctx.fill();
            }
            ctx.restore();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Depth zones - colour shifts over time (cycling through depths)
            var depthCycle = (t * 0.03) % 1;
            var hue1 = 190 - depthCycle * 30;
            var light1 = 45 - depthCycle * 30;
            var light2 = 35 - depthCycle * 25;
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'hsl(' + hue1 + ', 50%, ' + Math.max(5, light1) + '%)');
            grad.addColorStop(0.5, 'hsl(' + (hue1 - 10) + ', 45%, ' + Math.max(3, light2) + '%)');
            grad.addColorStop(1, 'hsl(' + (hue1 - 20) + ', 40%, ' + Math.max(2, light2 - 5) + '%)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Light shafts from above (narrow and fade with depth)
            var shaftIntensity = Math.max(0, 1 - depthCycle * 1.5);
            if (shaftIntensity > 0) {
                for (var i = 0; i < 5; i++) {
                    var sx = w * (0.15 + i * 0.18 + Math.sin(t * 0.1 + i * 2) * 0.03);
                    var spread = w * 0.02 * (1 + depthCycle * 2);
                    var shaftGrad = ctx.createLinearGradient(sx, 0, sx, h * (0.4 + depthCycle * 0.3));
                    shaftGrad.addColorStop(0, 'rgba(150, 200, 255, ' + (0.04 * shaftIntensity) + ')');
                    shaftGrad.addColorStop(1, 'rgba(100, 160, 220, 0)');
                    ctx.beginPath();
                    ctx.moveTo(sx - spread, 0);
                    ctx.lineTo(sx + spread, 0);
                    ctx.lineTo(sx + spread * 4, h * 0.6);
                    ctx.lineTo(sx - spread * 4, h * 0.6);
                    ctx.closePath();
                    ctx.fillStyle = shaftGrad;
                    ctx.fill();
                }
            }

            // Bubbles rising past (from our descent disturbing water)
            for (var i = 0; i < 8; i++) {
                var bx = w * (0.3 + Math.sin(i * 5.3 + t * 0.1) * 0.2);
                var by = ((h + i * h * 0.15 - t * 30) % (h * 1.3)) - h * 0.15;
                var bSize = 2 + Math.sin(i * 3.1) * 1;
                ctx.beginPath();
                ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(180, 210, 240, 0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Ascending theme ---
    // Rising through atmosphere layers from ground haze to stars
    themes.ascending = {
        targetCount: 40,

        spawn: function (w, h) {
            // Particles: mix of cloud wisps and stars
            var isStar = Math.random() < 0.5;
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                size: isStar ? (0.5 + Math.random() * 1.5) : (15 + Math.random() * 40),
                speed: 15 + Math.random() * 30,
                opacity: isStar ? (0.1 + Math.random() * 0.4) : (0.03 + Math.random() * 0.05),
                isStar: isStar,
                twinkleSpeed: 1 + Math.random() * 2,
                twinkleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            // Everything drifts downward (we're rising)
            p.y += p.speed * dt;
            if (p.y > h + p.size * 2) return false;
            return true;
        },

        draw: function (p, ctx, state) {
            if (p.isStar) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.opacity * (0.4 + twinkle * 0.6);
                if (op < 0.03) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
                ctx.fill();
            } else {
                // Cloud wisp
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size * 0.3, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 230, 245, ' + p.opacity + ')';
                ctx.fill();
            }
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Sky darkens as we climb (cycle through altitude)
            var altCycle = (t * 0.02) % 1;
            var topHue = 210;
            var topLight = Math.max(3, 50 - altCycle * 48);
            var botLight = Math.max(5, 60 - altCycle * 45);
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, 'hsl(' + topHue + ', 40%, ' + topLight + '%)');
            grad.addColorStop(0.6, 'hsl(' + (topHue + 5) + ', 35%, ' + ((topLight + botLight) * 0.5) + '%)');
            grad.addColorStop(1, 'hsl(' + (topHue + 10) + ', 30%, ' + botLight + '%)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Horizon curvature becomes visible at high altitude
            if (altCycle > 0.5) {
                var curveAmount = (altCycle - 0.5) * 2;
                var curveY = h * (0.85 + curveAmount * 0.1);
                ctx.beginPath();
                ctx.moveTo(0, h);
                ctx.quadraticCurveTo(w * 0.5, curveY, w, h);
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(100, 150, 200, ' + (curveAmount * 0.06) + ')';
                ctx.fill();
                // Thin atmosphere line at horizon
                ctx.beginPath();
                ctx.moveTo(0, h);
                ctx.quadraticCurveTo(w * 0.5, curveY, w, h);
                ctx.strokeStyle = 'rgba(150, 200, 255, ' + (curveAmount * 0.08) + ')';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Ground haze falling away below
            if (altCycle < 0.6) {
                var hazeOp = (1 - altCycle / 0.6) * 0.1;
                var hazeGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
                hazeGrad.addColorStop(0, 'rgba(200, 210, 220, 0)');
                hazeGrad.addColorStop(1, 'rgba(200, 210, 220, ' + hazeOp + ')');
                ctx.fillStyle = hazeGrad;
                ctx.fillRect(0, 0, w, h);
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Wandering theme ---
    // Walking through endless forest with parallax tree trunks, light shafts, fireflies
    themes.wandering = (function () {
        // Tree layer configs for parallax
        var treeLayers = [
            { count: 4, depth: 0.2, spacing: 0.28, widthMin: 0.025, widthMax: 0.04, opacity: 0.08 },
            { count: 5, depth: 0.4, spacing: 0.22, widthMin: 0.02, widthMax: 0.035, opacity: 0.12 },
            { count: 6, depth: 0.65, spacing: 0.18, widthMin: 0.015, widthMax: 0.03, opacity: 0.18 },
            { count: 5, depth: 0.85, spacing: 0.22, widthMin: 0.018, widthMax: 0.035, opacity: 0.25 }
        ];

        // Fireflies
        var fireflies = [];
        for (var i = 0; i < 10; i++) {
            fireflies.push({
                x: Math.random(),
                y: 0.3 + Math.random() * 0.5,
                pulseSpeed: 0.6 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2,
                driftX: 0.01 + Math.random() * 0.02,
                driftY: 0.005 + Math.random() * 0.01,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2
            });
        }

        return {
            targetCount: 20,

            spawn: function (w, h) {
                // Dust motes in the air
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.5 + Math.random() * 1.5,
                    opacity: 0.05 + Math.random() * 0.1,
                    twinkleSpeed: 0.5 + Math.random() * 1.5,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    driftX: (Math.random() - 0.5) * 3,
                    driftY: -(1 + Math.random() * 2)
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
                if (op < 0.01) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 230, 200, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Deep forest green gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1a2a18');
                grad.addColorStop(0.3, '#1e3220');
                grad.addColorStop(0.6, '#223828');
                grad.addColorStop(1, '#1a3020');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Light shafts between the trees
                for (var i = 0; i < 5; i++) {
                    var shaftX = ((i * 0.22 + Math.sin(i * 3.7) * 0.05 + t * 0.01) % 1.3 - 0.15) * w;
                    var shaftW = w * 0.02;
                    var shaftOp = 0.03 + Math.sin(t * 0.2 + i * 2.1) * 0.015;
                    var shaftGrad = ctx.createLinearGradient(shaftX, 0, shaftX, h);
                    shaftGrad.addColorStop(0, 'rgba(200, 220, 160, ' + shaftOp + ')');
                    shaftGrad.addColorStop(0.5, 'rgba(180, 200, 140, ' + (shaftOp * 0.5) + ')');
                    shaftGrad.addColorStop(1, 'rgba(160, 180, 120, 0)');
                    ctx.beginPath();
                    ctx.moveTo(shaftX - shaftW, 0);
                    ctx.lineTo(shaftX + shaftW, 0);
                    ctx.lineTo(shaftX + shaftW * 4, h);
                    ctx.lineTo(shaftX - shaftW * 4, h);
                    ctx.closePath();
                    ctx.fillStyle = shaftGrad;
                    ctx.fill();
                }

                // Parallax tree trunk layers scrolling past
                for (var l = 0; l < treeLayers.length; l++) {
                    var layer = treeLayers[l];
                    var scrollSpeed = 8 * layer.depth;
                    var scroll = t * scrollSpeed;

                    for (var tr = 0; tr < layer.count; tr++) {
                        var seed = l * 20 + tr;
                        var baseX = (Math.sin(seed * 4.7 + 0.3) * 0.5 + 0.5) * layer.spacing + tr * layer.spacing;
                        var tx = ((baseX - scroll * 0.01) % 1.2 - 0.1) * w;
                        var tw = w * (layer.widthMin + Math.sin(seed * 3.1) * (layer.widthMax - layer.widthMin) * 0.5);

                        // Trunk
                        ctx.fillStyle = 'rgba(30, 25, 18, ' + layer.opacity + ')';
                        ctx.fillRect(tx, 0, tw, h);

                        // Subtle bark texture
                        for (var b = 0; b < 5; b++) {
                            var barkY = (b / 5) * h;
                            ctx.fillStyle = 'rgba(20, 18, 12, ' + (layer.opacity * 0.3) + ')';
                            ctx.fillRect(tx, barkY, tw, 2);
                        }
                    }
                }

                // Ground foliage at the bottom
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 3) {
                    var gy = h * 0.92 + Math.sin(x * 0.02 + t * 0.5) * 5 + Math.sin(x * 0.05 + t * 0.3) * 3;
                    ctx.lineTo(x, gy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(20, 40, 15, 0.3)';
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Fireflies
                for (var i = 0; i < fireflies.length; i++) {
                    var ff = fireflies[i];
                    var fx = (ff.x + Math.sin(t * ff.driftX + ff.phaseX) * 0.1) * w;
                    var fy = (ff.y + Math.sin(t * ff.driftY + ff.phaseY) * 0.05) * h;
                    var pulse = Math.sin(t * ff.pulseSpeed + ff.pulseOffset);
                    var fOp = Math.max(0, pulse) * 0.2;
                    if (fOp < 0.02) continue;
                    var ffGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10);
                    ffGrad.addColorStop(0, 'rgba(200, 240, 100, ' + fOp + ')');
                    ffGrad.addColorStop(0.4, 'rgba(160, 210, 60, ' + (fOp * 0.4) + ')');
                    ffGrad.addColorStop(1, 'rgba(120, 180, 40, 0)');
                    ctx.beginPath();
                    ctx.arc(fx, fy, 10, 0, Math.PI * 2);
                    ctx.fillStyle = ffGrad;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230, 255, 140, ' + (fOp * 0.7) + ')';
                    ctx.fill();
                }

                // Mushrooms on the ground (scrolling past slowly)
                var mushScroll = t * 5;
                for (var i = 0; i < 6; i++) {
                    var mx = ((i * 0.18 + Math.sin(i * 3.7) * 0.04 - mushScroll * 0.005) % 1.2 - 0.1) * w;
                    var my = h * (0.92 + Math.sin(i * 5.1) * 0.02);
                    var mSize = 4 + Math.sin(i * 2.3) * 2;
                    // Cap
                    ctx.beginPath();
                    ctx.arc(mx, my - mSize, mSize, Math.PI, 0);
                    ctx.fillStyle = 'rgba(180, 80, 60, 0.08)';
                    ctx.fill();
                    // Stem
                    ctx.fillStyle = 'rgba(200, 190, 170, 0.06)';
                    ctx.fillRect(mx - 1, my - mSize, 2, mSize);
                }
            }
        };
    })();

    // --- Sailing theme ---
    // View from a boat on open ocean with rolling waves and rocking motion
    themes.sailing = (function () {
        // Seabird state
        var birds = [];
        for (var i = 0; i < 3; i++) {
            birds.push({
                x: Math.random(),
                y: 0.15 + Math.random() * 0.2,
                speed: 0.02 + Math.random() * 0.02,
                wingSpeed: 2 + Math.random() * 2,
                wingOffset: Math.random() * Math.PI * 2,
                size: 6 + Math.random() * 4
            });
        }

        return {
            targetCount: 0,

            spawn: function (w, h) { return { x: 0, y: 0 }; },
            update: function (p, dt, w, h, state) { return true; },
            draw: function (p, ctx, state) {},

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Gentle rocking motion (whole scene oscillates)
                var rockAngle = Math.sin(t * 0.4) * 0.008 + Math.sin(t * 0.67 + 1.2) * 0.005;
                var rockY = Math.sin(t * 0.5 + 0.3) * 5;

                ctx.save();
                ctx.translate(w * 0.5, h * 0.5);
                ctx.rotate(rockAngle);
                ctx.translate(-w * 0.5, -h * 0.5 + rockY);

                // Sky gradient
                var skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
                skyGrad.addColorStop(0, '#4878b0');
                skyGrad.addColorStop(0.4, '#6898c8');
                skyGrad.addColorStop(0.7, '#88b0d8');
                skyGrad.addColorStop(1, '#a8c8e4');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(-20, -20, w + 40, h * 0.52);

                // Horizon line
                var horizonY = h * 0.48;

                // Ocean with rolling waves toward the viewer
                var oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h + 20);
                oceanGrad.addColorStop(0, '#2868a0');
                oceanGrad.addColorStop(0.3, '#1a5888');
                oceanGrad.addColorStop(0.6, '#184878');
                oceanGrad.addColorStop(1, '#143868');
                ctx.fillStyle = oceanGrad;
                ctx.fillRect(-20, horizonY, w + 40, h);

                // Wave layers rolling toward the viewer (perspective)
                var waveLayers = [
                    { y: 0.50, amp: 5, freq: 0.008, speed: 0.15, opacity: 0.04 },
                    { y: 0.55, amp: 8, freq: 0.006, speed: 0.2, opacity: 0.05 },
                    { y: 0.62, amp: 12, freq: 0.005, speed: 0.25, opacity: 0.06 },
                    { y: 0.70, amp: 16, freq: 0.004, speed: 0.3, opacity: 0.07 },
                    { y: 0.78, amp: 20, freq: 0.003, speed: 0.35, opacity: 0.08 },
                    { y: 0.86, amp: 25, freq: 0.0025, speed: 0.4, opacity: 0.09 },
                    { y: 0.94, amp: 30, freq: 0.002, speed: 0.45, opacity: 0.1 }
                ];

                for (var l = 0; l < waveLayers.length; l++) {
                    var wl = waveLayers[l];
                    var baseY = h * wl.y;
                    ctx.beginPath();
                    ctx.moveTo(-20, h + 20);
                    for (var x = -20; x <= w + 20; x += 3) {
                        var wy = baseY
                            + Math.sin(x * wl.freq + t * wl.speed) * wl.amp
                            + Math.sin(x * wl.freq * 2.3 + t * wl.speed * 1.4 + l) * wl.amp * 0.4;
                        ctx.lineTo(x, wy);
                    }
                    ctx.lineTo(w + 20, h + 20);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(30, 80, 140, ' + wl.opacity + ')';
                    ctx.fill();

                    // Foam/whitecap highlights on wave crests
                    if (l > 2) {
                        for (var x = 0; x <= w; x += 8) {
                            var wy = baseY + Math.sin(x * wl.freq + t * wl.speed) * wl.amp;
                            var crest = Math.sin(x * wl.freq + t * wl.speed);
                            if (crest > 0.6) {
                                var foamOp = (crest - 0.6) * wl.opacity * 2;
                                ctx.beginPath();
                                ctx.arc(x, wy, 2, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(220, 240, 255, ' + foamOp + ')';
                                ctx.fill();
                            }
                        }
                    }
                }

                // Sun reflection on water
                var sunX = w * 0.65;
                for (var i = 0; i < 15; i++) {
                    var refY = horizonY + 10 + i * 8;
                    var refW = 3 + i * 2;
                    var refOp = 0.06 - i * 0.003;
                    var refX = sunX + Math.sin(t * 0.8 + i * 0.5) * (5 + i * 2);
                    ctx.beginPath();
                    ctx.ellipse(refX, refY, refW, 1.5, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 240, 200, ' + refOp + ')';
                    ctx.fill();
                }

                ctx.restore();

                // Sun in the sky (not affected by rocking)
                var sunGlow = ctx.createRadialGradient(w * 0.65, h * 0.18, 0, w * 0.65, h * 0.18, Math.min(w, h) * 0.15);
                sunGlow.addColorStop(0, 'rgba(255, 248, 230, 0.2)');
                sunGlow.addColorStop(0.3, 'rgba(255, 240, 200, 0.08)');
                sunGlow.addColorStop(1, 'rgba(255, 230, 180, 0)');
                ctx.beginPath();
                ctx.arc(w * 0.65, h * 0.18, Math.min(w, h) * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = sunGlow;
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Seabirds gliding past
                for (var i = 0; i < birds.length; i++) {
                    var b = birds[i];
                    var bx = ((b.x + t * b.speed) % 1.4 - 0.2) * w;
                    var by = b.y * h + Math.sin(t * 0.3 + i * 2) * 10;
                    var wing = Math.sin(t * b.wingSpeed + b.wingOffset) * 0.4;

                    ctx.save();
                    ctx.translate(bx, by);
                    ctx.strokeStyle = 'rgba(30, 30, 40, 0.12)';
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'round';
                    // Left wing
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(-b.size * 0.5, -b.size * wing, -b.size, -b.size * wing * 0.5);
                    ctx.stroke();
                    // Right wing
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(b.size * 0.5, -b.size * wing, b.size, -b.size * wing * 0.5);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        };
    })();

    // --- Streaming theme ---
    // Flowing with a mountain stream, rocks scrolling past, foam and spray
    themes.streaming = {
        targetCount: 35,

        spawn: function (w, h) {
            // Foam/spray particles
            var isSpray = Math.random() < 0.3;
            return {
                x: Math.random() * w,
                y: -10 - Math.random() * h * 0.2,
                size: isSpray ? (1 + Math.random() * 2) : (0.5 + Math.random() * 1.5),
                speed: 80 + Math.random() * 60,
                drift: (Math.random() - 0.5) * 20,
                opacity: isSpray ? (0.15 + Math.random() * 0.2) : (0.05 + Math.random() * 0.1),
                isSpray: isSpray,
                wobbleSpeed: 1 + Math.random() * 2,
                wobbleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            p.y += p.speed * dt;
            p.x += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 10) * dt;
            if (p.y > h + 10) return false;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            return true;
        },

        draw: function (p, ctx) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 245, 255, ' + p.opacity + ')';
            ctx.fill();
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Water base gradient (looking down at rushing water)
            var grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#2a6878');
            grad.addColorStop(0.3, '#287088');
            grad.addColorStop(0.6, '#267898');
            grad.addColorStop(1, '#2470a0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Water flow lines scrolling downward (we're flowing with the stream)
            var flowSpeed = 100;
            ctx.save();
            ctx.strokeStyle = 'rgba(140, 200, 220, 0.04)';
            ctx.lineWidth = 1;
            for (var i = 0; i < 20; i++) {
                var lx = w * (i / 20) + Math.sin(i * 3.7) * 20;
                var scrollY = (t * flowSpeed) % h;
                ctx.beginPath();
                for (var y = -h; y <= h * 2; y += 4) {
                    var yy = (y + scrollY) % (h * 1.5) - h * 0.25;
                    var wx = lx + Math.sin(y * 0.01 + t * 0.5 + i * 2) * 10;
                    if (y === -h) ctx.moveTo(wx, yy);
                    else ctx.lineTo(wx, yy);
                }
                ctx.stroke();
            }
            ctx.restore();

            // Sky reflection patches on smooth water
            for (var i = 0; i < 8; i++) {
                var rx = (Math.sin(i * 5.3 + t * 0.04) * 0.5 + 0.5) * w;
                var ry = ((Math.sin(i * 3.7 + 0.8) * 0.5 + 0.5) * h + t * 40) % (h * 1.2) - h * 0.1;
                var rSize = 20 + Math.sin(i * 2.1 + t * 0.2) * 10;
                var rOp = 0.02 + Math.sin(t * 0.3 + i * 1.8) * 0.01;
                ctx.beginPath();
                ctx.ellipse(rx, ry, rSize, rSize * 0.4, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(160, 210, 240, ' + rOp + ')';
                ctx.fill();
            }

            // Rocks scrolling past (looking down at the streambed)
            for (var i = 0; i < 12; i++) {
                var rockX = (Math.sin(i * 6.7 + 0.9) * 0.5 + 0.5) * w;
                var rockScroll = (t * 50 + i * h * 0.12) % (h * 1.3);
                var rockY = rockScroll - h * 0.15;
                var rockRx = 12 + Math.sin(i * 3.1) * 8;
                var rockRy = 8 + Math.sin(i * 4.3) * 5;
                var rockOp = 0.06 + Math.sin(i * 2.7) * 0.02;

                ctx.beginPath();
                ctx.ellipse(rockX, rockY, rockRx, rockRy, Math.sin(i * 1.9) * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(60, 80, 70, ' + rockOp + ')';
                ctx.fill();
                ctx.strokeStyle = 'rgba(80, 100, 90, ' + (rockOp * 0.5) + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Mossy bank edges scrolling past on left and right
            var bankScroll = t * 40;
            // Left bank
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var y = 0; y <= h; y += 3) {
                var bx = w * 0.08 + Math.sin((y + bankScroll) * 0.008 + 0.5) * 15 + Math.sin((y + bankScroll) * 0.02 + 2) * 5;
                ctx.lineTo(bx, y);
            }
            ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fillStyle = 'rgba(40, 70, 35, 0.25)';
            ctx.fill();
            // Right bank
            ctx.beginPath();
            ctx.moveTo(w, 0);
            for (var y = 0; y <= h; y += 3) {
                var bx = w * 0.92 + Math.sin((y + bankScroll * 1.1) * 0.008 + 3) * 15;
                ctx.lineTo(bx, y);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fillStyle = 'rgba(40, 70, 35, 0.2)';
            ctx.fill();
        },

        drawForeground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // White foam patches where water hits rocks
            for (var i = 0; i < 6; i++) {
                var rockX = (Math.sin(i * 6.7 + 0.9) * 0.5 + 0.5) * w;
                var rockScroll = (t * 50 + i * h * 0.12) % (h * 1.3);
                var rockY = rockScroll - h * 0.15;
                // Foam behind (downstream of) the rock
                var foamY = rockY + 15;
                for (var f = 0; f < 5; f++) {
                    var fx = rockX + (Math.random() - 0.5) * 20;
                    var fy = foamY + f * 4 + Math.sin(t * 3 + i + f) * 3;
                    ctx.beginPath();
                    ctx.arc(fx, fy, 1.5 + Math.sin(f * 2 + t) * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(230, 250, 255, 0.06)';
                    ctx.fill();
                }
            }
        }
    };
})(window.CV.themes, window.CV.FALLBACK_DT);
