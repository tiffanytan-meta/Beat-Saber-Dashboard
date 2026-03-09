// ============================================================
// Beat Saber Analytics Dashboard — Main Application Logic
// ============================================================

(function () {
  "use strict";

  const D = window.BEAT_SABER_DATA;

  // Chart.js global defaults
  Chart.defaults.color = "#8892a8";
  Chart.defaults.borderColor = "rgba(45,58,82,0.5)";
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
  Chart.defaults.plugins.tooltip.backgroundColor = "#1a2235";
  Chart.defaults.plugins.tooltip.borderColor = "#2d3a52";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.elements.point.radius = 3;
  Chart.defaults.elements.point.hoverRadius = 6;
  Chart.defaults.elements.line.tension = 0.35;

  const COLORS = [
    "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981",
    "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316",
    "#a855f7", "#22d3ee", "#84cc16", "#e879f9", "#fb923c"
  ];

  // Active charts reference (for cleanup)
  const activeCharts = {};

  function destroyChart(id) {
    if (activeCharts[id]) {
      activeCharts[id].destroy();
      delete activeCharts[id];
    }
  }

  function createChart(canvasId, config) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    activeCharts[canvasId] = new Chart(ctx, config);
    return activeCharts[canvasId];
  }

  function formatNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  }

  function formatUSD(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n.toLocaleString();
  }

  // ---- Navigation ----
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");

  function switchPage(pageId) {
    navItems.forEach(n => n.classList.toggle("active", n.dataset.page === pageId));
    pages.forEach(p => p.classList.toggle("active", p.id === pageId));
    // Render page charts
    switch (pageId) {
      case "overview": renderOverview(); break;
      case "sales-overall": renderSalesOverall(); break;
      case "individual-pack": renderIndividualPack(); break;
      case "pack-release": renderPackRelease(); break;
      case "song-metrics": renderSongMetrics(); break;
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      switchPage(item.dataset.page);
      // Close mobile sidebar
      document.querySelector(".sidebar").classList.remove("open");
    });
  });

  // Mobile toggle
  document.querySelector(".mobile-toggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });

  // ============================================================
  // PAGE 1: OVERVIEW
  // ============================================================
  function renderOverview() {
    const d = D.overviewData;

    // KPIs
    document.getElementById("kpi-mau").textContent = d.kpis.totalMAU;
    document.getElementById("kpi-dau-mau").textContent = d.kpis.dauMauRatio;
    document.getElementById("kpi-session").textContent = d.kpis.avgSessionMin + " min";
    document.getElementById("kpi-attach").textContent = d.kpis.attachRateQ3;
    document.getElementById("kpi-total-players").textContent = d.kpis.totalPlayers;
    document.getElementById("kpi-songs-session").textContent = d.kpis.avgSongsPerSession;

    // Active Users chart
    createChart("chart-active-users", {
      type: "line",
      data: {
        labels: d.activeUsers.labels,
        datasets: [
          { label: "DAU", data: d.activeUsers.dau, borderColor: COLORS[0], backgroundColor: "rgba(59,130,246,0.1)", fill: true },
          { label: "WAU", data: d.activeUsers.wau, borderColor: COLORS[3], backgroundColor: "rgba(6,182,212,0.1)", fill: true },
          { label: "MAU", data: d.activeUsers.mau, borderColor: COLORS[2], backgroundColor: "rgba(139,92,246,0.1)", fill: true },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => formatNum(v) } } },
        plugins: { tooltip: { callbacks: { label: ctx => ctx.dataset.label + ": " + formatNum(ctx.parsed.y) } } }
      }
    });

    // Stickiness chart
    createChart("chart-stickiness", {
      type: "line",
      data: {
        labels: d.stickiness.labels,
        datasets: [{
          label: "DAU/MAU %",
          data: d.stickiness.values,
          borderColor: COLORS[4],
          backgroundColor: "rgba(16,185,129,0.1)",
          fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => v + "%" } } }
      }
    });

    // Attach Rate chart
    createChart("chart-attach-rate", {
      type: "line",
      data: {
        labels: d.attachRate.labels,
        datasets: [
          { label: "Quest 2", data: d.attachRate.quest2, borderColor: COLORS[0] },
          { label: "Quest 3", data: d.attachRate.quest3, borderColor: COLORS[4] },
          { label: "Quest Pro", data: d.attachRate.questPro, borderColor: COLORS[2] },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => v + "%" } } }
      }
    });

    // Gender Distribution (doughnut)
    createChart("chart-gender", {
      type: "doughnut",
      data: {
        labels: ["Male", "Female", "Other"],
        datasets: [{ data: [d.genderDistribution.male, d.genderDistribution.female, d.genderDistribution.other], backgroundColor: [COLORS[0], COLORS[1], COLORS[2]], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { position: "bottom" } }
      }
    });

    // Age Distribution (bar)
    createChart("chart-age", {
      type: "bar",
      data: {
        labels: d.ageDistribution.labels,
        datasets: [{
          label: "% of Players",
          data: d.ageDistribution.values,
          backgroundColor: COLORS.slice(0, 6).map(c => c + "cc"),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: v => v + "%" } } }
      }
    });
  }

  // ============================================================
  // PAGE 2: SALES OVERALL
  // ============================================================
  function renderSalesOverall() {
    const d = D.salesOverallData;

    // KPIs
    document.getElementById("kpi-total-revenue").textContent = d.kpis.totalRevenue;
    document.getElementById("kpi-total-units").textContent = d.kpis.totalUnitsSold;
    document.getElementById("kpi-arpu").textContent = d.kpis.avgRevenuePerUser;
    document.getElementById("kpi-purchase-rate").textContent = d.kpis.purchaseRate;
    document.getElementById("kpi-top-pack").textContent = d.kpis.topPack;
    document.getElementById("kpi-wow").textContent = d.kpis.weekOverWeekGrowth;

    // Overall Sales trend
    createChart("chart-sales-overall", {
      type: "bar",
      data: {
        labels: d.overallSales.labels,
        datasets: [{
          label: "Revenue (USD)",
          data: d.overallSales.revenue,
          backgroundColor: "rgba(59,130,246,0.6)",
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { tooltip: { callbacks: { label: ctx => formatUSD(ctx.parsed.y) } } },
        scales: { y: { ticks: { callback: v => formatUSD(v) } } }
      }
    });

    // YoY Cumulative
    createChart("chart-yoy", {
      type: "line",
      data: {
        labels: d.yoyCumulative.labels,
        datasets: [
          { label: "2024", data: d.yoyCumulative.year2024, borderColor: COLORS[5], borderDash: [5, 5] },
          { label: "2025", data: d.yoyCumulative.year2025, borderColor: COLORS[0] },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { title: { display: true, text: "Revenue ($M)" } } }
      }
    });

    // Cumulative by Pack (horizontal bar)
    const sortedPacks = [...d.cumulativeByPack].slice(0, 10);
    createChart("chart-cumulative-pack", {
      type: "bar",
      data: {
        labels: sortedPacks.map(p => p.name),
        datasets: [{
          label: "Revenue ($K)",
          data: sortedPacks.map(p => p.revenue),
          backgroundColor: COLORS.slice(0, 10).map(c => c + "cc"),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { callback: v => "$" + v + "K" } } }
      }
    });

    // Purchase Rate by Pack
    createChart("chart-purchase-rate-pack", {
      type: "bar",
      data: {
        labels: d.purchaseRateByPack.map(p => p.name),
        datasets: [
          { label: "Day 1", data: d.purchaseRateByPack.map(p => p.day1), backgroundColor: COLORS[0] + "99", borderRadius: 3 },
          { label: "Week 1", data: d.purchaseRateByPack.map(p => p.week1), backgroundColor: COLORS[3] + "99", borderRadius: 3 },
          { label: "Month 1", data: d.purchaseRateByPack.map(p => p.month1), backgroundColor: COLORS[4] + "99", borderRadius: 3 },
          { label: "Overall", data: d.purchaseRateByPack.map(p => p.overall), backgroundColor: COLORS[2] + "99", borderRadius: 3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxRotation: 45, minRotation: 45 } },
          y: { ticks: { callback: v => v + "%" } }
        }
      }
    });

    // 1d Revenue
    createChart("chart-revenue-1d", {
      type: "line",
      data: {
        labels: d.revenue1d.labels,
        datasets: [{
          label: "Daily Revenue",
          data: d.revenue1d.values,
          borderColor: COLORS[5],
          backgroundColor: "rgba(245,158,11,0.1)",
          fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => formatUSD(v) } } }
      }
    });

    // Top Songs Table
    const tbody = document.getElementById("table-top-songs");
    tbody.innerHTML = d.individualSongSales.map((s, i) => `
      <tr>
        <td><span class="rank-badge rank-${i < 3 ? i + 1 : 'other'}">${i + 1}</span></td>
        <td>${s.song}</td>
        <td>${s.pack}</td>
        <td>${formatNum(s.units)}</td>
        <td>${formatUSD(s.revenue)}</td>
      </tr>
    `).join("");
  }

  // ============================================================
  // PAGE 3: INDIVIDUAL MUSIC PACK
  // ============================================================
  function renderIndividualPack() {
    const selector = document.getElementById("filter-pack");
    if (selector.options.length <= 1) {
      D.MUSIC_PACKS.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p; opt.textContent = p;
        selector.appendChild(opt);
      });
    }
    const pack = selector.value || D.MUSIC_PACKS[0];
    const d = D.individualPackData[pack];
    if (!d) return;

    // KPIs
    document.getElementById("ip-gameplay-pct").textContent = d.gameplayPct + "%";
    document.getElementById("ip-pr-day1").textContent = d.purchaseRate.day1 + "%";
    document.getElementById("ip-pr-week1").textContent = d.purchaseRate.week1 + "%";
    document.getElementById("ip-pr-month1").textContent = d.purchaseRate.month1 + "%";
    document.getElementById("ip-pr-overall").textContent = d.purchaseRate.overall + "%";
    document.getElementById("ip-w1-sales").textContent = formatNum(d.week1_2.week1);
    document.getElementById("ip-w2-sales").textContent = formatNum(d.week1_2.week2);

    // Sales chart
    createChart("chart-ip-sales", {
      type: "bar",
      data: {
        labels: d.sales.labels,
        datasets: [
          { label: "Units", data: d.sales.units, backgroundColor: COLORS[0] + "99", borderRadius: 4, yAxisID: "y" },
          { label: "Revenue ($)", data: d.sales.revenue, type: "line", borderColor: COLORS[5], yAxisID: "y1" },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { position: "left", ticks: { callback: v => formatNum(v) } },
          y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { callback: v => formatUSD(v) } },
        }
      }
    });

    // Purchasers
    createChart("chart-ip-purchasers", {
      type: "bar",
      data: {
        labels: d.purchasers.labels,
        datasets: [
          { label: "New", data: d.purchasers.newPurchasers, backgroundColor: COLORS[4] + "cc", borderRadius: 4 },
          { label: "Repeat", data: d.purchasers.repeatPurchasers, backgroundColor: COLORS[2] + "cc", borderRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => formatNum(v) } } }
      }
    });

    // Gender
    createChart("chart-ip-gender", {
      type: "doughnut",
      data: {
        labels: d.genderBreakdown.labels,
        datasets: [{ data: d.genderBreakdown.values, backgroundColor: [COLORS[0], COLORS[1], COLORS[2]], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "bottom" } } }
    });

    // Song purchases table
    const tbody = document.getElementById("table-ip-songs");
    tbody.innerHTML = d.songPurchases.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td>${formatNum(s.units)}</td>
        <td>${formatUSD(s.revenue)}</td>
      </tr>
    `).join("");
  }

  document.getElementById("filter-pack").addEventListener("change", renderIndividualPack);

  // ============================================================
  // PAGE 4: MUSIC PACK RELEASE
  // ============================================================
  function renderPackRelease() {
    const selector = document.getElementById("filter-release-pack");
    if (selector.options.length <= 1) {
      D.MUSIC_PACKS.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p; opt.textContent = p;
        selector.appendChild(opt);
      });
    }
    const pack = selector.value || D.MUSIC_PACKS[0];
    const d = D.releaseData[pack];
    if (!d) return;

    // Before/After cards
    document.getElementById("ba-day1-before-7d").textContent = d.beforeAfter.day1_before7D + "%";
    document.getElementById("ba-day1-after-7d").textContent = d.beforeAfter.day1_after7D + "%";
    document.getElementById("ba-day1-before-28d").textContent = d.beforeAfter.day1_before28D + "%";
    document.getElementById("ba-day1-after-28d").textContent = d.beforeAfter.day1_after28D + "%";
    document.getElementById("ba-rev-before-7d").textContent = "$" + d.avgRevenue.before7D;
    document.getElementById("ba-rev-after-7d").textContent = "$" + d.avgRevenue.after7D;
    document.getElementById("ba-rev-before-28d").textContent = "$" + d.avgRevenue.before28D;
    document.getElementById("ba-rev-after-28d").textContent = "$" + d.avgRevenue.after28D;

    // Daily sales since release
    createChart("chart-release-daily", {
      type: "line",
      data: {
        labels: d.salesSinceRelease.labels.map(v => "Day " + v),
        datasets: [{
          label: "Daily Sales",
          data: d.salesSinceRelease.daily,
          borderColor: COLORS[1],
          backgroundColor: "rgba(236,72,153,0.1)",
          fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => formatNum(v) } } }
      }
    });

    // Cumulative
    createChart("chart-release-cumulative", {
      type: "line",
      data: {
        labels: d.cumulativeSales.labels.map(v => "Day " + v),
        datasets: [{
          label: "Cumulative Sales",
          data: d.cumulativeSales.values,
          borderColor: COLORS[0],
          backgroundColor: "rgba(59,130,246,0.1)",
          fill: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => formatNum(v) } } }
      }
    });

    // Songs sold table
    const tbody = document.getElementById("table-release-songs");
    tbody.innerHTML = d.songsSold.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td>${formatNum(s.day7)}</td>
        <td>${formatNum(s.day30)}</td>
        <td>${formatNum(s.day90)}</td>
      </tr>
    `).join("");
  }

  document.getElementById("filter-release-pack").addEventListener("change", renderPackRelease);

  // ============================================================
  // PAGE 5: SONG METRICS
  // ============================================================
  function renderSongMetrics() {
    const packSel = document.getElementById("filter-sm-pack");
    const songSel = document.getElementById("filter-sm-song");

    if (packSel.options.length <= 1) {
      D.MUSIC_PACKS.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p; opt.textContent = p;
        packSel.appendChild(opt);
      });
    }

    const pack = packSel.value || D.MUSIC_PACKS[0];

    // Populate songs for selected pack
    const songs = D.SONGS[pack] || [];
    songSel.innerHTML = "";
    songs.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s; opt.textContent = s;
      songSel.appendChild(opt);
    });

    const song = songSel.value || songs[0];
    const key = `${pack} — ${song}`;
    const d = D.songMetricsData[key];
    if (!d) return;

    // Gameplays chart
    createChart("chart-sm-gameplays", {
      type: "line",
      data: {
        labels: d.gameplays.labels,
        datasets: [
          { label: "Total Gameplays", data: d.gameplays.total, borderColor: COLORS[0], backgroundColor: "rgba(59,130,246,0.1)", fill: true },
          { label: "Unique Players", data: d.gameplays.unique, borderColor: COLORS[4], backgroundColor: "rgba(16,185,129,0.1)", fill: true },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { ticks: { callback: v => formatNum(v) } } }
      }
    });

    // Difficulty breakdown (polar)
    createChart("chart-sm-difficulty", {
      type: "polarArea",
      data: {
        labels: d.difficultyBreakdown.labels,
        datasets: [{
          data: d.difficultyBreakdown.values,
          backgroundColor: COLORS.slice(0, 5).map(c => c + "99"),
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });

    // Game mode (doughnut)
    createChart("chart-sm-gamemode", {
      type: "doughnut",
      data: {
        labels: d.gameModeBreakdown.labels,
        datasets: [{ data: d.gameModeBreakdown.values, backgroundColor: [COLORS[0], COLORS[1], COLORS[3]], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "bottom" } } }
    });

    // Completion rate
    createChart("chart-sm-completion", {
      type: "bar",
      data: {
        labels: d.completionRate.labels,
        datasets: [{
          label: "Completion %",
          data: d.completionRate.values,
          backgroundColor: d.completionRate.values.map(v =>
            v >= 80 ? COLORS[4] + "cc" : v >= 60 ? COLORS[5] + "cc" : COLORS[6] + "cc"
          ),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { max: 100, ticks: { callback: v => v + "%" } } }
      }
    });

    // Country breakdown table
    const tbody = document.getElementById("table-sm-countries");
    tbody.innerHTML = d.countryBreakdown.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c.country}</td>
        <td>${formatNum(c.gameplays)}</td>
        <td>${c.pctTotal}%</td>
      </tr>
    `).join("");
  }

  document.getElementById("filter-sm-pack").addEventListener("change", () => {
    renderSongMetrics();
  });
  document.getElementById("filter-sm-song").addEventListener("change", renderSongMetrics);

  // ---- Initial render ----
  setTimeout(() => {
    document.querySelector(".loading-overlay").classList.add("hidden");
    switchPage("overview");
  }, 600);

})();
