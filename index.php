<?php
declare(strict_types=1);
session_start();
if (empty($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}
?><!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#352820"><title>MAK IG SmartCost</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<div class="app-shell">
  <aside class="sidebar" id="sidebar">
    <div class="brand"><div class="brand-mark">MI</div><div><strong>MAK IGA</strong><span>SMARTCOST</span></div></div>
    <div class="workspace-label">BUSINESS MANAGEMENT</div>
    <nav id="nav">
      <button class="nav-item active" data-page="dashboard"><i>⌂</i>Dashboard</button>
      <div class="nav-caption">OPERASIONAL</div>
      <button class="nav-item" data-page="products"><i>▦</i>Data Produk</button>
      <button class="nav-item" data-page="materials"><i>◈</i>Data Bahan Baku</button>
      <button class="nav-item" data-page="production"><i>◷</i>Simulasi Biaya Produksi</button>
      <button class="nav-item" data-page="pricing"><i>♢</i>Simulasi Harga Jual</button>
      <div class="nav-caption">ANALISIS BISNIS</div>
      <button class="nav-item" data-page="profits"><i>↗</i>Keuntungan</button>
      <button class="nav-item" data-page="compare"><i>▤</i>Perbandingan Produk</button>
      <button class="nav-item" data-page="finance"><i>◫</i>Analisis Keuangan</button>
      <button class="nav-item" data-page="advisor"><i>✳</i>AI Business Advisor <span class="ai-tag">AI</span></button>
      <button class="nav-item" data-page="reports"><i>▧</i>Laporan</button>
      <div class="nav-caption">PREFERENSI</div>
      <button class="nav-item" data-page="settings"><i>⚙</i>Pengaturan</button>
    </nav>
    <div class="sidebar-bottom"><div class="avatar">MA</div><div class="user-meta"><strong><?= htmlspecialchars(
        (string) ($_SESSION["user_name"] ?? "Pemilik"),
        ENT_QUOTES,
        "UTF-8",
    ) ?></strong><span>Pemilik usaha</span></div><button class="more" title="Keluar" id="resetBtn">···</button></div>
  </aside>
  <main class="main">
    <header class="topbar"><button class="hamburger" id="hamburger">☰</button><div class="crumb">MAK IGA <span>/</span> <b id="crumb">Dashboard</b></div><div class="top-actions"><span class="today" id="today"></span><button class="icon-button" id="helpBtn" title="Tentang demo">?</button><div class="avatar small">MA</div></div></header>
    <div id="content" class="content"></div>
  </main>
</div>
<div id="toast" class="toast"></div><div id="modalRoot"></div>
<script src="assets/js/app.js"></script>
</body></html>
