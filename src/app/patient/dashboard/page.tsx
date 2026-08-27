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

  .fam-switch-wrap{ position:relative; margin-bottom:14px; }
  .fam-switch-btn{
    all:unset; box-sizing:border-box; display:flex; align-items:center; gap:11px; width:100%;
    padding: 10px 8px; border-radius:14px; cursor:pointer;
    background: rgba(246,247,239,0.05); border: 1px solid rgba(246,247,239,0.1);
  }
  .fam-switch-btn:hover{ background: rgba(246,247,239,0.08); }
  .sb-avatar{ width:38px; height:38px; border-radius:50%; background: var(--teal); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
  .sb-profile-name{ font-size:13.5px; font-weight:700; }
  .sb-profile-id{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:rgba(246,247,239,0.5); margin-top:2px; }
  .fam-chevron{ margin-left:auto; opacity:.5; transition: transform .2s ease; flex-shrink:0; }
  .fam-switch-wrap.is-open .fam-chevron{ transform: rotate(180deg); }
  .fam-menu{
    position:absolute; top: calc(100% + 6px); left:0; right:0; background:#fff; border-radius:14px;
    box-shadow: 0 16px 40px -12px rgba(0,0,0,0.4); padding:6px; z-index:20; display:none;
  }
  .fam-switch-wrap.is-open .fam-menu{ display:block; }
  .fam-option{ all:unset; box-sizing:border-box; display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border-radius:10px; cursor:pointer; color:var(--ink); }
  .fam-option:hover{ background: var(--bg-cream-dim); }
  .fam-option-avatar{ width:28px; height:28px; border-radius:50%; background:var(--teal-deep); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; flex-shrink:0; }
  .fam-option-name{ font-size:13px; font-weight:700; }
  .fam-option-rel{ font-size:11px; color:var(--ink-soft); }
  .fam-add{ display:flex; align-items:center; gap:8px; padding:9px 10px; margin-top:2px; border-top:1px solid var(--border); font-size:12.5px; font-weight:700; color:var(--teal); cursor:pointer; }

  .sb-nav{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:3px; flex:1; }
  .sb-link{
    all:unset; box-sizing:border-box; display:flex; align-items:center; gap:12px;
    padding: 11px 12px; border-radius:12px; font-size:14px; font-weight:600;
    color: rgba(246,247,239,0.62); cursor:pointer; width:100%;
    transition: background .18s ease, color .18s ease;
  }
  .sb-link svg{ width:17px; height:17px; flex-shrink:0; }
  .sb-link svg path, .sb-link svg circle, .sb-link svg rect{ stroke: currentColor; }
  .sb-link:hover{ background: rgba(246,247,239,0.06); color:#F6F7EF; }
  .sb-link.is-active{ background: rgba(246,247,239,0.1); color:#F6F7EF; }

  .sb-sos{
    all:unset; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:8px;
    background:#fff; color:var(--teal-deep); font-weight:800; font-size:13.5px;
    padding:13px; border-radius:12px; cursor:pointer; margin-top:10px;
  }
  .sb-sos:hover{ opacity:.92; }

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
    position:absolute; top:calc(100% + 10px); right:0; width:300px; background:#fff; border-radius:16px;
    box-shadow: 0 16px 40px -12px rgba(0,0,0,0.35); padding:8px; display:none; z-index:30;
  }
  .notif-wrap.is-open .notif-panel{ display:block; }
  .notif-head{ font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--ink-soft); padding:10px 12px 6px; }
  .notif-item{ display:flex; gap:10px; padding:10px 12px; border-radius:10px; }
  .notif-item:hover{ background:var(--bg-cream-dim); }
  .notif-dot2{ width:7px; height:7px; border-radius:50%; background:var(--teal); flex-shrink:0; margin-top:6px; }
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
  .page-sub{ font-size:14.5px; color:var(--ink-soft); margin:0 0 30px; max-width: 60ch; }

  .card{ background:var(--card); border:1px solid var(--border); border-radius:18px; box-shadow:var(--shadow); padding: 24px 26px; }
  .card-title{ font-size:15.5px; font-weight:800; letter-spacing:-0.005em; margin:0 0 4px; }
  .card-link{ all:unset; font-size:13px; font-weight:700; color:var(--teal); cursor:pointer; display:inline-flex; align-items:center; gap:5px; }

  .overview-grid{ display:grid; grid-template-columns: 260px 1fr; gap:18px; margin-bottom:18px; }
  .score-card{ display:flex; flex-direction:column; align-items:center; text-align:center; }
  .score-ring-wrap{ position:relative; width:132px; height:132px; margin: 6px 0 14px; }
  .score-ring-wrap svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .score-ring-bg{ stroke: var(--bg-cream-dim); fill:none; stroke-width:9; }
  .score-ring-fg{ stroke: var(--teal); fill:none; stroke-width:9; stroke-linecap:round; }
  .score-ring-center{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .score-num{ font-size:30px; font-weight:800; letter-spacing:-0.02em; line-height:1; }
  .score-label{ font-size:11px; color:var(--ink-soft); margin-top:2px; }
  .score-note{ font-size:13px; color:var(--ink-soft); line-height:1.55; }

  .stat-row{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; }
  .stat-box{ background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:18px; }
  .stat-icon{ width:34px; height:34px; border-radius:10px; background:var(--bg-cream-dim); display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
  .stat-icon svg{ width:16px; height:16px; }
  .stat-icon svg path{ stroke:var(--teal); }
  .stat-value{ font-size:22px; font-weight:800; letter-spacing:-0.01em; }
  .stat-caption{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }

  .overview-cols{ display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-bottom:18px; }
  .mini-appt{ display:flex; align-items:center; gap:14px; }
  .mini-appt-date{ flex-shrink:0; width:52px; height:52px; border-radius:14px; background: var(--bg-cream-dim); display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .mini-appt-day{ font-size:17px; font-weight:800; line-height:1; }
  .mini-appt-mon{ font-family:'JetBrains Mono',monospace; font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); margin-top:2px; }
  .mini-appt-name{ font-size:14.5px; font-weight:700; }
  .mini-appt-meta{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }
  .mini-rx-name{ font-size:14.5px; font-weight:700; }
  .mini-rx-meta{ font-size:12.5px; color:var(--ink-soft); margin-top:3px; line-height:1.5; }

  .timeline{ display:flex; flex-direction:column; }
  .tl-item{ display:flex; gap:14px; padding: 13px 0; border-top:1px solid var(--border); }
  .tl-item:first-child{ border-top:none; padding-top:2px; }
  .tl-dot{ width:8px; height:8px; border-radius:50%; background:var(--teal); margin-top:5px; }
  .tl-title{ font-size:14px; font-weight:600; }
  .tl-time{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink-soft); opacity:.7; margin-top:2px; }

  .chip-row{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
  .chip{
    all:unset; box-sizing:border-box; font-size:13px; font-weight:600; padding:8px 15px; border-radius:999px;
    border:1.5px solid var(--border-strong); color:var(--ink-soft); cursor:pointer;
    transition: background .18s ease, color .18s ease, border-color .18s ease;
  }
  .chip.is-active{ background:var(--teal-deep); border-color:var(--teal-deep); color:#fff; }

  .record-list{ display:flex; flex-direction:column; gap:10px; }
  .record-row{
    display:flex; align-items:center; gap:14px; background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:15px 18px; box-shadow:var(--shadow); position:relative; overflow:hidden; cursor:pointer;
  }
  .record-row::before{ content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--teal); transform:scaleY(0); transform-origin:top; transition:transform .25s ease; }
  .record-row.is-active::before{ transform:scaleY(1); }
  .record-icon{ flex-shrink:0; width:38px; height:38px; border-radius:11px; background:var(--bg-cream-dim); display:flex; align-items:center; justify-content:center; font-size:17px; }
  .record-main{ flex:1; min-width:0; }
  .record-name{ font-size:14.5px; font-weight:700; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .record-meta{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }
  .record-date{ flex-shrink:0; font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--ink-soft); }
  .record-dl{ flex-shrink:0; width:32px; height:32px; border-radius:50%; border:1.5px solid var(--border-strong); display:flex; align-items:center; justify-content:center; transition: background .18s ease, border-color .18s ease; }
  .record-dl:hover{ background:var(--bg-cream-dim); border-color:var(--teal); }
  .record-dl svg{ width:13px; height:13px; }
  .record-dl svg path{ stroke:var(--ink); }
  .record-detail{ padding: 8px 6px 4px 70px; font-size:13.5px; color:var(--ink-soft); line-height:1.6; display:none; width:100%; }
  .record-row.is-open{ flex-wrap:wrap; }
  .record-row.is-open .record-detail{ display:block; }

  .badge{ font-family:'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--teal); background: rgba(19,116,89,0.10); padding: 3px 8px; border-radius: 999px; white-space:nowrap; }
  .badge.status-past{ color:var(--ink-soft); background:var(--bg-cream-dim); }

  .rx-card, .appt-card{ background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:18px 20px; margin-bottom:12px; }
  .rx-top, .appt-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:10px; }
  .rx-name{ font-size:15.5px; font-weight:800; }
  .rx-doctor, .appt-doctor{ font-size:13px; color:var(--ink-soft); margin-top:3px; }
  .rx-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin: 14px 0; }
  .rx-field-label{ font-size:11.5px; color:var(--ink-soft); margin-bottom:3px; }
  .rx-field-value{ font-size:14px; font-weight:700; }
  .rx-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:12px; }

  .pill-btn{
    all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:7px;
    background: var(--teal-deep); color:#fff; font-weight:700; font-size:13.5px;
    padding: 10px 18px; border-radius: 999px; cursor:pointer;
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .pill-btn:hover{ transform: translateY(-1px); box-shadow: 0 8px 20px -6px rgba(0,0,0,0.28); }
  .pill-btn.ghost{ background:#fff; color:var(--ink); border: 1.5px solid var(--border-strong); }
  .pill-btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

  .appt-when{ display:flex; align-items:center; gap:16px; margin: 12px 0; font-size:13.5px; color:var(--ink-soft); flex-wrap:wrap; }
  .appt-when b{ color:var(--ink); }

  .section-head-row{ display:flex; align-items:center; justify-content:space-between; margin: 28px 0 14px; }
  .section-head-row:first-of-type{ margin-top:0; }
  .section-head-row h3{ font-size:15px; font-weight:800; margin:0; }

  .vital-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .vital-box{ background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); padding:16px 18px; }
  .vital-label{ font-size:12px; color:var(--ink-soft); margin-bottom:6px; }
  .vital-value{ font-size:21px; font-weight:800; }
  .vital-value span{ font-size:13px; font-weight:600; color:var(--ink-soft); }
  .vital-trend{ font-size:11.5px; margin-top:4px; font-weight:600; }
  .vital-trend.up{ color:var(--red); }
  .vital-trend.down{ color:var(--teal); }
  .vital-trend.flat{ color:var(--ink-soft); }
  .chart-wrap svg{ width:100%; height:auto; display:block; }
  .chart-legend{ display:flex; gap:18px; margin-top:14px; font-size:12.5px; color:var(--ink-soft); }
  .legend-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:6px; }

  .id-card{
    background: linear-gradient(135deg, var(--teal-deep) 0%, #16453a 100%); color:#F6F7EF; border-radius:20px;
    padding: 26px 28px; position:relative; overflow:hidden; box-shadow: var(--shadow); margin-bottom:22px;
  }
  .id-card::after{ content:""; position:absolute; right:-40px; top:-40px; width:180px; height:180px; border-radius:50%; border:1px solid rgba(246,247,239,0.12); }
  .id-card-top{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom: 26px; }
  .id-brand{ display:flex; align-items:center; gap:8px; font-size:14px; font-weight:800; }
  .id-brand-mark{ width:22px; height:22px; border-radius:6px; background:var(--teal); display:flex; align-items:center; justify-content:center; }
  .id-brand-mark svg{ width:11px; height:11px; }
  .id-qr{ width:44px; height:44px; border-radius:8px; background:rgba(246,247,239,0.1); display:flex; align-items:center; justify-content:center; }
  .id-qr svg{ width:24px; height:24px; }
  .id-name{ font-size:20px; font-weight:800; letter-spacing:-0.01em; }
  .id-number{ font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:.06em; color: rgba(246,247,239,0.65); margin-top:4px; }
  .id-meta-row{ display:flex; gap:32px; margin-top:18px; }
  .id-meta-label{ font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:rgba(246,247,239,0.45); margin-bottom:3px; }
  .id-meta-value{ font-size:13.5px; font-weight:700; }

  .profile-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
  .profile-field{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 16px; box-shadow:var(--shadow); }
  .profile-field-label{ font-size:11.5px; color:var(--ink-soft); margin-bottom:4px; }
  .profile-field-value{ font-size:14.5px; font-weight:700; }
  .profile-field.is-editing input{ width:100%; border:1.5px solid var(--teal); border-radius:8px; padding:6px 8px; font-size:14.5px; font-weight:700; font-family:inherit; color:var(--ink); }
  .profile-actions{ display:flex; gap:10px; margin-top:16px; }

  .modal-overlay{
    position:fixed; inset:0; background: rgba(12,40,36,0.55); display:flex; align-items:flex-start; justify-content:center;
    padding: 6vh 20px; opacity:0; visibility:hidden; transition: opacity .22s ease, visibility 0s linear .22s; z-index: 100; overflow-y:auto;
  }
  .modal-overlay.is-open{ opacity:1; visibility:visible; transition: opacity .22s ease, visibility 0s linear 0s; }
  .modal-panel{
    background:var(--card); border-radius:20px; box-shadow:var(--shadow); width:100%; max-width:440px; padding: 28px 26px 24px;
    transform: translateY(14px) scale(.98); transition: transform .28s cubic-bezier(.4,0,.2,1);
  }
  .modal-overlay.is-open .modal-panel{ transform: translateY(0) scale(1); }
  .modal-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
  .modal-title{ font-size:19px; font-weight:800; margin:0; }
  .modal-close{ all:unset; flex-shrink:0; width:30px; height:30px; border-radius:50%; border:1.5px solid var(--border-strong); display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .modal-close svg path{ stroke:var(--ink); }
  .field{ margin-bottom:14px; }
  .field label{ display:block; font-size:12.5px; font-weight:700; color:var(--ink-soft); margin-bottom:6px; }
  .field select, .field input{ width:100%; padding:11px 13px; border-radius:10px; border:1.5px solid var(--border-strong); font-size:14px; font-family:inherit; color:var(--ink); background:#fff; }
  .field-error{ font-size:12px; color:var(--red); margin-top:6px; display:none; }
  .field-error.is-visible{ display:block; }

  .toast{
    position:fixed; bottom:26px; left:50%; transform:translateX(-50%) translateY(20px);
    background:var(--teal-deep); color:#fff; font-size:13.5px; font-weight:600; padding:13px 22px; border-radius:999px;
    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.4); opacity:0; pointer-events:none; transition: opacity .25s ease, transform .25s ease; z-index:150;
    max-width: 88vw; text-align:center;
  }
  .toast.is-visible{ opacity:1; transform:translateX(-50%) translateY(0); }

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
    .fam-switch-wrap{ display:none; }
    .sb-nav{ flex-direction:row; flex:none; }
    .sb-link span{ display:none; }
    .sb-sos span{ display:none; }
    .sb-sos{ margin-top:0; margin-left:8px; padding:10px 14px; }
    .sb-logout{ width:auto; margin-top:0; margin-left:4px; white-space:nowrap; }
    .sb-logout span{ display:none; }
    .sb-site-links{ display:none; }
    .main{ padding:24px 18px 60px; }
    .overview-grid, .overview-cols{ grid-template-columns:1fr; }
    .rx-grid, .vital-grid, .profile-grid{ grid-template-columns: 1fr 1fr; }
  }
  @media (prefers-reduced-motion: reduce){ *{ transition-duration:0.01ms !important; animation-duration:0.01ms !important; } }
`;

const PAGE_HTML = `
<div class="shell">

  <!-- ===================== Sidebar ===================== -->
  <aside class="sidebar">
    <div class="sb-logo">
      <span class="sb-logo-mark"><svg viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span>
      MedConnect
    </div>

    <div class="fam-switch-wrap" id="famSwitchWrap">
      <button class="fam-switch-btn" id="famSwitchBtn">
        <div class="sb-avatar" id="famAvatar">A</div>
        <div>
          <div class="sb-profile-name" id="famName">Aarav Mehta</div>
          <div class="sb-profile-id" id="famId">#MC-88219</div>
        </div>
        <svg class="fam-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="#F6F7EF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="fam-menu" id="famMenu"></div>
    </div>

    <ul class="sb-nav" id="sbNav">
      <li><button class="sb-link is-active" data-view="overview">
        <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.3"/><rect x="9" y="2" width="5" height="5" rx="1.3"/><rect x="2" y="9" width="5" height="5" rx="1.3"/><rect x="9" y="9" width="5" height="5" rx="1.3"/></svg>
        <span data-i18n="navOverview">Overview</span>
      </button></li>
      <li><button class="sb-link" data-view="records">
        <svg viewBox="0 0 16 16" fill="none"><path d="M4 2H10L13 5V14H4V2Z" stroke-linejoin="round"/><path d="M6 8H11M6 10.5H11"/></svg>
        <span data-i18n="navRecords">Health Records</span>
      </button></li>
      <li><button class="sb-link" data-view="prescriptions">
        <svg viewBox="0 0 16 16" fill="none"><path d="M4 9.5L9.5 4C10.6 2.9 12.3 2.9 13.3 4C14.3 5 14.3 6.7 13.3 7.8L7.8 13.3C6.7 14.3 5 14.3 4 13.3C3 12.3 3 10.6 4 9.5Z"/><path d="M7 6.5L11 10.5"/></svg>
        <span data-i18n="navPrescriptions">Prescriptions</span>
      </button></li>
      <li><button class="sb-link" data-view="appointments">
        <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5H14M5 1.5V4M11 1.5V4" stroke-linecap="round"/></svg>
        <span data-i18n="navAppointments">Appointments</span>
      </button></li>
      <li><button class="sb-link" data-view="vitals">
        <svg viewBox="0 0 16 16" fill="none"><path d="M2 9H5L6.5 4L9.5 13L11 9H14" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span data-i18n="navVitals">Vitals</span>
      </button></li>
      <li><button class="sb-link" data-view="profile">
        <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.8"/><path d="M2.5 14C3.3 11 5.4 9.5 8 9.5C10.6 9.5 12.7 11 13.5 14"/></svg>
        <span data-i18n="navProfile">Profile</span>
      </button></li>
    </ul>

    <button class="sb-sos" id="sbSosBtn">🚨 <span data-i18n="sos">SOS Emergency</span></button>

    <button class="sb-logout" id="logoutBtn">
      <svg viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5C2.7 14 2 13.3 2 12.5V3.5C2 2.7 2.7 2 3.5 2H6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 11L14 8L10.5 5M14 8H6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span data-i18n="logout">Log out</span>
    </button>

    <div class="sb-site-links">
      <a href="medconnect-faq.html">FAQ</a>
      <a href="medconnect-emergency.html">Emergency Centre</a>
    </div>
  </aside>

  <!-- ===================== Main ===================== -->
  <main class="main">

    <div class="topbar">
      <div class="search-box">
        <svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#4B5B55" stroke-width="1.4"/><path d="M13 13L10.2 10.2" stroke="#4B5B55" stroke-width="1.4" stroke-linecap="round"/></svg>
        <input type="text" id="globalSearch" data-i18n-placeholder="searchPlaceholder" placeholder="Search records, prescriptions, doctors…">
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
            <div class="notif-item"><span class="notif-dot2"></span><div><div class="notif-item-title" data-i18n="notif1">New report added — Blood test CBC panel</div><div class="notif-item-time" data-i18n="notifTime1">2 days ago</div></div></div>
            <div class="notif-item"><span class="notif-dot2"></span><div><div class="notif-item-title" data-i18n="notif2">Prescription refilled — Atorvastatin 10mg</div><div class="notif-item-time" data-i18n="notifTime2">5 days ago</div></div></div>
            <div class="notif-item"><span class="notif-dot2"></span><div><div class="notif-item-title" data-i18n="notif3">Appointment reminder — tomorrow 10:30 AM</div><div class="notif-item-time" data-i18n="notifTime3">Just now</div></div></div>
          </div>
        </div>
        <div class="sb-avatar" style="width:36px;height:36px;font-size:13px;cursor:pointer;" id="topAvatar" title="Go to profile">A</div>
      </div>
    </div>

    <!-- ============ OVERVIEW ============ -->
    <section class="view is-active" id="view-overview">
      <div class="eyebrow" data-i18n="navOverview">Overview</div>
      <h1 class="page-title" id="greetingTitle" data-i18n="greeting">Good morning, Aarav.</h1>
      <p class="page-sub" data-i18n="overviewSub">Here's a snapshot of your health today — reports, prescriptions and appointments, kept automatically in sync.</p>

      <div class="overview-grid">
        <div class="card score-card">
          <div class="card-title" data-i18n="healthScore">Health score</div>
          <div class="score-ring-wrap">
            <svg viewBox="0 0 132 132">
              <circle class="score-ring-bg" cx="66" cy="66" r="56"/>
              <circle class="score-ring-fg" cx="66" cy="66" r="56" stroke-dasharray="351.86" stroke-dashoffset="66.85"/>
            </svg>
            <div class="score-ring-center">
              <div class="score-num">81</div>
              <div class="score-label">/ 100</div>
            </div>
          </div>
          <p class="score-note" data-i18n="scoreNote">Based on vitals, care-plan adherence and recent reports. Up 4 points since last month.</p>
        </div>

        <div>
          <div class="stat-row" style="margin-bottom:14px;">
            <div class="stat-box">
              <div class="stat-icon"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke-width="1.4"/><path d="M2 6.5H14M5 1.5V4M11 1.5V4" stroke-width="1.4" stroke-linecap="round"/></svg></div>
              <div class="stat-value" id="statAppointments">2</div>
              <div class="stat-caption" data-i18n="statAppt">Upcoming appointments</div>
            </div>
            <div class="stat-box">
              <div class="stat-icon"><svg viewBox="0 0 16 16" fill="none"><path d="M4 2H10L13 5V14H4V2Z" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 8H11M6 10.5H11" stroke-width="1.4" stroke-linecap="round"/></svg></div>
              <div class="stat-value" id="statReports">12</div>
              <div class="stat-caption" data-i18n="statReports">Reports on file</div>
            </div>
            <div class="stat-box">
              <div class="stat-icon"><svg viewBox="0 0 16 16" fill="none"><path d="M4 9.5L9.5 4C10.6 2.9 12.3 2.9 13.3 4C14.3 5 14.3 6.7 13.3 7.8L7.8 13.3C6.7 14.3 5 14.3 4 13.3C3 12.3 3 10.6 4 9.5Z" stroke-width="1.4"/></svg></div>
              <div class="stat-value" id="statRx">2</div>
              <div class="stat-caption" data-i18n="statRx">Active prescriptions</div>
            </div>
          </div>

          <div class="card">
            <div class="card-title" style="margin-bottom:12px;" data-i18n="recentActivity">Recent activity</div>
            <div class="timeline" id="activityTimeline"></div>
          </div>
        </div>
      </div>

      <div class="overview-cols">
        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
            <div class="card-title" data-i18n="upcomingConsult">Upcoming consultation</div>
            <button class="card-link" data-goto="appointments"><span data-i18n="viewAll">View all</span> →</button>
          </div>
          <div class="mini-appt" id="miniAppt"></div>
        </div>

        <div class="card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
            <div class="card-title" data-i18n="activePrescription">Active prescription</div>
            <button class="card-link" data-goto="prescriptions"><span data-i18n="viewAll">View all</span> →</button>
          </div>
          <div id="miniRx"></div>
        </div>
      </div>
    </section>

    <!-- ============ HEALTH RECORDS ============ -->
    <section class="view" id="view-records">
      <button class="back-link" data-back="1"><svg viewBox="0 0 16 16" fill="none"><path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navRecords">Health Records</div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div>
          <h1 class="page-title" data-i18n="recordsTitle">All your reports, sorted automatically.</h1>
          <p class="page-sub" style="margin-bottom:0;" data-i18n="recordsSub">Most recent report is always marked as your Active Health Record — nothing here is hardcoded, it's derived from the date on each report.</p>
        </div>
        <button class="pill-btn" id="uploadDocBtn" data-i18n="uploadDoc">+ Upload document</button>
      </div>
      <div style="height:20px;"></div>

      <div class="chip-row" id="recordChips"></div>
      <div class="record-list" id="recordList"></div>
    </section>

    <!-- ============ PRESCRIPTIONS ============ -->
    <section class="view" id="view-prescriptions">
      <button class="back-link" data-back="1"><svg viewBox="0 0 16 16" fill="none"><path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navPrescriptions">Prescriptions</div>
      <h1 class="page-title" data-i18n="rxTitle">Your care plan.</h1>
      <p class="page-sub" data-i18n="rxSub">Active medication first, refill straight from here, and browse anything prescribed to you before.</p>

      <div class="section-head-row"><h3 data-i18n="active">Active</h3></div>
      <div id="rxActiveList"></div>

      <div class="section-head-row"><h3 data-i18n="pastRx">Past prescriptions</h3></div>
      <div id="rxPastList"></div>
    </section>

    <!-- ============ APPOINTMENTS ============ -->
    <section class="view" id="view-appointments">
      <button class="back-link" data-back="1"><svg viewBox="0 0 16 16" fill="none"><path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navAppointments">Appointments</div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div>
          <h1 class="page-title" data-i18n="apptTitle">Consultations.</h1>
          <p class="page-sub" style="margin-bottom:0;" data-i18n="apptSub">Manage upcoming visits or book a new one.</p>
        </div>
        <button class="pill-btn" id="bookApptBtn" data-i18n="bookAppt">+ Book appointment</button>
      </div>

      <div class="section-head-row"><h3 data-i18n="upcoming">Upcoming</h3></div>
      <div id="apptUpcomingList"></div>

      <div class="section-head-row"><h3 data-i18n="past">Past</h3></div>
      <div id="apptPastList"></div>
    </section>

    <!-- ============ VITALS ============ -->
    <section class="view" id="view-vitals">
      <button class="back-link" data-back="1"><svg viewBox="0 0 16 16" fill="none"><path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navVitals">Vitals</div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div>
          <h1 class="page-title" data-i18n="vitalsTitle">Track how you're doing.</h1>
          <p class="page-sub" style="margin-bottom:0;" data-i18n="vitalsSub">Readings you or your clinic have logged, over the last 6 checks.</p>
        </div>
        <button class="pill-btn" id="addVitalBtn" data-i18n="addReading">+ Add reading</button>
      </div>
      <div style="height:20px;"></div>

      <div class="vital-grid" id="vitalSummary"></div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-title" data-i18n="bpChart">Blood pressure (systolic / diastolic)</div>
        <div class="chart-wrap" id="chartBP"></div>
        <div class="chart-legend">
          <span><span class="legend-dot" style="background:#137459;"></span><span data-i18n="systolic">Systolic</span></span>
          <span><span class="legend-dot" style="background:#C98A1A;"></span><span data-i18n="diastolic">Diastolic</span></span>
        </div>
      </div>

      <div class="card">
        <div class="card-title" data-i18n="weightChart">Weight (kg)</div>
        <div class="chart-wrap" id="chartWeight"></div>
      </div>
    </section>

    <!-- ============ PROFILE ============ -->
    <section class="view" id="view-profile">
      <button class="back-link" data-back="1"><svg viewBox="0 0 16 16" fill="none"><path d="M12.5 8H3.5M3.5 8L7.5 4M3.5 8L7.5 12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="back">Back</span></button>
      <div class="eyebrow" data-i18n="navProfile">Profile</div>
      <h1 class="page-title" data-i18n="profileTitle">Your Universal Health ID.</h1>
      <p class="page-sub" data-i18n="profileSub">Show this — or your QR — at any connected hospital and your record loads automatically.</p>

      <div class="id-card">
        <div class="id-card-top">
          <div class="id-brand">
            <span class="id-brand-mark"><svg viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></span>
            MedConnect
          </div>
          <div class="id-qr">
            <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="7" height="7" stroke="#F6F7EF" stroke-width="1.3"/><rect x="15" y="2" width="7" height="7" stroke="#F6F7EF" stroke-width="1.3"/><rect x="2" y="15" width="7" height="7" stroke="#F6F7EF" stroke-width="1.3"/><rect x="15" y="15" width="3" height="3" fill="#F6F7EF"/><rect x="19" y="19" width="3" height="3" fill="#F6F7EF"/></svg>
          </div>
        </div>
        <div class="id-name" id="idCardName">Aarav Mehta</div>
        <div class="id-number" id="idCardNumber">#MC-88219</div>
        <div class="id-meta-row">
          <div><div class="id-meta-label" data-i18n="bloodGroup">Blood group</div><div class="id-meta-value" id="idCardBlood">O+</div></div>
          <div><div class="id-meta-label" data-i18n="age">Age</div><div class="id-meta-value" id="idCardAge">29</div></div>
          <div><div class="id-meta-label" data-i18n="memberSince">Member since</div><div class="id-meta-value">Jan 2026</div></div>
        </div>
      </div>

      <div class="section-head-row" style="margin-top:0;"><h3 data-i18n="personalDetails">Personal details</h3></div>
      <div class="profile-grid" id="profileGrid">
        <div class="profile-field" data-field="phone"><div class="profile-field-label" data-i18n="phone">Phone</div><div class="profile-field-value">+91 98xxxxxx21</div></div>
        <div class="profile-field" data-field="email"><div class="profile-field-label" data-i18n="email">Email</div><div class="profile-field-value">aarav.mehta@email.com</div></div>
        <div class="profile-field" data-field="emergency"><div class="profile-field-label" data-i18n="emergencyContact">Emergency contact</div><div class="profile-field-value">Meera Mehta · +91 90xxxxxx45</div></div>
        <div class="profile-field" data-field="allergies"><div class="profile-field-label" data-i18n="allergies">Known allergies</div><div class="profile-field-value">Penicillin</div></div>
      </div>
      <div class="profile-actions">
        <button class="pill-btn ghost" id="editProfileBtn" data-i18n="editDetails">Edit details</button>
      </div>
    </section>

  </main>
</div>

<!-- ===================== Book appointment modal ===================== -->
<div class="modal-overlay" id="bookOverlay" aria-hidden="true">
  <div class="modal-panel" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3 class="modal-title" data-i18n="bookAppt">Book appointment</h3>
      <button class="modal-close" id="bookCloseBtn" aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <form id="bookForm">
      <div class="field"><label data-i18n="specialty">Specialty</label>
        <select id="bookSpecialty">
          <option value="General Physician" data-i18n="specGP">General Physician</option>
          <option value="Cardiologist" data-i18n="specCardio">Cardiologist</option>
          <option value="Dermatologist" data-i18n="specDerma">Dermatologist</option>
          <option value="Orthopedic" data-i18n="specOrtho">Orthopedic</option>
        </select>
      </div>
      <div class="field">
        <label data-i18n="preferredDate">Preferred date</label>
        <input type="date" id="bookDate" required>
        <div class="field-error" id="bookDateError" data-i18n="pastDateError">Please choose a date from today onward.</div>
      </div>
      <div class="field"><label data-i18n="preferredTime">Preferred time</label><input type="time" id="bookTime" required></div>
      <button type="submit" class="pill-btn" style="width:100%; justify-content:center;" data-i18n="confirmRequest">Confirm request</button>
    </form>
  </div>
</div>

<!-- ===================== Add vital reading modal ===================== -->
<div class="modal-overlay" id="vitalOverlay" aria-hidden="true">
  <div class="modal-panel" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3 class="modal-title" data-i18n="addReading">Add reading</h3>
      <button class="modal-close" id="vitalCloseBtn" aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <form id="vitalForm">
      <div class="field"><label data-i18n="readingDate">Date</label><input type="date" id="vitalDate" required></div>
      <div class="field"><label data-i18n="systolicLabel">Systolic (mmHg)</label><input type="number" id="vitalSys" placeholder="120" required></div>
      <div class="field"><label data-i18n="diastolicLabel">Diastolic (mmHg)</label><input type="number" id="vitalDia" placeholder="80" required></div>
      <div class="field"><label data-i18n="weightLabel">Weight (kg)</label><input type="number" step="0.1" id="vitalWeight" placeholder="62.5" required></div>
      <button type="submit" class="pill-btn" style="width:100%; justify-content:center;" data-i18n="saveReading">Save reading</button>
    </form>
  </div>
</div>

<!-- ===================== Upload document modal ===================== -->
<div class="modal-overlay" id="uploadOverlay" aria-hidden="true">
  <div class="modal-panel" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3 class="modal-title" data-i18n="uploadDoc">Upload document</h3>
      <button class="modal-close" id="uploadCloseBtn" aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <form id="uploadForm">
      <div class="field"><label data-i18n="docName">Document name</label><input type="text" id="uploadName" placeholder="e.g. Dental checkup report" required></div>
      <div class="field"><label data-i18n="docType">Type</label>
        <select id="uploadType">
          <option value="Lab" data-i18n="typeLab">Lab</option>
          <option value="Imaging" data-i18n="typeImaging">Imaging</option>
          <option value="Cardiac" data-i18n="typeCardiac">Cardiac</option>
          <option value="Consultation" data-i18n="typeConsultation">Consultation</option>
          <option value="Prescription" data-i18n="typePrescription">Prescription</option>
          <option value="Immunisation" data-i18n="typeImmunisation">Immunisation</option>
        </select>
      </div>
      <div class="field">
        <label data-i18n="docDate">Date</label>
        <input type="date" id="uploadDate" required>
        <div class="field-error" id="uploadDateError" data-i18n="futureDateError">Record date can't be in the future.</div>
      </div>
      <div class="field"><label data-i18n="docFile">File</label><input type="file" id="uploadFile"></div>
      <button type="submit" class="pill-btn" style="width:100%; justify-content:center;" data-i18n="addToRecords">Add to records</button>
    </form>
  </div>
</div>

<!-- ===================== Emergency SOS modal ===================== -->
<div class="modal-overlay" id="sosOverlay" aria-hidden="true">
  <div class="modal-panel" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h3 class="modal-title">Send Emergency SOS</h3>
      <button class="modal-close" id="sosCloseBtn" aria-label="Close"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    </div>
    <form id="sosForm">
      <div class="field"><label>Hospital</label>
        <select id="sosHospital"></select>
      </div>
      <div class="field"><label>What's the emergency?</label>
        <textarea id="sosMessage" rows="3" placeholder="e.g. Chest pain, need urgent help" required></textarea>
      </div>
      <div class="field"><label>Location (optional)</label>
        <input type="text" id="sosLocation" placeholder="e.g. Near MG Road signal">
      </div>
      <div class="field"><label>Contact number (optional)</label>
        <input type="tel" id="sosContact" placeholder="+91 98765 43210">
      </div>
      <div class="field-error" id="sosError">Please select a hospital and describe the emergency.</div>
      <button type="submit" class="pill-btn" id="sosSendBtn" style="width:100%; justify-content:center; background:#E4483C; border-color:#E4483C;">Send SOS</button>
    </form>
  </div>
</div>

<div class="toast" id="toast"></div>

<!-- ===================== Logout confirm screen ===================== -->
<div class="logout-screen" id="logoutScreen">
  <div class="logout-screen-inner">
    <div class="logout-mark">
      <svg width="30" height="30" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5C2.7 14 2 13.3 2 12.5V3.5C2 2.7 2.7 2 3.5 2H6" stroke="#137459" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 11L14 8L10.5 5M14 8H6" stroke="#137459" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h2 class="logout-title" data-i18n="loggedOutTitle">You've been logged out.</h2>
    <p class="logout-sub" data-i18n="loggedOutSub">Your session on this device has ended. Sign back in anytime to see your reports, prescriptions and appointments.</p>
    <button class="pill-btn" id="loginAgainBtn" style="width:100%; justify-content:center;" data-i18n="loginAgain">Log back in</button>
  </div>
</div>
`;

export default function PatientDashboardPage() {
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    /* =====================================================================
       I18N — lightweight EN/HI translation for all static UI chrome.
       Dynamic mock data (doctor names, medicine names, addresses) is left
       as-is since real data wouldn't be auto-translated either.
    ===================================================================== */
    let currentLang = 'en';
    const I18N = {
      en: {
        navOverview:"Overview", navRecords:"Health Records", navPrescriptions:"Prescriptions",
        navAppointments:"Appointments", navVitals:"Vitals", navProfile:"Profile",
        sos:"SOS Emergency", logout:"Log out", back:"Back",
        searchPlaceholder:"Search records, prescriptions, doctors…",
        notifHeader:"Notifications",
        notif1:"New report added — Blood test CBC panel", notifTime1:"2 days ago",
        notif2:"Prescription refilled — Atorvastatin 10mg", notifTime2:"5 days ago",
        notif3:"Appointment reminder — tomorrow 10:30 AM", notifTime3:"Just now",
        greeting:"Good morning, {name}.",
        overviewSub:"Here's a snapshot of your health today — reports, prescriptions and appointments, kept automatically in sync.",
        healthScore:"Health score",
        scoreNote:"Based on vitals, care-plan adherence and recent reports. Up 4 points since last month.",
        statAppt:"Upcoming appointments", statReports:"Reports on file", statRx:"Active prescriptions",
        recentActivity:"Recent activity",
        upcomingConsult:"Upcoming consultation", activePrescription:"Active prescription", viewAll:"View all",
        recordsTitle:"All your reports, sorted automatically.",
        recordsSub:"Most recent report is always marked as your Active Health Record — nothing here is hardcoded, it's derived from the date on each report.",
        uploadDoc:"+ Upload document",
        rxTitle:"Your care plan.",
        rxSub:"Active medication first, refill straight from here, and browse anything prescribed to you before.",
        active:"Active", pastRx:"Past prescriptions",
        apptTitle:"Consultations.", apptSub:"Manage upcoming visits or book a new one.",
        bookAppt:"+ Book appointment", upcoming:"Upcoming", past:"Past",
        vitalsTitle:"Track how you're doing.", vitalsSub:"Readings you or your clinic have logged, over the last 6 checks.",
        addReading:"+ Add reading", bpChart:"Blood pressure (systolic / diastolic)", weightChart:"Weight (kg)",
        systolic:"Systolic", diastolic:"Diastolic",
        profileTitle:"Your Universal Health ID.", profileSub:"Show this — or your QR — at any connected hospital and your record loads automatically.",
        bloodGroup:"Blood group", age:"Age", memberSince:"Member since",
        personalDetails:"Personal details", phone:"Phone", email:"Email", emergencyContact:"Emergency contact", allergies:"Known allergies",
        editDetails:"Edit details", saveChanges:"Save changes",
        dosageLabel:"Dosage", startedLabel:"Started", validTill:"Valid till", endedLabel:"Ended",
        specialty:"Specialty", specGP:"General Physician", specCardio:"Cardiologist", specDerma:"Dermatologist", specOrtho:"Orthopedic",
        preferredDate:"Preferred date", preferredTime:"Preferred time", confirmRequest:"Confirm request",
        pastDateError:"Please choose a date from today onward.",
        readingDate:"Date", systolicLabel:"Systolic (mmHg)", diastolicLabel:"Diastolic (mmHg)", weightLabel:"Weight (kg)", saveReading:"Save reading",
        docName:"Document name", docType:"Type", docDate:"Date", docFile:"File", addToRecords:"Add to records",
        futureDateError:"Record date can't be in the future.",
        typeLab:"Lab", typeImaging:"Imaging", typeCardiac:"Cardiac", typeConsultation:"Consultation", typePrescription:"Prescription", typeImmunisation:"Immunisation", typeAll:"All",
        loggedOutTitle:"You've been logged out.",
        loggedOutSub:"Your session on this device has ended. Sign back in anytime to see your reports, prescriptions and appointments.",
        loginAgain:"Log back in",
        activeHealthRecord:"Active Health Record", download:"Download", noRecords:"No records in this category yet.",
        completed:"Completed", requestRefill:"Request refill", viewFullRx:"View full prescription",
        joinCheckIn:"Join / Check in", reschedule:"Reschedule",
        mmHg:"mmHg", kg:"kg", readingsLogged:"Readings logged", last6:"Last 6 checks", noChange:"No change", vsLast:"vs last",
        toBeAssigned:"To be assigned", clinic:"MedConnect Clinic",
        apptConfirmed:"Appointment confirmed for", refillRequested:"Refill requested for",
        openingFullRx:"Opening full prescription…", joiningConsult:"Joining consultation…", rescheduleSent:"Reschedule request sent — our team will confirm shortly",
        docAdded:"Document added to your health records", newReadingSaved:"New reading saved",
        profileUpdated:"Profile updated", welcomeBack:"Welcome back", downloading:"Downloading",
        notifSummary:"3 new updates — 1 report, 1 refill, 1 reminder", openEmergency:"In the full site this opens the Emergency Centre",
        addFamilySoon:"Add family member — coming soon", nowViewing:"Now viewing", DataNote:"records shown are demo data"
      },
      hi: {
        navOverview:"सारांश", navRecords:"हेल्थ रिकॉर्ड्स", navPrescriptions:"दवाइयां",
        navAppointments:"अपॉइंटमेंट्स", navVitals:"वाइटल्स", navProfile:"प्रोफाइल",
        sos:"एसओएस इमरजेंसी", logout:"लॉग आउट", back:"वापस",
        searchPlaceholder:"रिकॉर्ड्स, दवाइयां, डॉक्टर खोजें…",
        notifHeader:"सूचनाएं",
        notif1:"नई रिपोर्ट जोड़ी गई — ब्लड टेस्ट CBC पैनल", notifTime1:"2 दिन पहले",
        notif2:"दवा दोबारा भरी गई — एटोरवास्टेटिन 10mg", notifTime2:"5 दिन पहले",
        notif3:"अपॉइंटमेंट रिमाइंडर — कल सुबह 10:30", notifTime3:"अभी",
        greeting:"सुप्रभात, {name}.",
        overviewSub:"आज आपकी सेहत का सारांश — रिपोर्ट्स, दवाइयां और अपॉइंटमेंट्स, अपने आप अपडेट होते हुए।",
        healthScore:"हेल्थ स्कोर",
        scoreNote:"वाइटल्स, केयर-प्लान पालन और हाल की रिपोर्ट्स पर आधारित। पिछले महीने से 4 अंक ऊपर।",
        statAppt:"आने वाले अपॉइंटमेंट्स", statReports:"फ़ाइल में रिपोर्ट्स", statRx:"सक्रिय दवाइयां",
        recentActivity:"हाल की गतिविधि",
        upcomingConsult:"आगामी परामर्श", activePrescription:"सक्रिय दवा", viewAll:"सभी देखें",
        recordsTitle:"आपकी सभी रिपोर्ट्स, अपने आप क्रमबद्ध।",
        recordsSub:"सबसे नई रिपोर्ट हमेशा आपकी सक्रिय हेल्थ रिकॉर्ड मानी जाती है — यह हार्डकोड नहीं है, हर रिपोर्ट की तारीख से तय होता है।",
        uploadDoc:"+ दस्तावेज़ अपलोड करें",
        rxTitle:"आपकी केयर प्लान।",
        rxSub:"पहले सक्रिय दवा, यहीं से रिफिल करें, और पहले दी गई सभी दवाइयां देखें।",
        active:"सक्रिय", pastRx:"पिछली दवाइयां",
        apptTitle:"परामर्श।", apptSub:"आगामी विज़िट प्रबंधित करें या नई बुक करें।",
        bookAppt:"+ अपॉइंटमेंट बुक करें", upcoming:"आगामी", past:"पिछले",
        vitalsTitle:"अपनी सेहत ट्रैक करें।", vitalsSub:"आपने या क्लिनिक ने जो रीडिंग दर्ज कीं, पिछली 6 जांचें।",
        addReading:"+ रीडिंग जोड़ें", bpChart:"ब्लड प्रेशर (सिस्टोलिक / डायस्टोलिक)", weightChart:"वज़न (किग्रा)",
        systolic:"सिस्टोलिक", diastolic:"डायस्टोलिक",
        profileTitle:"आपका यूनिवर्सल हेल्थ आईडी।", profileSub:"इसे — या अपना QR — किसी भी जुड़े हॉस्पिटल में दिखाएं, रिकॉर्ड अपने आप लोड होगा।",
        bloodGroup:"ब्लड ग्रुप", age:"उम्र", memberSince:"सदस्य बने",
        personalDetails:"व्यक्तिगत विवरण", phone:"फोन", email:"ईमेल", emergencyContact:"आपातकालीन संपर्क", allergies:"ज्ञात एलर्जी",
        editDetails:"विवरण संपादित करें", saveChanges:"बदलाव सहेजें",
        dosageLabel:"खुराक", startedLabel:"शुरू", validTill:"वैध तक", endedLabel:"समाप्त",
        specialty:"विशेषज्ञता", specGP:"जनरल फिजिशियन", specCardio:"कार्डियोलॉजिस्ट", specDerma:"डर्मेटोलॉजिस्ट", specOrtho:"ऑर्थोपेडिक",
        preferredDate:"पसंदीदा तारीख", preferredTime:"पसंदीदा समय", confirmRequest:"अनुरोध की पुष्टि करें",
        pastDateError:"कृपया आज या उसके बाद की तारीख चुनें।",
        readingDate:"तारीख", systolicLabel:"सिस्टोलिक (mmHg)", diastolicLabel:"डायस्टोलिक (mmHg)", weightLabel:"वज़न (किग्रा)", saveReading:"रीडिंग सहेजें",
        docName:"दस्तावेज़ का नाम", docType:"प्रकार", docDate:"तारीख", docFile:"फ़ाइल", addToRecords:"रिकॉर्ड्स में जोड़ें",
        futureDateError:"रिकॉर्ड की तारीख भविष्य की नहीं हो सकती।",
        typeLab:"लैब", typeImaging:"इमेजिंग", typeCardiac:"कार्डियक", typeConsultation:"परामर्श", typePrescription:"दवा", typeImmunisation:"टीकाकरण", typeAll:"सभी",
        loggedOutTitle:"आप लॉग आउट हो गए हैं।",
        loggedOutSub:"इस डिवाइस पर आपका सत्र समाप्त हो गया है। अपनी रिपोर्ट्स, दवाइयां और अपॉइंटमेंट्स देखने के लिए कभी भी वापस लॉगिन करें।",
        loginAgain:"वापस लॉग इन करें",
        activeHealthRecord:"सक्रिय हेल्थ रिकॉर्ड", download:"डाउनलोड", noRecords:"इस श्रेणी में अभी कोई रिकॉर्ड नहीं है।",
        completed:"पूर्ण", requestRefill:"रिफिल का अनुरोध करें", viewFullRx:"पूरी दवा देखें",
        joinCheckIn:"जॉइन / चेक इन", reschedule:"पुनर्निर्धारित करें",
        mmHg:"mmHg", kg:"किग्रा", readingsLogged:"दर्ज रीडिंग", last6:"पिछली 6 जांचें", noChange:"कोई बदलाव नहीं", vsLast:"पिछले से",
        toBeAssigned:"जल्द तय होगा", clinic:"MedConnect क्लिनिक",
        apptConfirmed:"अपॉइंटमेंट पक्की हुई", refillRequested:"रिफिल का अनुरोध भेजा गया",
        openingFullRx:"पूरी दवा खोली जा रही है…", joiningConsult:"परामर्श में शामिल हो रहे हैं…", rescheduleSent:"पुनर्निर्धारण अनुरोध भेजा गया — हमारी टीम जल्द पुष्टि करेगी",
        docAdded:"दस्तावेज़ आपके हेल्थ रिकॉर्ड्स में जोड़ दिया गया", newReadingSaved:"नई रीडिंग सहेजी गई",
        profileUpdated:"प्रोफ़ाइल अपडेट हो गई", welcomeBack:"वापसी पर स्वागत है", downloading:"डाउनलोड हो रहा है",
        notifSummary:"3 नए अपडेट — 1 रिपोर्ट, 1 रिफिल, 1 रिमाइंडर", openEmergency:"पूरी साइट में यह इमरजेंसी सेंटर खोलेगा",
        addFamilySoon:"परिवार का सदस्य जोड़ें — जल्द आ रहा है", nowViewing:"अभी देख रहे हैं", demoDataNote:"दिखाए गए रिकॉर्ड डेमो डेटा हैं"
      }
    };
    function t(key){ return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en[key] || key); }

    /* =====================================================================
       MOCK DATA
    ===================================================================== */
    const REPORTS = [
      { name: "Blood test — CBC panel",        type: "Lab",           doctor: "Dr. Anjali Rao",     date: "2026-08-14", note: "All values within normal range. No follow-up needed." },
      { name: "Chest X-Ray",                   type: "Imaging",       doctor: "Dr. Sameer Kulkarni", date: "2026-07-29", note: "Clear lung fields, no abnormalities detected." },
      { name: "ECG report",                    type: "Cardiac",       doctor: "Dr. Anjali Rao",     date: "2026-07-18", note: "Normal sinus rhythm, no arrhythmia observed." },
      { name: "Lipid profile",                 type: "Lab",           doctor: "Dr. Anjali Rao",     date: "2026-06-30", note: "LDL slightly elevated — dietary changes advised." },
      { name: "General physician consult",     type: "Consultation",  doctor: "Dr. Naveen Shetty",  date: "2026-06-12", note: "Routine checkup, no concerns raised." },
      { name: "MRI — left knee",               type: "Imaging",       doctor: "Dr. Priya Menon",    date: "2026-05-22", note: "Minor cartilage wear, physiotherapy recommended." },
      { name: "Prescription refill note",      type: "Prescription",  doctor: "Dr. Anjali Rao",     date: "2026-05-04", note: "Continued current dosage for 3 more months." },
      { name: "Thyroid function test",         type: "Lab",           doctor: "Dr. Sameer Kulkarni", date: "2026-04-19", note: "TSH within normal limits." },
      { name: "Vaccination record",            type: "Immunisation",  doctor: "MedConnect Clinic",  date: "2026-03-27", note: "Annual flu vaccine administered." },
      { name: "Physiotherapy discharge note",  type: "Consultation",  doctor: "Dr. Priya Menon",    date: "2026-03-02", note: "Full range of motion restored, discharged." },
      { name: "Ultrasound — abdomen",          type: "Imaging",       doctor: "Dr. Naveen Shetty",  date: "2026-02-11", note: "No abnormalities detected." },
      { name: "Annual health checkup summary", type: "Consultation",  doctor: "Dr. Anjali Rao",     date: "2026-01-20", note: "Overall good health, routine bloodwork ordered." }
    ];
    const REPORT_ICONS = { "Lab":"🧪","Imaging":"🩻","Cardiac":"❤️","Consultation":"📋","Prescription":"💊","Immunisation":"💉" };
    const TYPE_KEY = { "Lab":"typeLab","Imaging":"typeImaging","Cardiac":"typeCardiac","Consultation":"typeConsultation","Prescription":"typePrescription","Immunisation":"typeImmunisation" };

    const PRESCRIPTIONS = {
      active: [
        { name:"Atorvastatin 10mg", doctor:"Dr. Anjali Rao", dosage:"1 tablet · once daily (night)", validTill:"22 Sep 2026", started:"22 Mar 2026" },
        { name:"Vitamin D3 60K", doctor:"Dr. Naveen Shetty", dosage:"1 sachet · once weekly", validTill:"10 Oct 2026", started:"10 Jun 2026" }
      ],
      past: [
        { name:"Azithromycin 500mg", doctor:"Dr. Sameer Kulkarni", dosage:"1 tablet · once daily, 3 days", started:"02 Feb 2026", ended:"05 Feb 2026" }
      ]
    };

    const APPOINTMENTS = {
      upcoming: [
        { doctor:"Dr. Naveen Shetty", specialty:"General Physician", date:"Today", time:"10:30 AM", location:"MedConnect Clinic · OPD 4" },
        { doctor:"Dr. Anjali Rao", specialty:"Cardiologist", date:"28 Aug 2026", time:"4:00 PM", location:"MedConnect Clinic · OPD 2" }
      ],
      past: [
        { doctor:"Dr. Priya Menon", specialty:"Orthopedic", date:"02 Mar 2026", time:"11:00 AM", location:"MedConnect Clinic · OPD 6" },
        { doctor:"Dr. Anjali Rao", specialty:"Cardiologist", date:"18 Jan 2026", time:"9:30 AM", location:"MedConnect Clinic · OPD 2" }
      ]
    };

    let VITALS = [
      { date:"10 Mar", sys:124, dia:82, weight:64.2 },
      { date:"05 Apr", sys:122, dia:80, weight:63.8 },
      { date:"12 May", sys:126, dia:84, weight:63.1 },
      { date:"20 Jun", sys:120, dia:79, weight:62.9 },
      { date:"14 Jul", sys:118, dia:78, weight:62.5 },
      { date:"14 Aug", sys:121, dia:80, weight:62.5 }
    ];

    const ACTIVITY = [
      { key:"notif1", time:"2 days ago", timeKey:"notifTime1" },
      { key:"notif2", time:"5 days ago", timeKey:"notifTime2" },
      { title:"Appointment confirmed with Dr. Naveen Shetty", time:"1 week ago" },
      { title:"Report reviewed — Chest X-Ray", time:"3 weeks ago" }
    ];

    function todayISO(){ return new Date().toISOString().split('T')[0]; }
    function fmtDate(iso){ const d = new Date(iso + "T00:00:00"); return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
    function toast(msg){
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('is-visible');
      clearTimeout(toast._tm);
      toast._tm = setTimeout(()=> el.classList.remove('is-visible'), 2800);
    }

    /* =====================================================================
       VIEW ROUTER — with real browser history so the back button
       (in-app "Back" links AND the browser/hardware back button) works.
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

    /* ---------------- Overview: mini cards + activity ---------------- */
    function renderOverview(){
      const nextAppt = APPOINTMENTS.upcoming[0];
      const miniApptHost = document.getElementById('miniAppt');
      if(nextAppt){
        let day = '—', mon = '';
        if(nextAppt.date === 'Today'){
          const d = new Date(); day = d.getDate(); mon = d.toLocaleDateString('en-GB',{month:'short'});
        } else {
          const parts = nextAppt.date.split(' ');
          day = parts[0]; mon = parts[1];
        }
        miniApptHost.innerHTML = `
          <div class="mini-appt-date"><div class="mini-appt-day">${day}</div><div class="mini-appt-mon">${mon}</div></div>
          <div>
            <div class="mini-appt-name">${nextAppt.doctor}</div>
            <div class="mini-appt-meta">${nextAppt.specialty} · ${nextAppt.date} · ${nextAppt.time}</div>
          </div>`;
      } else {
        miniApptHost.innerHTML = `<div class="empty-state" style="padding:10px 0;">${t('noRecords')}</div>`;
      }

      const activeRx = PRESCRIPTIONS.active[0];
      const miniRxHost = document.getElementById('miniRx');
      if(activeRx){
        miniRxHost.innerHTML = `
          <div class="mini-rx-name">${activeRx.name}</div>
          <div class="mini-rx-meta">${activeRx.dosage} · ${activeRx.doctor}<br>${t('validTill')} ${activeRx.validTill}</div>`;
      } else {
        miniRxHost.innerHTML = `<div class="empty-state" style="padding:10px 0;">${t('noRecords')}</div>`;
      }

      document.getElementById('statAppointments').textContent = APPOINTMENTS.upcoming.length;
      document.getElementById('statReports').textContent = REPORTS.length;
      document.getElementById('statRx').textContent = PRESCRIPTIONS.active.length;

      const tlHost = document.getElementById('activityTimeline');
      tlHost.innerHTML = '';
      ACTIVITY.forEach(a=>{
        const title = a.key ? t(a.key) : a.title;
        const time = a.timeKey ? t(a.timeKey) : a.time;
        const row = document.createElement('div');
        row.className = 'tl-item';
        row.innerHTML = `<span class="tl-dot" style="margin-top:5px;"></span>
          <div class="tl-text"><div class="tl-title">${title}</div><div class="tl-time">${time}</div></div>`;
        tlHost.appendChild(row);
      });
    }

    /* ---------------- Health Records ---------------- */
    let activeRecordType = "All";
    function renderRecordChips(){
      const chipsHost = document.getElementById('recordChips');
      chipsHost.innerHTML = '';
      const types = ["All", ...new Set(REPORTS.map(r=>r.type))];
      types.forEach(ty=>{
        const chip = document.createElement('button');
        chip.className = 'chip' + (ty===activeRecordType ? ' is-active' : '');
        chip.textContent = ty==="All" ? t('typeAll') : t(TYPE_KEY[ty]);
        chip.addEventListener('click', ()=>{ activeRecordType = ty; renderRecordChips(); renderRecords(); });
        chipsHost.appendChild(chip);
      });
    }
    function renderRecords(){
      const listHost = document.getElementById('recordList');
      const sorted = [...REPORTS].sort((a,b)=> new Date(b.date) - new Date(a.date));
      const mostRecentDate = sorted[0] ? sorted[0].date : null;
      const filtered = activeRecordType==="All" ? sorted : sorted.filter(r=>r.type===activeRecordType);

      listHost.innerHTML = '';
      if(!filtered.length){
        listHost.innerHTML = `<div class="empty-state">${t('noRecords')}</div>`;
        return;
      }
      filtered.forEach(r=>{
        const isActive = r.date === mostRecentDate;
        const row = document.createElement('div');
        row.className = 'record-row' + (isActive ? ' is-active' : '');
        row.innerHTML = `
          <span class="record-icon">${REPORT_ICONS[r.type]||'📄'}</span>
          <span class="record-main">
            <span class="record-name">${r.name} ${isActive ? '<span class="badge">'+t('activeHealthRecord')+'</span>' : ''}</span>
            <span class="record-meta">${t(TYPE_KEY[r.type]) || r.type} · ${r.doctor}</span>
            <div class="record-detail">${r.note}</div>
          </span>
          <span class="record-date">${fmtDate(r.date)}</span>
          <span class="record-dl" title="${t('download')}" aria-label="${t('download')}"><svg viewBox="0 0 16 16" fill="none"><path d="M8 2V10M8 10L5 7M8 10L11 7M3 13H13" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        `;
        row.addEventListener('click', (e)=>{
          if(e.target.closest('.record-dl')){ toast(t('downloading') + ' ' + r.name + '…'); return; }
          row.classList.toggle('is-open');
        });
        listHost.appendChild(row);
      });
    }

    /* ---------------- Prescriptions ---------------- */
    function rxCard(rx, isActive){
      const el = document.createElement('div');
      el.className = 'rx-card';
      el.innerHTML = `
        <div class="rx-top">
          <div><div class="rx-name">${rx.name}</div><div class="rx-doctor">${rx.doctor}</div></div>
          <span class="badge ${isActive?'':'status-past'}">${isActive?t('active'):t('completed')}</span>
        </div>
        <div class="rx-grid">
          <div><div class="rx-field-label">${t('dosageLabel')}</div><div class="rx-field-value">${rx.dosage}</div></div>
          <div><div class="rx-field-label">${t('startedLabel')}</div><div class="rx-field-value">${rx.started||'—'}</div></div>
          <div><div class="rx-field-label">${isActive ? t('validTill') : t('endedLabel')}</div><div class="rx-field-value">${rx.validTill||rx.ended||'—'}</div></div>
        </div>
        ${isActive ? `<div class="rx-actions">
          <button class="pill-btn" data-refill="${rx.name}">${t('requestRefill')}</button>
          <button class="pill-btn ghost" data-viewrx>${t('viewFullRx')}</button>
        </div>` : ''}
      `;
      return el;
    }
    function renderPrescriptions(){
      const activeHost = document.getElementById('rxActiveList');
      const pastHost = document.getElementById('rxPastList');
      activeHost.innerHTML = '';
      pastHost.innerHTML = '';
      PRESCRIPTIONS.active.forEach(rx => activeHost.appendChild(rxCard(rx, true)));
      PRESCRIPTIONS.past.forEach(rx => pastHost.appendChild(rxCard(rx, false)));
    }
    document.getElementById('rxActiveList').addEventListener('click', (e)=>{
      const refillBtn = e.target.closest('[data-refill]');
      if(refillBtn){ toast(t('refillRequested') + ' ' + refillBtn.dataset.refill); return; }
      if(e.target.closest('[data-viewrx]')){ toast(t('openingFullRx')); }
    });

    /* ---------------- Appointments ---------------- */
    function apptCard(a, isUpcoming){
      const el = document.createElement('div');
      el.className = 'appt-card';
      el.innerHTML = `
        <div class="appt-top">
          <div><div class="rx-name">${a.doctor}</div><div class="appt-doctor">${a.specialty}</div></div>
          <span class="badge ${isUpcoming?'':'status-past'}">${isUpcoming?t('upcoming'):t('completed')}</span>
        </div>
        <div class="appt-when"><span><b>${a.date}</b> · ${a.time}</span><span>${a.location}</span></div>
        ${isUpcoming ? `<div class="rx-actions">
          <button class="pill-btn" data-join>${t('joinCheckIn')}</button>
          <button class="pill-btn ghost" data-cancel>${t('reschedule')}</button>
        </div>` : ''}
      `;
      return el;
    }
    function renderAppointments(){
      const upHost = document.getElementById('apptUpcomingList');
      const pastHost = document.getElementById('apptPastList');
      upHost.innerHTML = '';
      pastHost.innerHTML = '';
      if(!APPOINTMENTS.upcoming.length){
        upHost.innerHTML = `<div class="empty-state">${t('noRecords')}</div>`;
      } else {
        APPOINTMENTS.upcoming.forEach(a => upHost.appendChild(apptCard(a, true)));
      }
      APPOINTMENTS.past.forEach(a => pastHost.appendChild(apptCard(a, false)));
      renderOverview(); // keep overview mini-card + stat count in sync
    }
    document.getElementById('apptUpcomingList').addEventListener('click', (e)=>{
      if(e.target.closest('[data-cancel]')){ toast(t('rescheduleSent')); return; }
      if(e.target.closest('[data-join]')){ toast(t('joiningConsult')); }
    });

    /* ---------------- Book appointment (with future-date validation) ---------------- */
    (function(){
      const bookBtn = document.getElementById('bookApptBtn');
      const overlay = document.getElementById('bookOverlay');
      const closeBtn = document.getElementById('bookCloseBtn');
      const form = document.getElementById('bookForm');
      const dateInput = document.getElementById('bookDate');
      const dateError = document.getElementById('bookDateError');

      function open(){
        dateInput.min = todayISO();
        dateError.classList.remove('is-visible');
        overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      }
      function close(){ overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
      bookBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });

      dateInput.addEventListener('input', ()=> dateError.classList.remove('is-visible'));

      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const specialtySelect = document.getElementById('bookSpecialty');
        const specialty = specialtySelect.options[specialtySelect.selectedIndex].textContent;
        const dateVal = dateInput.value;
        const timeVal = document.getElementById('bookTime').value;

        const todayMid = new Date(); todayMid.setHours(0,0,0,0);
        const chosen = dateVal ? new Date(dateVal + "T00:00:00") : null;
        if(!chosen || chosen < todayMid){
          dateError.classList.add('is-visible');
          return;
        }

        const dateLabel = chosen.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        let timeLabel = timeVal;
        if(timeVal){
          const [hh,mm] = timeVal.split(':');
          let hour = parseInt(hh,10);
          const ampm = hour>=12 ? 'PM':'AM';
          hour = hour % 12; if(hour===0) hour = 12;
          timeLabel = hour + ':' + mm + ' ' + ampm;
        }

        APPOINTMENTS.upcoming.push({ doctor:t('toBeAssigned'), specialty, date:dateLabel, time:timeLabel, location:t('clinic') });
        renderAppointments();
        close();
        toast(t('apptConfirmed') + ' ' + dateLabel + ' · ' + timeLabel);
        form.reset();
      });
    })();

    /* ---------------- Vitals: summary + SVG charts ---------------- */
    function renderVitals(){
      const summaryHost = document.getElementById('vitalSummary');
      const latest = VITALS[VITALS.length-1];
      const prev = VITALS[VITALS.length-2] || latest;
      function trend(curr, prevV){
        const diff = curr - prevV;
        if(Math.abs(diff) < 0.05) return {cls:'flat', txt:t('noChange')};
        return diff > 0 ? {cls:'up', txt:'+'+diff.toFixed(1)+' '+t('vsLast')} : {cls:'down', txt:diff.toFixed(1)+' '+t('vsLast')};
      }
      const tSys = trend(latest.sys, prev.sys);
      const tWeight = trend(latest.weight, prev.weight);

      summaryHost.innerHTML = `
        <div class="vital-box">
          <div class="vital-label">${t('bpChart').split(' (')[0]}</div>
          <div class="vital-value">${latest.sys}/${latest.dia} <span>${t('mmHg')}</span></div>
          <div class="vital-trend ${tSys.cls}">${tSys.txt}</div>
        </div>
        <div class="vital-box">
          <div class="vital-label">${t('weightChart').split(' (')[0]}</div>
          <div class="vital-value">${latest.weight} <span>${t('kg')}</span></div>
          <div class="vital-trend ${tWeight.cls}">${tWeight.txt}</div>
        </div>
        <div class="vital-box">
          <div class="vital-label">${t('readingsLogged')}</div>
          <div class="vital-value">${VITALS.length}</div>
          <div class="vital-trend flat">${t('last6')}</div>
        </div>
      `;

      drawLineChart('chartBP', [
        { data: VITALS.map(v=>v.sys), color:'#137459' },
        { data: VITALS.map(v=>v.dia), color:'#C98A1A' }
      ], VITALS.map(v=>v.date));
      drawLineChart('chartWeight', [{ data: VITALS.map(v=>v.weight), color:'#137459' }], VITALS.map(v=>v.date));
    }
    function drawLineChart(hostId, series, labels){
      const host = document.getElementById(hostId);
      const W = 560, H = 180, PAD = 28;
      const allVals = series.flatMap(s=>s.data);
      const min = Math.min(...allVals) - 3, max = Math.max(...allVals) + 3;
      const xStep = (W - PAD*2) / Math.max(labels.length - 1, 1);
      function pt(i, v){ const x = PAD + i*xStep; const y = H - PAD - ((v-min)/(max-min)) * (H - PAD*2); return [x,y]; }
      let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`;
      for(let g=0; g<=3; g++){
        const y = PAD + g*((H-PAD*2)/3);
        svg += `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="rgba(17,47,42,0.08)" stroke-width="1"/>`;
      }
      series.forEach(s=>{
        const points = s.data.map((v,i)=>pt(i,v));
        const path = points.map((p,i)=> (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
        svg += `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        points.forEach(p=>{ svg += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="#fff" stroke="${s.color}" stroke-width="2"/>`; });
      });
      labels.forEach((l,i)=>{ const [x] = pt(i,0); svg += `<text x="${x}" y="${H-6}" font-size="10" fill="#4B5B55" text-anchor="middle" font-family="Inter">${l}</text>`; });
      svg += `</svg>`;
      host.innerHTML = svg;
    }

    (function(){
      const addBtn = document.getElementById('addVitalBtn');
      const overlay = document.getElementById('vitalOverlay');
      const closeBtn = document.getElementById('vitalCloseBtn');
      const form = document.getElementById('vitalForm');
      const dateInput = document.getElementById('vitalDate');
      function open(){
        dateInput.max = todayISO();
        dateInput.value = todayISO();
        overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      }
      function close(){ overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
      addBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const sys = parseFloat(document.getElementById('vitalSys').value);
        const dia = parseFloat(document.getElementById('vitalDia').value);
        const weight = parseFloat(document.getElementById('vitalWeight').value);
        const dateVal = dateInput.value || todayISO();
        const label = new Date(dateVal + "T00:00:00").toLocaleDateString('en-GB', {day:'2-digit', month:'short'});
        VITALS.push({ date:label, sys, dia, weight });
        if(VITALS.length > 6) VITALS.shift();
        renderVitals();
        close();
        toast(t('newReadingSaved'));
        form.reset();
      });
    })();

    /* ---------------- Upload document (record date can't be future) ---------------- */
    (function(){
      const uploadBtn = document.getElementById('uploadDocBtn');
      const overlay = document.getElementById('uploadOverlay');
      const closeBtn = document.getElementById('uploadCloseBtn');
      const form = document.getElementById('uploadForm');
      const dateInput = document.getElementById('uploadDate');
      const dateError = document.getElementById('uploadDateError');

      function open(){
        dateInput.max = todayISO();
        dateError.classList.remove('is-visible');
        overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      }
      function close(){ overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
      uploadBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });
      dateInput.addEventListener('input', ()=> dateError.classList.remove('is-visible'));

      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = document.getElementById('uploadName').value.trim();
        const typeSelect = document.getElementById('uploadType');
        const type = typeSelect.value;
        const date = dateInput.value;
        if(!name || !date) return;

        const todayMid = new Date(); todayMid.setHours(0,0,0,0);
        const chosen = new Date(date + "T00:00:00");
        if(chosen > todayMid){ dateError.classList.add('is-visible'); return; }

        REPORTS.push({ name, type, doctor:"Self-uploaded", date, note:"Uploaded by patient — pending doctor review." });
        activeRecordType = "All";
        renderRecordChips();
        renderRecords();
        close();
        toast(t('docAdded'));
        form.reset();
      });
    })();

    /* ---------------- Family member switcher ---------------- */
    const FAMILY = [
      { name:"Aarav Mehta", rel:"You", id:"#MC-88219", blood:"O+", age:29, initial:"A" },
      { name:"Meera Mehta", rel:"Spouse", id:"#MC-88220", blood:"B+", age:27, initial:"M" },
      { name:"Aditi Mehta", rel:"Daughter", id:"#MC-88221", blood:"O+", age:4, initial:"A" }
    ];
    let currentFamilyMember = FAMILY[0];
    (function(){
      const wrap = document.getElementById('famSwitchWrap');
      const btn = document.getElementById('famSwitchBtn');
      const menu = document.getElementById('famMenu');

      function renderMenu(){
        menu.innerHTML = '';
        FAMILY.forEach(m=>{
          const opt = document.createElement('button');
          opt.className = 'fam-option';
          opt.innerHTML = `<span class="fam-option-avatar">${m.initial}</span>
            <span><span class="fam-option-name">${m.name}</span><br><span class="fam-option-rel">${m.rel}</span></span>`;
          opt.addEventListener('click', ()=>{ switchTo(m); wrap.classList.remove('is-open'); });
          menu.appendChild(opt);
        });
        const addBtn = document.createElement('div');
        addBtn.className = 'fam-add';
        addBtn.textContent = '+ ' + (currentLang==='hi' ? 'परिवार का सदस्य जोड़ें' : 'Add family member');
        addBtn.addEventListener('click', ()=>{ toast(t('addFamilySoon')); wrap.classList.remove('is-open'); });
        menu.appendChild(addBtn);
      }
      function switchTo(m){
        currentFamilyMember = m;
        document.getElementById('famAvatar').textContent = m.initial;
        document.getElementById('famName').textContent = m.name;
        document.getElementById('famId').textContent = m.id;
        document.getElementById('topAvatar').textContent = m.initial;
        applyGreeting();
        document.getElementById('idCardName').textContent = m.name;
        document.getElementById('idCardNumber').textContent = m.id;
        document.getElementById('idCardBlood').textContent = m.blood;
        document.getElementById('idCardAge').textContent = m.age;
        toast(t('nowViewing') + ' ' + m.name + (m.rel!=='You' ? ' ('+m.rel+')' : '') + ' — ' + t('demoDataNote'));
      }
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('is-open'); });
      document.addEventListener('click', (e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove('is-open'); });
      renderMenu();
      window._renderFamMenu = renderMenu;
    })();

    /* ---------------- Logout ---------------- */
    (function(){
      const logoutBtn = document.getElementById('logoutBtn');
      const screen = document.getElementById('logoutScreen');
      const loginAgainBtn = document.getElementById('loginAgainBtn');
      logoutBtn.addEventListener('click', ()=> screen.classList.add('is-open'));
      loginAgainBtn.addEventListener('click', ()=>{
        screen.classList.remove('is-open');
        showView('overview');
        toast(t('welcomeBack') + ', ' + currentFamilyMember.name.split(' ')[0]);
      });
    })();

    /* ---------------- Edit profile ---------------- */
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

    /* ---------------- Notification dropdown ---------------- */
    (function(){
      const wrap = document.getElementById('notifWrap');
      const bellBtn = document.getElementById('notifBellBtn');
      bellBtn.addEventListener('click', (e)=>{ e.stopPropagation(); wrap.classList.toggle('is-open'); });
      document.addEventListener('click', (e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove('is-open'); });
    })();

    /* ---------------- Sidebar SOS + top avatar ---------------- */
    (function(){
      const sosBtn = document.getElementById('sbSosBtn');
      const overlay = document.getElementById('sosOverlay');
      const closeBtn = document.getElementById('sosCloseBtn');
      const form = document.getElementById('sosForm');
      const hospitalSelect = document.getElementById('sosHospital');
      const messageInput = document.getElementById('sosMessage');
      const locationInput = document.getElementById('sosLocation');
      const contactInput = document.getElementById('sosContact');
      const errorBox = document.getElementById('sosError');
      const sendBtn = document.getElementById('sosSendBtn');

      let hospitalsCache = null;
      async function loadHospitals(){
        if(hospitalsCache) return hospitalsCache;
        try{
          const res = await fetch('/api/hospitals');
          const data = await res.json();
          hospitalsCache = data.hospitals || [];
        }catch(err){
          hospitalsCache = [];
        }
        return hospitalsCache;
      }

      async function open(){
        errorBox.classList.remove('is-visible');
        messageInput.value = '';
        locationInput.value = '';
        contactInput.value = '';
        hospitalSelect.innerHTML = '<option value="">Loading hospitals...</option>';
        overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';

        const hospitals = await loadHospitals();
        if(hospitals.length === 0){
          hospitalSelect.innerHTML = '<option value="">No hospitals registered yet</option>';
          return;
        }
        hospitalSelect.innerHTML = hospitals.map(function(h){ return '<option value="' + h.id + '">' + h.name + '</option>'; }).join('');
      }
      function close(){ overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

      sosBtn.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });

      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const hospitalId = hospitalSelect.value;
        const message = messageInput.value.trim();
        if(!hospitalId || !message){
          errorBox.classList.add('is-visible');
          return;
        }
        errorBox.classList.remove('is-visible');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        try{
          const res = await fetch('/api/hospitals/' + hospitalId + '/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              location: locationInput.value || undefined,
              contactNumber: contactInput.value || undefined,
            }),
          });
          if(res.ok){
            close();
            toast('Emergency alert sent - the hospital has been notified.');
            form.reset();
          } else {
            errorBox.textContent = 'Something went wrong. Please try again.';
            errorBox.classList.add('is-visible');
          }
        }catch(err){
          errorBox.textContent = 'Network error. Please check your connection.';
          errorBox.classList.add('is-visible');
        }finally{
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send SOS';
        }
      });
    })();
    document.getElementById('topAvatar').addEventListener('click', ()=> showView('profile'));

    /* ---------------- Global search ---------------- */
    document.getElementById('globalSearch').addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        showView('records');
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('#recordList .record-row').forEach(row=>{
          const text = row.textContent.toLowerCase();
          row.style.display = (!q || text.includes(q)) ? '' : 'none';
        });
      }
    });

    /* =====================================================================
       LANGUAGE TOGGLE — updates every data-i18n element on the page plus
       re-renders dynamic sections (records/prescriptions/appointments/vitals)
       so badges, buttons and chips switch language too, not just the sidebar.
    ===================================================================== */
    function applyGreeting(){
      document.getElementById('greetingTitle').textContent = t('greeting').replace('{name}', currentFamilyMember.name.split(' ')[0]);
    }
    function setLang(lang){
      currentLang = lang;
      document.getElementById('langEn').classList.toggle('is-active', lang==='en');
      document.getElementById('langHi').classList.toggle('is-active', lang==='hi');

      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.dataset.i18n;
        if(key === 'greeting') return; // handled separately (has dynamic name)
        el.textContent = t(key);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        el.placeholder = t(el.dataset.i18nPlaceholder);
      });
      applyGreeting();

      // re-render dynamic, data-driven sections so their generated text updates too
      renderRecordChips();
      renderRecords();
      renderPrescriptions();
      renderAppointments();
      renderVitals();
      if(window._renderFamMenu) window._renderFamMenu();
      if(window._editProfileBtnState){
        document.getElementById('editProfileBtn').textContent = window._editProfileBtnState() ? t('saveChanges') : t('editDetails');
      }
    }
    document.getElementById('langEn').addEventListener('click', ()=> setLang('en'));
    document.getElementById('langHi').addEventListener('click', ()=> setLang('hi'));

    /* ---------------- Initial render ---------------- */
    applyGreeting();
    renderOverview();
    renderRecordChips();
    renderRecords();
    renderPrescriptions();
    renderAppointments();
    renderVitals();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_HTML }} />
    </>
  );
}