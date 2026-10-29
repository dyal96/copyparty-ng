/* ============================================================
   Modern UI for CopyParty — Overlay Engine
   Reads existing CGV/ls0 data and renders a Google-style UI
   Loaded via --js-browser (zero source changes)
   ============================================================ */

(function () {
  "use strict";

  // If the user chose the classic UI, disable the
  // CSS boot veil synchronously so the classic page paints immediately.
  try {
    if (localStorage.getItem("cpp_modern_ui") === "false")
      document.documentElement.classList.add("modern-off");
  } catch (e) {}

  // ===== CONFIGURATION =====
  var STORAGE_KEY = "cpp_modern_ui";
  var DARK_KEY = "cpp_modern_dark";
  var ACCENT_KEY = "cpp_modern_accent";
  var VIEW_KEY = "cpp_modern_view";
  var draggedFile = null;

  // ===== ACCENT COLOR PRESETS =====
  var ACCENT_COLORS = [
    { name: "Blue",   hex: "#1a73e8", light: "#e8f0fe", hover: "#1557b0" },
    { name: "Purple", hex: "#7c3aed", light: "#ede9fe", hover: "#6d28d9" },
    { name: "Green",  hex: "#059669", light: "#d1fae5", hover: "#047857" },
    { name: "Orange", hex: "#ea580c", light: "#ffedd5", hover: "#c2410c" },
    { name: "Red",    hex: "#dc2626", light: "#fee2e2", hover: "#b91c1c" },
    { name: "Teal",   hex: "#0d9488", light: "#ccfbf1", hover: "#0f766e" },
    { name: "Pink",   hex: "#db2777", light: "#fce7f3", hover: "#be185d" },
    { name: "Amber",  hex: "#d97706", light: "#fef3c7", hover: "#b45309" },
  ];

  // ===== ICONS (inline SVG paths) =====
  var SVG = {
    folder:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',
    upload:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="15" x2="12" y2="3"/><polyline points="5 8 12 3 19 8"/><path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/></svg>',
    newFolder:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3v-3h2v3h3v2z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z"/></svg>',
    darkMode:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>',
    lightMode:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
    download:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    zip: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H10v-2h4v2zm0-4H10V9h4v3z"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    rename:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    moreVert:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
    chevronRight:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
    switchUI:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    storage:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',
    listView: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>',
    gridView: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',
    login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2.5 2.5 0 002.5-2.5c0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
  };

  // ===== FILE TYPE CONFIG =====
  var FILE_TYPES = {
    pdf: { icon: "PDF", color: "var(--m-ft-pdf)", bg: "var(--m-ft-pdf-bg)" },
    doc: { icon: "DOC", color: "var(--m-ft-doc)", bg: "var(--m-ft-doc-bg)" },
    docx: { icon: "DOC", color: "var(--m-ft-doc)", bg: "var(--m-ft-doc-bg)" },
    txt: { icon: "TXT", color: "var(--m-ft-default)", bg: "var(--m-ft-default-bg)" },
    md: { icon: "MD", color: "var(--m-ft-doc)", bg: "var(--m-ft-doc-bg)" },
    rtf: { icon: "RTF", color: "var(--m-ft-doc)", bg: "var(--m-ft-doc-bg)" },
    xls: { icon: "XLS", color: "var(--m-ft-sheet)", bg: "var(--m-ft-sheet-bg)" },
    xlsx: { icon: "XLS", color: "var(--m-ft-sheet)", bg: "var(--m-ft-sheet-bg)" },
    csv: { icon: "CSV", color: "var(--m-ft-sheet)", bg: "var(--m-ft-sheet-bg)" },
    jpg: { icon: "JPG", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    jpeg: { icon: "JPG", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    png: { icon: "PNG", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    gif: { icon: "GIF", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    webp: { icon: "WEBP", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    svg: { icon: "SVG", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    bmp: { icon: "BMP", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    ico: { icon: "ICO", color: "var(--m-ft-image)", bg: "var(--m-ft-image-bg)" },
    mp4: { icon: "MP4", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    mkv: { icon: "MKV", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    avi: { icon: "AVI", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    mov: { icon: "MOV", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    webm: { icon: "WEBM", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    flv: { icon: "FLV", color: "var(--m-ft-video)", bg: "var(--m-ft-video-bg)" },
    mp3: { icon: "MP3", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    flac: { icon: "FLAC", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    wav: { icon: "WAV", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    ogg: { icon: "OGG", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    opus: { icon: "OPUS", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    m4a: { icon: "M4A", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    aac: { icon: "AAC", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    wma: { icon: "WMA", color: "var(--m-ft-audio)", bg: "var(--m-ft-audio-bg)" },
    zip: { icon: "ZIP", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    rar: { icon: "RAR", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    gz: { icon: "GZ", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    tar: { icon: "TAR", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    "7z": { icon: "7Z", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    bz2: { icon: "BZ2", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    xz: { icon: "XZ", color: "var(--m-ft-archive)", bg: "var(--m-ft-archive-bg)" },
    js: { icon: "JS", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    ts: { icon: "TS", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    py: { icon: "PY", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    html: { icon: "HTML", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    css: { icon: "CSS", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    json: { icon: "JSON", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    xml: { icon: "XML", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    sh: { icon: "SH", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    bat: { icon: "BAT", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    java: { icon: "JAVA", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    c: { icon: "C", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    cpp: { icon: "C++", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    h: { icon: "H", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    rb: { icon: "RB", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    go: { icon: "GO", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    rs: { icon: "RS", color: "var(--m-ft-code)", bg: "var(--m-ft-code-bg)" },
    exe: { icon: "EXE", color: "var(--m-ft-default)", bg: "var(--m-ft-default-bg)" },
    msi: { icon: "MSI", color: "var(--m-ft-default)", bg: "var(--m-ft-default-bg)" },
    iso: { icon: "ISO", color: "var(--m-ft-default)", bg: "var(--m-ft-default-bg)" },
  };

  var DEFAULT_TYPE = { icon: "FILE", color: "var(--m-ft-default)", bg: "var(--m-ft-default-bg)" };

  // ===== UTILITY FUNCTIONS =====

  function getFileType(ext) {
    if (!ext) return DEFAULT_TYPE;
    return FILE_TYPES[ext.toLowerCase()] || DEFAULT_TYPE;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return "—";
    var units = ["B", "KB", "MB", "GB", "TB"];
    var i = 0;
    var val = bytes;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return (i === 0 ? val : val.toFixed(1)) + " " + units[i];
  }

  function formatDate(dt) {
    if (!dt) return "—";
    try {
      var d = new Date(dt.replace(" ", "T"));
      if (isNaN(d.getTime())) return dt;
      var now = new Date();
      var diffMs = now - d;
      var diffDays = Math.floor(diffMs / 86400000);
      if (diffDays === 0) {
        return "Today, " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return diffDays + " days ago";
      } else {
        return d.toLocaleDateString(undefined, {
          month: "short", day: "numeric",
          year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
      }
    } catch (e) { return dt; }
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") e.className = attrs[k];
        else if (k === "innerHTML") e.innerHTML = attrs[k];
        else if (k === "textContent") e.textContent = attrs[k];
        else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      if (typeof children === "string") { e.innerHTML = children; }
      else if (Array.isArray(children)) {
        children.forEach(function (c) {
          if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        });
      } else { e.appendChild(children); }
    }
    return e;
  }

  function isModernEnabled() {
    var val = localStorage.getItem(STORAGE_KEY);
    return val === null || val === "true";
  }

  function isDarkMode() {
    var val = localStorage.getItem(DARK_KEY);
    if (val !== null) return val === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function getPathSegments() {
    var path = decodeURIComponent(window.location.pathname);
    var root = window.SR || "";
    if (root && path.indexOf(root) === 0) { path = path.slice(root.length); }
    var segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(function (s) { return s.length > 0; });
    return segments;
  }

  function buildBreadcrumbLinks() {
    var segments = getPathSegments();
    var root = window.SR || "";
    var links = [{ name: "My Files", href: root + "/" }];
    var cumul = root;
    for (var i = 0; i < segments.length; i++) {
      cumul += "/" + encodeURIComponent(segments[i]);
      links.push({ name: segments[i], href: cumul + "/" });
    }
    return links;
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function isImageExt(ext) {
    return ["jpg","jpeg","png","gif","webp","svg","bmp"].indexOf((ext||"").toLowerCase()) >= 0;
  }

  // ===== MODERN UI CLASS =====

  function ModernUI() {
    this.data = window.ls0 || (window.CGV && window.CGV.ls0) || { dirs: [], files: [] };
    this.config = window.CGV1 || {};
    this.perms = (window.CGV && window.CGV.perms) || [];
    this.serverRoot = window.SR || "";
    this.serverName = this.config.s_name || "CopyParty";
    this.acct = (window.CGV && window.CGV.acct) || "*";
    this.canWrite = this.perms.indexOf("write") >= 0;
    this.canDelete = this.perms.indexOf("delete") >= 0;
    this.hasZip = this.config.have_zip !== undefined ? this.config.have_zip : true;
    this.sidebarOpen = false;
    this.contextMenu = null;
    this.uploadToast = null;

    // State
    this.sortCol = 'name';
    this.sortDir = 1;
    this.selectedFiles = new Set();
    this.viewMode = localStorage.getItem(VIEW_KEY) || 'list';
    this.searchQuery = getSearchQuery();
  }

  ModernUI.prototype.init = function () {
    document.documentElement.classList.add("modern-active");
    if (isDarkMode()) {
      document.documentElement.classList.add("modern-dark");
    }

    // Apply saved accent color
    this.applyAccentColor(localStorage.getItem(ACCENT_KEY) || "");

    this.buildApp();

    var self = this;
    document.addEventListener("click", function () { self.hideContextMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        self.hideContextMenu();
        self.closeModal();
        self.closeSidebar();
        self.hideSettings();
        self.hideLogin();
      }
    });

    this.initUploadMonitor();
  };

  ModernUI.prototype.initUploadMonitor = function() {
    var self = this;
    setInterval(function() {
      var tbody = document.querySelector('#u2tab tbody');
      if (!tbody || tbody.children.length === 0) {
        if (self.uploadToast) self.uploadToast.classList.remove('visible');
        return;
      }
      var rows = tbody.querySelectorAll('tr');
      var total = rows.length;
      var done = 0;
      var bz = 0;
      var fileStatus = "";
      for (var i = 0; i < rows.length; i++) {
        var txt = rows[i].textContent;
        if (txt.indexOf('ok') >= 0 || txt.indexOf('ng') >= 0 || txt.indexOf('done') >= 0) done++;
        else if (txt.indexOf('hashing') >= 0 || txt.indexOf('uploading') >= 0 || txt.indexOf('bz') >= 0) {
          bz++;
          var parts = rows[i].querySelectorAll('td');
          if (parts.length > 0) fileStatus = "Uploading " + parts[0].textContent.trim();
        }
      }
      if (done === total && total > 0) {
        if (self.uploadToast) self.uploadToast.classList.remove('visible');
        return;
      }
      if (!self.uploadToast) {
        self.uploadToast = el("div", { className: "m-upload-toast" });
        var header = el("div", { className: "m-upload-toast-header" });
        self.utTitle = el("div", { className: "m-upload-toast-title", textContent: "Uploading..." });
        header.appendChild(self.utTitle);
        self.uploadToast.appendChild(header);
        var bar = el("div", { className: "m-upload-progress-bar" });
        self.utFill = el("div", { className: "m-upload-progress-fill", style: "width: 0%" });
        bar.appendChild(self.utFill);
        self.uploadToast.appendChild(bar);
        self.utText = el("div", { className: "m-upload-progress-text", textContent: "Calculating..." });
        self.uploadToast.appendChild(self.utText);
        document.body.appendChild(self.uploadToast);
      }
      self.uploadToast.classList.add('visible');
      var pct = Math.floor((done / total) * 100);
      var progressText = document.querySelector('#u2etat');
      if (progressText && progressText.textContent !== "(no uploads are queued yet)") {
        self.utText.textContent = progressText.textContent;
      } else if (fileStatus) {
        self.utText.textContent = fileStatus;
      } else {
        self.utText.textContent = done + " of " + total + " complete";
      }
      self.utFill.style.width = Math.max(5, pct) + "%";
      self.utTitle.textContent = "Uploading (" + done + "/" + total + ")";
    }, 500);
  };

  // ===== ACCENT COLOR =====
  ModernUI.prototype.applyAccentColor = function(hex) {
    if (!hex) return;
    var root = document.documentElement;
    // Find the preset
    for (var i = 0; i < ACCENT_COLORS.length; i++) {
      if (ACCENT_COLORS[i].hex === hex) {
        root.style.setProperty("--m-primary", ACCENT_COLORS[i].hex);
        root.style.setProperty("--m-primary-hover", ACCENT_COLORS[i].hover);
        root.style.setProperty("--m-primary-light", ACCENT_COLORS[i].light);
        return;
      }
    }
    // Custom hex fallback
    root.style.setProperty("--m-primary", hex);
  };

  // ===== BUILD APP =====
  ModernUI.prototype.buildApp = function () {
    var app = el("div", { id: "modern-app" });

    // Sidebar overlay (mobile)
    this.sidebarOverlay = el("div", { className: "m-sidebar-overlay", onclick: this.closeSidebar.bind(this) });
    app.appendChild(this.sidebarOverlay);

    // Sidebar
    app.appendChild(this.buildSidebar());

    // Main area
    var main = el("div", { className: "m-main" });
    main.appendChild(this.buildHeader());

    var content = el("div", { className: "m-content" });
    content.appendChild(this.buildBreadcrumbs());

    // Search results banner
    if (this.searchQuery) {
      content.appendChild(this.buildSearchBanner());
    }

    // Folders section
    if (this.data.dirs && this.data.dirs.length > 0 && !this.searchQuery) {
      content.appendChild(this.buildFolderSection());
    }

    // Files section
    this.fileSectionWrapper = el("div");
    this.fileSectionWrapper.appendChild(this.buildFileSection());
    content.appendChild(this.fileSectionWrapper);

    main.appendChild(content);
    app.appendChild(main);

    // Batch action bar (FIXED position, outside any overflow:hidden container)
    this.batchActionBar = this.buildBatchActionBar();
    app.appendChild(this.batchActionBar);

    // Toggle button
    app.appendChild(this.buildToggleButton());

    // Modal - create folder
    this.modalOverlay = this.buildModalOverlay();
    app.appendChild(this.modalOverlay);

    // Context menu
    this.contextMenu = el("div", { className: "m-context-menu" });
    app.appendChild(this.contextMenu);

    // Settings panel
    app.appendChild(this.buildSettingsPanel());

    // Login modal
    app.appendChild(this.buildLoginModal());

    // Config Builder modal
    app.appendChild(this.buildConfigModal());

    document.body.appendChild(app);
  };

  // ---- BATCH ACTION BAR (FIXED — separate from file list) ----
  ModernUI.prototype.buildBatchActionBar = function () {
    var self = this;
    var bar = el("div", { className: "m-batch-action-bar", id: "m-batch-bar" });
    this.batchTitle = el("div", { className: "m-batch-title", textContent: "0 items selected" });
    bar.appendChild(this.batchTitle);
    if (this.hasZip) {
      bar.appendChild(el("button", { className: "m-btn-primary", textContent: "Download Selected", onclick: this.downloadSelected.bind(this) }));
    }
    if (this.canDelete) {
      bar.appendChild(el("button", { className: "m-btn-secondary", textContent: "Delete Selected", style: "color:var(--m-error)", onclick: this.deleteSelected.bind(this) }));
    }
    bar.appendChild(el("button", { className: "m-header-btn", innerHTML: SVG.close, onclick: this.clearSelection.bind(this) }));
    return bar;
  };

  // ---- SIDEBAR ----
  ModernUI.prototype.buildSidebar = function () {
    var self = this;
    var sidebar = el("div", { className: "m-sidebar", id: "m-sidebar" });

    // Brand
    var brand = el("div", { className: "m-sidebar-brand" });
    brand.appendChild(el("div", { className: "m-sidebar-logo" }, "CP"));
    var brandText = el("div");
    brandText.appendChild(el("div", { className: "m-sidebar-title", textContent: this.serverName }));
    brandText.appendChild(el("div", { className: "m-sidebar-subtitle", textContent: "File Server" }));
    brand.appendChild(brandText);
    sidebar.appendChild(brand);

    // Upload button (only if write permission)
    if (this.canWrite) {
      var uploadBtn = el("button", { className: "m-upload-btn", onclick: function () { self.triggerUpload(); } },
        [el("span", { innerHTML: SVG.upload }), document.createTextNode(" Upload")]
      );
      sidebar.appendChild(uploadBtn);
    }

    // Navigation
    var nav = el("div", { className: "m-sidebar-nav" });

    var homeLink = el("a", {
      className: "m-nav-item" + (getPathSegments().length === 0 ? " active" : ""),
      href: this.serverRoot + "/",
    });
    homeLink.innerHTML = SVG.home + "<span>Home</span>";
    nav.appendChild(homeLink);

    if (this.canWrite) {
      var mkdirBtn = el("button", { className: "m-nav-item", onclick: function () { self.showCreateFolderModal(); } });
      mkdirBtn.innerHTML = SVG.newFolder + "<span>New Folder</span>";
      nav.appendChild(mkdirBtn);
    }

    nav.appendChild(el("div", { className: "m-nav-divider" }));

    var segments = getPathSegments();
    var cumul = this.serverRoot;
    if (segments.length > 0) {
      for (var i = 0; i < segments.length; i++) {
        cumul += "/" + encodeURIComponent(segments[i]);
        var isLast = i === segments.length - 1;
        var folderLink = el("a", {
          className: "m-nav-item" + (isLast ? " active" : ""),
          href: cumul + "/",
          style: "padding-left: " + (16 + i * 16) + "px",
        });
        folderLink.innerHTML = SVG.folder + "<span>" + escapeHtml(segments[i]) + "</span>";
        nav.appendChild(folderLink);
      }
    }

    if (this.data.dirs && this.data.dirs.length > 0) {
      nav.appendChild(el("div", { className: "m-nav-divider" }));
      var indent = 16 + segments.length * 16;
      var maxShow = Math.min(this.data.dirs.length, 15);
      for (var j = 0; j < maxShow; j++) {
        var dir = this.data.dirs[j];
        var dirName = dir.name.replace(/\/$/, "");
        var dirLink = el("a", {
          className: "m-nav-item",
          href: dir.href,
          style: "padding-left: " + indent + "px",
        });
        dirLink.innerHTML = SVG.folder + "<span>" + escapeHtml(dirName) + "</span>";
        nav.appendChild(dirLink);
      }
      if (this.data.dirs.length > 15) {
        nav.appendChild(el("div", {
          className: "m-nav-item",
          style: "padding-left:" + indent + "px;color:var(--m-text-tertiary);font-size:12px;cursor:default",
          textContent: "+" + (this.data.dirs.length - 15) + " more folders",
        }));
      }
    }

    sidebar.appendChild(nav);
    sidebar.appendChild(this.buildStorageInfo());
    return sidebar;
  };

  ModernUI.prototype.buildStorageInfo = function () {
    var storageDiv = el("div", { className: "m-storage" });
    var duText = "";
    var srvInfo = document.getElementById("srv_info");
    if (srvInfo) duText = srvInfo.textContent || "";

    storageDiv.appendChild(el("div", { className: "m-storage-label" }, [el("span", { textContent: "Storage" })]));
    var bar = el("div", { className: "m-storage-bar" });
    bar.appendChild(el("div", { className: "m-storage-fill", style: "width: 0%" }));
    storageDiv.appendChild(bar);
    storageDiv.appendChild(el("div", {
      className: "m-storage-text",
      textContent: duText ? duText.trim() : "Storage info unavailable",
    }));
    return storageDiv;
  };

  // ---- HEADER ----
  ModernUI.prototype.buildHeader = function () {
    var self = this;
    var header = el("div", { className: "m-header" });

    var hamburger = el("button", {
      className: "m-hamburger",
      onclick: function () { self.toggleSidebar(); },
      innerHTML: SVG.menu,
    });
    header.appendChild(hamburger);

    // Search
    var search = el("div", { className: "m-search" });
    search.innerHTML = '<div class="m-search-icon">' + SVG.search + '</div>' +
      '<input type="text" class="m-search-input" placeholder="Search files and folders..." id="m-search-input" value="' + escapeHtml(this.searchQuery) + '">';
    header.appendChild(search);

    setTimeout(function () {
      var input = document.getElementById("m-search-input");
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") self.doSearch(this.value);
        });
      }
    }, 100);

    // Header actions
    var actions = el("div", { className: "m-header-actions" });

    // View toggle
    var viewToggle = el("div", { className: "m-view-toggle" });
    var listBtn = el("button", {
      className: "m-view-toggle-btn" + (this.viewMode === "list" ? " active" : ""),
      "data-tooltip": "List view",
      innerHTML: SVG.listView,
      onclick: function () { self.setViewMode("list"); },
    });
    var gridBtn = el("button", {
      className: "m-view-toggle-btn" + (this.viewMode === "grid" ? " active" : ""),
      "data-tooltip": "Grid view",
      innerHTML: SVG.gridView,
      onclick: function () { self.setViewMode("grid"); },
    });
    viewToggle.appendChild(listBtn);
    viewToggle.appendChild(gridBtn);
    actions.appendChild(viewToggle);

    // Dark mode toggle
    var darkBtn = el("button", {
      className: "m-header-btn",
      "data-tooltip": "Toggle dark mode",
      onclick: function () { self.toggleDarkMode(); },
      innerHTML: isDarkMode() ? SVG.lightMode : SVG.darkMode,
      id: "m-dark-toggle",
    });
    actions.appendChild(darkBtn);

    // Help Button
    var helpBtn = el("button", {
      className: "m-header-btn",
      "data-tooltip": "Help & Cheatsheet",
      onclick: function () { window.open("/FEATURES_AND_CHEATSHEET.md", "_blank"); },
      innerHTML: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    });
    actions.appendChild(helpBtn);

    // Settings button - opens settings panel
    var settingsBtn = el("button", {
      className: "m-header-btn",
      "data-tooltip": "Settings",
      onclick: function () { self.showSettings(); },
      innerHTML: SVG.settings,
    });
    actions.appendChild(settingsBtn);

    // User avatar - opens login modal if not logged in
    var userChar = this.acct === "*" ? "?" : this.acct.charAt(0).toUpperCase();
    var avatar = el("div", {
      className: "m-user-avatar",
      "data-tooltip": this.acct === "*" ? "Click to log in" : "Logged in as " + this.acct,
      textContent: userChar,
      onclick: function () {
        if (self.acct === "*") {
          self.showLogin();
        } else {
          // Show logout option
          self.showSettings();
        }
      },
    });
    actions.appendChild(avatar);

    // Permissions badge
    if (this.canWrite) {
      actions.appendChild(el("span", { className: "m-badge m-badge-rw", textContent: "R/W" }));
    } else {
      actions.appendChild(el("span", { className: "m-badge m-badge-ro", textContent: "Read" }));
    }

    header.appendChild(actions);
    return header;
  };

  // ---- SEARCH ----
  ModernUI.prototype.doSearch = function (query) {
    if (!query) {
      // Clear search - go to current path without query
      window.location.href = window.location.pathname;
      return;
    }
    // Navigate to ?q=query for native CopyParty search
    window.location.href = window.location.pathname + "?q=" + encodeURIComponent(query);
  };

  ModernUI.prototype.buildSearchBanner = function () {
    var self = this;
    var banner = el("div", { className: "m-search-results-banner" });
    banner.appendChild(el("div", { innerHTML: SVG.search, style: "display:flex" }));
    var text = el("div", { className: "m-search-results-text" });
    text.innerHTML = 'Search results for <strong>"' + escapeHtml(this.searchQuery) + '"</strong> — ' +
      this.data.files.length + ' file(s) found';
    banner.appendChild(text);
    var clearBtn = el("button", {
      className: "m-search-clear-btn",
      textContent: "Clear Search",
      onclick: function () { window.location.href = window.location.pathname; },
    });
    banner.appendChild(clearBtn);
    return banner;
  };

  // ---- VIEW MODE ----
  ModernUI.prototype.setViewMode = function (mode) {
    this.viewMode = mode;
    localStorage.setItem(VIEW_KEY, mode);
    this.fileSectionWrapper.innerHTML = "";
    this.fileSectionWrapper.appendChild(this.buildFileSection());
    // Update toggle buttons
    var btns = document.querySelectorAll(".m-view-toggle-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove("active");
    }
    if (mode === "list") {
      btns[0] && btns[0].classList.add("active");
    } else {
      btns[1] && btns[1].classList.add("active");
    }
  };

  // ---- BREADCRUMBS ----
  ModernUI.prototype.buildBreadcrumbs = function () {
    var links = buildBreadcrumbLinks();
    var ul = el("ul", { className: "m-breadcrumbs" });
    for (var i = 0; i < links.length; i++) {
      var li = el("li");
      if (i > 0) {
        li.appendChild(el("span", { className: "m-bc-sep", innerHTML: SVG.chevronRight }));
      }
      if (i === links.length - 1) {
        li.appendChild(el("span", { className: "m-bc-current", textContent: links[i].name }));
      } else {
        li.appendChild(el("a", { href: links[i].href, textContent: links[i].name }));
      }
      ul.appendChild(li);
    }
    return ul;
  };

  // ---- FOLDER CARDS ----
  ModernUI.prototype.buildFolderSection = function () {
    var section = el("div");
    var header = el("div", { className: "m-section-header" });
    header.appendChild(el("h2", { className: "m-section-title", textContent: "Folders (" + this.data.dirs.length + ")" }));
    section.appendChild(header);

    var grid = el("div", { className: "m-folders-grid" });
    for (var i = 0; i < this.data.dirs.length; i++) {
      var dir = this.data.dirs[i];
      var dirName = dir.name.replace(/\/$/, "");
      var card = el("a", { className: "m-folder-card", href: dir.href });
      card.appendChild(el("div", {
        className: "m-folder-icon",
        style: "color: var(--m-primary); background: var(--m-primary-light);",
        innerHTML: SVG.folder,
      }));
      var info = el("div", { className: "m-folder-info" });
      info.appendChild(el("div", { className: "m-folder-name", textContent: dirName }));
      info.appendChild(el("div", { className: "m-folder-meta", textContent: formatDate(dir.dt) }));
      card.appendChild(info);
      grid.appendChild(card);
    }
    section.appendChild(grid);
    return section;
  };

  // ---- SORTING & SELECTION ----
  ModernUI.prototype.sortFiles = function (col) {
    if (this.sortCol === col) { this.sortDir *= -1; }
    else { this.sortCol = col; this.sortDir = 1; }
    var dir = this.sortDir;
    this.data.files.sort(function (a, b) {
      var va, vb;
      if (col === "name") { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (col === "size") { va = a.sz; vb = b.sz; }
      else if (col === "type") { va = (a.ext || "").toLowerCase(); vb = (b.ext || "").toLowerCase(); }
      else if (col === "date") { va = a.dt; vb = b.dt; }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    this.fileSectionWrapper.innerHTML = "";
    this.fileSectionWrapper.appendChild(this.buildFileSection());
  };

  ModernUI.prototype.toggleSelection = function (fileHref) {
    if (this.selectedFiles.has(fileHref)) { this.selectedFiles.delete(fileHref); }
    else { this.selectedFiles.add(fileHref); }
    this.updateBatchBar();
  };

  ModernUI.prototype.selectAll = function () {
    var allSelected = this.selectedFiles.size === this.data.files.length;
    this.selectedFiles.clear();
    if (!allSelected) {
      for (var i = 0; i < this.data.files.length; i++) {
        this.selectedFiles.add(this.data.files[i].href);
      }
    }
    this.fileSectionWrapper.innerHTML = "";
    this.fileSectionWrapper.appendChild(this.buildFileSection());
    this.updateBatchBar();
  };

  ModernUI.prototype.clearSelection = function () {
    this.selectedFiles.clear();
    this.fileSectionWrapper.innerHTML = "";
    this.fileSectionWrapper.appendChild(this.buildFileSection());
    this.updateBatchBar();
  };

  ModernUI.prototype.updateBatchBar = function () {
    var bar = document.getElementById("m-batch-bar");
    if (!bar) return;
    if (this.selectedFiles.size > 0) {
      this.batchTitle.textContent = this.selectedFiles.size + " item" + (this.selectedFiles.size > 1 ? "s" : "") + " selected";
      bar.classList.add("visible");
    } else {
      bar.classList.remove("visible");
    }
    // Update checkboxes
    var boxes = document.querySelectorAll(".m-checkbox-cell[data-href]");
    for (var i = 0; i < boxes.length; i++) {
      var href = boxes[i].getAttribute("data-href");
      var cb = boxes[i].querySelector(".m-checkbox");
      if (cb) {
        if (this.selectedFiles.has(href)) cb.classList.add("checked");
        else cb.classList.remove("checked");
      }
    }
    var selectAllBox = document.getElementById("m-select-all-box");
    if (selectAllBox) {
      if (this.selectedFiles.size > 0 && this.selectedFiles.size === this.data.files.length) {
        selectAllBox.classList.add("checked");
      } else {
        selectAllBox.classList.remove("checked");
      }
    }
  };

  ModernUI.prototype.downloadSelected = function () {
    if (this.selectedFiles.size === 0) return;
    var form = document.createElement("form");
    form.method = "POST";
    form.action = window.location.pathname + "?tar";
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "files";
    var urls = Array.from(this.selectedFiles).map(function(u) {
      var pts = u.replace(/\/$/, '').split('/');
      return decodeURIComponent(pts[pts.length - 1]);
    });
    input.value = urls.join("\n");
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    this.clearSelection();
  };

  ModernUI.prototype.deleteSelected = function () {
    if (this.selectedFiles.size === 0) return;
    if (!confirm("Are you sure you want to delete " + this.selectedFiles.size + " item(s)?")) return;
    var urls = Array.from(this.selectedFiles);
    var done = 0;
    var nextDelete = function() {
      if (done >= urls.length) { window.location.reload(); return; }
      fetch(urls[done] + "?delete", { method: "POST" }).then(function() { done++; nextDelete(); }).catch(function() { done++; nextDelete(); });
    };
    nextDelete();
  };

  // ---- FILE LIST ----
  ModernUI.prototype.buildFileSection = function () {
    var self = this;
    var sectionOuter = el("div");

    var header = el("div", { className: "m-section-header" });
    header.appendChild(el("h2", {
      className: "m-section-title",
      textContent: "Files (" + this.data.files.length + ")",
    }));

    // Action buttons row
    var actionsRow = el("div", { style: "display:flex;gap:8px;align-items:center" });

    if (this.hasZip && this.data.files.length > 0) {
      var zipBtn = el("button", {
        className: "m-section-action",
        onclick: function () { window.location.href = window.location.pathname + "?zip"; },
      });
      zipBtn.innerHTML = SVG.download + " Download as ZIP";
      actionsRow.appendChild(zipBtn);
    }

    header.appendChild(actionsRow);
    sectionOuter.appendChild(header);

    if (this.data.files.length === 0 && (!this.data.dirs || this.data.dirs.length === 0)) {
      var empty = el("div", { className: "m-empty-state" });
      empty.appendChild(el("div", {
        className: "m-empty-icon",
        innerHTML: SVG.file,
        style: "width:80px;height:80px;color:var(--m-text-tertiary);opacity:0.3",
      }));
      empty.appendChild(el("div", { className: "m-empty-title", textContent: "No files here" }));
      empty.appendChild(el("div", {
        className: "m-empty-text",
        textContent: this.canWrite ? "Drop files here or click Upload to add files" : "No files in this directory",
      }));
      sectionOuter.appendChild(empty);
      return sectionOuter;
    }

    if (this.data.files.length === 0) return sectionOuter;

    // Choose view mode
    if (this.viewMode === "grid") {
      sectionOuter.appendChild(this.buildFileGrid());
    } else {
      sectionOuter.appendChild(this.buildFileList());
    }

    return sectionOuter;
  };

  // ---- LIST VIEW ----
  ModernUI.prototype.buildFileList = function () {
    var self = this;
    var table = el("div", { className: "m-filelist" });

    // Header
    var thead = el("div", { className: "m-filelist-header" });
    var selectAllCell = el("div", { className: "m-checkbox-cell", onclick: this.selectAll.bind(this) });
    var allChecked = this.selectedFiles.size > 0 && this.selectedFiles.size === this.data.files.length;
    selectAllCell.appendChild(el("div", { id: "m-select-all-box", className: "m-checkbox" + (allChecked ? " checked" : ""), innerHTML: SVG.check }));
    thead.appendChild(selectAllCell);

    var buildHeaderCol = function(name, col) {
      var colEl = el("div", { onclick: function() { self.sortFiles(col); } });
      colEl.textContent = name;
      if (self.sortCol === col) {
        var ind = el("span", { className: "m-sort-indicator active", innerHTML: self.sortDir > 0 ? SVG.arrowDown : SVG.arrowUp });
        colEl.appendChild(ind);
      }
      return colEl;
    };

    thead.appendChild(buildHeaderCol("Name", "name"));
    thead.appendChild(buildHeaderCol("Size", "size"));
    thead.appendChild(buildHeaderCol("Type", "type"));
    thead.appendChild(buildHeaderCol("Modified", "date"));
    thead.appendChild(el("div", { textContent: "" }));
    table.appendChild(thead);

    for (var i = 0; i < this.data.files.length; i++) {
      table.appendChild(this.buildFileRow(this.data.files[i]));
    }

    return table;
  };

  // ---- GRID VIEW ----
  ModernUI.prototype.buildFileGrid = function () {
    var self = this;
    var grid = el("div", { className: "m-file-grid" });

    for (var i = 0; i < this.data.files.length; i++) {
      var file = this.data.files[i];
      var ft = getFileType(file.ext);
      var card = el("div", { className: "m-file-card", tabIndex: "0", draggable: "true" });
      file.el = card;
      self.bindDragDrop(card, file);

      // Thumbnail area
      var thumb = el("div", { className: "m-file-card-thumb" });
      if (isImageExt(file.ext)) {
        thumb.appendChild(el("img", { src: file.href + "?th=200", alt: file.name, loading: "lazy" }));
      } else {
        thumb.appendChild(el("div", {
          className: "m-file-card-icon",
          style: "color:" + ft.color + ";background:" + ft.bg,
          textContent: ft.icon,
        }));
      }
      card.appendChild(thumb);

      // Info area
      var info = el("div", { className: "m-file-card-info" });
      info.appendChild(el("div", { className: "m-file-card-name", textContent: file.name, title: file.name }));
      var meta = el("div", { className: "m-file-card-meta" });
      meta.appendChild(el("span", { textContent: formatBytes(file.sz) }));
      meta.appendChild(el("span", { textContent: formatDate(file.dt) }));
      info.appendChild(meta);
      card.appendChild(info);

      // Click handler
      (function(f) {
        var actionFn = function(e) {
          if (e.type === "keydown" && e.key === " ") { e.preventDefault(); self.toggleSelection(f.href); return; }
          if (e.type === "keydown" && e.key !== "Enter") return;
          var ext = (f.ext || "").toLowerCase();
          if (isImageExt(ext)) {
            self.showPreview(f, "image");
          } else if (["txt","md","csv","js","py","html","css","json","xml","log"].indexOf(ext) >= 0) {
            self.showPreview(f, "text");
          } else if (["mp4","webm","mkv","mp3","wav","ogg","flac"].indexOf(ext) >= 0) {
            self.showPreview(f, "media");
          } else {
            window.location.href = f.href;
          }
        };
        card.addEventListener("click", actionFn);
        card.addEventListener("keydown", actionFn);
        card.addEventListener("contextmenu", function (e) {
          e.preventDefault();
          self.showFileContextMenu(e, f);
        });
      })(file);

      grid.appendChild(card);
    }
    return grid;
  };

  ModernUI.prototype.bindDragDrop = function(element, file) {
    var self = this;
    var isFolder = !file.ext || file.href.endsWith('/');
    
    element.addEventListener("dragstart", function(e) {
      draggedFile = file;
      e.dataTransfer.setData("text/plain", file.name);
      e.dataTransfer.effectAllowed = "move";
      setTimeout(function() { element.style.opacity = '0.4'; }, 0);
    });

    element.addEventListener("dragend", function(e) {
      element.style.opacity = '';
      draggedFile = null;
    });

    if (isFolder) {
      element.addEventListener("dragover", function(e) {
        if (draggedFile && draggedFile !== file && draggedFile.href !== file.href) {
          e.preventDefault(); 
          element.classList.add("m-drag-over");
        }
      });
      element.addEventListener("dragleave", function(e) {
        element.classList.remove("m-drag-over");
      });
      element.addEventListener("drop", function(e) {
        e.preventDefault();
        element.classList.remove("m-drag-over");
        if (draggedFile && draggedFile !== file && draggedFile.href !== file.href) {
          var destPath = file.name.replace(/\/$/,'') + "/" + draggedFile.name; 
          self.moveFile(draggedFile, destPath);
        }
      });
    }
  };

  ModernUI.prototype.buildFileRow = function (file) {
    var self = this;
    var ft = getFileType(file.ext);
    var row = el("div", { className: "m-file-row", tabIndex: "0", draggable: "true" });
    file.el = row;
    self.bindDragDrop(row, file);

    row.addEventListener("keydown", function(e) {
      if (e.key === " ") { e.preventDefault(); self.toggleSelection(file.href); }
      else if (e.key === "Enter") {
        var a = row.querySelector(".m-file-name-link");
        if (a) a.click();
      }
    });

    // Checkbox
    var cbCell = el("div", { className: "m-checkbox-cell", "data-href": file.href });
    var isChecked = self.selectedFiles.has(file.href);
    cbCell.appendChild(el("div", { className: "m-checkbox" + (isChecked ? " checked" : ""), innerHTML: SVG.check }));
    cbCell.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); self.toggleSelection(file.href); });
    row.appendChild(cbCell);

    // Name cell
    var nameCell = el("div", { className: "m-file-name-cell" });
    nameCell.appendChild(el("div", {
      className: "m-file-icon",
      style: "color:" + ft.color + ";background:" + ft.bg,
      textContent: ft.icon,
    }));

    var nameText = el("div", { className: "m-file-name-text" });
    var nameLink = el("a", { className: "m-file-name m-file-name-link", href: file.href, textContent: file.name });

    var ext = (file.ext || "").toLowerCase();
    var isImage = isImageExt(ext);
    var isText = ["txt","md","csv","js","py","html","css","json","xml","log"].indexOf(ext) >= 0;
    var isMedia = ["mp4","webm","mkv","mp3","wav","ogg","flac"].indexOf(ext) >= 0;

    if (isImage || isText || isMedia) {
      nameLink.addEventListener("click", function(e) {
        e.preventDefault();
        self.showPreview(file, isImage ? "image" : isText ? "text" : "media");
      });
    }

    nameText.appendChild(nameLink);
    nameCell.appendChild(nameText);
    row.appendChild(nameCell);

    row.appendChild(el("div", { className: "m-file-size", textContent: formatBytes(file.sz) }));
    row.appendChild(el("div", { className: "m-file-ext", textContent: file.ext ? file.ext.toUpperCase() : "—" }));
    row.appendChild(el("div", { className: "m-file-date", textContent: formatDate(file.dt) }));

    // Actions
    var actions = el("div", { className: "m-file-actions" });
    actions.appendChild(el("button", {
      className: "m-file-action-btn",
      title: "More actions",
      innerHTML: SVG.moreVert,
      onclick: function (e) { e.preventDefault(); e.stopPropagation(); self.showFileContextMenu(e, file); },
    }));
    row.appendChild(actions);

    row.addEventListener("contextmenu", function (e) { e.preventDefault(); self.showFileContextMenu(e, file); });
    return row;
  };

  // ---- PREVIEW ----
  ModernUI.prototype.showPreview = function(file, type) {
    if (!this.previewModal) {
      this.previewModal = el("div", { className: "m-preview-modal" });
      this.previewClose = el("button", {
        className: "m-preview-close", innerHTML: SVG.close,
        onclick: function() { this.previewModal.classList.remove("active"); }.bind(this),
      });
      this.previewModal.appendChild(this.previewClose);
      this.previewContentBox = el("div", { className: "m-preview-content-box" });
      this.previewModal.appendChild(this.previewContentBox);
      document.body.appendChild(this.previewModal);
    }
    this.previewContentBox.innerHTML = "";
    this.previewModal.classList.add("active");

    if (type === "image") {
      this.previewContentBox.appendChild(el("img", { src: file.href + "?raw", className: "m-preview-img" }));
    } else if (type === "text") {
      var loading = el("div", { textContent: "Loading...", style: "color:white;padding:24px;font-family:monospace" });
      this.previewContentBox.appendChild(loading);
      var self = this;
      fetch(file.href + "?raw").then(function(r){return r.text()}).then(function(txt) {
        self.previewContentBox.innerHTML = "";
        
        var isMd = file.name.toLowerCase().endsWith(".md");
        if (isMd && self.canWrite) {
          // SPLIT PANE MARKDOWN EDITOR
          self.previewContentBox.style.display = "flex";
          self.previewContentBox.style.flexDirection = "column";
          
          var toolbar = el("div", { style: "padding:12px;background:var(--m-bg);border-bottom:1px solid var(--m-border);display:flex;justify-content:space-between;align-items:center" });
          toolbar.appendChild(el("div", { textContent: "Markdown Split-Pane Editor", style: "font-weight:600;color:var(--m-primary)" }));
          var saveBtn = el("button", { className: "m-btn-primary", textContent: "Save Changes" });
          toolbar.appendChild(saveBtn);
          self.previewContentBox.appendChild(toolbar);

          var split = el("div", { style: "display:flex;flex:1;overflow:hidden" });
          
          var area = el("textarea", { spellcheck: "false", style: "flex:1;padding:16px;background:var(--m-bg);color:var(--m-text);border:none;border-right:1px solid var(--m-border);font-family:monospace;resize:none;font-size:14px;line-height:1.5" });
          area.value = txt;
          
          var renderbox = el("div", { style: "flex:1;padding:16px 24px;overflow-y:auto;background:var(--m-bg);color:var(--m-text);line-height:1.6;font-family:sans-serif" });
          var renderMd = function() {
            var raw = area.value;
            var html = raw.replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/^### (.*$)/gim, '<h3 style="margin-top:16px;margin-bottom:8px;font-weight:600">$1</h3>')
              .replace(/^## (.*$)/gim, '<h2 style="margin-top:24px;margin-bottom:12px;font-weight:600;border-bottom:1px solid var(--m-border)">$1</h2>')
              .replace(/^# (.*$)/gim, '<h1 style="margin-top:24px;margin-bottom:16px;font-weight:700;border-bottom:1px solid var(--m-border);padding-bottom:8px">$1</h1>')
              .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
              .replace(/\*(.*?)\*/gim, '<i>$1</i>')
              .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' style='max-width:100%;border-radius:8px'>")
              .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' style='color:var(--m-primary)'>$1</a>")
              .replace(/`(.*?)`/gim, "<code style='background:var(--m-bg-hover);padding:2px 4px;border-radius:4px;font-family:monospace'>$1</code>")
              .replace(/\n\n/gim, '</p><p style="margin-bottom:16px">').replace(/\n/gim, '<br>');
            renderbox.innerHTML = '<p>' + html + '</p>';
          };
          renderMd();
          area.addEventListener("input", renderMd);
          
          saveBtn.onclick = function() {
            saveBtn.textContent = "Saving...";
            // Upload to same directory
            var pdir = file.href.split('/').slice(0, -1).join('/') + '/';
            var blob = new Blob([area.value], { type: "text/plain" });
            var fd = new FormData();
            fd.append("act", "bput");
            fd.append("f", blob, file.name);
            
            var xhr = new XMLHttpRequest();
            xhr.open("POST", pdir);
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 400) { 
                saveBtn.textContent = "Saved!"; 
                setTimeout(function(){saveBtn.textContent="Save Changes";}, 2000); 
              } else { 
                alert("Error saving: " + xhr.statusText); 
                saveBtn.textContent = "Save Changes"; 
              }
            };
            xhr.send(fd);
          };

          split.appendChild(area);
          split.appendChild(renderbox);
          self.previewContentBox.appendChild(split);
        } else {
          self.previewContentBox.style.display = "block";
          self.previewContentBox.appendChild(el("pre", { className: "m-preview-text", textContent: txt }));
        }
      }).catch(function() {
        self.previewContentBox.innerHTML = "<div style='color:white;padding:24px'>Failed to load file</div>";
      });
    } else if (type === "media") {
      var isAudio = ["mp3","wav","ogg","flac","m4a"].indexOf((file.ext||"").toLowerCase()) >= 0;
      if (isAudio) {
        this.previewModal.classList.remove("active");
        this.playAudio(file);
        return;
      }
      var media = el("video", { src: file.href + "?raw", controls: "true", className: "m-preview-media", autoplay: "true" });
      this.previewContentBox.appendChild(media);
      this.previewClose.onclick = function() {
        media.pause(); media.src = "";
        this.previewModal.classList.remove("active");
      }.bind(this);
    }
  };

  // ---- AUDIO PLAYER ----
  ModernUI.prototype.buildAudioDock = function() {
    if (this.audioDock) return;
    var self = this;
    this.audioDock = el("div", { className: "m-audio-dock" });
    
    // Info
    this.audioInfo = el("div", { className: "m-audio-info" });
    this.audioTitle = el("div", { className: "m-audio-title", textContent: "Loading..." });
    this.audioArtist = el("div", { className: "m-audio-artist", textContent: "CopyParty Audio" });
    this.audioInfo.appendChild(this.audioTitle);
    this.audioInfo.appendChild(this.audioArtist);
    this.audioDock.appendChild(this.audioInfo);

    // Controls
    var ctrls = el("div", { className: "m-audio-controls" });
    var playBtn = el("button", { className: "m-audio-btn play-pause", innerHTML: SVG.play });
    ctrls.appendChild(playBtn);
    this.audioDock.appendChild(ctrls);

    // Progress
    var prog = el("div", { className: "m-audio-progress-container" });
    this.audioTimeCur = el("div", { className: "m-audio-time", textContent: "0:00" });
    this.audioScrub = el("div", { className: "m-audio-scrubber" });
    this.audioScrubFill = el("div", { className: "m-audio-scrub-fill" });
    this.audioScrub.appendChild(this.audioScrubFill);
    this.audioTimeTot = el("div", { className: "m-audio-time", textContent: "0:00" });
    prog.appendChild(this.audioTimeCur);
    prog.appendChild(this.audioScrub);
    prog.appendChild(this.audioTimeTot);
    this.audioDock.appendChild(prog);

    // Close
    var closeBtn = el("button", { className: "m-audio-close", innerHTML: SVG.close });
    this.audioDock.appendChild(closeBtn);

    // Audio Element inside (hidden)
    this.audioEl = el("audio", { src: "" });
    this.audioDock.appendChild(this.audioEl);

    document.body.appendChild(this.audioDock);

    // Events
    playBtn.onclick = function() {
      if (self.audioEl.paused) { self.audioEl.play(); playBtn.innerHTML = SVG.pause; }
      else { self.audioEl.pause(); playBtn.innerHTML = SVG.play; }
    };
    closeBtn.onclick = function() {
      self.audioEl.pause();
      self.audioDock.classList.remove("active");
    };
    this.audioEl.addEventListener('timeupdate', function() {
      var pct = (self.audioEl.currentTime / self.audioEl.duration) * 100 || 0;
      self.audioScrubFill.style.width = pct + "%";
      self.audioTimeCur.textContent = self.formatTime(self.audioEl.currentTime);
      if (self.audioEl.duration) self.audioTimeTot.textContent = self.formatTime(self.audioEl.duration);
    });
    this.audioEl.addEventListener('ended', function() {
      playBtn.innerHTML = SVG.play;
    });
    this.audioScrub.onclick = function(e) {
      if (!self.audioEl.duration) return;
      var rect = self.audioScrub.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      self.audioEl.currentTime = Math.max(0, Math.min(1, pct)) * self.audioEl.duration;
    };
  };

  ModernUI.prototype.formatTime = function(sec) {
    if (isNaN(sec)) return "0:00";
    var min = Math.floor(sec / 60);
    var sc = Math.floor(sec % 60);
    return min + ":" + (sc < 10 ? "0" : "") + sc;
  };

  ModernUI.prototype.playAudio = function(file) {
    this.buildAudioDock();
    this.audioTitle.textContent = file.name;
    this.audioEl.src = file.href + "?raw";
    this.audioEl.play();
    this.audioDock.querySelector('.play-pause').innerHTML = SVG.pause;
    this.audioDock.classList.add("active");
  };

  // ---- CONTEXT MENU ----
  ModernUI.prototype.showFileContextMenu = function (e, file) {
    var self = this;
    var menu = this.contextMenu;
    menu.innerHTML = "";

    var dlItem = el("button", { className: "m-ctx-item", onclick: function () { window.location.href = file.href + "?raw"; self.hideContextMenu(); } });
    dlItem.innerHTML = SVG.download + "<span>Download</span>";
    menu.appendChild(dlItem);

    var openItem = el("button", { className: "m-ctx-item", onclick: function () { window.open(file.href, "_blank"); self.hideContextMenu(); } });
    openItem.innerHTML = SVG.file + "<span>Open in new tab</span>";
    menu.appendChild(openItem);

    var copyItem = el("button", {
      className: "m-ctx-item",
      onclick: function () {
        var link = window.location.origin + file.href;
        navigator.clipboard.writeText(link).then(function() { alert('Link copied!'); });
        self.hideContextMenu();
      },
    });
    copyItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span>Copy Link</span>';
    menu.appendChild(copyItem);

    var shareItem = el("button", { className: "m-ctx-item", onclick: function() { self.showShareModal(file); self.hideContextMenu(); }});
    shareItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span>Share Menu</span>';
    menu.appendChild(shareItem);

    if (this.canDelete) {
      // Rename & Move
      var renItem = el("button", {
        className: "m-ctx-item",
        onclick: function () { self.showRenameModal(file); self.hideContextMenu(); },
      });
      renItem.innerHTML = SVG.rename + "<span>Rename</span>";
      menu.appendChild(renItem);

      var moveItem = el("button", {
        className: "m-ctx-item",
        onclick: function () { self.showMoveModal(file); self.hideContextMenu(); },
      });
      moveItem.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/></svg><span>Move</span>';
      menu.appendChild(moveItem);

      menu.appendChild(el("div", { className: "m-ctx-divider" }));
      var delItem = el("button", {
        className: "m-ctx-item danger",
        onclick: function () { self.deleteFile(file); self.hideContextMenu(); },
      });
      delItem.innerHTML = SVG.trash + "<span>Delete</span>";
      menu.appendChild(delItem);
    }

    menu.style.left = e.clientX + "px";
    menu.style.top = e.clientY + "px";
    menu.classList.add("active");

    setTimeout(function () {
      var rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + "px";
      if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + "px";
    }, 10);
  };

  ModernUI.prototype.hideContextMenu = function () {
    if (this.contextMenu) this.contextMenu.classList.remove("active");
  };

  // ---- TOGGLE BUTTON ----
  ModernUI.prototype.buildToggleButton = function () {
    var btn = el("button", { className: "m-toggle-ui", onclick: this.switchToClassic.bind(this) });
    btn.innerHTML = SVG.switchUI + " Classic UI";
    return btn;
  };

  // ---- MODAL ----
  ModernUI.prototype.buildModalOverlay = function () {
    var self = this;
    var overlay = el("div", { className: "m-modal-overlay", id: "m-modal" });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) self.closeModal(); });

    var modal = el("div", { className: "m-modal" });
    modal.appendChild(el("h3", { className: "m-modal-title", id: "m-modal-title" }));
    modal.appendChild(el("input", { className: "m-modal-input", id: "m-modal-input", type: "text", placeholder: "Enter name..." }));
    var actions = el("div", { className: "m-modal-actions" });
    actions.appendChild(el("button", { className: "m-btn-secondary", textContent: "Cancel", onclick: function () { self.closeModal(); } }));
    actions.appendChild(el("button", { className: "m-btn-primary", id: "m-modal-confirm", textContent: "Create", onclick: function () { self.confirmModal(); } }));
    modal.appendChild(actions);
    overlay.appendChild(modal);
    return overlay;
  };

  ModernUI.prototype.showCreateFolderModal = function () {
    this.currentModalAction = "mkdir";
    document.getElementById("m-modal-title").textContent = "Create new folder";
    var input = document.getElementById("m-modal-input");
    input.value = "";
    input.placeholder = "Folder name";
    document.getElementById("m-modal-confirm").textContent = "Create";
    document.getElementById("m-modal").classList.add("active");
    setTimeout(function () { input.focus(); }, 100);
    var self = this;
    input.onkeydown = function (e) { if (e.key === "Enter") self.confirmModal(); };
  };

  ModernUI.prototype.closeModal = function () {
    var modal = document.getElementById("m-modal");
    if (modal) modal.classList.remove("active");
    this.currentModalAction = null;
  };

  ModernUI.prototype.showRenameModal = function (file) {
    this.currentModalAction = "rename";
    this.currentModalTarget = file;
    document.getElementById("m-modal-title").textContent = "Rename";
    var input = document.getElementById("m-modal-input");
    input.value = file.name;
    input.placeholder = "New name";
    document.getElementById("m-modal-confirm").textContent = "Rename";
    document.getElementById("m-modal").classList.add("active");
    setTimeout(function () { input.focus(); input.select(); }, 100);
    var self = this;
    input.onkeydown = function (e) { if (e.key === "Enter") self.confirmModal(); };
  };

  ModernUI.prototype.showMoveModal = function (file) {
    this.currentModalAction = "move";
    this.currentModalTarget = file;
    document.getElementById("m-modal-title").textContent = "Move file to...";
    var input = document.getElementById("m-modal-input");
    input.value = "";
    input.placeholder = "Folder path (e.g. '../photos')";
    document.getElementById("m-modal-confirm").textContent = "Move";
    document.getElementById("m-modal").classList.add("active");
    setTimeout(function () { input.focus(); }, 100);
    var self = this;
    input.onkeydown = function (e) { if (e.key === "Enter") self.confirmModal(); };
  };

  ModernUI.prototype.showShareModal = function(file) {
    var self = this;
    if (!this.shareOverlay) {
      this.shareOverlay = el("div", { className: "m-modal-overlay" });
      this.shareOverlay.addEventListener("click", function (e) {
        if (e.target === self.shareOverlay) self.shareOverlay.classList.remove("active");
      });
      document.body.appendChild(this.shareOverlay);
    }
    
    var modal = el("div", { className: "m-modal", style:"text-align:center" });
    modal.appendChild(el("h3", { className: "m-modal-title", textContent: "Share File" }));
    
    var linkVal = window.location.origin + file.href;
    
    var qr = el("img", { src: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(linkVal), style:"margin: 20px auto; border-radius: 8px; border: 1px solid var(--m-border);" });
    modal.appendChild(qr);
    
    var inputWrap = el("div", { style:"display:flex;gap:8px;margin-bottom:16px;" });
    var input = el("input", { type:"text", value: linkVal, readOnly: true, style:"flex:1;padding:8px;border:1px solid var(--m-border);border-radius:4px;background:var(--m-bg);color:var(--m-text);" });
    var copyBtn = el("button", { className: "m-btn-primary", textContent: "Copy" });
    copyBtn.onclick = function() {
      input.select(); document.execCommand("copy");
      copyBtn.textContent = "Copied!";
      setTimeout(function(){ copyBtn.textContent="Copy"; }, 2000);
    };
    inputWrap.appendChild(input); inputWrap.appendChild(copyBtn);
    modal.appendChild(inputWrap);
    
    var closeBtn = el("button", { className: "m-btn-secondary", textContent: "Close", onclick: function() { self.shareOverlay.classList.remove("active"); } });
    modal.appendChild(closeBtn);
    
    this.shareOverlay.innerHTML = "";
    this.shareOverlay.appendChild(modal);
    this.shareOverlay.classList.add("active");
  };

  ModernUI.prototype.confirmModal = function () {
    var val = document.getElementById("m-modal-input").value.trim();
    if (val) {
      if (this.currentModalAction === "mkdir") {
        this.createFolder(val);
      } else if (this.currentModalAction === "rename" && this.currentModalTarget) {
        this.renameFile(this.currentModalTarget, val);
      } else if (this.currentModalAction === "move" && this.currentModalTarget) {
        this.moveFile(this.currentModalTarget, val);
      }
    }
    this.closeModal();
  };

  // ===== SETTINGS PANEL =====
  ModernUI.prototype.buildSettingsPanel = function () {
    var self = this;
    var container = el("div");

    // Overlay
    this.settingsOverlay = el("div", { className: "m-settings-overlay", onclick: function () { self.hideSettings(); } });
    container.appendChild(this.settingsOverlay);

    // Panel
    this.settingsPanel = el("div", { className: "m-settings-panel" });

    // Header
    var header = el("div", { className: "m-settings-header" });
    header.appendChild(el("h2", { textContent: "Settings" }));
    header.appendChild(el("button", { className: "m-settings-close", innerHTML: SVG.close, onclick: function () { self.hideSettings(); } }));
    this.settingsPanel.appendChild(header);

    // Body
    var body = el("div", { className: "m-settings-body" });

    // === Appearance Section ===
    var appearSec = el("div", { className: "m-settings-section" });
    appearSec.appendChild(el("div", { className: "m-settings-section-title", textContent: "Appearance" }));

    // Dark mode
    var darkRow = el("div", { className: "m-setting-row" });
    var darkInfo = el("div");
    darkInfo.appendChild(el("div", { className: "m-setting-label", textContent: "Dark Mode" }));
    darkInfo.appendChild(el("div", { className: "m-setting-desc", textContent: "Use dark color scheme" }));
    darkRow.appendChild(darkInfo);
    var darkSwitch = el("div", {
      className: "m-switch" + (isDarkMode() ? " active" : ""),
      id: "m-settings-dark-switch",
      onclick: function () {
        self.toggleDarkMode();
        this.classList.toggle("active");
      },
    });
    darkRow.appendChild(darkSwitch);
    appearSec.appendChild(darkRow);

    // Accent color
    var colorRow = el("div", { className: "m-setting-row", style: "flex-direction:column;align-items:flex-start" });
    colorRow.appendChild(el("div", { className: "m-setting-label", textContent: "Accent Color" }));
    var colorGrid = el("div", { className: "m-color-grid" });
    var savedAccent = localStorage.getItem(ACCENT_KEY) || "#1a73e8";
    for (var i = 0; i < ACCENT_COLORS.length; i++) {
      (function(preset) {
        var swatch = el("div", {
          className: "m-color-swatch" + (savedAccent === preset.hex ? " active" : ""),
          style: "background:" + preset.hex,
          title: preset.name,
          onclick: function () {
            // Deactivate all
            var all = colorGrid.querySelectorAll(".m-color-swatch");
            for (var j = 0; j < all.length; j++) all[j].classList.remove("active");
            this.classList.add("active");
            localStorage.setItem(ACCENT_KEY, preset.hex);
            self.applyAccentColor(preset.hex);
          },
        });
        colorGrid.appendChild(swatch);
      })(ACCENT_COLORS[i]);
    }
    colorRow.appendChild(colorGrid);
    appearSec.appendChild(colorRow);
    body.appendChild(appearSec);

    // === View Section ===
    var viewSec = el("div", { className: "m-settings-section" });
    viewSec.appendChild(el("div", { className: "m-settings-section-title", textContent: "View" }));

    var viewRow = el("div", { className: "m-setting-row" });
    var viewInfo = el("div");
    viewInfo.appendChild(el("div", { className: "m-setting-label", textContent: "Default View" }));
    viewInfo.appendChild(el("div", { className: "m-setting-desc", textContent: self.viewMode === "grid" ? "Grid (cards)" : "List (table)" }));
    viewRow.appendChild(viewInfo);
    var viewSwitch = el("div", {
      className: "m-switch" + (self.viewMode === "grid" ? " active" : ""),
      onclick: function () {
        var newMode = self.viewMode === "list" ? "grid" : "list";
        self.setViewMode(newMode);
        this.classList.toggle("active");
        viewInfo.querySelector(".m-setting-desc").textContent = newMode === "grid" ? "Grid (cards)" : "List (table)";
      },
    });
    viewRow.appendChild(viewSwitch);
    viewSec.appendChild(viewRow);
    body.appendChild(viewSec);

    // === Account Section ===
    var acctSec = el("div", { className: "m-settings-section" });
    acctSec.appendChild(el("div", { className: "m-settings-section-title", textContent: "Account" }));

    if (this.acct !== "*") {
      // Logged in — show user info and logout
      var userRow = el("div", { className: "m-setting-row" });
      var userInfo = el("div");
      userInfo.appendChild(el("div", { className: "m-setting-label", textContent: "Logged in as" }));
      userInfo.appendChild(el("div", { className: "m-setting-desc", textContent: this.acct }));
      userRow.appendChild(userInfo);
      acctSec.appendChild(userRow);

      var logoutBtn = el("button", {
        className: "m-settings-action-btn",
        onclick: function () {
          // CopyParty logout
          document.cookie = "cppwd=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.reload();
        },
      });
      logoutBtn.innerHTML = SVG.logout + "<span>Log Out</span>";
      acctSec.appendChild(logoutBtn);
    } else {
      // Not logged in — show login button
      var loginBtn = el("button", {
        className: "m-settings-action-btn",
        onclick: function () { self.hideSettings(); self.showLogin(); },
      });
      loginBtn.innerHTML = SVG.login + "<span>Log In</span>";
      acctSec.appendChild(loginBtn);
    }

    body.appendChild(acctSec);

    // === Server Config Section (UI Only) ===
    var srvSec = el("div", { className: "m-settings-section" });
    srvSec.appendChild(el("div", { className: "m-settings-section-title", textContent: "Server Services" }));

    var createServiceToggle = function(label, desc) {
      var row = el("div", { className: "m-setting-row" });
      var info = el("div");
      info.appendChild(el("div", { className: "m-setting-label", textContent: label }));
      info.appendChild(el("div", { className: "m-setting-desc", textContent: desc }));
      row.appendChild(info);
      var toggle = el("div", {
        className: "m-switch",
        onclick: function () {
          this.classList.toggle("active");
          alert("Note: To fully enable " + label + ", copyparty must be restarted with the CLI flag or config file.");
        },
      });
      row.appendChild(toggle);
      return row;
    };

    srvSec.appendChild(createServiceToggle("FTP Server", "--ftp 3921 (File Transfer)"));
    srvSec.appendChild(createServiceToggle("SMB Server", "--smb 3945 (Windows Share)"));
    srvSec.appendChild(createServiceToggle("WebDAV Server", "-e2d (HTTP File Mapping)"));

    var configBtn = el("button", {
      className: "m-settings-action-btn",
      style: "margin-top: 12px; justify-content: center; background: var(--m-primary-light); color: var(--m-primary)",
      onclick: function () { self.hideSettings(); self.showConfigModal(); },
      textContent: "Open Config Builder",
    });
    srvSec.appendChild(configBtn);
    body.appendChild(srvSec);

    // === UI Section ===
    var uiSec = el("div", { className: "m-settings-section" });
    uiSec.appendChild(el("div", { className: "m-settings-section-title", textContent: "Interface" }));

    var classicBtn = el("button", {
      className: "m-settings-action-btn",
      onclick: function () { self.hideSettings(); self.switchToClassic(); },
    });
    classicBtn.innerHTML = SVG.switchUI + "<span>Switch to Classic UI</span>";
    uiSec.appendChild(classicBtn);
    body.appendChild(uiSec);

    this.settingsPanel.appendChild(body);

    // Footer
    var footer = el("div", { className: "m-settings-footer" });
    footer.appendChild(el("div", { className: "m-settings-footer-text", textContent: "CopyParty Modern UI v3.0\nOverlay theme — zero source changes" }));
    this.settingsPanel.appendChild(footer);

    container.appendChild(this.settingsPanel);
    return container;
  };

  ModernUI.prototype.showSettings = function () {
    if (this.settingsOverlay) this.settingsOverlay.classList.add("active");
    if (this.settingsPanel) this.settingsPanel.classList.add("active");
  };

  ModernUI.prototype.hideSettings = function () {
    if (this.settingsOverlay) this.settingsOverlay.classList.remove("active");
    if (this.settingsPanel) this.settingsPanel.classList.remove("active");
  };

  // ===== LOGIN MODAL =====
  ModernUI.prototype.buildLoginModal = function () {
    var self = this;
    this.loginOverlay = el("div", { className: "m-login-overlay" });
    this.loginOverlay.addEventListener("click", function (e) {
      if (e.target === self.loginOverlay) self.hideLogin();
    });

    var card = el("div", { className: "m-login-card", style: "position:relative" });

    // Close button
    card.appendChild(el("button", { className: "m-login-close", innerHTML: SVG.close, onclick: function () { self.hideLogin(); } }));

    // Logo
    card.appendChild(el("div", { className: "m-login-logo" }, "CP"));
    card.appendChild(el("h2", { className: "m-login-title", textContent: "Welcome back" }));
    card.appendChild(el("p", { className: "m-login-subtitle", textContent: "Sign in to access your files" }));

    // Username field
    var userField = el("div", { className: "m-login-field" });
    userField.appendChild(el("label", { className: "m-login-label", textContent: "Username" }));
    userField.appendChild(el("input", { className: "m-login-input", id: "m-login-user", type: "text", placeholder: "Enter your username", autocomplete: "username" }));
    card.appendChild(userField);

    // Password field
    var passField = el("div", { className: "m-login-field" });
    passField.appendChild(el("label", { className: "m-login-label", textContent: "Password" }));
    passField.appendChild(el("input", { className: "m-login-input", id: "m-login-pass", type: "password", placeholder: "Enter your password", autocomplete: "current-password" }));
    card.appendChild(passField);

    // Error message
    this.loginError = el("div", { className: "m-login-error", id: "m-login-error", textContent: "Invalid username or password" });
    card.appendChild(this.loginError);

    // Submit button
    card.appendChild(el("button", {
      className: "m-login-btn",
      textContent: "Sign In",
      onclick: function () { self.doLogin(); },
    }));

    this.loginOverlay.appendChild(card);

    // Enter key handler
    setTimeout(function () {
      var passInput = document.getElementById("m-login-pass");
      if (passInput) {
        passInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") self.doLogin();
        });
      }
      var userInput = document.getElementById("m-login-user");
      if (userInput) {
        userInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            var p = document.getElementById("m-login-pass");
            if (p) p.focus();
          }
        });
      }
    }, 200);

    return this.loginOverlay;
  };

  ModernUI.prototype.showLogin = function () {
    if (this.loginOverlay) {
      this.loginOverlay.classList.add("active");
      setTimeout(function () {
        var u = document.getElementById("m-login-user");
        if (u) u.focus();
      }, 200);
    }
  };

  ModernUI.prototype.hideLogin = function () {
    if (this.loginOverlay) {
      this.loginOverlay.classList.remove("active");
      var err = document.getElementById("m-login-error");
      if (err) err.classList.remove("visible");
    }
  };

  ModernUI.prototype.doLogin = function () {
    var user = (document.getElementById("m-login-user").value || "").trim();
    var pass = document.getElementById("m-login-pass").value || "";
    if (!user) return;

    var self = this;
    var errEl = document.getElementById("m-login-error");

    // CopyParty auth: POST to current URL with cred=user:pass
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.pathname);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        // Check if login succeeded by looking for auth cookie or success indicators
        self.hideLogin();
        window.location.reload();
      } else {
        if (errEl) { errEl.textContent = "Login failed — check credentials"; errEl.classList.add("visible"); }
      }
    };
    xhr.onerror = function () {
      if (errEl) { errEl.textContent = "Network error"; errEl.classList.add("visible"); }
    };
    xhr.send("cred=" + encodeURIComponent(user) + ":" + encodeURIComponent(pass));
  };

  // ---- ACTIONS ----
  ModernUI.prototype.triggerUpload = function () {
    var fileInput = document.getElementById("file1");
    if (fileInput) {
      fileInput.click();
      this.monitorUpload();
      return;
    }
    this.switchToClassic("up2k");
  };

  ModernUI.prototype.monitorUpload = function () {
    var self = this;
    var toast = self.uploadToast;
    if (!toast) return;

    var checkInterval = setInterval(function () {
      var ok = 0, ng = 0, bz = 0, que = 0;
      try {
        var okEl = document.querySelector("#u2cnt_ok .u2c_n");
        var ngEl = document.querySelector("#u2cnt_ng .u2c_n");
        var bzEl = document.querySelector("#u2cnt_bz .u2c_n");
        var queEl = document.querySelector("#u2cnt_q .u2c_n");
        if (okEl) ok = parseInt(okEl.textContent) || 0;
        if (ngEl) ng = parseInt(ngEl.textContent) || 0;
        if (bzEl) bz = parseInt(bzEl.textContent) || 0;
        if (queEl) que = parseInt(queEl.textContent) || 0;
      } catch (e) {}
      var total = ok + ng + bz + que;
      if (total > 0) {
        toast.classList.add("visible");
        var pct = total > 0 ? Math.round(((ok + ng) / total) * 100) : 0;
        if (self.utFill) self.utFill.style.width = pct + "%";
        if (self.utText) self.utText.textContent = ok + " of " + total + " files done" + (ng > 0 ? " (" + ng + " failed)" : "");
        if (bz === 0 && que === 0 && (ok > 0 || ng > 0)) {
          if (self.utFill) self.utFill.style.width = "100%";
          if (self.utText) self.utText.textContent = "Upload complete! " + ok + " files uploaded.";
          setTimeout(function () { toast.classList.remove("visible"); window.location.reload(); }, 2000);
          clearInterval(checkInterval);
        }
      }
    }, 500);
    setTimeout(function () { clearInterval(checkInterval); }, 300000);
  };

  ModernUI.prototype.queueAction = function(file, message, executeFn) {
    var self = this;
    if (this.pendingAction) this.pendingAction.execute(false); // finish previous queue

    // visual hide
    var originalOpacity, originalEvents;
    var el = file.el;
    if (el) {
      originalOpacity = el.style.opacity;
      originalEvents = el.style.pointerEvents;
      el.style.opacity = '0.3';
      el.style.pointerEvents = 'none';
      if (this.viewMode === "list") el.style.background = 'var(--m-danger-bg)';
    }

    if (!this.undoToast) {
      this.undoToast = document.createElement("div");
      this.undoToast.className = "m-undo-toast";
      this.undoMsg = document.createElement("span");
      this.undoMsg.className = "m-undo-msg";
      this.undoBtn = document.createElement("button");
      this.undoBtn.className = "m-undo-btn";
      this.undoBtn.textContent = "Undo";
      this.undoToast.appendChild(this.undoMsg);
      this.undoToast.appendChild(this.undoBtn);
      document.body.appendChild(this.undoToast);
    }

    this.undoMsg.textContent = message;
    this.undoToast.classList.add("active");

    var tm = setTimeout(function() {
      if (self.pendingAction && self.pendingAction.tm === tm) {
        self.pendingAction.execute(true);
      }
    }, 5000);

    var cleanup = function() {
      self.undoToast.classList.remove("active");
      self.pendingAction = null;
    };

    this.undoBtn.onclick = function() {
      clearTimeout(tm);
      if (el) {
        el.style.opacity = originalOpacity;
        el.style.pointerEvents = originalEvents;
        if (self.viewMode === "list") el.style.background = '';
      }
      cleanup();
    };

    this.pendingAction = {
      tm: tm,
      execute: function(reload) {
        clearTimeout(tm);
        cleanup();
        executeFn(reload);
      }
    };
  };

  ModernUI.prototype.createFolder = function (name) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.pathname + "?mkdir=" + encodeURIComponent(name));
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) window.location.reload();
      else alert("Failed to create folder: " + xhr.statusText);
    };
    xhr.onerror = function () { alert("Network error creating folder"); };
    xhr.send("");
  };

  ModernUI.prototype.renameFile = function (file, newName) {
    if (!newName || newName === file.name) return;
    this.queueAction(file, "Renamed '" + file.name + "'", function(reload) {
      var pdir = file.href.split('/').slice(0, -1).join('/') + '/';
      var xhr = new XMLHttpRequest();
      xhr.open("POST", pdir + "?mv=" + encodeURIComponent(file.name));
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      if (reload) xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) window.location.reload();
        else alert("Failed to rename: " + xhr.statusText);
      };
      xhr.send(newName);
    });
  };

  ModernUI.prototype.moveFile = function (file, dest) {
    if (!dest) return;
    this.queueAction(file, "Moved '" + file.name + "'", function(reload) {
      var pdir = file.href.split('/').slice(0, -1).join('/') + '/';
      var xhr = new XMLHttpRequest();
      xhr.open("POST", pdir + "?mv=" + encodeURIComponent(file.name));
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      if (reload) xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) window.location.reload();
        else alert("Failed to move: " + xhr.statusText);
      };
      xhr.send(dest);
    });
  };

  ModernUI.prototype.deleteFile = function (file) {
    this.queueAction(file, "Deleted '" + file.name + "'", function(reload) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", file.href + "?delete");
      if (reload) xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) window.location.reload();
        else alert("Failed to delete: " + xhr.statusText);
      };
      xhr.send("");
    });
  };

  // ---- UI SWITCHING ----
  ModernUI.prototype.switchToClassic = function (panel) {
    localStorage.setItem(STORAGE_KEY, "false");
    document.documentElement.classList.remove("modern-active");
    document.documentElement.classList.remove("modern-dark");
    document.documentElement.classList.add("modern-off");
    var app = document.getElementById("modern-app");
    if (app) app.style.display = "none";
    addClassicToggleButton();
    if (typeof panel === "string" && typeof window.goto === "function") {
      setTimeout(function () { window.goto(panel); }, 100);
    }
  };

  ModernUI.prototype.toggleDarkMode = function () {
    var dark = !isDarkMode();
    localStorage.setItem(DARK_KEY, dark.toString());
    document.documentElement.classList.toggle("modern-dark", dark);
    var btn = document.getElementById("m-dark-toggle");
    if (btn) btn.innerHTML = dark ? SVG.lightMode : SVG.darkMode;
  };

  ModernUI.prototype.toggleSidebar = function () {
    this.sidebarOpen = !this.sidebarOpen;
    var sidebar = document.getElementById("m-sidebar");
    if (sidebar) sidebar.classList.toggle("open", this.sidebarOpen);
    if (this.sidebarOverlay) this.sidebarOverlay.classList.toggle("open", this.sidebarOpen);
  };

  ModernUI.prototype.closeSidebar = function () {
    this.sidebarOpen = false;
    var sidebar = document.getElementById("m-sidebar");
    if (sidebar) sidebar.classList.remove("open");
    if (this.sidebarOverlay) this.sidebarOverlay.classList.remove("open");
  };

  // ===== CLASSIC MODE TOGGLE =====
  function addClassicToggleButton() {
    var existing = document.getElementById("m-classic-toggle");
    if (existing) existing.remove();
    var btn = document.createElement("button");
    btn.id = "m-classic-toggle";
    btn.className = "m-toggle-ui";
    btn.innerHTML = SVG.switchUI + " Modern UI";
    btn.onclick = function () {
      localStorage.setItem(STORAGE_KEY, "true");
      document.documentElement.classList.remove("modern-off");
      window.location.reload();
    };
    document.body.appendChild(btn);
  }

  // ===== CONFIG BUILDER MODAL =====
  ModernUI.prototype.buildConfigModal = function() {
    var self = this;
    this.configOverlay = el("div", { className: "m-modal-overlay m-config-modal" });
    this.configOverlay.addEventListener("click", function (e) {
      if (e.target === self.configOverlay) self.hideConfigModal();
    });

    var modal = el("div", { className: "m-modal" });
    modal.appendChild(el("h3", { className: "m-modal-title", textContent: "CopyParty Config Builder" }));

    var layout = el("div", { className: "m-cb-layout" });

    // LEFT COLUMN: Forms
    var forms = el("div", { className: "m-cb-section", style: "max-height: 60vh; overflow-y: auto; padding-right: 16px; align-content: flex-start" });

    // Network
    var netSec = el("div", { className: "m-cb-section", style: "border-bottom:1px solid var(--m-border); padding-bottom:12px;" });
    netSec.appendChild(el("div", { className: "m-cb-title", textContent: "Network" }));
    var g1 = el("div", { className: "m-cb-form-group" });
    g1.innerHTML = '<label>Listen Port</label><input type="number" id="cb-port" value="3923">';
    var g2 = el("div", { className: "m-cb-form-group" });
    g2.innerHTML = '<label>Host / IP (0.0.0.0 for all)</label><input type="text" id="cb-host" value="0.0.0.0">';
    netSec.appendChild(g1); netSec.appendChild(g2);
    forms.appendChild(netSec);

    // Services
    var srvSec = el("div", { className: "m-cb-section", style: "border-bottom:1px solid var(--m-border); padding-bottom:12px;" });
    srvSec.appendChild(el("div", { className: "m-cb-title", textContent: "Services" }));
    var g3 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    g3.innerHTML = '<input type="checkbox" id="cb-ftp"><label for="cb-ftp">Enable FTP Port 3921</label>';
    var g4 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    g4.innerHTML = '<input type="checkbox" id="cb-smb"><label for="cb-smb">Enable SMB Port 3945</label>';
    var g5 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    g5.innerHTML = '<input type="checkbox" id="cb-webdav"><label for="cb-webdav">Enable WebDAV mapping</label>';
    srvSec.appendChild(g3); srvSec.appendChild(g4); srvSec.appendChild(g5);
    forms.appendChild(srvSec);

    // Accounts
    var acctSec = el("div", { className: "m-cb-section", style: "border-bottom:1px solid var(--m-border); padding-bottom:12px;" });
    acctSec.appendChild(el("div", { className: "m-cb-title", textContent: "Accounts" }));
    var gAcct = el("div", { className: "m-cb-form-group" });
    gAcct.innerHTML = '<label>Default Admin Account (user:pass)</label><input type="text" id="cb-acct" placeholder="admin:mysecretpassword">';
    acctSec.appendChild(gAcct);
    forms.appendChild(acctSec);

    // Indexing
    var idxSec = el("div", { className: "m-cb-section", style: "border-bottom:1px solid var(--m-border); padding-bottom:12px;" });
    idxSec.appendChild(el("div", { className: "m-cb-title", textContent: "Indexing & Performance" }));
    var gIdx1 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    gIdx1.innerHTML = '<input type="checkbox" id="cb-e2dsa" checked><label for="cb-e2dsa">Enable general file indexing (-e2dsa)</label>';
    var gIdx2 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    gIdx2.innerHTML = '<input type="checkbox" id="cb-e2ts"><label for="cb-e2ts">Enable audio metadata indexing (-e2ts)</label>';
    var gIdx3 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    gIdx3.innerHTML = '<input type="checkbox" id="cb-nothumb"><label for="cb-nothumb">Disable all thumbnail generation (--no-thumb)</label>';
    idxSec.appendChild(gIdx1); idxSec.appendChild(gIdx2); idxSec.appendChild(gIdx3);
    forms.appendChild(idxSec);

    // Security
    var secSec = el("div", { className: "m-cb-section", style: "border-bottom:1px solid var(--m-border); padding-bottom:12px;" });
    secSec.appendChild(el("div", { className: "m-cb-title", textContent: "Security & Proxy" }));
    var gSec1 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;" });
    gSec1.innerHTML = '<input type="checkbox" id="cb-cf"><label for="cb-cf">Trust Cloudflare IPs (--xff-hdr)</label>';
    var gSec2 = el("div", { className: "m-cb-form-group" });
    gSec2.innerHTML = '<label>Brute-force Ban Limits (failures/seconds)</label><input type="text" id="cb-ban" placeholder="9/3600">';
    secSec.appendChild(gSec1); secSec.appendChild(gSec2);
    forms.appendChild(secSec);

    // Volume
    var volSec = el("div", { className: "m-cb-section" });
    volSec.appendChild(el("div", { className: "m-cb-title", textContent: "Default Volume" }));
    var g6 = el("div", { className: "m-cb-form-group" });
    g6.innerHTML = '<label>Local Directory Path</label><input type="text" id="cb-vol-src" value="./" placeholder="/var/www/data">';
    var g7 = el("div", { className: "m-cb-form-group" });
    g7.innerHTML = '<label>Web URL Mount Point</label><input type="text" id="cb-vol-dst" value="/">';
    var g8 = el("div", { className: "m-cb-form-group" });
    g8.innerHTML = '<label>Permissions</label><select id="cb-vol-acc" style="padding:8px;border:1px solid var(--m-border);border-radius:4px;background:var(--m-bg);color:var(--m-text);"><option value="r">Read Only (r)</option><option value="w">Upload Only (w)</option><option value="rw">Read & Write (rw)</option><option value="rmd">Read, Move, Delete (rmd)</option><option value="rmda">Full Admin (rmda)</option></select>';
    var g9 = el("div", { className: "m-cb-form-group", style: "flex-direction:row;align-items:center;gap:8px;margin-top:8px;" });
    g9.innerHTML = '<input type="checkbox" id="cb-vol-dthumb"><label for="cb-vol-dthumb">Disable thumbnails on this volume (c,dthumb)</label>';
    volSec.appendChild(g6); volSec.appendChild(g7); volSec.appendChild(g8); volSec.appendChild(g9);
    forms.appendChild(volSec);

    layout.appendChild(forms);

    // RIGHT COLUMN: Output
    var outSec = el("div", { className: "m-cb-section" });
    outSec.appendChild(el("div", { className: "m-cb-title", textContent: "Generated copyparty.conf" }));
    var outArea = el("textarea", { className: "m-cb-output", id: "cb-output-area", readOnly: true });
    outSec.appendChild(outArea);

    layout.appendChild(outSec);
    modal.appendChild(layout);

    // Actions
    var actions = el("div", { className: "m-modal-actions", style: "margin-top:10px;" });
    actions.appendChild(el("button", { className: "m-btn-secondary", textContent: "Close", onclick: function () { self.hideConfigModal(); } }));
    actions.appendChild(el("button", { className: "m-btn-primary", textContent: "Copy & Download", onclick: function () {
      navigator.clipboard.writeText(outArea.value);
      var blob = new Blob([outArea.value], {type: "text/plain"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "copyparty.conf";
      a.click();
    } }));
    modal.appendChild(actions);

    this.configOverlay.appendChild(modal);

    // Update logic
    var inputs = ["cb-port","cb-host","cb-ftp","cb-smb","cb-webdav","cb-vol-src","cb-vol-dst","cb-vol-acc","cb-acct","cb-e2dsa","cb-e2ts","cb-nothumb","cb-cf","cb-ban","cb-vol-dthumb"];
    var updateYaml = function() {
      var y = "[global]\n";
      y += "p: " + (document.getElementById("cb-port").value || 3923) + "\n";
      y += "i: " + (document.getElementById("cb-host").value || "0.0.0.0") + "\n";
      if (document.getElementById("cb-ftp").checked) y += "ftp: 3921\n";
      if (document.getElementById("cb-smb").checked) y += "smb: 1\n";
      if (document.getElementById("cb-webdav").checked) y += "e2d: 1\n";
      
      var acct = document.getElementById("cb-acct").value;
      if (acct) y += "a: " + acct + "\n";
      
      if (document.getElementById("cb-e2dsa").checked) y += "e2dsa: 1\n";
      if (document.getElementById("cb-e2ts").checked) y += "e2ts: 1\n";
      if (document.getElementById("cb-nothumb").checked) y += "no-thumb: 1\n";
      
      if (document.getElementById("cb-cf").checked) y += "xff-hdr: cf-connecting-ip\n";
      var ban = document.getElementById("cb-ban").value;
      if (ban) y += "ban-pw: " + ban + "\n";
      
      y += "\n[/" + document.getElementById("cb-vol-dst").value.replace(/^\/+/,'') + "]\n";
      y += document.getElementById("cb-vol-src").value + "\n";
      
      var vf = [];
      var acc = document.getElementById("cb-vol-acc").value;
      if (document.getElementById("cb-vol-dthumb").checked) vf.push("c,dthumb");
      
      var flags = vf.length > 0 ? "  " + vf.join("  ") : "";
      var accAuth = acct ? acct.split(':')[0] : "A"; // Use 'A' (anonymous) if no acct defined
      y += "accs:  " + accAuth + ":" + acc + flags + "\n";
      
      outArea.value = y;
    };

    setTimeout(function() {
      for (var i = 0; i < inputs.length; i++) {
        var el = document.getElementById(inputs[i]);
        if (el) el.addEventListener("input", updateYaml);
        if (el) el.addEventListener("change", updateYaml);
      }
      updateYaml();
    }, 100);

    return this.configOverlay;
  };

  ModernUI.prototype.showConfigModal = function() {
    if (this.configOverlay) this.configOverlay.classList.add("active");
  };

  ModernUI.prototype.hideConfigModal = function() {
    if (this.configOverlay) this.configOverlay.classList.remove("active");
  };

  // ===== DROP ZONE =====
  function setupDragDrop() {
    var content = document.querySelector(".m-content");
    if (!content) return;
    var dragCounter = 0;
    content.addEventListener("dragenter", function (e) {
      e.preventDefault(); dragCounter++;
      content.style.outline = "2px dashed var(--m-primary)";
      content.style.outlineOffset = "-4px";
      content.style.background = "var(--m-primary-light)";
    });
    content.addEventListener("dragleave", function (e) {
      e.preventDefault(); dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        content.style.outline = ""; content.style.outlineOffset = ""; content.style.background = "";
      }
    });
    content.addEventListener("dragover", function (e) { e.preventDefault(); });
    content.addEventListener("drop", function (e) {
      e.preventDefault(); dragCounter = 0;
      content.style.outline = ""; content.style.outlineOffset = ""; content.style.background = "";
      var u2btn = document.getElementById("u2btn");
      if (u2btn && e.dataTransfer && e.dataTransfer.files.length > 0) {
        try {
          var newDT = new DataTransfer();
          for (var i = 0; i < e.dataTransfer.files.length; i++) newDT.items.add(e.dataTransfer.files[i]);
          u2btn.dispatchEvent(new DragEvent("drop", { dataTransfer: newDT, bubbles: true, cancelable: true }));
        } catch (err) {
          var fileInput = document.getElementById("file1");
          if (fileInput) fileInput.click();
        }
      }
    });
  }

  // ===== INITIALIZATION =====
  function init() {
    if (!window.CGV && !window.ls0) return;
    if (!isModernEnabled()) { addClassicToggleButton(); return; }
    var ui = new ModernUI();
    ui.init();
    setTimeout(function () { setupDragDrop(); }, 200);

    // Global keyboard navigation
    document.addEventListener("keydown", function(e) {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
      var focused = document.activeElement;
      if (!focused || (!focused.classList.contains("m-file-card") && !focused.classList.contains("m-file-row"))) {
        // If nothing is focused and user presses down, focus first item
        if (e.key === "ArrowDown") {
          var first = document.querySelector(".m-file-card, .m-file-row");
          if (first) { e.preventDefault(); first.focus(); }
        }
        return;
      }

      var isGrid = focused.classList.contains("m-file-card");
      var items = document.querySelectorAll(isGrid ? ".m-file-card" : ".m-file-row");
      var idx = Array.prototype.indexOf.call(items, focused);
      if (idx < 0) return;

      var newIdx = idx;
      if (e.key === "ArrowDown") {
        if (isGrid) {
          var cols = 1;
          for (var i = 1; i < items.length; i++) {
            if (items[i].offsetTop > items[0].offsetTop) { cols = i; break; }
          }
          newIdx = idx + cols;
        } else {
          newIdx = idx + 1;
        }
      }
      else if (e.key === "ArrowUp") {
        if (isGrid) {
          var cols = 1;
          for (var i = 1; i < items.length; i++) {
            if (items[i].offsetTop > items[0].offsetTop) { cols = i; break; }
          }
          newIdx = idx - cols;
        } else {
          newIdx = idx - 1;
        }
      }
      else if (e.key === "ArrowRight" && isGrid) newIdx = idx + 1;
      else if (e.key === "ArrowLeft" && isGrid) newIdx = idx - 1;
      else return;

      if (newIdx >= 0 && newIdx < items.length) {
        e.preventDefault();
        items[newIdx].focus();
      }
    });
  }

  // Activate as soon as the DOM is ready instead of
  // waiting for the full window load event; retry briefly while copyparty's
  // page data (CGV/ls0) is not available yet.
  var bootTries = 0;
  function boot() {
    if ((window.CGV || window.ls0) || ++bootTries > 40) { init(); return; }
    setTimeout(boot, 50);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
