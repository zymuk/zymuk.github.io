import React, { useEffect, useRef, useState } from "react";
import usePageMeta from "../../../utils/usePageMeta";
import "./ImageEditor.css";

const cmToPx = (cm) =>
  Math.round((parseFloat(cm) || 0) * 96 / 2.54);

const PRESET_BACKGROUNDS = [
  { name: "Transparent", value: "transparent", checker: true },
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#cfe8ff" },
  { name: "Pink", value: "#ffdcec" },
  { name: "Dark", value: "#1c1220" },
];

const boundsOf = (data, w, h) => {
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
};

const blurAlpha = (data, w, h, radius) => {
  const n = w * h;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = data[i * 4 + 3];
  const tmp = new Float32Array(n);
  const k = radius;
  const div = k * 2 + 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let j = -k; j <= k; j++) {
        const xx = Math.min(w - 1, Math.max(0, x + j));
        sum += a[y * w + xx];
      }
      tmp[y * w + x] = sum / div;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let sum = 0;
      for (let j = -k; j <= k; j++) {
        const yy = Math.min(h - 1, Math.max(0, y + j));
        sum += tmp[yy * w + x];
      }
      a[y * w + x] = sum / div;
    }
  }
  for (let i = 0; i < n; i++) data[i * 4 + 3] = a[i];
};

const eraseAt = (data, w, h, sx, sy, tolv) => {
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;
  const si = (sy * w + sx) * 4;
  if (data[si + 3] === 0) return;
  const r0 = data[si];
  const g0 = data[si + 1];
  const b0 = data[si + 2];
  const visited = new Uint8Array(w * h);
  const stack = [sy * w + sx];
  visited[sy * w + sx] = 1;
  const match = (i) =>
    data[i + 3] > 0 &&
    Math.abs(data[i] - r0) <= tolv &&
    Math.abs(data[i + 1] - g0) <= tolv &&
    Math.abs(data[i + 2] - b0) <= tolv;
  while (stack.length) {
    const p = stack.pop();
    data[p * 4 + 3] = 0;
    const px = p % w;
    const py = (p - px) / w;
    const neighbors = [
      [px + 1, py],
      [px - 1, py],
      [px, py + 1],
      [px, py - 1],
    ];
    for (let k = 0; k < 4; k++) {
      const nx = neighbors[k][0];
      const ny = neighbors[k][1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const np = ny * w + nx;
      if (visited[np]) continue;
      visited[np] = 1;
      if (match(np * 4)) stack.push(np);
    }
  }
};

const ImageEditor = () => {
  usePageMeta({
    title: "Image Editor",
    description:
      "Remove white background, crop, resize and export transparent images as WEBP or PNG directly in the browser.",
  });

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const previewBoxRef = useRef(null);
  const previewRef = useRef(null);
  const overlayRef = useRef(null);

  const sourceRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const outputCanvasRef = useRef(null);

  const [tolerance, setTolerance] = useState(40);
  const [feather, setFeather] = useState(1);
  const [trim, setTrim] = useState(true);
  const [cropCm, setCropCm] = useState("0");
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState("image/webp");
  const [background, setBackground] = useState("transparent");
  const [activeSwatch, setActiveSwatch] = useState(0);

  const [cropMode, setCropMode] = useState(false);
  const [hasCrop, setHasCrop] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [erasePoints, setErasePoints] = useState([]);
  const [metaText, setMetaText] = useState("");

  const [cropX, setCropX] = useState("0");
  const [cropY, setCropY] = useState("0");
  const [cropW, setCropW] = useState("0");
  const [cropH, setCropH] = useState("0");

  const cropRectRef = useRef(null);
  const cropOffsetRef = useRef({ x: 0, y: 0 });
  const trimOffsetRef = useRef({ x: 0, y: 0 });
  const manualEraseRef = useRef([]);
  const dragRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.onload = null;
        sourceRef.current.onerror = null;
      }
    };
  }, []);

  const getContext2d = (canvas, willRead = false) => {
    const ctx = canvas.getContext("2d", willRead ? { willReadFrequently: true } : undefined);
    return ctx;
  };

  const sourceToPreview = (sx, sy) => {
    const base = cropRectRef.current || { x: 0, y: 0 };
    const out = outputCanvasRef.current;
    const result = resultCanvasRef.current;
    const f = out && result ? out.width / result.width : 1;
    return {
      x: (sx - base.x - cropOffsetRef.current.x - trimOffsetRef.current.x) * f,
      y: (sy - base.y - cropOffsetRef.current.y - trimOffsetRef.current.y) * f,
    };
  };

  const previewToSource = (rx, ry) => {
    const base = cropRectRef.current || { x: 0, y: 0 };
    const out = outputCanvasRef.current;
    const result = resultCanvasRef.current;
    const f = out && result ? out.width / result.width : 1;
    return {
      x: base.x + cropOffsetRef.current.x + trimOffsetRef.current.x + rx / f,
      y: base.y + cropOffsetRef.current.y + trimOffsetRef.current.y + ry / f,
    };
  };

  const clampRect = (r, w, h) => {
    const x = Math.max(0, Math.min(r.x, w));
    const y = Math.max(0, Math.min(r.y, h));
    const x2 = Math.max(0, Math.min(r.x + r.w, w));
    const y2 = Math.max(0, Math.min(r.y + r.h, h));
    return { x, y, w: x2 - x, h: y2 - y };
  };

  const drawCropOverlay = () => {
    const out = outputCanvasRef.current;
    const overlay = overlayRef.current;
    if (!out || !overlay) return;
    const ow = out.width;
    const oh = out.height;
    overlay.width = ow;
    overlay.height = oh;
    const ctx = getContext2d(overlay);
    ctx.clearRect(0, 0, ow, oh);
    if (!cropMode && !hasCrop) return;

    let sel = null;
    if (dragRef.current) {
      const d = dragRef.current;
      sel = {
        x: Math.min(d.x0, d.x1),
        y: Math.min(d.y0, d.y1),
        w: Math.abs(d.x1 - d.x0),
        h: Math.abs(d.y1 - d.y0),
      };
    } else if (cropRectRef.current) {
      const cr = cropRectRef.current;
      const a = sourceToPreview(cr.x, cr.y);
      const b = sourceToPreview(cr.x + cr.w, cr.y + cr.h);
      sel = { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
    }
    if (!sel) {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(0, 0, ow, oh);
      return;
    }
    const s = clampRect(sel, ow, oh);
    if (s.w <= 0 || s.h <= 0) return;
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.fillRect(0, 0, ow, s.y);
    ctx.fillRect(0, s.y + s.h, ow, oh - (s.y + s.h));
    ctx.fillRect(0, s.y, s.x, s.h);
    ctx.fillRect(s.x + s.w, s.y, ow - (s.x + s.w), s.h);
    ctx.strokeStyle = "#e85a94";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
    ctx.setLineDash([]);
  };

  const renderPreview = () => {
    const out = outputCanvasRef.current;
    const preview = previewRef.current;
    if (!out || !preview) return;
    const w = out.width;
    const h = out.height;
    preview.width = w;
    preview.height = h;
    const ctx = getContext2d(preview);
    ctx.clearRect(0, 0, w, h);
    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(out, 0, 0);
    drawCropOverlay();
  };

  useEffect(() => {
    renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background]);

  const updateMeta = (ow, oh) => {
    let t = "Original: " + ow + "×" + oh + " px";
    if (resultCanvasRef.current) {
      t += " → Result: " + resultCanvasRef.current.width + "×" + resultCanvasRef.current.height + " px";
    }
    if (outputCanvasRef.current && outputCanvasRef.current !== resultCanvasRef.current) {
      t += " → Export: " + outputCanvasRef.current.width + "×" + outputCanvasRef.current.height + " px";
    }
    setMetaText(t);
  };

  const processImage = () => {
    const img = sourceRef.current;
    if (!img) return;
    const cr = cropRectRef.current || {
      x: 0,
      y: 0,
      w: img.naturalWidth,
      h: img.naturalHeight,
    };
    const w = cr.w;
    const h = cr.h;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = getContext2d(c, true);
    ctx.drawImage(img, cr.x, cr.y, cr.w, cr.h, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const cut = 255 - parseInt(tolerance, 10);

    const isWhite = (i) =>
      data[i] >= cut && data[i + 1] >= cut && data[i + 2] >= cut && data[i + 3] > 0;

    const visited = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (visited[p]) return;
      if (!isWhite(p * 4)) return;
      visited[p] = 1;
      stack.push(p);
    };
    for (let x = 0; x < w; x++) {
      push(x, 0);
      push(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      push(0, y);
      push(w - 1, y);
    }
    while (stack.length) {
      const p = stack.pop();
      const px = p % w;
      const py = (p - px) / w;
      data[p * 4 + 3] = 0;
      push(px + 1, py);
      push(px - 1, py);
      push(px, py + 1);
      push(px, py - 1);
    }

    const tolv = parseInt(tolerance, 10);
    manualEraseRef.current.forEach((point) => {
      eraseAt(data, w, h, point.x - cr.x, point.y - cr.y, tolv);
    });

    const r = parseInt(feather, 10);
    if (r > 0) blurAlpha(data, w, h, r);

    ctx.putImageData(imgData, 0, 0);

    const cropPx = cmToPx(cropCm);
    let stage = c;
    let sw = w;
    let sh = h;
    cropOffsetRef.current = { x: 0, y: 0 };
    if (cropPx > 0) {
      const nw = Math.max(1, w - cropPx * 2);
      const nh = Math.max(1, h - cropPx * 2);
      const cx = Math.floor((w - nw) / 2);
      const cy = Math.floor((h - nh) / 2);
      const cc = document.createElement("canvas");
      cc.width = nw;
      cc.height = nh;
      getContext2d(cc).drawImage(c, cx, cy, nw, nh, 0, 0, nw, nh);
      stage = cc;
      sw = nw;
      sh = nh;
      cropOffsetRef.current = { x: cx, y: cy };
    }

    trimOffsetRef.current = { x: 0, y: 0 };
    if (trim) {
      const sdata = getContext2d(stage, true).getImageData(0, 0, sw, sh).data;
      const b = boundsOf(sdata, sw, sh);
      if (b) {
        const out = document.createElement("canvas");
        out.width = b.w;
        out.height = b.h;
        getContext2d(out).drawImage(stage, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
        resultCanvasRef.current = out;
        trimOffsetRef.current = { x: b.x, y: b.y };
      } else {
        resultCanvasRef.current = stage;
      }
    } else {
      resultCanvasRef.current = stage;
    }

    const sp = parseInt(scale, 10) || 100;
    if (sp !== 100) {
      const tw = Math.max(1, Math.round(resultCanvasRef.current.width * sp) / 100);
      const th = Math.max(1, Math.round(resultCanvasRef.current.height * sp) / 100);
      const sc = document.createElement("canvas");
      sc.width = tw;
      sc.height = th;
      getContext2d(sc).drawImage(resultCanvasRef.current, 0, 0, tw, th);
      outputCanvasRef.current = sc;
    } else {
      outputCanvasRef.current = resultCanvasRef.current;
    }

    renderPreview();
    updateMeta(img.naturalWidth, img.naturalHeight);
  };

  useEffect(() => {
    if (sourceRef.current) processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tolerance, feather, trim, cropCm, scale]);

  const loadImage = (file) => {
    if (!/^image\//.test(file.type)) {
      window.alert("Please choose an image file.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      sourceRef.current = img;
      manualEraseRef.current = [];
      setErasePoints([]);
      setHasCrop(false);
      cropRectRef.current = null;
      setCropX("0");
      setCropY("0");
      setCropW(String(img.naturalWidth));
      setCropH(String(img.naturalHeight));
      setHasImage(true);
      processImage();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      window.alert("Could not read the image.");
    };
    img.src = url;
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) loadImage(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove("over");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const posToPreview = (e) => {
    const preview = previewRef.current;
    const rect = preview.getBoundingClientRect();
    if (!rect.width) return null;
    return {
      x: (e.clientX - rect.left) * (preview.width / rect.width),
      y: (e.clientY - rect.top) * (preview.height / rect.height),
    };
  };

  const handlePreviewMouseDown = (e) => {
    if (!cropMode || !outputCanvasRef.current || drawingRef.current) return;
    e.preventDefault();
    const p = posToPreview(e);
    if (!p) return;
    dragRef.current = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    drawingRef.current = true;
    drawCropOverlay();
  };

  useEffect(() => {
    if (!cropMode) return undefined;
    const handleMove = (e) => {
      if (!drawingRef.current || !dragRef.current) return;
      const p = posToPreview(e);
      if (!p) return;
      dragRef.current.x1 = p.x;
      dragRef.current.y1 = p.y;
      drawCropOverlay();
    };
    const handleUp = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      const d = dragRef.current;
      dragRef.current = null;
      if (d && Math.abs(d.x1 - d.x0) > 2 && Math.abs(d.y1 - d.y0) > 2) {
        const a = previewToSource(Math.min(d.x0, d.x1), Math.min(d.y0, d.y1));
        const b = previewToSource(Math.max(d.x0, d.x1), Math.max(d.y0, d.y1));
        const W = sourceRef.current.naturalWidth;
        const H = sourceRef.current.naturalHeight;
        const x = Math.max(0, Math.min(a.x, W - 1));
        const y = Math.max(0, Math.min(a.y, H - 1));
        const x2 = Math.max(1, Math.min(b.x, W));
        const y2 = Math.max(1, Math.min(b.y, H));
        setCropX(String(x));
        setCropY(String(y));
        setCropW(String(x2 - x));
        setCropH(String(y2 - y));
        setCropMode(false);
      }
      drawCropOverlay();
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropMode, tolerance, feather, trim, cropCm, scale, background, hasCrop]);

  const handlePreviewClick = (e) => {
    if (!sourceRef.current || !outputCanvasRef.current || cropMode) return;
    const p = posToPreview(e);
    if (!p) return;
    const s = previewToSource(p.x, p.y);
    const wx = Math.floor(s.x);
    const wy = Math.floor(s.y);
    const W = sourceRef.current.naturalWidth;
    const H = sourceRef.current.naturalHeight;
    if (wx < 0 || wy < 0 || wx >= W || wy >= H) return;
    const next = [...manualEraseRef.current, { x: wx, y: wy }];
    manualEraseRef.current = next;
    setErasePoints(next);
    processImage();
  };

  const undoErase = () => {
    if (!manualEraseRef.current.length) return;
    const next = manualEraseRef.current.slice(0, -1);
    manualEraseRef.current = next;
    setErasePoints(next);
    processImage();
  };

  const clearErase = () => {
    if (!manualEraseRef.current.length) return;
    manualEraseRef.current = [];
    setErasePoints([]);
    processImage();
  };

  const toggleCropMode = () => {
    if (!sourceRef.current) return;
    setCropMode((prev) => !prev);
  };

  const clearCrop = () => {
    setCropMode(false);
    const img = sourceRef.current;
    if (img) {
      setCropX("0");
      setCropY("0");
      setCropW(String(img.naturalWidth));
      setCropH(String(img.naturalHeight));
    }
  };

  useEffect(() => {
    const img = sourceRef.current;
    if (!img) return;
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const x = Math.max(0, Math.min(Math.round(Number(cropX)) || 0, W - 1));
    const y = Math.max(0, Math.min(Math.round(Number(cropY)) || 0, H - 1));
    const w = Math.max(1, Math.min(Math.round(Number(cropW)) || 0, W - x));
    const h = Math.max(1, Math.min(Math.round(Number(cropH)) || 0, H - y));
    const isFullImage = x === 0 && y === 0 && w === W && h === H;
    cropRectRef.current = isFullImage ? null : { x, y, w, h };
    setHasCrop(!isFullImage);
    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropX, cropY, cropW, cropH]);

  const handleDownload = () => {
    const out = outputCanvasRef.current;
    if (!out) return;
    out.toBlob(
      (blob) => {
        if (!blob) {
          window.alert("Your browser could not export " + format.split("/")[1].toUpperCase() + ". Use a recent Chrome/Edge.");
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = format === "image/png" ? "edited-image.png" : "edited-image.webp";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      format,
      0.92
    );
  };

  const handleReset = () => {
    sourceRef.current = null;
    resultCanvasRef.current = null;
    outputCanvasRef.current = null;
    manualEraseRef.current = [];
    setErasePoints([]);
    cropRectRef.current = null;
    setHasCrop(false);
    setCropMode(false);
    setHasImage(false);
    setMetaText("");
  };

  const cropValLabel = cropCm + " cm ≈ " + cmToPx(cropCm) + " px";
  const downloadLabel = format === "image/png" ? "Download PNG" : "Download WEBP";

  return (
    <div className="image-editor-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Image Editor</h1>
          <p className="page-subtitle">
            Remove white background, crop, resize and export transparent images — all locally in your browser.
          </p>
        </div>

        <div className="glass-content image-editor-grid">
          {/* Controls */}
          <div className="image-editor-controls">
            <h2>1 · Source image</h2>
            <div
              className="image-editor-drop"
              id="drop"
              ref={dropRef}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                dropRef.current.classList.add("over");
              }}
              onDragLeave={() => dropRef.current.classList.remove("over")}
              onDrop={handleDrop}
              role="button"
              tabIndex="0"
              aria-label="Upload image"
            >
              Drag &amp; drop an image here
              <br />
              or click to choose a file
              <br />
              <span>(PNG / JPG / WEBP)</span>
            </div>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <h2>2 · Manual crop</h2>
            <p className="image-editor-hint">
              Click <strong>Select crop region</strong> then drag on the image to keep only the selected area. You can crop repeatedly.
            </p>
            <div className="image-editor-btn-row">
              <button
                className="btn-secondary image-editor-btn-sm"
                onClick={toggleCropMode}
                disabled={!hasImage}
              >
                {cropMode ? "Finish selection" : "Select crop region"}
              </button>
              <button
                className="btn-secondary image-editor-btn-sm"
                onClick={clearCrop}
                disabled={!hasCrop}
              >
                Remove crop
              </button>
            </div>
            <p className="image-editor-hint">
              Or type exact pixel values (based on the original image) — the crop applies automatically.
            </p>
            <div className="image-editor-crop-grid">
              <label>
                Left
                <input
                  type="number"
                  min="0"
                  value={cropX}
                  disabled={!hasImage}
                  onChange={(e) => setCropX(e.target.value)}
                />
              </label>
              <label>
                Top
                <input
                  type="number"
                  min="0"
                  value={cropY}
                  disabled={!hasImage}
                  onChange={(e) => setCropY(e.target.value)}
                />
              </label>
              <label>
                Width
                <input
                  type="number"
                  min="1"
                  value={cropW}
                  disabled={!hasImage}
                  onChange={(e) => setCropW(e.target.value)}
                />
              </label>
              <label>
                Height
                <input
                  type="number"
                  min="1"
                  value={cropH}
                  disabled={!hasImage}
                  onChange={(e) => setCropH(e.target.value)}
                />
              </label>
            </div>

            <h2>3 · Remove white background</h2>
            <div className="image-editor-field">
              <div className="image-editor-field-head">
                <label htmlFor="tol">White threshold</label>
                <span className="image-editor-val">{tolerance}</span>
              </div>
              <input
                type="range"
                id="tol"
                min="0"
                max="120"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
              />
              <p className="image-editor-hint">
                Higher removes off-white / light gray. Only removes white connected to the image edge.
              </p>
            </div>
            <div className="image-editor-field">
              <div className="image-editor-field-head">
                <label htmlFor="feather">Feather edges</label>
                <span className="image-editor-val">{feather}</span>
              </div>
              <input
                type="range"
                id="feather"
                min="0"
                max="4"
                value={feather}
                onChange={(e) => setFeather(Number(e.target.value))}
              />
            </div>
            <div className="image-editor-field">
              <div className="image-editor-field-head">
                <label htmlFor="cropCm">Fixed border crop (per side)</label>
                <span className="image-editor-val">{cropValLabel}</span>
              </div>
              <input
                type="number"
                id="cropCm"
                min="0"
                step="0.1"
                value={cropCm}
                onChange={(e) => setCropCm(e.target.value)}
              />
              <p className="image-editor-hint">
                Removes a fixed amount (cm, 96 dpi) from every side. Set to 0 to disable.
              </p>
            </div>
            <label className="image-editor-check">
              <input
                type="checkbox"
                id="trim"
                checked={trim}
                onChange={(e) => setTrim(e.target.checked)}
              />
              Trim to content (remove remaining empty space)
            </label>

            <h2>4 · Preview background</h2>
            <div className="image-editor-swatches">
              {PRESET_BACKGROUNDS.map((p, i) => (
                <div
                  key={p.name}
                  className={
                    "image-editor-sw" +
                    (p.checker ? " checker" : "") +
                    (activeSwatch === i ? " active" : "")
                  }
                  style={p.checker ? undefined : { background: p.value }}
                  title={p.name}
                  onClick={() => {
                    setBackground(p.value);
                    setActiveSwatch(i);
                  }}
                />
              ))}
            </div>
            <div className="image-editor-row">
              <input
                type="color"
                id="customColor"
                value="#ffdcec"
                onChange={(e) => {
                  setBackground(e.target.value);
                  setActiveSwatch(-1);
                }}
              />
              <span>Custom color</span>
            </div>

            <h2>5 · Manual erase (click the image)</h2>
            <p className="image-editor-hint">
              Click directly on the result image to erase a connected region of similar color at that point. Uses the white threshold as color tolerance.
            </p>
            <div className="image-editor-btn-row">
              <button
                className="btn-secondary image-editor-btn-sm"
                onClick={undoErase}
                disabled={erasePoints.length === 0}
              >
                Undo click
              </button>
              <button
                className="btn-secondary image-editor-btn-sm"
                onClick={clearErase}
                disabled={erasePoints.length === 0}
              >
                Clear all
              </button>
            </div>
            <p className="image-editor-meta">
              {erasePoints.length ? "Clicked " + erasePoints.length + " point(s)" : ""}
            </p>

            <h2>6 · Export</h2>
            <div className="image-editor-field">
              <div className="image-editor-field-head">
                <label htmlFor="scale">Resize result</label>
                <span className="image-editor-val">{scale}%</span>
              </div>
              <input
                type="range"
                id="scale"
                min="5"
                max="200"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
            <div className="image-editor-field">
              <label htmlFor="format">Download format</label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="image/webp">WEBP (small, supports transparency)</option>
                <option value="image/png">PNG (transparent)</option>
              </select>
            </div>
            <div className="image-editor-btn-row">
              <button
                className="btn-primary"
                onClick={handleDownload}
                disabled={!hasImage}
              >
                {downloadLabel}
              </button>
              <button
                className="btn-secondary"
                onClick={handleReset}
                disabled={!hasImage}
              >
                Reset
              </button>
            </div>
            <p className="image-editor-meta">{metaText}</p>
          </div>

          {/* Preview */}
          <div className="image-editor-result">
            <h2>Result</h2>
            <div className="image-editor-stage">
              <div
                ref={previewBoxRef}
                className="image-editor-preview-box"
                style={{ display: hasImage ? "block" : "none" }}
              >
                <canvas
                  ref={previewRef}
                  id="preview"
                  width="1"
                  height="1"
                  onClick={handlePreviewClick}
                  onMouseDown={handlePreviewMouseDown}
                  className="image-editor-canvas"
                />
                <canvas ref={overlayRef} id="cropOverlay" className="image-editor-overlay" />
              </div>
              {!hasImage && (
                <span className="image-editor-placeholder">
                  No image yet — upload one to get started.
                </span>
              )}
            </div>
            <p className="image-editor-hint">
              Checkerboard background = transparent area. Pick a blue/pink preview to test the asset on a theme background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
