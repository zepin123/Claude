/*
 * PAPA PAL MUNDO — Título cinematográfico para After Effects
 * ----------------------------------------------------------
 * Uso: After Effects > Archivo > Scripts > Ejecutar archivo de script...
 *      y selecciona este .jsx.
 *
 * Al ejecutarlo te pregunta por una imagen:
 *   - Elige "titulo_referencia.png" (o tu PNG/PSD original sobre fondo negro)
 *     para animar EXACTAMENTE tu diseño, cortado en 3 líneas (PAPA / PAL / MUNDO).
 *   - Pulsa Cancelar para construirlo con capas de TEXTO editables y una
 *     textura de fuego procedural (cambia FONT abajo por tu tipografía).
 *
 * Crea: comp principal "PAPA PAL MUNDO - Titulo" (1920x1080, 24 fps, 10 s)
 *   0.6 s  PAPA se enciende con parpadeo, desenfoque y escala
 *   2.1 s  PAL entra
 *   2.5 s  MUNDO se enciende
 *   3–8 s  respiración del brillo, calor, grano, empuje lento de cámara
 *   8.6 s  salida con parpadeo y desenfoque a negro
 *
 * Compatible con AE en cualquier idioma (usa matchNames con respaldo por nombre).
 */

(function papaPalMundo() {
    // ================= CONFIGURACIÓN =================
    var W = 1920, H = 1080, FPS = 24, DUR = 10;
    var FONT = "Arial-Black";      // Nombre PostScript. Ej: "ArchivoBlack-Regular", "Anton-Regular"
    var LETTERBOX = false;         // true = barras 2.39:1
    var HEAT_HAZE = true;          // distorsión de calor sutil
    var OUT_START = 8.6;           // inicio de la salida
    var OUT_DUR = 1.2;

    // Colores del fuego (modo texto)
    var COL_SHADOW = hex("D91C06");
    var COL_MID    = hex("FF3F14");
    var COL_HIGH   = hex("FFB020");

    // Animación por línea. yNorm/xNorm = recorte sobre la imagen de referencia (0–1)
    var LINES = [
        { name: "PAPA",  tIn: 0.6, dur: 2.0, scaleFrom: 1.18, blurFrom: 80, yFrom: -10,
          box: { cx: 967, cy: 334, w: 1144, h: 321 }, crop: [0.00, 0.145, 1.00, 0.458] },
        { name: "PAL",   tIn: 2.1, dur: 1.0, scaleFrom: 1.35, blurFrom: 30, yFrom: 0,
          box: { cx: 969, cy: 538, w: 311,  h: 85  }, crop: [0.40, 0.458, 0.61, 0.542] },
        { name: "MUNDO", tIn: 2.5, dur: 2.0, scaleFrom: 1.18, blurFrom: 80, yFrom: 12,
          box: { cx: 966, cy: 743, w: 1449, h: 306 }, crop: [0.00, 0.542, 1.00, 0.860] }
    ];
    // =================================================

    var warnings = [];

    function hex(h) {
        return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
    }

    // Busca un parámetro: primero por nombre (inglés/español), luego por matchName
    function findProp(group, keys, byMatch) {
        for (var i = 1; i <= group.numProperties; i++) {
            var p = group.property(i);
            for (var k = 0; k < keys.length; k++) {
                if (byMatch ? p.matchName === keys[k] : p.name.toLowerCase() === keys[k].toLowerCase()) return p;
            }
            if (p.propertyType !== PropertyType.PROPERTY && p.numProperties > 0) {
                var r = findProp(p, keys, !!byMatch);
                if (r) return r;
            }
        }
        if (byMatch === undefined) return findProp(group, keys, true);
        return null;
    }

    function setP(fx, keys, val, expression) {
        var p = findProp(fx, keys);
        if (!p) { warnings.push(fx.name + " → " + keys[0]); return null; }
        try {
            if (val !== undefined && val !== null) p.setValue(val);
            if (expression) p.expression = expression;
        } catch (e) { warnings.push(fx.name + " → " + keys[0] + ": " + e.toString()); }
        return p;
    }

    function addFx(layer, matchName, label) {
        var fx = layer.property("ADBE Effect Parade").addProperty(matchName);
        if (label) fx.name = label;
        return fx;
    }

    function easeCount(prop) {
        var t = prop.propertyValueType;
        if (t === PropertyValueType.TwoD) return 2;
        if (t === PropertyValueType.ThreeD) return 3;
        return 1;
    }

    // Keyframes con easing cinematográfico (influencia alta = entrada/salida suave)
    function kf(prop, times, vals, inflIn, inflOut) {
        var i, n = easeCount(prop);
        for (i = 0; i < times.length; i++) prop.setValueAtTime(times[i], vals[i]);
        for (i = 1; i <= prop.numKeys; i++) {
            var a = [], b = [];
            for (var d = 0; d < n; d++) {
                a.push(new KeyframeEase(0, inflIn || 75));
                b.push(new KeyframeEase(0, inflOut || 75));
            }
            prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            prop.setTemporalEaseAtKey(i, a, b);
        }
    }

    function flickerExpr(tIn, dur, tOut, dOut) {
        return [
            "// Encendido con parpadeo tipo tubo/proyector",
            "var tIn = " + tIn + ", dur = " + dur + ", tOut = " + tOut + ", dOut = " + dOut + ";",
            "posterizeTime(24);",
            "seedRandom(index * 17, false);",
            "var r = random();",
            "var v = 0;",
            "if (time >= tIn && time < tOut) {",
            "  var p = clamp((time - tIn) / dur, 0, 1);",
            "  v = ease(p, 0, 1, 0, 100);",
            "  if (p < 1 && r > p * 0.85 + 0.25) v *= 0.15;",
            "} else if (time >= tOut) {",
            "  var q = clamp((time - tOut) / dOut, 0, 1);",
            "  v = ease(q, 0, 1, 100, 0);",
            "  if (q > 0 && r < q * 0.6) v *= 0.2;",
            "}",
            "v;"
        ].join("\n");
    }

    function animateLine(layer, cfg, baseScale, basePos) {
        var tr = layer.transform;
        var tIn = cfg.tIn, tEnd = cfg.tIn + cfg.dur;

        kf(tr.scale, [tIn, tEnd, OUT_START, OUT_START + OUT_DUR],
            [[baseScale[0] * cfg.scaleFrom, baseScale[1] * cfg.scaleFrom, 100],
             [baseScale[0], baseScale[1], 100],
             [baseScale[0], baseScale[1], 100],
             [baseScale[0] * 1.06, baseScale[1] * 1.06, 100]], 20, 90);

        kf(tr.position, [tIn, tEnd], [[basePos[0], basePos[1] + cfg.yFrom], basePos], 20, 90);

        tr.opacity.expression = flickerExpr(tIn, cfg.dur * 0.8, OUT_START, OUT_DUR);

        var blur = addFx(layer, "ADBE Gaussian Blur 2", "Desenfoque entrada");
        var bp = setP(blur, ["ADBE Gaussian Blur 2-0001", "Blurriness", "Desenfoque"]);
        if (bp) kf(bp, [tIn, tEnd, OUT_START, OUT_START + OUT_DUR], [cfg.blurFrom, 0, 0, 45], 20, 85);
        setP(blur, ["ADBE Gaussian Blur 2-0003", "Repeat Edge Pixels", "Repetir píxeles de borde"], 0);

        layer.motionBlur = true;
    }

    // ---------- Construcción ----------
    app.beginUndoGroup("PAPA PAL MUNDO - Titulo");

    var proj = app.project || app.newProject();
    var folder = proj.items.addFolder("PAPA PAL MUNDO");

    var imgFile = File.openDialog("Elige la imagen del título (PNG/PSD/JPG). Cancelar = modo texto editable");
    var footage = null;
    if (imgFile) {
        try {
            footage = proj.importFile(new ImportOptions(imgFile));
            footage.parentFolder = folder;
        } catch (e) {
            alert("No se pudo importar la imagen (" + e.toString() + ").\nAE no admite .webp: expórtala como PNG.\nSe usará el modo texto.");
            footage = null;
        }
    }

    // Precomp con las 3 líneas animadas
    var pre = proj.items.addComp("TITULO_lineas", W, H, 1, DUR, FPS);
    pre.parentFolder = folder;
    pre.motionBlur = true;

    var i, cfg, L;
    if (footage) {
        var fitS = Math.min(W / footage.width, H / footage.height) * 100;
        for (i = LINES.length - 1; i >= 0; i--) {
            cfg = LINES[i];
            L = pre.layers.add(footage);
            L.name = cfg.name;
            var fw = footage.width, fh = footage.height;
            var c = cfg.crop;
            var x0 = c[0] * fw, y0 = c[1] * fh, x1 = c[2] * fw, y1 = c[3] * fh;

            var mask = L.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
            mask.name = "Recorte " + cfg.name;
            var shp = new Shape();
            shp.vertices = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            shp.closed = true;
            mask.property("ADBE Mask Shape").setValue(shp);
            mask.property("ADBE Mask Feather").setValue([2, 2]);

            // Negro → transparente (alfa desde el canal rojo; conserva el color)
            var sc = addFx(L, "ADBE Shift Channels", "Negro a alfa");
            setP(sc, ["ADBE Shift Channels-0001", "Take Alpha From", "Tomar alfa de"], 2);

            var ax = (x0 + x1) / 2, ay = (y0 + y1) / 2;
            L.transform.anchorPoint.setValue([ax, ay]);
            var pos = [W / 2 + (ax - fw / 2) * fitS / 100, H / 2 + (ay - fh / 2) * fitS / 100];
            L.transform.position.setValue(pos);
            animateLine(L, cfg, [fitS, fitS], pos);
        }
    } else {
        for (i = LINES.length - 1; i >= 0; i--) {
            cfg = LINES[i];
            L = pre.layers.addText(cfg.name);
            L.name = cfg.name;
            var td = L.property("ADBE Text Properties").property("ADBE Text Document");
            var doc = td.value;
            try { doc.font = FONT; } catch (e1) { warnings.push("Fuente no encontrada: " + FONT); }
            doc.fontSize = 200;
            doc.applyFill = true;
            doc.fillColor = [1, 1, 1];
            doc.applyStroke = false;
            doc.tracking = 0;
            doc.justification = ParagraphJustification.CENTER_JUSTIFY;
            td.setValue(doc);

            // Ajusta cada línea a la caja del diseño original, con cualquier fuente
            var r = L.sourceRectAtTime(0, false);
            L.transform.anchorPoint.setValue([r.left + r.width / 2, r.top + r.height / 2]);
            var sx = cfg.box.w / r.width * 100, sy = cfg.box.h / r.height * 100;
            if (sy > sx * 1.3) sy = sx * 1.3;
            if (sx > sy * 1.3) sx = sy * 1.3;
            var p0 = [cfg.box.cx, cfg.box.cy];
            L.transform.position.setValue(p0);
            animateLine(L, cfg, [sx, sy], p0);
        }
    }

    // ---------- Comp principal ----------
    var comp = proj.items.addComp("PAPA PAL MUNDO - Titulo", W, H, 1, DUR, FPS);
    comp.parentFolder = folder;
    comp.motionBlur = true;
    comp.bgColor = [0, 0, 0];

    var bg = comp.layers.addSolid([0, 0, 0], "Fondo negro", W, H, 1, DUR);

    var preL = comp.layers.add(pre);
    preL.name = "TITULO";
    preL.motionBlur = true;
    kf(preL.transform.scale, [0, DUR], [[100, 100, 100], [106, 106, 100]], 10, 10); // empuje lento de cámara
    preL.transform.position.expression = "// Cámara en mano muy sutil\nwiggle(1.2, 2.5);";

    if (!footage) {
        // Textura de fuego procedural, recortada por el texto
        var tex = comp.layers.addSolid([1, 1, 1], "Textura fuego", W, H, 1, DUR);
        tex.moveBefore(bg);
        var fn = addFx(tex, "ADBE Fractal Noise", "Manchas de calor");
        setP(fn, ["Contrast", "Contraste"], 170);
        setP(fn, ["Brightness", "Brillo"], -12);
        setP(fn, ["Uniform Scaling", "Escala uniforme"], 1);
        setP(fn, ["Scale", "Escala"], 420);
        setP(fn, ["Complexity", "Complejidad"], 3);
        setP(fn, ["Evolution", "Evolución"], null, "time * 70;");
        var tt = addFx(tex, "ADBE Tritone", "Color fuego");
        setP(tt, ["ADBE Tritone-0001", "Highlights", "Iluminaciones"], COL_HIGH);
        setP(tt, ["ADBE Tritone-0002", "Midtones", "Medios tonos"], COL_MID);
        setP(tt, ["ADBE Tritone-0003", "Shadows", "Sombras"], COL_SHADOW);

        preL.moveBefore(tex);
        if (typeof tex.setTrackMatte === "function") {
            tex.setTrackMatte(preL, TrackMatteType.ALPHA);
        } else {
            tex.trackMatteType = TrackMatteType.ALPHA;
        }
        preL.enabled = false;
    }

    // Calor + brillo
    var fxAdj = comp.layers.addSolid([1, 1, 1], "FX Brillo y calor", W, H, 1, DUR);
    fxAdj.adjustmentLayer = true;
    if (HEAT_HAZE) {
        var td2 = addFx(fxAdj, "ADBE Turbulent Displace", "Calor");
        setP(td2, ["ADBE Turbulent Displace-0002", "Amount", "Cantidad"], 3);
        setP(td2, ["ADBE Turbulent Displace-0003", "Size", "Tamaño"], 70);
        setP(td2, ["ADBE Turbulent Displace-0006", "Evolution", "Evolución"], null, "time * 45;");
    }
    var glowWide = addFx(fxAdj, "ADBE Glo2", "Brillo amplio");
    setP(glowWide, ["ADBE Glo2-0002", "Glow Threshold", "Umbral de resplandor"], 35);
    setP(glowWide, ["ADBE Glo2-0003", "Glow Radius", "Radio de resplandor"], 90);
    var gi = setP(glowWide, ["ADBE Glo2-0004", "Glow Intensity", "Intensidad de resplandor"]);
    if (gi) {
        kf(gi, [0.6, 1.4, 2.6, 2.9, 4.5, OUT_START, OUT_START + OUT_DUR], [0.4, 2.0, 1.1, 1.8, 1.0, 1.0, 2.2], 40, 80);
        gi.expression = "// Respiración del fuego\nvalue * (1 + 0.15 * noise(time * 2.5));";
    }
    var glowTight = addFx(fxAdj, "ADBE Glo2", "Brillo borde");
    setP(glowTight, ["ADBE Glo2-0002", "Glow Threshold", "Umbral de resplandor"], 50);
    setP(glowTight, ["ADBE Glo2-0003", "Glow Radius", "Radio de resplandor"], 14);
    setP(glowTight, ["ADBE Glo2-0004", "Glow Intensity", "Intensidad de resplandor"], 0.6);

    // Viñeta
    var vig = comp.layers.addSolid([0, 0, 0], "Viñeta", W, H, 1, DUR);
    var vm = vig.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    var ell = new Shape();
    var kx = W / 2 * 0.5523, ky = H / 2 * 0.5523;
    ell.vertices = [[W / 2, 0], [W, H / 2], [W / 2, H], [0, H / 2]];
    ell.inTangents = [[-kx, 0], [0, -ky], [kx, 0], [0, ky]];
    ell.outTangents = [[kx, 0], [0, ky], [-kx, 0], [0, -ky]];
    ell.closed = true;
    vm.property("ADBE Mask Shape").setValue(ell);
    vm.property("ADBE Mask Feather").setValue([450, 450]);
    vm.inverted = true;
    vig.transform.opacity.setValue(70);

    // Grano de película
    var grain = comp.layers.addSolid([1, 1, 1], "FX Grano", W, H, 1, DUR);
    grain.adjustmentLayer = true;
    var nz = addFx(grain, "ADBE Noise", "Grano");
    setP(nz, ["ADBE Noise-0001", "Amount of Noise", "Cantidad de ruido"], 6);
    setP(nz, ["Use Color Noise", "Usar ruido de color"], 0);

    if (LETTERBOX) {
        var barH = Math.round((H - W / 2.39) / 2);
        var top = comp.layers.addSolid([0, 0, 0], "Letterbox arriba", W, barH, 1, DUR);
        top.transform.position.setValue([W / 2, barH / 2]);
        var bot = comp.layers.addSolid([0, 0, 0], "Letterbox abajo", W, barH, 1, DUR);
        bot.transform.position.setValue([W / 2, H - barH / 2]);
    }

    app.endUndoGroup();
    comp.openInViewer();

    var msg = "Listo: \"PAPA PAL MUNDO - Titulo\" (" + (footage ? "modo imagen" : "modo texto, fuente " + FONT) + ").";
    if (warnings.length) msg += "\n\nAjustes no aplicados (revísalos a mano):\n- " + warnings.join("\n- ");
    alert(msg);
})();
