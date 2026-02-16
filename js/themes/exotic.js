(function (themes) {
    // --- Pulsar theme ---
    // Rotating neutron star with sweeping beams and magnetic field lines
    themes.pulsar = (function () {
        // Pre-compute field line configs
        var fieldLines = [];
        for (var i = 0; i < 10; i++) {
            fieldLines.push({
                angleOffset: (i / 10) * Math.PI * 2,
                height: 0.15 + Math.sin(i * 3.1) * 0.05,
                width: 0.08 + Math.sin(i * 2.7) * 0.03,
                opacity: 0.03 + Math.sin(i * 4.3) * 0.015
            });
        }

        return {
            targetCount: 60,

            spawn: function (w, h) {
                // Particles spiraling along field lines
                return {
                    angle: Math.random() * Math.PI * 2,
                    dist: 0.1 + Math.random() * 0.3,
                    speed: 0.3 + Math.random() * 0.6,
                    size: 0.5 + Math.random() * 1,
                    opacity: 0.15 + Math.random() * 0.3,
                    wobble: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                p.angle += p.speed * dt;
                return true;
            },

            draw: function (p, ctx, state) {
                var w = ctx.canvas.width;
                var h = ctx.canvas.height;
                var cx = w * 0.5;
                var cy = h * 0.5;
                var minDim = Math.min(w, h);
                var dist = p.dist * minDim;
                var wobble = Math.sin(state.timeElapsed * 2 + p.wobble) * dist * 0.1;
                var px = cx + Math.cos(p.angle) * (dist + wobble);
                var py = cy + Math.sin(p.angle) * (dist + wobble) * 0.6; // flatten to ellipse
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(150, 200, 255, ' + p.opacity + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark space background
                ctx.fillStyle = '#020308';
                ctx.fillRect(0, 0, w, h);

                var cx = w * 0.5;
                var cy = h * 0.5;
                var minDim = Math.min(w, h);

                // Background stars
                for (var i = 0; i < 60; i++) {
                    var sx = (Math.sin(i * 7.3 + 0.9) * 0.5 + 0.5) * w;
                    var sy = (Math.sin(i * 11.1 + 2.3) * 0.5 + 0.5) * h;
                    var sOp = (Math.sin(t * (0.3 + i * 0.04) + i * 1.5) * 0.5 + 0.5) * 0.3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + sOp + ')';
                    ctx.fill();
                }

                // Magnetic field lines (elliptical arcs around the star)
                ctx.save();
                ctx.translate(cx, cy);
                for (var i = 0; i < fieldLines.length; i++) {
                    var fl = fieldLines[i];
                    var flH = fl.height * minDim;
                    var flW = fl.width * minDim;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, flW, flH, fl.angleOffset + t * 0.05, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(100, 150, 255, ' + fl.opacity + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                ctx.restore();

                // Bright central neutron star
                var starGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.08);
                starGlow.addColorStop(0, 'rgba(200, 220, 255, 0.6)');
                starGlow.addColorStop(0.2, 'rgba(150, 180, 255, 0.25)');
                starGlow.addColorStop(0.5, 'rgba(100, 140, 255, 0.08)');
                starGlow.addColorStop(1, 'rgba(60, 100, 220, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, minDim * 0.08, 0, Math.PI * 2);
                ctx.fillStyle = starGlow;
                ctx.fill();
                // Core
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(230, 240, 255, 0.9)';
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                var cx = w * 0.5;
                var cy = h * 0.5;
                var minDim = Math.min(w, h);

                // Two sweeping beams rotating like a lighthouse
                var beamAngle = t * 0.8; // rotation speed
                var beamLen = Math.max(w, h) * 0.8;

                for (var b = 0; b < 2; b++) {
                    var angle = beamAngle + b * Math.PI;
                    var bx = Math.cos(angle);
                    var by = Math.sin(angle);

                    // Beam as a narrow triangle with gradient
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(angle);

                    var beamGrad = ctx.createLinearGradient(0, 0, beamLen, 0);
                    beamGrad.addColorStop(0, 'rgba(180, 210, 255, 0.2)');
                    beamGrad.addColorStop(0.1, 'rgba(150, 190, 255, 0.1)');
                    beamGrad.addColorStop(0.4, 'rgba(100, 150, 230, 0.03)');
                    beamGrad.addColorStop(1, 'rgba(60, 100, 200, 0)');

                    var beamWidth = minDim * 0.02;
                    ctx.beginPath();
                    ctx.moveTo(0, -beamWidth * 0.3);
                    ctx.lineTo(beamLen, -beamWidth * 2);
                    ctx.lineTo(beamLen, beamWidth * 2);
                    ctx.lineTo(0, beamWidth * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = beamGrad;
                    ctx.fill();

                    ctx.restore();
                }
            }
        };
    })();

    // --- Nebular theme ---
    // Inside a nebula with rich colour clouds, dense star fields, gas pillars
    themes.nebular = {
        targetCount: 180,

        spawn: function (w, h) {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                size: 0.3 + Math.random() * 1.8,
                baseOpacity: 0.2 + Math.random() * 0.6,
                twinkleSpeed: 0.5 + Math.random() * 2.5,
                twinkleOffset: Math.random() * Math.PI * 2
            };
        },

        update: function (p, dt, w, h, state) {
            return true; // Stars are stationary
        },

        draw: function (p, ctx, state) {
            var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
            var op = p.baseOpacity * (0.5 + twinkle * 0.5);
            if (op < 0.05) return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
            ctx.fill();
            if (p.size > 1.2 && op > 0.4) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 230, 255, ' + (op * 0.06) + ')';
                ctx.fill();
            }
        },

        drawBackground: function (ctx, w, h, state) {
            var t = state.timeElapsed;
            // Deep space base
            ctx.fillStyle = '#050308';
            ctx.fillRect(0, 0, w, h);

            // Rich colour clouds - large overlapping radial gradients
            var clouds = [
                { cx: 0.3, cy: 0.25, r: 0.35, hue: 340, sat: 50, light: 25, drift: 0.008 },
                { cx: 0.7, cy: 0.6, r: 0.30, hue: 180, sat: 45, light: 22, drift: 0.006 },
                { cx: 0.5, cy: 0.45, r: 0.40, hue: 40, sat: 55, light: 20, drift: 0.010 },
                { cx: 0.2, cy: 0.7, r: 0.25, hue: 280, sat: 50, light: 23, drift: 0.007 },
                { cx: 0.8, cy: 0.3, r: 0.28, hue: 200, sat: 40, light: 21, drift: 0.009 },
                { cx: 0.45, cy: 0.8, r: 0.32, hue: 320, sat: 45, light: 24, drift: 0.005 }
            ];

            for (var i = 0; i < clouds.length; i++) {
                var c = clouds[i];
                var cx = (c.cx + Math.sin(t * c.drift + i * 2.3) * 0.04) * w;
                var cy = (c.cy + Math.sin(t * c.drift * 0.7 + i * 3.1 + 1) * 0.03) * h;
                var cr = c.r * Math.min(w, h);

                var nebGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
                nebGrad.addColorStop(0, 'hsla(' + c.hue + ', ' + c.sat + '%, ' + c.light + '%, 0.12)');
                nebGrad.addColorStop(0.2, 'hsla(' + c.hue + ', ' + (c.sat - 5) + '%, ' + (c.light - 2) + '%, 0.08)');
                nebGrad.addColorStop(0.5, 'hsla(' + c.hue + ', ' + (c.sat - 10) + '%, ' + (c.light - 5) + '%, 0.04)');
                nebGrad.addColorStop(1, 'hsla(' + c.hue + ', ' + c.sat + '%, ' + c.light + '%, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                ctx.fillStyle = nebGrad;
                ctx.fill();
            }

            // Gas pillars - tall dark columns
            for (var i = 0; i < 3; i++) {
                var px = w * (0.25 + i * 0.25 + Math.sin(i * 3.7 + t * 0.01) * 0.02);
                var pw = w * (0.03 + Math.sin(i * 2.3) * 0.01);
                var pTop = h * (0.2 + Math.sin(i * 4.1) * 0.1);
                // Pillar body
                ctx.beginPath();
                ctx.moveTo(px - pw, h);
                for (var y = h; y >= pTop; y -= 4) {
                    var frac = (h - y) / (h - pTop);
                    var wobble = Math.sin(y * 0.01 + t * 0.1 + i * 2) * pw * 0.3 * frac;
                    var taper = 1 - frac * 0.4;
                    ctx.lineTo(px - pw * taper + wobble, y);
                }
                for (var y = pTop; y <= h; y += 4) {
                    var frac = (h - y) / (h - pTop);
                    var wobble = Math.sin(y * 0.01 + t * 0.1 + i * 2) * pw * 0.3 * frac;
                    var taper = 1 - frac * 0.4;
                    ctx.lineTo(px + pw * taper + wobble, y);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(8, 5, 12, 0.15)';
                ctx.fill();
                // Bright edge glow
                ctx.strokeStyle = 'rgba(200, 150, 100, 0.03)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        },

        drawForeground: function (ctx, w, h, state) {}
    };

    // --- Binary theme ---
    // Binary star system with two orbiting stars and material streams
    themes.binary = (function () {
        var orbitRadius = 0.12;
        var orbitSpeed = 0.3;

        return {
            targetCount: 80,

            spawn: function (w, h) {
                // Background stars
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 0.3 + Math.random() * 1.2,
                    baseOpacity: 0.15 + Math.random() * 0.4,
                    twinkleSpeed: 0.5 + Math.random() * 2,
                    twinkleOffset: Math.random() * Math.PI * 2
                };
            },

            update: function (p, dt, w, h, state) {
                return true;
            },

            draw: function (p, ctx, state) {
                var twinkle = Math.sin(state.timeElapsed * p.twinkleSpeed + p.twinkleOffset);
                var op = p.baseOpacity * (0.4 + twinkle * 0.6);
                if (op < 0.04) return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, ' + op + ')';
                ctx.fill();
            },

            drawBackground: function (ctx, w, h, state) {
                var t = state.timeElapsed;
                // Dark space
                ctx.fillStyle = '#030208';
                ctx.fillRect(0, 0, w, h);

                var cx = w * 0.5;
                var cy = h * 0.5;
                var minDim = Math.min(w, h);
                var orbR = orbitRadius * minDim;

                // Calculate star positions
                var angle = t * orbitSpeed;
                var s1x = cx + Math.cos(angle) * orbR;
                var s1y = cy + Math.sin(angle) * orbR * 0.4;
                var s2x = cx + Math.cos(angle + Math.PI) * orbR;
                var s2y = cy + Math.sin(angle + Math.PI) * orbR * 0.4;

                // Combined light glow (illuminates surrounding space)
                var combinedGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
                combinedGlow.addColorStop(0, 'rgba(180, 160, 200, 0.04)');
                combinedGlow.addColorStop(0.5, 'rgba(150, 140, 180, 0.02)');
                combinedGlow.addColorStop(1, 'rgba(100, 100, 150, 0)');
                ctx.beginPath();
                ctx.arc(cx, cy, minDim * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = combinedGlow;
                ctx.fill();

                // Material stream between stars (figure-eight pattern)
                ctx.save();
                ctx.globalAlpha = 0.6;
                for (var i = 0; i < 30; i++) {
                    var streamAngle = angle + (i / 30) * Math.PI * 2;
                    var streamR = orbR * (0.8 + Math.sin(streamAngle * 2 + t) * 0.3);
                    var sx = cx + Math.cos(streamAngle) * streamR;
                    var sy = cy + Math.sin(streamAngle) * streamR * 0.4;
                    var sOp = 0.03 + Math.sin(i * 2.3 + t * 1.5) * 0.02;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 180, 220, ' + sOp + ')';
                    ctx.fill();
                }
                ctx.restore();

                // Warm star (gold/orange)
                var warmGlow = ctx.createRadialGradient(s1x, s1y, 0, s1x, s1y, minDim * 0.06);
                warmGlow.addColorStop(0, 'rgba(255, 240, 200, 0.5)');
                warmGlow.addColorStop(0.2, 'rgba(255, 200, 120, 0.2)');
                warmGlow.addColorStop(0.5, 'rgba(255, 170, 60, 0.06)');
                warmGlow.addColorStop(1, 'rgba(255, 140, 30, 0)');
                ctx.beginPath();
                ctx.arc(s1x, s1y, minDim * 0.06, 0, Math.PI * 2);
                ctx.fillStyle = warmGlow;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(s1x, s1y, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 245, 220, 0.9)';
                ctx.fill();

                // Cool star (blue/white)
                var coolGlow = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, minDim * 0.05);
                coolGlow.addColorStop(0, 'rgba(200, 220, 255, 0.5)');
                coolGlow.addColorStop(0.2, 'rgba(150, 190, 255, 0.2)');
                coolGlow.addColorStop(0.5, 'rgba(100, 150, 240, 0.06)');
                coolGlow.addColorStop(1, 'rgba(60, 100, 220, 0)');
                ctx.beginPath();
                ctx.arc(s2x, s2y, minDim * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = coolGlow;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(s2x, s2y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(220, 235, 255, 0.9)';
                ctx.fill();
            },

            drawForeground: function (ctx, w, h, state) {}
        };
    })();
})(window.CV.themes);
