// --- Diurnal time-of-day utility ---
// Provides time data, color interpolation, and period-to-theme mapping
// for diurnal (time-reactive) visualizations.
(function () {
    var CV = window.CV;

    // 8 time periods with smooth palette interpolation
    var PERIODS = [
        { name: 'latenight',  startHour: 0,    endHour: 4.5,  brightnessStart: 0.03, brightnessEnd: 0.05 },
        { name: 'dawn',       startHour: 4.5,  endHour: 6.5,  brightnessStart: 0.05, brightnessEnd: 0.35 },
        { name: 'morning',    startHour: 6.5,  endHour: 10,   brightnessStart: 0.35, brightnessEnd: 0.85 },
        { name: 'midday',     startHour: 10,   endHour: 14,   brightnessStart: 0.85, brightnessEnd: 1.0  },
        { name: 'afternoon',  startHour: 14,   endHour: 17,   brightnessStart: 0.85, brightnessEnd: 0.55 },
        { name: 'dusk',       startHour: 17,   endHour: 19.5, brightnessStart: 0.55, brightnessEnd: 0.12 },
        { name: 'evening',    startHour: 19.5, endHour: 22,   brightnessStart: 0.12, brightnessEnd: 0.06 },
        { name: 'night',      startHour: 22,   endHour: 24,   brightnessStart: 0.06, brightnessEnd: 0.03 }
    ];

    // Sky palettes per period: [zenith, mid-sky, horizon] as [r,g,b]
    var PALETTES = {
        latenight:  { zenith: [8, 8, 25],      mid: [12, 12, 35],     horizon: [15, 15, 40]     },
        dawn:       { zenith: [25, 30, 65],     mid: [80, 50, 70],     horizon: [200, 110, 80]   },
        morning:    { zenith: [70, 130, 200],   mid: [120, 170, 220],  horizon: [200, 200, 190]  },
        midday:     { zenith: [90, 160, 230],   mid: [140, 190, 240],  horizon: [200, 210, 220]  },
        afternoon:  { zenith: [80, 140, 200],   mid: [160, 170, 180],  horizon: [220, 190, 140]  },
        dusk:       { zenith: [40, 40, 80],     mid: [120, 60, 70],    horizon: [230, 120, 50]   },
        evening:    { zenith: [20, 18, 50],     mid: [40, 25, 60],     horizon: [80, 45, 70]     },
        night:      { zenith: [10, 12, 30],     mid: [12, 15, 38],     horizon: [20, 22, 45]     }
    };

    // Period-to-theme mapping for Day Tracker mode
    var PERIOD_THEME_MAP = {
        latenight:  'desert',
        dawn:       'harbour',
        morning:    'mountain',
        midday:     'coast',
        afternoon:  'meadow',
        dusk:       'garden',
        evening:    'lake',
        night:      'cityscape'
    };

    function lerpColor(c1, c2, t) {
        t = Math.max(0, Math.min(1, t));
        return [
            c1[0] + (c2[0] - c1[0]) * t,
            c1[1] + (c2[1] - c1[1]) * t,
            c1[2] + (c2[2] - c1[2]) * t
        ];
    }

    function colorToRgb(c, alpha) {
        if (alpha !== undefined) {
            return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + alpha + ')';
        }
        return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
    }

    function getTimeData(date) {
        date = date || new Date();
        var hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

        // Find current period
        var period = PERIODS[0];
        var periodIndex = 0;
        for (var i = 0; i < PERIODS.length; i++) {
            if (hour >= PERIODS[i].startHour && hour < PERIODS[i].endHour) {
                period = PERIODS[i];
                periodIndex = i;
                break;
            }
        }

        // Progress within current period (0 to 1)
        var duration = period.endHour - period.startHour;
        var periodProgress = duration > 0 ? (hour - period.startHour) / duration : 0;
        periodProgress = Math.max(0, Math.min(1, periodProgress));

        // Brightness interpolation within period
        var brightness = period.brightnessStart + (period.brightnessEnd - period.brightnessStart) * periodProgress;

        // Sun altitude approximation (-1 at midnight, 1 at noon)
        var sunAngle = (hour - 6) / 12 * Math.PI;
        var sunAltitude = Math.sin(sunAngle);

        // Interpolate palette: blend current period with next for smooth transitions
        var currentPalette = PALETTES[period.name];
        var nextPeriod = PERIODS[(periodIndex + 1) % PERIODS.length];
        var nextPalette = PALETTES[nextPeriod.name];

        // Use eased progress at edges for smoother transitions
        var blendT = periodProgress;
        // Blend into next period's palette in the last 20% of the current period
        var transitionZone = 0.2;
        var blendAmount = 0;
        if (blendT > (1 - transitionZone)) {
            blendAmount = (blendT - (1 - transitionZone)) / transitionZone;
        }

        var palette = {
            zenith:  lerpColor(currentPalette.zenith, nextPalette.zenith, blendAmount),
            mid:     lerpColor(currentPalette.mid, nextPalette.mid, blendAmount),
            horizon: lerpColor(currentPalette.horizon, nextPalette.horizon, blendAmount)
        };

        return {
            hour: hour,
            period: period.name,
            periodIndex: periodIndex,
            periodProgress: periodProgress,
            sunAltitude: sunAltitude,
            brightness: brightness,
            palette: palette
        };
    }

    function getThemeForPeriod(periodName) {
        return PERIOD_THEME_MAP[periodName] || 'meadow';
    }

    // Shared drawing helper: sky gradient from time data
    function drawSkyGradient(ctx, w, h, td) {
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, colorToRgb(td.palette.zenith));
        grad.addColorStop(0.5, colorToRgb(td.palette.mid));
        grad.addColorStop(1, colorToRgb(td.palette.horizon));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    // Shared drawing helper: stars based on brightness (more visible at night)
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

    // Shared drawing helper: simple sun disc
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

    // Shared drawing helper: simple moon disc
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

    // Expose on CV namespace
    CV.diurnal = {
        getTimeData: getTimeData,
        lerpColor: lerpColor,
        colorToRgb: colorToRgb,
        getThemeForPeriod: getThemeForPeriod,
        drawSkyGradient: drawSkyGradient,
        drawStars: drawStars,
        drawSun: drawSun,
        drawMoon: drawMoon,
        PERIODS: PERIODS,
        PALETTES: PALETTES
    };
})();
