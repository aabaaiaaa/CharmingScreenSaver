(function (themes) {
    // --- Abyssal theme ---
    // Deep ocean floor with bioluminescent creatures, hydrothermal vents, marine snow
    themes.abyssal = (function () {
        // Bioluminescent creature pulses
        var bioLights = [];
        for (var i = 0; i < 12; i++) {
            bioLights.push({
                x: (Math.sin(i * 5.9 + 1.4) * 0.5 + 0.5),
                y: 0.3 + (Math.sin(i * 3.7 + 0.6) * 0.5 + 0.5) * 0.6,
                hue: [180, 200, 140, 260, 300][i % 5],
                size: 0.008 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 0.015,
                pulseSpeed: 0.3 + Math.sin(i * 4.7) * 0.2,
                pulseOffset: Math.random() * Math.PI * 2,
                driftX: 0.003 + Math.sin(i * 1.9) * 0.002,
                driftY: 0.002 + Math.sin(i * 2.7) * 0.001,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2
            });
        }

        // Hydrothermal vent configs
        var vents = [
            { x: 0.25, width: 0.03, speed: 30 },
            { x: 0.70, width: 0.025, speed: 25 }
        ];

        return {
            targetCount: 50,

            spawn: function (w, h) {
                // Marine snow particles drifting downward
                return {
                    x: Math.random() * w,
                    y: -Math.random() * h * 0.2,
                    size: 0.3 + Math.random() * 1.2,
                    speed: 5 + Math.random() * 12,
                    drift: (Math.random() - 0.5) * 4,
                    opacity: 0.05 + Math.random() * 0.12,
                    wobbleSpeed: 0.3 + Math.random() * 0.5,
                    wobbleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                p.y += p.speed * dt;
                p.x += (p.drift + Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * 3) * dt;
                if (p.y > h + 5) return false;
                if (p.x < -5) p.x = w + 5;
                if (p.x > w + 5) p.x = -5;
                return true;
            },

            draw: function (p, ctx) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(180, 200, 220, ' + p.opacity + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Pitch black with slight deep blue gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#010208');
                grad.addColorStop(0.5, '#020410');
                grad.addColorStop(0.8, '#030614');
                grad.addColorStop(1, '#040818');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Bioluminescent creature pulses
                for (var i = 0; i < bioLights.length; i++) {
                    var bl = bioLights[i];
                    var bx = (bl.x + Math.sin(t * bl.driftX + bl.phaseX) * 0.08) * w;
                    var by = (bl.y + Math.sin(t * bl.driftY + bl.phaseY) * 0.05) * h;
                    var pulse = Math.sin(t * bl.pulseSpeed + bl.pulseOffset);
                    var bOp = 0.03 + (pulse * 0.5 + 0.5) * 0.08;
                    var bSize = bl.size * Math.min(w, h) * (0.8 + pulse * 0.2);

                    var blGrad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize);
                    blGrad.addColorStop(0, 'hsla(' + bl.hue + ', 80%, 60%, ' + bOp + ')');
                    blGrad.addColorStop(0.3, 'hsla(' + bl.hue + ', 70%, 50%, ' + (bOp * 0.5) + ')');
                    blGrad.addColorStop(1, 'hsla(' + bl.hue + ', 60%, 40%, 0)');
                    ctx.beginPath();
                    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
                    ctx.fillStyle = blGrad;
                    ctx.fill();

                    // Bright core
                    if (pulse > 0.3) {
                        ctx.beginPath();
                        ctx.arc(bx, by, bSize * 0.15, 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + bl.hue + ', 90%, 80%, ' + (bOp * 0.8) + ')';
                        ctx.fill();
                    }
                }

                // Anglerfish-like lure light drifting slowly
                var lureX = (0.5 + Math.sin(t * 0.02 + 1.3) * 0.3) * w;
                var lureY = (0.4 + Math.sin(t * 0.015 + 2.7) * 0.2) * h;
                var lurePulse = Math.sin(t * 1.5) * 0.5 + 0.5;
                var lureGrad = ctx.createRadialGradient(lureX, lureY, 0, lureX, lureY, 20);
                lureGrad.addColorStop(0, 'rgba(200, 255, 220, ' + (0.15 * lurePulse) + ')');
                lureGrad.addColorStop(0.3, 'rgba(100, 220, 180, ' + (0.06 * lurePulse) + ')');
                lureGrad.addColorStop(1, 'rgba(50, 180, 140, 0)');
                ctx.beginPath();
                ctx.arc(lureX, lureY, 20, 0, Math.PI * 2);
                ctx.fillStyle = lureGrad;
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Hydrothermal vent plumes rising from the bottom
                for (var v = 0; v < vents.length; v++) {
                    var vent = vents[v];
                    var vx = vent.x * w;
                    var vWidth = vent.width * w;
                    // Shimmering plume particles
                    for (var i = 0; i < 15; i++) {
                        var frac = i / 15;
                        var py = h - frac * h * 0.35;
                        var spread = vWidth * (1 + frac * 2);
                        var px = vx + Math.sin(t * 2 + frac * 10 + v * 3) * spread;
                        var pOp = (1 - frac) * 0.06;
                        var pSize = 3 + frac * 5;
                        var pGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize);
                        pGrad.addColorStop(0, 'rgba(180, 120, 60, ' + pOp + ')');
                        pGrad.addColorStop(1, 'rgba(140, 80, 40, 0)');
                        ctx.beginPath();
                        ctx.arc(px, py, pSize, 0, Math.PI * 2);
                        ctx.fillStyle = pGrad;
                        ctx.fill();
                    }
                    // Vent glow at the base
                    var ventGlow = ctx.createRadialGradient(vx, h, 0, vx, h, vWidth * 3);
                    ventGlow.addColorStop(0, 'rgba(200, 100, 30, 0.08)');
                    ventGlow.addColorStop(0.5, 'rgba(160, 70, 20, 0.03)');
                    ventGlow.addColorStop(1, 'rgba(120, 50, 10, 0)');
                    ctx.beginPath();
                    ctx.arc(vx, h, vWidth * 3, 0, Math.PI * 2);
                    ctx.fillStyle = ventGlow;
                    ctx.fill();
                }
            }
        };
    })();

    // --- Coraline theme ---
    // Shallow reef with caustics, swaying corals, fish schools, bubbles
    themes.coraline = (function () {
        // Coral shapes at the bottom
        var corals = [];
        for (var i = 0; i < 10; i++) {
            corals.push({
                x: (i / 10) + Math.sin(i * 3.7) * 0.03,
                height: 0.08 + (Math.sin(i * 2.9 + 1.1) * 0.5 + 0.5) * 0.12,
                width: 0.03 + (Math.sin(i * 4.3) * 0.5 + 0.5) * 0.03,
                hue: [340, 280, 30, 15, 320, 260, 35, 350, 300, 25][i],
                branches: 2 + Math.floor(Math.sin(i * 5.1) * 2 + 2)
            });
        }

        // Fish school configs
        var schools = [
            { cx: 0.3, cy: 0.35, count: 12, speed: 0.04, radius: 0.08, hue: 45 },
            { cx: 0.7, cy: 0.45, count: 8, speed: 0.03, radius: 0.06, hue: 200 }
        ];

        return {
            targetCount: 20,

            spawn: function (w, h) {
                // Rising bubbles
                var r = 1.5 + Math.random() * 4;
                return {
                    x: Math.random() * w,
                    y: h + r + Math.random() * h * 0.2,
                    r: r,
                    speed: 15 + Math.random() * 25,
                    wobbleAmp: 10 + Math.random() * 20,
                    wobbleSpeed: 0.5 + Math.random() * 0.8,
                    wobbleOffset: Math.random() * Math.PI * 2,
                    opacity: 0.1 + Math.random() * 0.2
                };
            },

            update: function (p, dt, w, h, state) {
                p.y -= p.speed * dt;
                p.x += Math.sin(state.timeElapsed * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp * dt;
                if (p.y + p.r < 0) return false;
                if (p.x < -p.r) p.x = w + p.r;
                if (p.x > w + p.r) p.x = -p.r;
                return true;
            },

            draw: function (p, ctx) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(200, 240, 255, ' + p.opacity + ')';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Highlight
                ctx.beginPath();
                ctx.arc(p.x - p.r * 0.25, p.y - p.r * 0.25, p.r * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (p.opacity * 0.5) + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Warm turquoise water gradient
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#1098a8');
                grad.addColorStop(0.3, '#0e8898');
                grad.addColorStop(0.6, '#0c7888');
                grad.addColorStop(0.8, '#0a6878');
                grad.addColorStop(1, '#085868');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Dappled light caustics - overlapping bright patches
                ctx.save();
                for (var i = 0; i < 20; i++) {
                    var cx = (Math.sin(i * 4.3 + t * 0.08 + 1.2) * 0.5 + 0.5) * w;
                    var cy = (Math.sin(i * 6.1 + t * 0.06 + 2.8) * 0.5 + 0.5) * h * 0.7;
                    var cr = 30 + Math.sin(i * 2.7 + t * 0.3) * 15;
                    var cOp = 0.02 + Math.sin(t * 0.4 + i * 1.5) * 0.015;
                    var caustGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
                    caustGrad.addColorStop(0, 'rgba(180, 255, 240, ' + cOp + ')');
                    caustGrad.addColorStop(1, 'rgba(120, 220, 200, 0)');
                    ctx.beginPath();
                    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                    ctx.fillStyle = caustGrad;
                    ctx.fill();
                }
                ctx.restore();

                // Sandy bottom
                var sandY = h * 0.82;
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var x = 0; x <= w; x += 4) {
                    var sy = sandY + Math.sin(x * 0.008 + t * 0.03) * 8 + Math.sin(x * 0.02 + 1.5) * 4;
                    ctx.lineTo(x, sy);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = 'rgba(180, 160, 120, 0.3)';
                ctx.fill();

                // Coral shapes
                for (var i = 0; i < corals.length; i++) {
                    var c = corals[i];
                    var cx = c.x * w;
                    var baseY = h * 0.88;
                    var ch = c.height * h;
                    var cw = c.width * w;
                    var sway = Math.sin(t * 0.5 + i * 1.8) * 5;

                    // Main trunk
                    ctx.beginPath();
                    ctx.moveTo(cx, baseY);
                    ctx.quadraticCurveTo(cx + sway, baseY - ch * 0.5, cx + sway * 1.5, baseY - ch);
                    ctx.strokeStyle = 'hsla(' + c.hue + ', 60%, 50%, 0.25)';
                    ctx.lineWidth = cw;
                    ctx.lineCap = 'round';
                    ctx.stroke();

                    // Branches
                    for (var b = 0; b < c.branches; b++) {
                        var bFrac = (b + 1) / (c.branches + 1);
                        var bx = cx + sway * bFrac;
                        var by = baseY - ch * bFrac;
                        var bAngle = (b % 2 === 0 ? -1 : 1) * (0.3 + Math.sin(i + b) * 0.2);
                        var bLen = ch * (0.2 + Math.sin(i * 2 + b) * 0.1);
                        var bSway = Math.sin(t * 0.6 + i * 2 + b * 1.3) * 4;
                        ctx.beginPath();
                        ctx.moveTo(bx, by);
                        ctx.quadraticCurveTo(bx + bSway + Math.cos(bAngle) * bLen * 0.5, by - bLen * 0.5, bx + bSway + Math.cos(bAngle) * bLen, by + Math.sin(bAngle) * bLen);
                        ctx.strokeStyle = 'hsla(' + c.hue + ', 65%, 55%, 0.2)';
                        ctx.lineWidth = cw * 0.5;
                        ctx.stroke();
                    }
                }
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Fish schools - coordinated dot groups
                for (var s = 0; s < schools.length; s++) {
                    var school = schools[s];
                    var scx = (school.cx + Math.sin(t * school.speed + s * 2) * 0.15) * w;
                    var scy = (school.cy + Math.sin(t * school.speed * 0.7 + s * 3 + 1) * 0.08) * h;
                    for (var f = 0; f < school.count; f++) {
                        var fAngle = (f / school.count) * Math.PI * 2 + t * 0.3;
                        var fDist = school.radius * Math.min(w, h) * (0.5 + Math.sin(f * 2.3 + t * 0.5) * 0.3);
                        var fx = scx + Math.cos(fAngle) * fDist;
                        var fy = scy + Math.sin(fAngle) * fDist * 0.5;
                        ctx.beginPath();
                        ctx.ellipse(fx, fy, 3, 1.5, Math.atan2(Math.sin(fAngle), Math.cos(fAngle)), 0, Math.PI * 2);
                        ctx.fillStyle = 'hsla(' + school.hue + ', 50%, 65%, 0.2)';
                        ctx.fill();
                    }
                }
            }
        };
    })();
})(window.CV.themes);
