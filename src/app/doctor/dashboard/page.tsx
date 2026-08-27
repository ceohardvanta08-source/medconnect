// @ts-nocheck
"use client";
//
// This page is a direct port of a self-contained HTML/CSS/JS design into a
// Next.js client component. The CSS and markup are injected verbatim, and
// the original interaction script (tabs, modals, i18n toggle, filters, the
// hospital-contact / SOS form, etc.) runs unmodified inside a useEffect,
// exactly as it did in the original HTML file. // @ts-nocheck is used here
// because this is plain DOM-driven JavaScript (document.getElementById,
// addEventListener, etc.) rather than idiomatic React — TypeScript's strict
// null-checking isn't meaningful for code that we know targets elements we
// just rendered ourselves. The didInit guard below stops the script from
// running twice in React 18 Strict Mode during development.

import { useEffect, useRef } from "react";

const PAGE_CSS = `
  :root{
    --bg-cream:      #F6F7EF;
    --bg-cream-dim:  #EEF0E4;
    --ink:           #112F2A;
    --ink-soft:      #4B5B55;
    --teal:          #137459;
    --teal-deep:     #0C2824;
    --card:          #FFFFFF;
    --border:        rgba(17,47,42,0.10);
    --border-strong: rgba(17,47,42,0.16);
    --shadow:        0 1px 2px rgba(17,47,42,0.04), 0 12px 32px -16px rgba(17,47,42,0.14);
    --red:           #E4483C;
    --amber:         #C98A1A;
  }
  *{ box-sizing:border-box; }
  html{ scroll-behavior:smooth; }
  body{
    margin:0; background:var(--bg-cream); color:var(--ink);
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  button{ font-family:inherit; }

  .shell{ display:grid; grid-template-columns: 252px 1fr; min-height:100vh; }

  /* ---------- Sidebar ---------- */
  .sidebar{
    background: var(--teal-deep); color:#F6F7EF; padding: 26px 18px;
    display:flex; flex-direction:column; position:sticky; top:0; height:100vh;
  }
  .sb-logo{ display:flex; align-items:center; gap:10px; font-size:17px; font-weight:800; letter-spacing:-0.01em; padding: 6px 8px 22px; }
  .sb-logo-mark{ width:28px; height:28px; border-radius:8px; background:var(--teal); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sb-logo-mark svg{ width:13px; height:13px; }

  /* ---------- Duty switcher (doctor identity + on-duty status) ---------- */
  .duty-switch-wrap{ position:relative; margin-bottom:14px; }
  .duty-switch-btn{
    all:unset; box-sizing:border-box; display:flex; align-items:center; gap:11px; width:100%;
    padding: 10px 8px; border-radius:14px; cursor:pointer;
    background: rgba(246,247,239,0.05); border: 1px solid rgba(246,247,239,0.1);
  }
  .duty-switch-btn:hover{ background: rgba(246,247,239,0.08); }
  .sb-avatar{ width:38px; height:38px; border-radius:50%; background: var(--teal); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
  .sb-profile-name{ font-size:13.5px; font-weight:700; }
  .sb-profile-sub{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:rgba(246,247,239,0.5); margin-top:2px; display:flex; align-items:center; gap:5px; }
  .duty-dot{ width:6px; height:6px; border-radius:50%; background:#7fd9b9; flex-shrink:0; }
  .duty-dot.off{ background: rgba(246,247,239,0.35); }
  .duty-chevron{ margin-left:auto; opacity:.5; transition: transform .2s ease; flex-shrink:0; }
  .duty-switch-wrap.is-open .duty-chevron{ transform: rotate(180deg); }
  .duty-menu{
    position:absolute; top: calc(100% + 6px); left:0; right:0; background:#fff; border-radius:14px;
    box-shadow: 0 16px 40px -12px rgba(0,0,0,0.4); padding:6px; z-index:20; display:none;
  }
  .duty-switch-wrap.is-open .duty-menu{ display:block; }
  .duty-option{ all:unset; box-sizing:border-box; display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border-radius:10px; cursor:pointer; color:var(--ink); }
  .duty-option:hover{ background: var(--bg-cream-dim); }
  .duty-option-dot{ width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .duty-option-label{ font-size:13px; font-weight:700; }

  .sb-nav{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:3px; flex:1; }
  .sb-link{
    all:unset; box-sizing:border-box; display:flex; align-items:center; gap:12px;
    padding: 11px 12px; border-radius:12px; font-size:14px; font-weight:600;
    color: rgba(246,247,239,0.62); cursor:pointer; width:100%; position:relative;
    transition: background .18s ease, color .18s ease;
  }
  .sb-link svg{ width:17px; height:17px; flex-shrink:0; }
  .sb-link svg path, .sb-link svg circle, .sb-link svg rect{ stroke: currentColor; }
  .sb-link:hover{ background: rgba(246,247,239,0.06); color:#F6F7EF; }
  .sb-link.is-active{ background: rgba(246,247,239,0.1); color:#F6F7EF; }
  .sb-link-badge{
    margin-left:auto; background:var(--red); color:#fff; font-size:10.5px; font-weight:700;
    min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 5px;
  }

  .sb-quick{
    all:unset; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:8px;
    background:#fff; color:var(--teal-deep); font-weight:800; font-size:13.5px;
    padding:13px; border-radius:12px; cursor:pointer; margin-top:10px;
  }
  .sb-quick:hover{ opacity:.92; }

  .sb-logout{
    all:unset; box-sizing:border-box; display:flex; align-items:center; gap:10px; width:100%;
    padding:11px 12px; border-radius:12px; font-size:13.5px; font-weight:600;
    color: rgba(246,247,239,0.5); cursor:pointer; margin-top:6px;
  }
  .sb-logout:hover{ background: rgba(228,72,60,0.12); color:#f2a89f; }
  .sb-logout svg{ width:16px; height:16px; flex-shrink:0; }

  .sb-site-links{ display:flex; flex-direction:column; gap:2px; margin-top:14px; padding-top:14px; border-top:1px solid rgba(246,247,239,0.08); }
  .sb-site-links a{ font-size:12.5px; color: rgba(246,247,239,0.42); text-decoration:none; padding:6px 12px; display:flex; align-items:center; gap:8px; }
  .sb-site-links a:hover{ color:#F6F7EF; }

  /* ---------- Main ---------- */
  .main{ padding: 30px 40px 80px; max-width: 1100px; }
  .topbar{ display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom: 30px; }
  .search-box{
    flex:1; max-width: 340px; display:flex; align-items:center; gap:9px;
    background:#fff; border:1px solid var(--border); border-radius:12px; padding: 10px 14px; box-shadow: var(--shadow);
  }
  .search-box svg{ width:15px; height:15px; flex-shrink:0; opacity:.5; }
  .search-box input{ border:none; outline:none; background:transparent; font-size:14px; color:var(--ink); width:100%; font-family:inherit; }
  .topbar-right{ display:flex; align-items:center; gap:10px; }

  .lang-toggle{ display:flex; background:#fff; border:1px solid var(--border); border-radius:999px; box-shadow:var(--shadow); padding:3px; gap:2px; }
  .lang-btn{ all:unset; box-sizing:border-box; font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; cursor:pointer; color:var(--ink-soft); }
  .lang-btn.is-active{ background:var(--teal-deep); color:#fff; }

  .icon-btn{
    width:38px; height:38px; border-radius:50%; background:#fff; border:1px solid var(--border); box-shadow:var(--shadow);
    display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative;
  }
  .icon-btn svg{ width:16px; height:16px; }
  .icon-btn svg path{ stroke: var(--ink); }
  .icon-dot{ position:absolute; top:8px; right:8px; width:7px; height:7px; border-radius:50%; background: var(--red); border:1.5px solid #fff; }

  .notif-wrap{ position:relative; }
  .notif-panel{
    position:absolute; top:calc(100% + 10px); right:0; width:310px; background:#fff; border-radius:16px;
    box-shadow: 0 16px 40px -12px rgba(0,0,0,0.35); padding:8px; display:none; z-index:30;
  }
  .notif-wrap.is-open .notif-panel{ display:block; }
  .notif-head{ font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--ink-soft); padding:10px 12px 6px; }
  .notif-item{ display:flex; gap:10px; padding:10px 12px; border-radius:10px; }
  .notif-item:hover{ background:var(--bg-cream-dim); }
  .notif-dot2{ width:7px; height:7px; border-radius:50%; background:var(--teal); flex-shrink:0; margin-top:6px; }
  .notif-dot2.crit{ background:var(--red); }
  .notif-item-title{ font-size:13px; font-weight:600; line-height:1.4; }
  .notif-item-time{ font-size:11px; color:var(--ink-soft); margin-top:2px; }

  .eyebrow{ display:flex; align-items:center; gap:8px; font-family:'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; }
  .eyebrow::before{ content:""; width:6px; height:6px; border-radius:50%; background:var(--teal); display:inline-block; }

  /* ---------- Back link ---------- */
  .back-link{
    all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:6px;
    font-size:13.5px; font-weight:700; color: var(--ink-soft); cursor:pointer; margin-bottom:14px;
    transition: color .18s ease, gap .18s ease;
  }
  .back-link:hover{ color:var(--teal); gap:9px; }
  .back-link svg{ width:14px; height:14px; }
  .back-link svg path{ stroke:currentColor; }

  .page-title{ font-size: clamp(24px,3vw,32px); font-weight:800; letter-spacing:-0.01em; margin:0 0 6px; }
  .page-sub{ font-size:14.5px; color:var(--ink-soft); margin:0 0 30px; max-width: 62ch; }

  .card{ background:var(--card); border:1px solid var(--border); border-radius:18px; box-shadow:var(--shadow); padding: 24px 26px; }
  .card-title{ font-size:15.5px; font-weight:800; letter-spacing:-0.005em; margin:0 0 4px; }
  .card-link{ all:unset; font-size:13px; font-weight:700; color:var(--teal); cursor:pointer; display:inline-flex; align-items:center; gap:5px; }

  /* ---------- Overview ---------- */
  .overview-grid{ display:grid; grid-template-columns: 260px 1fr; gap:18px; margin-bottom:18px; }
  .pulse-card{ display:flex; flex-direction:column; text-align:left; }
  .pulse-title-row{ display:flex; align-items:center; gap:8px; margin-bottom:4px; }
  .pulse-live-dot{ width:7px; height:7px; border-radius:50%; background:var(--teal); box-shadow:0 0 0 4px rgba(19,116,89,0.14); flex-shrink:0; }
  .pulse-note{ font-size:13px; color:var(--ink-soft); margin:0 0 16px; }
  .pulse-list{ display:flex; flex-direction:column; gap:10px; }
  .pulse-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; background:var(--bg-cream-dim); border-radius:12px; }
  .pulse-hospital{ font-size:13.5px; font-weight:700; }
  .pulse-meta{ font-size:11.5px; color:var(--ink-soft); margin-top:1px; }
  .pulse-status{ flex-shrink:0; font-size:11px; font-weight:700; padding:4px 9px; border-radius:999px; }
  .pulse-status.ok{ background:#E4F3EC; color:var(--teal); }
  .pulse-status.low{ background:#FBF3E3; color:var(--amber); }

  .stat-row{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
  .stat-box{ background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:18px; }
  .stat-icon{ width:34px; height:34px; border-radius:10px; background:var(--bg-cream-dim); display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
  .stat-icon svg{ width:16px; height:16px; }
  .stat-icon svg path{ stroke:var(--teal); }
  .stat-icon.warn svg path{ stroke:var(--amber); }
  .stat-icon.crit svg path{ stroke:var(--red); }
  .stat-value{ font-size:22px; font-weight:800; letter-spacing:-0.01em; }
  .stat-caption{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }

  .overview-cols{ display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-bottom:18px; }
  .timeline{ display:flex; flex-direction:column; }
  .tl-item{ display:flex; gap:14px; padding: 13px 0; border-top:1px solid var(--border); }
  .tl-item:first-child{ border-top:none; padding-top:2px; }
  .tl-dot{ width:8px; height:8px; border-radius:50%; background:var(--teal); margin-top:5px; flex-shrink:0; }
  .tl-title{ font-size:14px; font-weight:600; }
  .tl-time{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink-soft); opacity:.7; margin-top:2px; }

  .ai-teaser{ background: var(--teal-deep); color:#F6F7EF; }
  .ai-teaser .card-title{ color:#F6F7EF; }
  .ai-teaser-sub{ font-size:13px; color:rgba(246,247,239,0.62); margin:0 0 16px; line-height:1.55; }
  .ai-teaser .pill-btn{ background:#fff; color:var(--teal-deep); }

  /* ---------- Chips / filters ---------- */
  .chip-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
  .chip{
    all:unset; box-sizing:border-box; font-size:13px; font-weight:600; padding:8px 15px; border-radius:999px;
    border:1.5px solid var(--border-strong); color:var(--ink-soft); cursor:pointer;
    transition: background .18s ease, color .18s ease, border-color .18s ease;
  }
  .chip.is-active{ background:var(--teal-deep); border-color:var(--teal-deep); color:#fff; }

  /* ---------- Queue / equipment rows (shared pattern) ---------- */
  .record-list{ display:flex; flex-direction:column; gap:10px; }
  .record-row{
    display:flex; align-items:center; gap:14px; background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:15px 18px; box-shadow:var(--shadow); position:relative; overflow:hidden; cursor:pointer; flex-wrap:wrap;
  }
  .record-row::before{ content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--border-strong); transition: background .2s ease; }
  .record-row[data-level="critical"]::before{ background:var(--red); }
  .record-row[data-level="urgent"]::before{ background:var(--amber); }
  .record-row[data-level="routine"]::before{ background:var(--teal); }
  .record-icon{ flex-shrink:0; width:38px; height:38px; border-radius:11px; background:var(--bg-cream-dim); display:flex; align-items:center; justify-content:center; font-size:17px; }
  .record-main{ flex:1; min-width:0; }
  .record-name{ font-size:14.5px; font-weight:700; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .record-meta{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }
  .record-side{ flex-shrink:0; display:flex; align-items:center; gap:10px; }
  .record-detail{ padding: 8px 6px 4px 52px; font-size:13.5px; color:var(--ink-soft); line-height:1.6; display:none; width:100%; }
  .record-row.is-open .record-detail{ display:block; }

  .badge{ font-family:'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--teal); background: rgba(19,116,89,0.10); padding: 3px 8px; border-radius: 999px; white-space:nowrap; }
  .badge.warn{ color:var(--amber); background:#FBF3E3; }
  .badge.crit{ color:#B23327; background:#FBEFEE; }

  .pill-btn{
    all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:7px;
    background: var(--teal-deep); color:#fff; font-weight:700; font-size:13.5px;
    padding: 10px 18px; border-radius: 999px; cursor:pointer;
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .pill-btn:hover{ transform: translateY(-1px); box-shadow: 0 8px 20px -6px rgba(0,0,0,0.28); }
  .pill-btn.ghost{ background:#fff; color:var(--ink); border: 1.5px solid var(--border-strong); }
  .pill-btn.sm{ padding:7px 14px; font-size:12.5px; }
  .pill-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

  .section-head-row{ display:flex; align-items:center; justify-content:space-between; margin: 28px 0 14px; flex-wrap:wrap; gap:12px; }
  .section-head-row:first-of-type{ margin-top:0; }
  .section-head-row h3{ font-size:15px; font-weight:800; margin:0; }

  /* ---------- Equipment: search + view toggle ---------- */
  .finder-row{ display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .finder-row .search-box{ max-width:none; flex:1; min-width:220px; }
  .view-toggle{ display:flex; background: var(--bg-cream-dim); border-radius: 12px; padding:3px; gap:2px; flex-shrink:0; }
  .view-btn{ all:unset; box-sizing:border-box; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:700; padding:9px 14px; border-radius:9px; color:var(--ink-soft); transition: background .18s ease, color .18s ease; }
  .view-btn[aria-pressed="true"]{ background:#fff; color:var(--ink); box-shadow: var(--shadow); }
  .view-btn svg{ width:13px; height:13px; }
  .equip-map{ display:none; height:320px; border-radius:16px; background:var(--bg-cream-dim); position:relative; overflow:hidden; border:1px solid var(--border); }
  .equip-map.is-visible{ display:block; }
  .map-grid{ position:absolute; inset:0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 32px 32px; opacity:.6; }
  .map-pin{ position:absolute; width:14px; height:14px; border-radius:50%; border:3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
  .map-pin.operational{ background: var(--teal); cursor:pointer; }
  .map-pin.maintenance{ background: var(--amber); cursor:not-allowed; }
  .map-pin::after{ content:""; position:absolute; inset:-6px; border-radius:50%; border:1.5px solid var(--teal); opacity:0; }
  .map-pin.operational::after{ animation: mapPulse 2.2s ease-out infinite; }
  @keyframes mapPulse{ 0%{ transform:scale(1); opacity:.5; } 100%{ transform:scale(2.4); opacity:0; } }
  .map-legend{ position:absolute; bottom:14px; left:14px; background:#fff; border:1px solid var(--border); border-radius:12px; padding:10px 14px; box-shadow: var(--shadow); display:flex; gap:14px; }
  .map-legend-item{ display:flex; align-items:center; gap:6px; font-size:11.5px; color:var(--ink-soft); }
  .map-legend-dot{ width:8px; height:8px; border-radius:50%; }

  /* ---------- AI Assist ---------- */
  .ai-panel{ background: var(--teal-deep); color:#F6F7EF; border-radius:20px; padding: 26px 28px; margin-bottom:20px; }
  .ai-panel-head{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
  .ai-badge{ flex-shrink:0; width:30px; height:30px; border-radius:9px; background:rgba(246,247,239,0.1); display:flex; align-items:center; justify-content:center; }
  .ai-panel-title{ font-size:17px; font-weight:800; margin:0; }
  .ai-panel-sub{ font-size:13.5px; color:rgba(246,247,239,0.6); margin:0 0 20px; max-width:64ch; }
  .ai-input-row{ display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .ai-input{ flex:1; min-width:220px; background: rgba(246,247,239,0.07); border:1px solid rgba(246,247,239,0.16); border-radius:12px; padding:12px 14px; color:#F6F7EF; font-size:14px; font-family:inherit; }
  .ai-input::placeholder{ color: rgba(246,247,239,0.4); }
  .ai-input:focus{ outline:2px solid var(--teal); outline-offset:1px; }
  .ai-go-btn{ all:unset; box-sizing:border-box; cursor:pointer; flex-shrink:0; background:#fff; color:var(--teal-deep); font-weight:700; font-size:13.5px; padding: 12px 20px; border-radius:12px; transition: transform .15s ease; }
  .ai-go-btn:hover{ transform: translateY(-1px); }
  .ai-result{ display:none; }
  .ai-result.is-visible{ display:block; animation: fadeIn .3s ease; }
  .ai-result-label{ font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color: rgba(246,247,239,0.5); margin-bottom:10px; }
  .ai-chip-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .ai-chip{ background: rgba(246,247,239,0.08); border:1px solid rgba(246,247,239,0.18); border-radius:999px; padding: 8px 14px; font-size:13px; display:flex; align-items:center; gap:8px; }
  .ai-chip strong{ font-weight:700; }
  .ai-chip .pct{ font-family:'JetBrains Mono', monospace; font-size:11px; color:#7fd9b9; }
  .ai-note{ font-size:13px; line-height:1.6; color:rgba(246,247,239,0.65); border-top:1px solid rgba(246,247,239,0.12); padding-top:14px; }
  .ai-note strong{ color:#F6F7EF; }
  .ai-empty{ font-size:13px; color:rgba(246,247,239,0.45); }

  /* ---------- Referral / SLA ring ---------- */
  .sla-wrap{ display:flex; align-items:center; gap:20px; background: var(--bg-cream-dim); border-radius:16px; padding:18px 20px; margin-bottom:20px; }
  .sla-ring{ position:relative; width:76px; height:76px; flex-shrink:0; }
  .sla-ring svg{ width:100%; height:100%; transform: rotate(-90deg); }
  .sla-ring-bg{ stroke: var(--border-strong); fill:none; stroke-width:5; }
  .sla-ring-progress{ stroke: var(--teal); fill:none; stroke-width:5; stroke-linecap:round; stroke-dasharray: 213.6; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear, stroke .3s ease; }
  .sla-ring-center{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:15px; }
  .sla-text-title{ font-size:14px; font-weight:700; margin:0 0 2px; }
  .sla-text-sub{ font-size:12.5px; color:var(--ink-soft); margin:0; }

  /* ---------- Modal ---------- */
  .modal-overlay{
    position:fixed; inset:0; background: rgba(12,40,36,0.55); display:flex; align-items:flex-start; justify-content:center;
    padding: 6vh 20px; opacity:0; visibility:hidden; transition: opacity .22s ease, visibility 0s linear .22s; z-index: 100; overflow-y:auto;
  }
  .modal-overlay.is-open{ opacity:1; visibility:visible; transition: opacity .22s ease, visibility 0s linear 0s; }
  .modal-panel{
    background:var(--card); border-radius:20px; box-shadow:var(--shadow); width:100%; max-width:460px; padding: 28px 26px 24px;
    transform: translateY(14px) scale(.98); transition: transform .28s cubic-bezier(.4,0,.2,1);
  }
  .modal-overlay.is-open .modal-panel{ transform: translateY(0) scale(1); }
  .modal-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
  .modal-title{ font-size:19px; font-weight:800; margin:0; }
  .modal-sub{ font-size:12.5px; color:var(--ink-soft); margin:4px 0 0; font-family:'JetBrains Mono',monospace; letter-spacing:.04em; text-transform:uppercase; }
  .modal-close{ all:unset; flex-shrink:0; width:30px; height:30px; border-radius:50%; border:1.5px solid var(--border-strong); display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .modal-close svg path{ stroke:var(--ink); }
  .ref-field{ margin-bottom:14px; }
  .ref-label{ font-size:12.5px; font-weight:600; color:var(--ink-soft); margin-bottom:6px; display:block; }
  .ref-value-box{ background: var(--bg-cream-dim); border-radius:12px; padding:12px 14px; font-size:14px; font-weight:600; }
  .ref-attach-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
  .ref-attach-chip{ display:flex; align-items:center; gap:6px; background: var(--bg-cream-dim); border:1px solid var(--border); border-radius:10px; padding:8px 12px; font-size:12.5px; font-weight:600; color:var(--ink-soft); }
  .ref-actions{ display:flex; gap:10px; flex-wrap:wrap; }
  .ref-actions .pill-btn{ flex:1; text-align:center; justify-content:center; min-width:140px; }

  /* ---------- ID card (doctor identity) ---------- */
  .id-card{
    background: linear-gradient(135deg, var(--teal-deep) 0%, #16453a 100%); color:#F6F7EF; border-radius:20px;
    padding: 26px 28px; position:relative; overflow:hidden; box-shadow: var(--shadow); margin-bottom:22px;
  }
  .id-card::after{ content:""; position:absolute; right:-40px; top:-40px; width:180px; height:180px; border-radius:50%; border:1px solid rgba(246,247,239,0.12); }
  .id-card-top{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom: 26px; }
  .id-brand{ display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; }
  .id-brand-mark{ width:22px; height:22px; border-radius:6px; background:var(--teal); display:flex; align-items:center; justify-content:center; }
  .id-brand-mark svg{ width:11px; height:11px; }
  .id-verified{ display:flex; align-items:center; gap:6px; background:rgba(246,247,239,0.1); border-radius:999px; padding:6px 12px; font-size:11.5px; font-weight:700; }
  .id-verified svg{ width:13px; height:13px; }
  .id-name{ font-size:20px; font-weight:800; letter-spacing:-0.01em; }
  .id-number{ font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:.06em; color: rgba(246,247,239,0.65); margin-top:4px; }
  .id-meta-row{ display:flex; gap:32px; margin-top:18px; flex-wrap:wrap; }
  .id-meta-label{ font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:rgba(246,247,239,0.45); margin-bottom:3px; }
  .id-meta-value{ font-size:13.5px; font-weight:700; }

  .profile-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
  .profile-field{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 16px; box-shadow:var(--shadow); }
  .profile-field-label{ font-size:11.5px; color:var(--ink-soft); margin-bottom:4px; }
  .profile-field-value{ font-size:14.5px; font-weight:700; }
  .profile-field.is-editing input{ width:100%; border:1.5px solid var(--teal); border-radius:8px; padding:6px 8px; font-size:14.5px; font-weight:700; font-family:inherit; color:var(--ink); }
  .profile-actions{ display:flex; gap:10px; margin-top:16px; }

  /* ---------- Toast ---------- */
  .toast{
    position:fixed; bottom:26px; left:50%; transform:translateX(-50%) translateY(20px);
    background:var(--teal-deep); color:#fff; font-size:13.5px; font-weight:600; padding:13px 22px; border-radius:999px;
    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.4); opacity:0; pointer-events:none; transition: opacity .25s ease, transform .25s ease; z-index:150;
    max-width: 88vw; text-align:center;
  }
  .toast.is-visible{ opacity:1; transform:translateX(-50%) translateY(0); }

  /* ---------- Logout screen ---------- */
  .logout-screen{ position:fixed; inset:0; background:var(--bg-cream); z-index:300; display:none; align-items:center; justify-content:center; text-align:center; padding:24px; }
  .logout-screen.is-open{ display:flex; }
  .logout-screen-inner{ max-width:340px; }
  .logout-mark{ width:72px; height:72px; border-radius:20px; background:var(--card); border:1px solid var(--border); box-shadow:var(--shadow); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; }
  .logout-title{ font-size:22px; font-weight:800; margin:0 0 10px; }
  .logout-sub{ font-size:14.5px; color:var(--ink-soft); margin:0 0 28px; line-height:1.6; }

  .view{ display:none; }
  .view.is-active{ display:block; animation: fadeIn .35s ease; }
  @keyframes fadeIn{ from{ opacity:0; transform:translateY(8px);} to{ opacity:1; transform:none;} }
  .empty-state{ text-align:center; padding: 40px 20px; color:var(--ink-soft); font-size:14px; }

  @media (max-width: 980px){
    .shell{ grid-template-columns: 1fr; }
    .sidebar{ position:relative; height:auto; flex-direction:row; align-items:center; padding:14px 16px; overflow-x:auto; }
    .sb-logo{ padding:0 14px 0 0; }
    .duty-switch-wrap{ display:none; }
    .sb-nav{ flex-direction:row; flex:none; }
    .sb-link span{ display:none; }
    .sb-quick span{ display:none; }
    .sb-quick{ margin-top:0; margin-left:8px; padding:10px 14px; }
    .sb-logout{ width:auto; margin-top:0; margin-left:4px; white-space:nowrap; }
    .sb-logout span{ display:none; }
    .sb-site-links{ display:none; }
    .main{ padding:24px 18px 60px; }
    .overview-grid, .overview-cols{ grid-template-columns:1fr; }
    .profile-grid{ grid-template-columns: 1fr 1fr; }
  }
  @media (prefers-reduced-motion: reduce){ *{ transition-duration:0.01ms !important; animation-duration:0.01ms !important; } }

  .ref-select, .ref-textarea, .ref-input{
    width:100%; background: var(--card); border:1px solid var(--border-strong); border-radius:12px;
    padding:11px 14px; font-size:14px; font-family:inherit; color:var(--ink); margin: 0 0 14px;
  }
  .ref-select:focus, .ref-textarea:focus, .ref-input:focus{ outline:none; border-color:var(--teal); }
  .ref-textarea{ resize:vertical; min-height:72px; }
  .ref-error{ color:var(--red); font-size:12.5px; font-weight:600; margin: -6px 0 12px; display:none; }
  .ref-error.is-visible{ display:block; }
  .ref-success{ color:var(--teal); font-size:12.5px; font-weight:600; margin: -6px 0 12px; display:none; }
  .ref-success.is-visible{ display:block; }
`;

const PAGE_HTML = `
<div class="shell">

  <!-- ===================== Sidebar ===================== -->
  <aside class="sidebar">
    <div class="sb-logo">
      <span class="sb-logo-mark"><svg viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span>
      MedConnect
    </div>

    <div class="duty-switch-wrap" id="dutySwitchWrap">
      <button class="duty-switch-btn" id="dutySwitchBtn">
        <div class="sb-avatar">AR</div>
        <div>
          <div class="sb-profile-name">Dr. Anjali Rao</div>
          <div class="sb-profile-sub"><span class="duty-dot" id="dutyDot"></span><span id="dutyLabel">On duty</span></div>
        </div>
        <svg class="duty-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="#F6F7EF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="duty-menu" id="dutyMenu"></div>
    </div>

    <ul class="sb-nav" id="sbNav">
      <li><button class="sb-link is-active" data-view="overview">
        <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.3"/><rect x="9" y="2" width="5" height="5" rx="1.3"/><rect x="2" y="9" width="5" height="5" rx="1.3"/><rect x="9" y="9" width="5" height="5" rx="1.3"/></svg>
        <span data-i18n="navOverview">Overview</span>
      </button></li>
      <li><button class="sb-link" data-view="queue">
        <svg viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H9" stroke-linecap="round"/></svg>
        <span data-i18n="navQueue">Live Queue</span>
        <span class="sb-link-badge" id="queueBadge">5</span>
      </button></li>
      <li><button class="sb-link" data-view="equipment">
        <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2"/><path d="M5 4V2.5M11 4V2.5" stroke-linecap="round"/></svg>
        <span data-i18n="navEquipment">Equipment Finder</span>
      </button></li>
      <li><button class="sb-link" data-view="ai">
        <svg viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.6 4.2L12.7 4.7L10.5 6.9L11 10L8 8.5L5 10L5.5 6.9L3.3 4.7L6.4 4.2L8 1.5Z"/></svg>
        <span data-i18n="navAi">AI Assist</span>
      </button></li>
      <li><button class="sb-link" data-view="referrals">
        <svg viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span data-i18n="navReferrals">Referrals</span>
      </button></li>
      <li><button class="sb-link" data-view="profile">
        <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.8"/><path d="M2.5 14C3.3 11 5.4 9.5 8 9.5C10.6 9.5 12.7 11 13.5 14"/></svg>
        <span data-i18n="navProfile">Profile</span>
      </button></li>
    </ul>

    <button class="sb-quick" id="sbQuickBtn">+ <span data-i18n="newReferral">New Referral</span></button>

    <button class="sb-logout" id="logoutBtn">
      <svg viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5C2.7 14 2 13.3 2 12.5V3.5C2 2.7 2.7 2 3.5 2H6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 11L14 8L10.5 5M14 8H6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span data-i18n="logout">Log out</span>
    </button>

    <div class="sb-site-links">
      <a href="medconnect-clinical-guidelines.html">Clinical Guidelines</a>
      <a href="medconnect-faq.html">FAQ</a>
      <a href="medconnect-emergency.html">Emergency Centre</a>
    </div>
  </aside>

  <!-- ===================== Main ===================== -->
  <main class="main">

    <div class="topbar">
      <div class="search-box">
        <svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#4B5B55" stroke-width="1.4"/><path d="M13 13L10.2 10.2" stroke="#4B5B55" stroke-width="1.4" stroke-linecap="round"/></svg>
        <input type="text" id="globalSearch" data-i18n-placeholder="searchPlaceholder" placeholder="Search patients, equipment, hospitals…">
      </div>
      <div class="topbar-right">
        <div class="lang-toggle">
          <button class="lang-btn is-active" id="langEn">EN</button>
          <button class="lang-btn" id="langHi">हिं</button>
        </div>
        <div class="notif-wrap" id="notifWrap">
          <button class="icon-btn" id="notifBellBtn" aria-label="Notifications">
            <svg viewBox="0 0 16 16" fill="none"><path d="M4 6.5C4 4 5.8 2.5 8 2.5C10.2 2.5 12 4 12 6.5C12 10 13.5 10.5 13.5 11.5H2.5C2.5 10.5 4 10 4 6.5Z" stroke-width="1.3" stroke-linejoin="round"/><path d="M6.5 13.5C6.8 14.1 7.4 14.5 8 14.5C8.6 14.5 9.2 14.1 9.5 13.5" stroke-width="1.3" stroke-linecap="round"/></svg>
            <span class="icon-dot"></span>
          </button>
          <div class="notif-panel" id="notifPanel">
            <div class="notif-head" data-i18n="notifHeader">Notifications</div>
            <div class="notif-item"><span class="notif-dot2 crit"></span><div><div class="notif-item-title" data-i18n="notif1">Critical referral — Ramesh Iyer needs confirmation</div><div class="notif-item-time" data-i18n="notifTime1">2 minutes ago</div></div></div>
            <div class="notif-item"><span class="notif-dot2"></span><div><div class="notif-item-title" data-i18n="notif2">MRI 3T back online at Apollo Bannerghatta</div><div class="notif-item-time" data-i18n="notifTime2">1 hour ago</div></div></div>
            <div class="notif-item"><span class="notif-dot2"></span><div><div class="notif-item-title" data-i18n="notif3">Fortis Whitefield accepted your referral</div><div class="notif-item-time" data-i18n="notifTime3">Yesterday</div></div></div>
          </div>
        </div>
        <div class="sb-avatar" style="width:36px;height:36px;font-size:13px;cursor:pointer;" id="topAvatar" title="Go to profile">AR</div>
      </div>
    </div>

    <!-- ============ OVERVIEW ============ -->
    <section class="view is-active" id="view-overview">
      <div class="eyebrow" data-i18n="navOverview">Overview</div>
      <h1 class="page-title" id="greetingTitle" data-i18n="greeting">Good morning, Dr. Rao.</h1>
      <p class="page-sub" data-i18n="overviewSub">Today's queue, nearby equipment status and referrals in flight — sorted by what needs you first.</p>

      <div class="stat-row" style="margin-bottom:18px;">
        <div class="stat-box">
          <div class="stat-icon"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke-width="1.4"/><path d="M2 6.5H14M5 1.5V4M11 1.5V4" stroke-width="1.4" stroke-linecap="round"/></svg></div>
          <div class="stat-value" id="statOpd">14</div>
          <div class="stat-caption" data-i18n="statOpd">Today's OPD</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon warn"><svg viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="stat-value" id="statPending">3</div>
          <div class="stat-caption" data-i18n="statPending">Pending referrals</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon crit"><svg viewBox="0 0 16 16" fill="none"><path d="M8 5V9" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11.3" r="0.9" fill="#E4483C"/><circle cx="8" cy="8" r="6" stroke-width="1.4"/></svg></div>
          <div class="stat-value" id="statCritical">1</div>
          <div class="stat-caption" data-i18n="statCritical">Critical in queue</div>
        </div>
      </div>

      <div class="overview-grid">
        <div class="card pulse-card">
          <div class="pulse-title-row"><span class="pulse-live-dot"></span><span class="card-title" data-i18n="networkPulse">Network pulse</span></div>
          <p class="pulse-note" data-i18n="networkPulseSub">Live status from hospitals in your referral network.</p>
          <div class="pulse-list" id="pulseList"></div>
        </div>

        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <div class="card-title" data-i18n="recentActivity">Recent activity</div>
          </div>
          <div class="timeline" id="activityTimeline"></div>
        </div>
      </div>

      <div class="overview-cols">
        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
            <div class="card-title" data-i18n="queuePreview">Needs your attention</div>
            <button class="card-link" data-goto="queue"><span data-i18n="viewAll">View all</span> →</button>
          </div>
          <div class="record-list" id="queuePreviewList"></div>
        </div>

        <div class="card ai-teaser">
          <div class="ai-panel-head" style="margin-bottom:6px;">
            <span class="ai-badge"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.6 4.2L12.7 4.7L10.5 6.9L11 10L8 8.5L5 10L5.5 6.9L3.3 4.7L6.4 4.2L8 1.5Z" fill="#F6F7EF"/></svg></span>
            <div class="card-title" data-i18n="aiTeaserTitle">AI Clinical Assist</div>
          </div>
          <p class="ai-teaser-sub" data-i18n="aiTeaserSub">Get a ranked differential and a one-line history summary before you walk in.</p>
          <button class="pill-btn" data-goto="ai"><span data-i18n="openAi">Open AI Assist</span> →</button>
        </div>
      </div>
    </section>

    <!-- ============ LIVE QUEUE ============ -->
    <section class="view" id="view-queue">
      <button class="back-link" data-back="true"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8L10 13" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navQueue">Live Queue</div>
      <h1 class="page-title" data-i18n="queueTitle">Sorted by urgency, not arrival time.</h1>
      <p class="page-sub" data-i18n="queueSub">Auto-sorted — critical cases route straight to a referral, everything else opens the case detail.</p>

      <div class="chip-row" id="queueFilter">
        <button class="chip is-active" data-filter="all" data-i18n="filterAll">All</button>
        <button class="chip" data-filter="critical" data-i18n="filterCritical">Critical</button>
        <button class="chip" data-filter="urgent" data-i18n="filterUrgent">Urgent</button>
        <button class="chip" data-filter="routine" data-i18n="filterRoutine">Routine</button>
      </div>

      <div class="record-list" id="queueFullList"></div>
    </section>

    <!-- ============ EQUIPMENT FINDER ============ -->
    <section class="view" id="view-equipment">
      <button class="back-link" data-back="true"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8L10 13" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navEquipment">Equipment Finder</div>
      <h1 class="page-title" data-i18n="equipTitle">Nearest working machine, not just listed.</h1>
      <p class="page-sub" data-i18n="equipSub">Search a machine — see what's actually operational right now.</p>

      <div class="finder-row">
        <div class="search-box">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#4B5B55" stroke-width="1.4"/><path d="M13 13L10.2 10.2" stroke="#4B5B55" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input type="text" id="equipSearch" data-i18n-placeholder="equipSearchPlaceholder" placeholder="MRI 3T, Dialysis, ECMO, Cath Lab…" value="MRI 3T">
        </div>
        <div class="view-toggle" id="equipViewToggle">
          <button class="view-btn" data-view="list" aria-pressed="true">
            <svg viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H14" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span data-i18n="listView">List</span>
          </button>
          <button class="view-btn" data-view="map" aria-pressed="false">
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 14C8 14 13 9.5 13 6.2C13 3.3 10.8 1.5 8 1.5C5.2 1.5 3 3.3 3 6.2C3 9.5 8 14 8 14Z" stroke-width="1.5"/><circle cx="8" cy="6" r="1.8" stroke-width="1.5"/></svg>
            <span data-i18n="mapView">Map</span>
          </button>
        </div>
      </div>

      <div class="record-list" id="equipListView"></div>

      <div class="equip-map" id="equipMapView">
        <div class="map-grid"></div>
        <div id="mapPins"></div>
        <div class="map-legend">
          <div class="map-legend-item"><span class="map-legend-dot" style="background:var(--teal)"></span><span data-i18n="operational">Operational</span></div>
          <div class="map-legend-item"><span class="map-legend-dot" style="background:var(--amber)"></span><span data-i18n="maintenance">Maintenance</span></div>
        </div>
      </div>
    </section>

    <!-- ============ AI ASSIST ============ -->
    <section class="view" id="view-ai">
      <button class="back-link" data-back="true"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8L10 13" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navAi">AI Assist</div>
      <h1 class="page-title" data-i18n="aiTitle">A second opinion before you form the first.</h1>
      <p class="page-sub" data-i18n="aiSub">Enter symptoms or vitals for a ranked differential and a summary of recent reports. Suggestions only — the diagnosis is always yours.</p>

      <div class="ai-panel" style="margin-bottom:0;">
        <div class="ai-input-row">
          <input class="ai-input" id="aiSymptomInput" type="text" data-i18n-placeholder="aiInputPlaceholder" placeholder="e.g. chest pain, shortness of breath, sweating" value="Chest pain, shortness of breath, radiating to left arm">
          <button class="ai-go-btn" id="aiGoBtn" data-i18n="analyse">Analyse</button>
        </div>
        <div class="ai-result" id="aiResult">
          <div class="ai-result-label" data-i18n="differentialLabel">Ranked differential — for review</div>
          <div class="ai-chip-row" id="aiChipRow"></div>
          <p class="ai-note" id="aiNote"></p>
        </div>
        <p class="ai-empty" id="aiEmpty" data-i18n="aiEmptyState">Results will appear here once you run an analysis.</p>
      </div>
    </section>

    <!-- ============ REFERRALS ============ -->
    <section class="view" id="view-referrals">
      <button class="back-link" data-back="true"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8L10 13" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navReferrals">Referrals</div>
      <h1 class="page-title" data-i18n="referralsTitle">Every referral, one glance.</h1>
      <p class="page-sub" data-i18n="referralsSub">Track SLA timers, hospital responses and reroutes — all from here.</p>

      <div class="chip-row" id="referralFilter">
        <button class="chip is-active" data-filter="all" data-i18n="filterAll">All</button>
        <button class="chip" data-filter="pending" data-i18n="filterPending">Pending</button>
        <button class="chip" data-filter="accepted" data-i18n="filterAccepted">Accepted</button>
        <button class="chip" data-filter="rerouted" data-i18n="filterRerouted">Rerouted</button>
      </div>

      <div class="record-list" id="referralList"></div>
    </section>

    <!-- ============ PROFILE ============ -->
    <section class="view" id="view-profile">
      <button class="back-link" data-back="true"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8L10 13" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navProfile">Profile</div>
      <h1 class="page-title" data-i18n="profileTitle">Your verified practice ID.</h1>
      <p class="page-sub" data-i18n="profileSub">Shown to patients and hospitals across the MedConnect network.</p>

      <div class="id-card">
        <div class="id-card-top">
          <div class="id-brand">
            <span class="id-brand-mark"><svg viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span>
            MedConnect
          </div>
          <div class="id-verified">
            <svg viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.6 4.2L12.7 4.7L10.5 6.9L11 10L8 8.5L5 10L5.5 6.9L3.3 4.7L6.4 4.2L8 1.5Z" fill="#F6F7EF"/></svg>
            <span data-i18n="nmcVerified">NMC Verified</span>
          </div>
        </div>
        <div class="id-name">Dr. Anjali Rao</div>
        <div class="id-number">#DOC-4471</div>
        <div class="id-meta-row">
          <div>
            <div class="id-meta-label" data-i18n="specialty">Specialty</div>
            <div class="id-meta-value" data-i18n="specCardio">Cardiologist</div>
          </div>
          <div>
            <div class="id-meta-label" data-i18n="hospital">Hospital</div>
            <div class="id-meta-value">Fortis Whitefield</div>
          </div>
          <div>
            <div class="id-meta-label" data-i18n="experience">Experience</div>
            <div class="id-meta-value">11 yrs</div>
          </div>
        </div>
      </div>

      <div class="section-head-row">
        <h3 data-i18n="personalDetails">Personal details</h3>
        <button class="pill-btn ghost sm" id="editProfileBtn" data-i18n="editDetails">Edit details</button>
      </div>
      <div class="profile-grid" id="profileGrid">
        <div class="profile-field"><div class="profile-field-label" data-i18n="phone">Phone</div><div class="profile-field-value">+91 98450 12233</div></div>
        <div class="profile-field"><div class="profile-field-label" data-i18n="email">Email</div><div class="profile-field-value">anjali.rao@fortis.example</div></div>
        <div class="profile-field"><div class="profile-field-label" data-i18n="department">Department</div><div class="profile-field-value">Cardiology, 3rd Floor</div></div>
        <div class="profile-field"><div class="profile-field-label" data-i18n="licenseNo">NMC License No.</div><div class="profile-field-value">NMC-KA-22841</div></div>
      </div>
    </section>

  </main>
</div>

<!-- ============ Contact Hospital modal (replaces the old 1-click referral SLA flow) ============ -->
<div class="modal-overlay" id="refOverlay" aria-hidden="true">
  <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="refTitle">
    <div class="modal-head">
      <div>
        <div class="modal-sub">Contact Hospital</div>
        <h3 class="modal-title" id="refTitle">Send a request</h3>
      </div>
      <button class="modal-close" id="refCloseBtn" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div class="ref-field">
      <span class="ref-label" data-i18n="patient">Patient</span>
      <div class="ref-value-box" id="refPatientBox">Ramesh Iyer</div>
    </div>

    <span class="ref-label">Hospital</span>
    <select class="ref-select" id="refHospitalSelect"></select>

    <span class="ref-label">Message</span>
    <textarea class="ref-textarea" id="refMessageInput" placeholder="Describe what you need from this hospital"></textarea>

    <span class="ref-label">Callback number (optional)</span>
    <input class="ref-input" type="tel" id="refContactInput" placeholder="+91 98765 43210">

    <div class="ref-error" id="refError">Please choose a hospital and add a short message.</div>
    <div class="ref-success" id="refSuccess">Request sent to the hospital.</div>

    <div class="ref-actions">
      <button class="pill-btn ghost" id="refCancelBtn" type="button">Cancel</button>
      <button class="pill-btn" id="refSendBtn" type="button">Send request</button>
    </div>
  </div>
</div>

<!-- ============ Logout screen ============ -->
<div class="logout-screen" id="logoutScreen">
  <div class="logout-screen-inner">
    <div class="logout-mark">
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5C2.7 14 2 13.3 2 12.5V3.5C2 2.7 2.7 2 3.5 2H6" stroke="#137459" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 11L14 8L10.5 5M14 8H6" stroke="#137459" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h2 class="logout-title" data-i18n="loggedOutTitle">You've been logged out.</h2>
    <p class="logout-sub" data-i18n="loggedOutSub">Your session on this device has ended. Sign back in anytime to see your queue, referrals and equipment status.</p>
    <button class="pill-btn" id="loginAgainBtn" data-i18n="loginAgain">Log back in</button>
  </div>
</div>

<div class="toast" id="toast"></div>
`;

export default function DoctorDashboardPage() {
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    /* =====================================================================
       I18N
    ===================================================================== */
    let currentLang = 'en';
    const I18N = {
      en: {
        navOverview:"Overview", navQueue:"Live Queue", navEquipment:"Equipment Finder", navAi:"AI Assist", navReferrals:"Referrals", navProfile:"Profile",
        newReferral:"New Referral", logout:"Log out", back:"Back",
        searchPlaceholder:"Search patients, equipment, hospitals…",
        notifHeader:"Notifications",
        notif1:"Critical referral — Ramesh Iyer needs confirmation", notifTime1:"2 minutes ago",
        notif2:"MRI 3T back online at Apollo Bannerghatta", notifTime2:"1 hour ago",
        notif3:"Fortis Whitefield accepted your referral", notifTime3:"Yesterday",
        greeting:"Good morning, Dr. Rao.",
        overviewSub:"Today's queue, nearby equipment status and referrals in flight — sorted by what needs you first.",
        statOpd:"Today's OPD", statPending:"Pending referrals", statCritical:"Critical in queue",
        networkPulse:"Network pulse", networkPulseSub:"Live status from hospitals in your referral network.",
        goodStatus:"Good", lowStatus:"Low availability",
        recentActivity:"Recent activity", queuePreview:"Needs your attention", viewAll:"View all",
        aiTeaserTitle:"AI Clinical Assist", aiTeaserSub:"Get a ranked differential and a one-line history summary before you walk in.", openAi:"Open AI Assist",
        queueTitle:"Sorted by urgency, not arrival time.", queueSub:"Auto-sorted — critical cases route straight to a referral, everything else opens the case detail.",
        filterAll:"All", filterCritical:"Critical", filterUrgent:"Urgent", filterRoutine:"Routine",
        filterPending:"Pending", filterAccepted:"Accepted", filterRerouted:"Rerouted",
        equipTitle:"Nearest working machine, not just listed.", equipSub:"Search a machine — see what's actually operational right now.",
        equipSearchPlaceholder:"MRI 3T, Dialysis, ECMO, Cath Lab…", listView:"List", mapView:"Map",
        operational:"Operational", maintenance:"Maintenance",
        aiTitle:"A second opinion before you form the first.",
        aiSub:"Enter symptoms or vitals for a ranked differential and a summary of recent reports. Suggestions only — the diagnosis is always yours.",
        aiInputPlaceholder:"e.g. chest pain, shortness of breath, sweating", analyse:"Analyse",
        differentialLabel:"Ranked differential — for review", aiEmptyState:"Results will appear here once you run an analysis.",
        referralsTitle:"Every referral, one glance.", referralsSub:"Track SLA timers, hospital responses and reroutes — all from here.",
        profileTitle:"Your verified practice ID.", profileSub:"Shown to patients and hospitals across the MedConnect network.",
        nmcVerified:"NMC Verified", specialty:"Specialty", specCardio:"Cardiologist", hospital:"Hospital", experience:"Experience",
        personalDetails:"Personal details", editDetails:"Edit details", saveChanges:"Save changes",
        phone:"Phone", email:"Email", department:"Department", licenseNo:"NMC License No.",
        oneClickReferral:"1-Click Referral", slaWaiting:"Waiting on hospital confirmation", slaSub:"Auto-reroutes to the next nearest hospital if no response.",
        patient:"Patient", equipRequired:"Equipment required", labReport:"Lab report", xrayScan:"X-Ray scan", consultNotes:"Consult notes",
        callSpecialist:"Call on-duty specialist", cancelReferral:"Cancel referral",
        loggedOutTitle:"You've been logged out.", loggedOutSub:"Your session on this device has ended. Sign back in anytime to see your queue, referrals and equipment status.", loginAgain:"Log back in",
        dutyOn:"On duty", dutySurgery:"In surgery", dutyOff:"Off duty",
        history:"History", referNow:"Refer now", openCase:"Open case", refer:"Refer",
        slaRerouting:"No response — auto-rerouting", slaReroutingSub:"Sending to the next nearest available hospital.",
        connectingSpecialist:"Connecting to on-duty specialist…", quickSync:"Quick sync before the patient is shifted.",
        noResultsCategory:"No patients in this category right now.", noReferralsCategory:"No referrals in this category yet.",
        welcomeBack:"Welcome back", profileUpdated:"Profile updated", dutyChanged:"Status set to",
        quickReferralToast:"Pick a patient from the queue to start a referral", markSeen:"Notifications marked as read",
        reportSummaryLabel:"Report summary:", reportSummaryText:"Last ECG (18 Jul) showed mild ST depression; lipid profile from 30 Jun flagged elevated LDL. No prior cardiac admission on record."
      },
      hi: {
        navOverview:"सारांश", navQueue:"लाइव कतार", navEquipment:"उपकरण खोजें", navAi:"एआई सहायता", navReferrals:"रेफरल", navProfile:"प्रोफाइल",
        newReferral:"नया रेफरल", logout:"लॉग आउट", back:"वापस",
        searchPlaceholder:"मरीज़, उपकरण, अस्पताल खोजें…",
        notifHeader:"सूचनाएं",
        notif1:"गंभीर रेफरल — रमेश अय्यर को पुष्टि चाहिए", notifTime1:"2 मिनट पहले",
        notif2:"MRI 3T फिर से चालू — अपोलो बन्नेरघट्टा", notifTime2:"1 घंटा पहले",
        notif3:"फोर्टिस व्हाइटफील्ड ने आपका रेफरल स्वीकार किया", notifTime3:"कल",
        greeting:"सुप्रभात, डॉ. राव।",
        overviewSub:"आज की कतार, नज़दीकी उपकरण स्थिति और चल रहे रेफरल — सबसे ज़रूरी पहले।",
        statOpd:"आज का OPD", statPending:"लंबित रेफरल", statCritical:"कतार में गंभीर मामले",
        networkPulse:"नेटवर्क स्थिति", networkPulseSub:"आपके रेफरल नेटवर्क के अस्पतालों की लाइव स्थिति।",
        goodStatus:"ठीक", lowStatus:"कम उपलब्धता",
        recentActivity:"हाल की गतिविधि", queuePreview:"तुरंत ध्यान चाहिए", viewAll:"सभी देखें",
        aiTeaserTitle:"एआई क्लिनिकल असिस्ट", aiTeaserSub:"मरीज़ के पास जाने से पहले संभावित निदान और इतिहास का सारांश पाएं।", openAi:"एआई असिस्ट खोलें",
        queueTitle:"आगमन नहीं, गंभीरता के अनुसार क्रमबद्ध।", queueSub:"अपने आप क्रमबद्ध — गंभीर मामले सीधे रेफरल पर जाते हैं, बाकी केस विवरण खोलते हैं।",
        filterAll:"सभी", filterCritical:"गंभीर", filterUrgent:"तत्काल", filterRoutine:"नियमित",
        filterPending:"लंबित", filterAccepted:"स्वीकृत", filterRerouted:"पुनर्निर्देशित",
        equipTitle:"नज़दीकी चालू मशीन, सिर्फ सूचीबद्ध नहीं।", equipSub:"मशीन खोजें — देखें कि अभी वास्तव में क्या चालू है।",
        equipSearchPlaceholder:"MRI 3T, डायलिसिस, ECMO, कैथ लैब…", listView:"सूची", mapView:"मानचित्र",
        operational:"चालू", maintenance:"रखरखाव में",
        aiTitle:"पहली राय बनाने से पहले, दूसरी राय।",
        aiSub:"लक्षण या वाइटल्स दर्ज करें — संभावित निदान और हाल की रिपोर्ट्स का सारांश पाएं। यह केवल सुझाव है — अंतिम निदान हमेशा आपका ही होगा।",
        aiInputPlaceholder:"जैसे: सीने में दर्द, सांस फूलना, पसीना आना", analyse:"विश्लेषण करें",
        differentialLabel:"संभावित निदान — समीक्षा हेतु", aiEmptyState:"विश्लेषण चलाने के बाद परिणाम यहां दिखेंगे।",
        referralsTitle:"हर रेफरल, एक नज़र में।", referralsSub:"SLA टाइमर, अस्पताल के जवाब और पुनर्निर्देशन — सब यहीं से ट्रैक करें।",
        profileTitle:"आपकी सत्यापित प्रैक्टिस आईडी।", profileSub:"MedConnect नेटवर्क में मरीज़ों और अस्पतालों को दिखाई जाती है।",
        nmcVerified:"NMC सत्यापित", specialty:"विशेषज्ञता", specCardio:"कार्डियोलॉजिस्ट", hospital:"अस्पताल", experience:"अनुभव",
        personalDetails:"व्यक्तिगत विवरण", editDetails:"विवरण संपादित करें", saveChanges:"बदलाव सहेजें",
        phone:"फोन", email:"ईमेल", department:"विभाग", licenseNo:"NMC लाइसेंस नंबर",
        oneClickReferral:"1-क्लिक रेफरल", slaWaiting:"अस्पताल की पुष्टि का इंतज़ार", slaSub:"जवाब न मिलने पर अगले नज़दीकी अस्पताल को अपने आप भेजा जाएगा।",
        patient:"मरीज़", equipRequired:"ज़रूरी उपकरण", labReport:"लैब रिपोर्ट", xrayScan:"एक्स-रे स्कैन", consultNotes:"परामर्श नोट्स",
        callSpecialist:"ऑन-ड्यूटी विशेषज्ञ को कॉल करें", cancelReferral:"रेफरल रद्द करें",
        loggedOutTitle:"आप लॉग आउट हो गए हैं।", loggedOutSub:"इस डिवाइस पर आपका सत्र समाप्त हो गया है। कतार, रेफरल और उपकरण स्थिति देखने के लिए कभी भी वापस लॉगिन करें।", loginAgain:"वापस लॉग इन करें",
        dutyOn:"ड्यूटी पर", dutySurgery:"सर्जरी में", dutyOff:"ड्यूटी पर नहीं",
        history:"इतिहास", referNow:"अभी रेफर करें", openCase:"केस खोलें", refer:"रेफर करें",
        slaRerouting:"कोई जवाब नहीं — अपने आप पुनर्निर्देशित हो रहा है", slaReroutingSub:"अगले नज़दीकी उपलब्ध अस्पताल को भेजा जा रहा है।",
        connectingSpecialist:"ऑन-ड्यूटी विशेषज्ञ से जोड़ा जा रहा है…", quickSync:"मरीज़ को शिफ्ट करने से पहले त्वरित चर्चा।",
        noResultsCategory:"अभी इस श्रेणी में कोई मरीज़ नहीं है।", noReferralsCategory:"अभी इस श्रेणी में कोई रेफरल नहीं है।",
        welcomeBack:"वापसी पर स्वागत है", profileUpdated:"प्रोफ़ाइल अपडेट हो गई", dutyChanged:"स्थिति सेट की गई:",
        quickReferralToast:"रेफरल शुरू करने के लिए कतार से एक मरीज़ चुनें", markSeen:"सूचनाएं पढ़ी गई मानी गईं",
        reportSummaryLabel:"रिपोर्ट सारांश:", reportSummaryText:"पिछला ECG (18 जुलाई) में हल्का ST डिप्रेशन दिखा; 30 जून के लिपिड पैनल में LDL बढ़ा हुआ पाया गया। पहले कोई कार्डियक एडमिशन दर्ज नहीं है।"
      }
    };
    function t(key){ return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en[key] || key); }

    /* =====================================================================
       MOCK DATA
    ===================================================================== */
    const DUTY_STATES = [
      { key:"on", labelKey:"dutyOn" },
      { key:"surgery", labelKey:"dutySurgery" },
      { key:"off", labelKey:"dutyOff" }
    ];
    let currentDuty = DUTY_STATES[0];

    const PULSE = [
      { hospital:"Fortis Whitefield", meta:"MRI 3T · Cath Lab", status:"ok" },
      { hospital:"Manipal Old Airport Rd", meta:"2 ICU beds free", status:"low" },
      { hospital:"Apollo Bannerghatta", meta:"ECMO · Dialysis", status:"ok" }
    ];

    const ACTIVITY = [
      { title:"Fortis Whitefield accepted your referral", time:"Yesterday" },
      { title:"MRI 3T back online at Apollo Bannerghatta", time:"1 hour ago" },
      { title:"Referred Ramesh Iyer to Fortis Whitefield", time:"2 minutes ago" }
    ];

    const QUEUE = [
      { id:"q1", level:"critical", name:"Ramesh Iyer", meta:"58M · Chest pain, breathlessness · #MC-88219",
        history:"Last ECG (18 Jul) showed mild ST depression. Elevated LDL on 30 Jun lipid panel. No prior cardiac admission on record." },
      { id:"q2", level:"urgent", name:"Fatima Sheikh", meta:"34F · Post-op review · Room 4",
        history:"Laparoscopic appendectomy on 12 Aug, day-3 post-op review. Vitals stable, wound healing on track, no fever in last 24h." },
      { id:"q3", level:"urgent", name:"Karan Mehta", meta:"27M · Fracture follow-up · OPD Token #9",
        history:"Distal radius fracture, cast applied 3 weeks ago. Due for X-ray to confirm union before cast removal." },
      { id:"q4", level:"routine", name:"Sunita Deshpande", meta:"61F · Routine lipid recheck · #MC-77031",
        history:"On statin therapy since March. Last panel showed LDL trending down. Routine 3-month recheck, no new symptoms reported." },
      { id:"q5", level:"routine", name:"Arjun Nair", meta:"45M · Annual checkup · OPD Token #14",
        history:"No chronic conditions on file. Due for annual bloodwork and BP check. Last visit 14 months ago." }
    ];

    const EQUIPMENT = [
      { name:"MRI 3T", hospital:"Fortis Whitefield", status:"operational", distance:"1.8 km" },
      { name:"MRI 3T", hospital:"Manipal Old Airport Rd", status:"operational", distance:"3.4 km" },
      { name:"MRI 3T", hospital:"Apollo Bannerghatta", status:"maintenance", distance:"5.1 km" },
      { name:"MRI 3T", hospital:"Columbia Asia Hebbal", status:"operational", distance:"6.7 km" }
    ];

    const REFERRALS = [
      { id:"r1", patient:"Ramesh Iyer", hospital:"Fortis Whitefield", status:"pending", equip:"MRI 3T", when:"2 minutes ago" },
      { id:"r2", patient:"Meena Kulkarni", hospital:"Manipal Old Airport Rd", status:"accepted", equip:"Dialysis", when:"Yesterday" },
      { id:"r3", patient:"Vikram Shah", hospital:"Apollo Bannerghatta", status:"rerouted", equip:"Cath Lab", when:"2 days ago" }
    ];

    const DIAGNOSES = [
      { name:"Acute Coronary Syndrome", pct:"High likelihood" },
      { name:"Unstable Angina", pct:"Consider" },
      { name:"Costochondritis", pct:"Low likelihood" }
    ];

    function toast(msg){
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('is-visible');
      clearTimeout(toast._tm);
      toast._tm = setTimeout(()=> el.classList.remove('is-visible'), 2800);
    }

    /* =====================================================================
       VIEW ROUTER
    ===================================================================== */
    let currentView = 'overview';
    function showView(id, fromHistory){
      const target = document.getElementById('view-'+id);
      if(!target) return;
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('is-active'));
      target.classList.add('is-active');
      document.querySelectorAll('.sb-link').forEach(l=>l.classList.toggle('is-active', l.dataset.view===id));
      currentView = id;
      window.scrollTo({top:0});
      if(!fromHistory){
        try{ history.pushState({view:id}, '', '#'+id); }catch(err){}
      }
    }
    window.addEventListener('popstate', (e)=>{
      const id = (e.state && e.state.view) || 'overview';
      showView(id, true);
    });
    try{ history.replaceState({view:'overview'}, '', '#overview'); }catch(err){}

    function goBack(){
      if(window.history.length > 1){ history.back(); }
      else{ showView('overview'); }
    }
    document.querySelectorAll('.sb-link').forEach(btn=>{
      btn.addEventListener('click', ()=> showView(btn.dataset.view));
    });
    document.querySelectorAll('[data-goto]').forEach(a=>{
      a.addEventListener('click', ()=> showView(a.dataset.goto));
    });
    document.querySelectorAll('[data-back]').forEach(b=>{
      b.addEventListener('click', goBack);
    });

    /* =====================================================================
       Duty switcher
    ===================================================================== */
    (function(){
      const wrap = document.getElementById('dutySwitchWrap');
      const btn = document.getElementById('dutySwitchBtn');
      const menu = document.getElementById('dutyMenu');
      const dot = document.getElementById('dutyDot');
      const label = document.getElementById('dutyLabel');

      function dotColorFor(key){ return key === 'off' ? '#F6F7EF80' : (key === 'surgery' ? '#C98A1A' : '#7fd9b9'); }

      function renderMenu(){
        menu.innerHTML = '';
        DUTY_STATES.forEach(d=>{
          const opt = document.createElement('button');
          opt.className = 'duty-option';
          opt.innerHTML = `<span class="duty-option-dot" style="background:${dotColorFor(d.key)}"></span><span class="duty-option-label">${t(d.labelKey)}</span>`;
          opt.addEventListener('click', ()=>{ setDuty(d); wrap.classList.remove('is-open'); });
          menu.appendChild(opt);
        });
      }
      function setDuty(d){
        currentDuty = d;
        label.textContent = t(d.labelKey);
        dot.classList.toggle('off', d.key === 'off');
        toast(t('dutyChanged') + ' ' + t(d.labelKey));
      }
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('is-open'); });
      document.addEventListener('click', (e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove('is-open'); });
      renderMenu();
      window._renderDutyMenu = renderMenu;
      window._applyDutyLabel = ()=> { label.textContent = t(currentDuty.labelKey); };
    })();

    /* =====================================================================
       Overview render
    ===================================================================== */
    function renderPulse(){
      const host = document.getElementById('pulseList');
      host.innerHTML = '';
      PULSE.forEach(p=>{
        const el = document.createElement('div');
        el.className = 'pulse-row';
        el.innerHTML = `
          <span><span class="pulse-hospital">${p.hospital}</span><div class="pulse-meta">${p.meta}</div></span>
          <span class="pulse-status ${p.status}">${p.status==='ok' ? t('goodStatus') : t('lowStatus')}</span>
        `;
        host.appendChild(el);
      });
    }
    function renderActivity(){
      const host = document.getElementById('activityTimeline');
      host.innerHTML = '';
      ACTIVITY.forEach(a=>{
        const el = document.createElement('div');
        el.className = 'tl-item';
        el.innerHTML = `<span class="tl-dot"></span><div><div class="tl-title">${a.title}</div><div class="tl-time">${a.time}</div></div>`;
        host.appendChild(el);
      });
    }
    function renderQueuePreview(){
      const host = document.getElementById('queuePreviewList');
      host.innerHTML = '';
      const top = QUEUE.filter(q=>q.level!=='routine').slice(0,3);
      top.forEach(q=>{
        const el = document.createElement('div');
        el.className = 'record-row';
        el.dataset.level = q.level;
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <span class="record-icon">🩺</span>
          <span class="record-main">
            <span class="record-name">${q.name} <span class="badge ${q.level==='critical'?'crit':'warn'}">${t(q.level==='critical'?'filterCritical':'filterUrgent')}</span></span>
            <div class="record-meta">${q.meta}</div>
          </span>
        `;
        el.addEventListener('click', ()=> showView('queue'));
        host.appendChild(el);
      });
    }
    function updateStatBadges(){
      document.getElementById('queueBadge').textContent = String(QUEUE.length);
      document.getElementById('statCritical').textContent = String(QUEUE.filter(q=>q.level==='critical').length);
      document.getElementById('statPending').textContent = String(REFERRALS.filter(r=>r.status==='pending').length + 2);
    }

    /* =====================================================================
       Live queue (full view)
    ===================================================================== */
    function renderQueueFull(filter){
      filter = filter || 'all';
      const host = document.getElementById('queueFullList');
      host.innerHTML = '';
      const filtered = filter === 'all' ? QUEUE : QUEUE.filter(q => q.level === filter);

      if(filtered.length === 0){
        host.innerHTML = `<div class="empty-state">${t('noResultsCategory')}</div>`;
        return;
      }

      filtered.forEach(q=>{
        const el = document.createElement('div');
        el.className = 'record-row';
        el.dataset.level = q.level;
        const actionKey = q.level === 'critical' ? 'referNow' : 'openCase';
        const badgeClass = q.level === 'critical' ? 'crit' : (q.level === 'urgent' ? 'warn' : '');
        el.innerHTML = `
          <span class="record-icon">🩺</span>
          <span class="record-main">
            <span class="record-name">${q.name} <span class="badge ${badgeClass}">${t('filter'+q.level.charAt(0).toUpperCase()+q.level.slice(1))}</span></span>
            <div class="record-meta">${q.meta}</div>
          </span>
          <span class="record-side">
            <button class="pill-btn ghost sm" data-role="history">${t('history')}</button>
            <button class="pill-btn sm" data-role="action">${t(actionKey)}</button>
          </span>
          <div class="record-detail"><strong>${t('history')}:</strong> ${q.history}</div>
        `;
        host.appendChild(el);

        const historyBtn = el.querySelector('[data-role="history"]');
        const actionBtn = el.querySelector('[data-role="action"]');
        historyBtn.addEventListener('click', (e)=>{ e.stopPropagation(); el.classList.toggle('is-open'); });
        actionBtn.addEventListener('click', (e)=>{
          e.stopPropagation();
          if(q.level === 'critical'){ openReferral(q.name); }
          else{ el.classList.toggle('is-open'); }
        });
      });
    }
    document.querySelectorAll('#queueFilter .chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        document.querySelectorAll('#queueFilter .chip').forEach(c=>c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderQueueFull(chip.dataset.filter);
      });
    });

    /* =====================================================================
       Equipment finder
    ===================================================================== */
    function renderEquipList(){
      const host = document.getElementById('equipListView');
      host.innerHTML = '';
      EQUIPMENT.forEach(e=>{
        const el = document.createElement('div');
        el.className = 'record-row';
        el.innerHTML = `
          <span class="record-icon">🖥️</span>
          <span class="record-main">
            <span class="record-name">${e.name} <span class="badge ${e.status==='operational' ? '' : 'warn'}">${e.status==='operational' ? t('operational') : t('maintenance')}</span></span>
            <div class="record-meta">${e.hospital} · ${e.distance}</div>
          </span>
          <span class="record-side">
            <button class="pill-btn sm" data-hospital="${e.hospital}" ${e.status!=='operational' ? 'disabled' : ''}>${t('refer')}</button>
          </span>
        `;
        const btn = el.querySelector('button');
        if(e.status === 'operational'){
          btn.addEventListener('click', (ev)=>{ ev.stopPropagation(); openReferral('Ramesh Iyer', e.hospital); });
        }
        host.appendChild(el);
      });
    }
    function renderEquipMap(){
      const host = document.getElementById('mapPins');
      host.innerHTML = '';
      const positions = [ [22,30], [48,55], [70,22], [35,72] ];
      EQUIPMENT.forEach((e,i)=>{
        const pin = document.createElement('div');
        pin.className = 'map-pin ' + e.status;
        pin.style.left = positions[i][0] + '%';
        pin.style.top = positions[i][1] + '%';
        pin.title = `${e.hospital} — ${e.status==='operational' ? t('operational') : t('maintenance')}`;
        if(e.status === 'operational'){
          pin.addEventListener('click', ()=> openReferral('Ramesh Iyer', e.hospital));
        }
        host.appendChild(pin);
      });
    }
    const equipListView = document.getElementById('equipListView');
    const equipMapView = document.getElementById('equipMapView');
    document.querySelectorAll('#equipViewToggle .view-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('#equipViewToggle .view-btn').forEach(b=>b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        const isMap = btn.dataset.view === 'map';
        equipListView.style.display = isMap ? 'none' : 'flex';
        equipMapView.classList.toggle('is-visible', isMap);
      });
    });
    document.getElementById('equipSearch').addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('#equipListView .record-row').forEach(row=>{
        row.style.display = (!q || row.textContent.toLowerCase().includes(q)) ? '' : 'none';
      });
    });

    /* =====================================================================
       AI Assist
    ===================================================================== */
    function renderAiResult(){
      const chipRow = document.getElementById('aiChipRow');
      chipRow.innerHTML = '';
      DIAGNOSES.forEach(d=>{
        const chip = document.createElement('span');
        chip.className = 'ai-chip';
        chip.innerHTML = `<strong>${d.name}</strong><span class="pct">${d.pct}</span>`;
        chipRow.appendChild(chip);
      });
      document.getElementById('aiNote').innerHTML = `<strong>${t('reportSummaryLabel')}</strong> ${t('reportSummaryText')}`;
    }
    document.getElementById('aiGoBtn').addEventListener('click', ()=>{
      renderAiResult();
      document.getElementById('aiResult').classList.add('is-visible');
      document.getElementById('aiEmpty').style.display = 'none';
    });

    /* =====================================================================
       Referrals list
    ===================================================================== */
    function renderReferralList(filter){
      filter = filter || 'all';
      const host = document.getElementById('referralList');
      host.innerHTML = '';
      const filtered = filter === 'all' ? REFERRALS : REFERRALS.filter(r=>r.status===filter);

      if(filtered.length === 0){
        host.innerHTML = `<div class="empty-state">${t('noReferralsCategory')}</div>`;
        return;
      }

      filtered.forEach(r=>{
        const el = document.createElement('div');
        el.className = 'record-row';
        const badgeClass = r.status === 'pending' ? 'warn' : (r.status === 'rerouted' ? 'crit' : '');
        el.innerHTML = `
          <span class="record-icon">🔁</span>
          <span class="record-main">
            <span class="record-name">${r.patient} <span class="badge ${badgeClass}">${t('filter'+r.status.charAt(0).toUpperCase()+r.status.slice(1))}</span></span>
            <div class="record-meta">${r.hospital} · ${r.equip} · ${r.when}</div>
          </span>
          <span class="record-side">
            <button class="pill-btn ghost sm" data-role="view">${t('history')}</button>
          </span>
        `;
        el.querySelector('[data-role="view"]').addEventListener('click', (e)=>{
          e.stopPropagation();
          openReferral(r.patient, r.hospital, r.equip, r.status);
        });
        host.appendChild(el);
      });
    }
    document.querySelectorAll('#referralFilter .chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        document.querySelectorAll('#referralFilter .chip').forEach(c=>c.classList.remove('is-active'));
        chip.classList.add('is-active');
        renderReferralList(chip.dataset.filter);
      });
    });

    /* =====================================================================
       Referral SLA modal
    ===================================================================== */
    const refOverlay = document.getElementById('refOverlay');
    const refTitle = document.getElementById('refTitle');
    const refPatientBox = document.getElementById('refPatientBox');
    const refHospitalSelect = document.getElementById('refHospitalSelect');
    const refMessageInput = document.getElementById('refMessageInput');
    const refContactInput = document.getElementById('refContactInput');
    const refError = document.getElementById('refError');
    const refSuccess = document.getElementById('refSuccess');
    const refSendBtn = document.getElementById('refSendBtn');

    let refHospitalsCache = null;
    async function loadReferralHospitals(){
      if(refHospitalsCache) return refHospitalsCache;
      try{
        const res = await fetch('/api/hospitals');
        const data = await res.json();
        refHospitalsCache = data.hospitals || [];
      }catch(err){
        refHospitalsCache = [];
      }
      return refHospitalsCache;
    }

    async function openReferral(patientName, hospital, equip){
      refTitle.textContent = 'Send a request';
      refPatientBox.textContent = patientName || 'Patient';
      refMessageInput.value = equip ? ('Regarding: ' + equip + '. ') : '';
      refContactInput.value = '';
      refError.classList.remove('is-visible');
      refSuccess.classList.remove('is-visible');
      refSendBtn.disabled = false;
      refSendBtn.textContent = 'Send request';

      refOverlay.classList.add('is-open');
      refOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      refHospitalSelect.innerHTML = '<option value="">Loading hospitals...</option>';
      const hospitals = await loadReferralHospitals();
      if(hospitals.length === 0){
        refHospitalSelect.innerHTML = '<option value="">No hospitals registered yet</option>';
        return;
      }
      refHospitalSelect.innerHTML = hospitals.map(function(h){ return '<option value="' + h.id + '">' + h.name + '</option>'; }).join('');
      if(hospital){
        const match = hospitals.find(function(h){ return h.name === hospital; });
        if(match) refHospitalSelect.value = match.id;
      }
    }
    function closeReferral(){
      refOverlay.classList.remove('is-open');
      refOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    document.getElementById('refCloseBtn').addEventListener('click', closeReferral);
    document.getElementById('refCancelBtn').addEventListener('click', closeReferral);
    refSendBtn.addEventListener('click', async ()=>{
      const hospitalId = refHospitalSelect.value;
      const message = refMessageInput.value.trim();
      if(!hospitalId || !message){
        refError.classList.add('is-visible');
        return;
      }
      refError.classList.remove('is-visible');
      refSendBtn.disabled = true;
      refSendBtn.textContent = 'Sending...';
      try{
        const res = await fetch('/api/hospitals/' + hospitalId + '/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            contactNumber: refContactInput.value || undefined,
          }),
        });
        if(res.ok){
          refSuccess.classList.add('is-visible');
          toast('Request sent to hospital');
          setTimeout(closeReferral, 1000);
        } else {
          refError.textContent = 'Something went wrong. Please try again.';
          refError.classList.add('is-visible');
        }
      }catch(err){
        refError.textContent = 'Network error. Please check your connection.';
        refError.classList.add('is-visible');
      }finally{
        refSendBtn.disabled = false;
        refSendBtn.textContent = 'Send request';
      }
    });
    refOverlay.addEventListener('click', (e)=>{ if(e.target === refOverlay) closeReferral(); });

    document.getElementById('sbQuickBtn').addEventListener('click', ()=>{
      const critical = QUEUE.find(q=>q.level==='critical');
      if(critical){ openReferral(critical.name); }
      else{ toast(t('quickReferralToast')); showView('queue'); }
    });

    /* =====================================================================
       Logout
    ===================================================================== */
    (function(){
      const logoutBtn = document.getElementById('logoutBtn');
      const screen = document.getElementById('logoutScreen');
      const loginAgainBtn = document.getElementById('loginAgainBtn');
      logoutBtn.addEventListener('click', ()=> screen.classList.add('is-open'));
      loginAgainBtn.addEventListener('click', ()=>{
        screen.classList.remove('is-open');
        showView('overview');
        toast(t('welcomeBack') + ', Dr. Rao');
      });
    })();

    /* =====================================================================
       Edit profile
    ===================================================================== */
    (function(){
      const editBtn = document.getElementById('editProfileBtn');
      const grid = document.getElementById('profileGrid');
      let editing = false;
      editBtn.addEventListener('click', ()=>{
        editing = !editing;
        grid.querySelectorAll('.profile-field').forEach(field=>{
          const valueEl = field.querySelector('.profile-field-value');
          if(editing){
            const currentText = valueEl.textContent;
            field.classList.add('is-editing');
            valueEl.dataset.original = currentText;
            valueEl.innerHTML = `<input type="text" value="${currentText}">`;
          } else {
            const input = field.querySelector('input');
            const newVal = input ? input.value : valueEl.dataset.original;
            field.classList.remove('is-editing');
            valueEl.textContent = newVal;
          }
        });
        editBtn.textContent = editing ? t('saveChanges') : t('editDetails');
        if(!editing) toast(t('profileUpdated'));
      });
      window._editProfileBtnState = ()=> editing;
    })();

    /* =====================================================================
       Notifications
    ===================================================================== */
    (function(){
      const wrap = document.getElementById('notifWrap');
      const bellBtn = document.getElementById('notifBellBtn');
      bellBtn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('is-open'); });
      document.addEventListener('click', (e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove('is-open'); });
    })();
    document.getElementById('topAvatar').addEventListener('click', ()=> showView('profile'));

    /* =====================================================================
       Global search — jumps to Queue view and filters by text
    ===================================================================== */
    document.getElementById('globalSearch').addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        showView('queue');
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('#queueFullList .record-row').forEach(row=>{
          row.style.display = (!q || row.textContent.toLowerCase().includes(q)) ? '' : 'none';
        });
      }
    });

    /* =====================================================================
       LANGUAGE TOGGLE
    ===================================================================== */
    function setLang(lang){
      currentLang = lang;
      document.getElementById('langEn').classList.toggle('is-active', lang==='en');
      document.getElementById('langHi').classList.toggle('is-active', lang==='hi');

      document.querySelectorAll('[data-i18n]').forEach(el=>{
        el.textContent = t(el.dataset.i18n);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        el.placeholder = t(el.dataset.i18nPlaceholder);
      });

      renderPulse();
      renderActivity();
      renderQueuePreview();
      const activeQueueFilter = document.querySelector('#queueFilter .chip.is-active');
      renderQueueFull(activeQueueFilter ? activeQueueFilter.dataset.filter : 'all');
      renderEquipList();
      renderEquipMap();
      const activeRefFilter = document.querySelector('#referralFilter .chip.is-active');
      renderReferralList(activeRefFilter ? activeRefFilter.dataset.filter : 'all');
      if(document.getElementById('aiResult').classList.contains('is-visible')) renderAiResult();
      if(window._renderDutyMenu) window._renderDutyMenu();
      if(window._applyDutyLabel) window._applyDutyLabel();
      if(window._editProfileBtnState){
        document.getElementById('editProfileBtn').textContent = window._editProfileBtnState() ? t('saveChanges') : t('editDetails');
      }
    }
    document.getElementById('langEn').addEventListener('click', ()=> setLang('en'));
    document.getElementById('langHi').addEventListener('click', ()=> setLang('hi'));

    /* ---------------- Initial render ---------------- */
    renderPulse();
    renderActivity();
    renderQueuePreview();
    updateStatBadges();
    renderQueueFull('all');
    renderEquipList();
    renderEquipMap();
    renderReferralList('all');
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_HTML }} />
    </>
  );
}