const seed = {
  products: [
    {
      id: 1,
      name: "Iga Bakar Madu",
      category: "Menu utama",
      description: "Iga bakar dengan saus madu khas",
      price: 45000,
      cost: 28500,
      status: "Aktif",
    },
    {
      id: 2,
      name: "Iga Penyet",
      category: "Menu utama",
      description: "Iga goreng dengan sambal penyet",
      price: 42000,
      cost: 27000,
      status: "Aktif",
    },
    {
      id: 3,
      name: "Sop Iga",
      category: "Menu utama",
      description: "Sop iga kuah bening",
      price: 38000,
      cost: 26000,
      status: "Aktif",
    },
    {
      id: 4,
      name: "Nasi Putih",
      category: "Pendamping",
      description: "Nasi putih pulen",
      price: 7000,
      cost: 3500,
      status: "Aktif",
    },
  ],
  materials: [
    {
      id: 1,
      name: "Iga sapi",
      qty: 10,
      unit: "kg",
      price: 125000,
      note: "Pemasok utama",
    },
    {
      id: 2,
      name: "Madu",
      qty: 2,
      unit: "liter",
      price: 85000,
      note: "Madu lokal",
    },
    {
      id: 3,
      name: "Bumbu rempah",
      qty: 3,
      unit: "paket",
      price: 35000,
      note: "Campuran bumbu",
    },
    {
      id: 4,
      name: "Kemasan makanan",
      qty: 100,
      unit: "pcs",
      price: 1200,
      note: "Kemasan kraft",
    },
  ],
  sales: [
    { productId: 1, qty: 42, date: new Date().toISOString().slice(0, 10) },
    { productId: 2, qty: 31, date: new Date().toISOString().slice(0, 10) },
    { productId: 3, qty: 25, date: new Date().toISOString().slice(0, 10) },
    { productId: 4, qty: 38, date: new Date().toISOString().slice(0, 10) },
  ],
  simulations: [],
};
let db = JSON.parse(localStorage.getItem("makig-data") || "null") || seed;
let page = "dashboard",
  chartInstances = [];
const save = () => localStorage.setItem("makig-data", JSON.stringify(db)),
  rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID"),
  fmt = (n) => Number(n || 0).toLocaleString("id-ID");
document.querySelector("#today").textContent = new Intl.DateTimeFormat(
  "id-ID",
  { weekday: "long", day: "numeric", month: "long", year: "numeric" },
).format(new Date());
function toast(s) {
  let t = document.querySelector("#toast");
  t.textContent = s;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2300);
}
function products() {
  return db.products;
}
function salesFor(id) {
  return db.sales
    .filter((s) => s.productId === id)
    .reduce((a, b) => a + b.qty, 0);
}
function productCost(p) {
  return Number(p.cost) || 0;
}
function profit(p) {
  return (p.price - productCost(p)) * salesFor(p.id);
}
function totalRevenue() {
  return db.sales.reduce((a, s) => {
    let p = products().find((p) => p.id === s.productId);
    return a + (p ? p.price * s.qty : 0);
  }, 0);
}
function totalCost() {
  return db.sales.reduce((a, s) => {
    let p = products().find((p) => p.id === s.productId);
    return a + (p ? productCost(p) * s.qty : 0);
  }, 0);
}
const titles = {
  dashboard: "Dashboard",
  products: "Data Produk",
  materials: "Data Bahan Baku",
  production: "Simulasi Biaya Produksi",
  pricing: "Simulasi Harga Jual",
  profits: "Keuntungan & Kerugian",
  compare: "Perbandingan Produk",
  finance: "Analisis Keuangan",
  advisor: "AI Business Advisor",
  reports: "Laporan",
  settings: "Pengaturan",
};
document.querySelector("#nav").addEventListener("click", (e) => {
  let b = e.target.closest("[data-page]");
  if (!b) return;
  page = b.dataset.page;
  document
    .querySelectorAll(".nav-item")
    .forEach((x) => x.classList.toggle("active", x === b));
  document.querySelector("#crumb").textContent = titles[page];
  document.querySelector("#sidebar").classList.remove("open");
  render();
});
document.querySelector("#hamburger").onclick = () =>
  document.querySelector("#sidebar").classList.toggle("open");
document.querySelector("#helpBtn").onclick = () =>
  toast("Demo lokal — data tersimpan di browser ini.");
document.querySelector("#resetBtn").onclick = () => {
  if (confirm("Hapus seluruh perubahan demo dan pulihkan data awal?")) {
    localStorage.removeItem("makig-data");
    location.reload();
  }
};
function render() {
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];
  let c = document.querySelector("#content");
  c.innerHTML = {
    dashboard: dashboard,
    products: productPage,
    materials: materialPage,
    production: productionPage,
    pricing: pricingPage,
    profits: profitsPage,
    compare: comparePage,
    finance: financePage,
    advisor: advisorPage,
    reports: reportsPage,
    settings: settingsPage,
  }[page]();
  if (page === "dashboard" || page === "finance" || page === "compare")
    drawCharts();
}
const note =
  '<div class="demo-note">Data demo untuk eksplorasi awal. Perubahan disimpan di browser perangkat ini.</div>';
function head(title, sub, btn = "") {
  return `<div class="page-head"><div><div class="eyebrow">MAK IGA · SMARTCOST</div><h1>${title}</h1><p>${sub}</p></div>${btn}</div>`;
}
function dashboard() {
  let top = [...products()].sort((a, b) => profit(b) - profit(a)),
    rev = totalRevenue(),
    cost = totalCost(),
    net = rev - cost,
    loss = products().reduce(
      (total, product) => total + Math.max(0, -profit(product)),
      0,
    );
  return `${head("Selamat datang di MAK IG SmartCost", "Ringkasan dan insight keuangan usaha Anda.", '<button class="primary" onclick="go(\'production\')">＋ Simulasi baru</button>')}${note}<div class="stats">${[
    ["Total Produk", products().length, "▦", "Produk terdaftar"],
    ["Total Pendapatan", rupiah(rev), "↗", "Dari penjualan tercatat"],
    ["Biaya Produksi", rupiah(cost), "◈", "Total biaya produk terjual"],
    ["Total Keuntungan", rupiah(net), "♢", "Pendapatan − biaya"],
    ["Total Kerugian", rupiah(loss), "⌁", "Produk dengan hasil negatif"],
  ]
    .map(
      (x) =>
        `<div class="stat-card"><div class="stat-top">${x[0]}<span class="stat-icon">${x[2]}</span></div><div class="stat-value">${x[1]}</div><div class="stat-foot">${x[3]}</div></div>`,
    )
    .join(
      "",
    )}</div><div class="grid-main"><section class="card"><div class="card-head"><div><div class="card-title">Pendapatan & biaya</div><div class="card-sub">Ikhtisar dari penjualan tersimpan</div></div><select id="dashboardRange" class="select" onchange="drawDashboardTimeline()"><option value="daily">7 hari terakhir</option><option value="monthly">12 bulan terakhir</option></select></div><div class="chart-wrap"><canvas id="revenueChart"></canvas></div></section><section class="card"><div class="card-head"><div><div class="card-title">Ringkasan keuangan</div><div class="card-sub">Kondisi berdasarkan penjualan tercatat</div></div></div><div class="chart-wrap"><canvas id="donutChart"></canvas></div><div class="stat-foot" style="text-align:center">Pendapatan ${rupiah(rev)} · Biaya ${rupiah(cost)}</div></section></div><div class="grid-bottom"><section class="card"><div class="card-head"><div><div class="card-title">Produk unggulan</div><div class="card-sub">Urut berdasarkan keuntungan tercatat</div></div></div>${top
    .slice(0, 3)
    .map(
      (p, i) =>
        `<div class="product-row"><div class="product-thumb">${["♨", "♨", "◉"][i]}</div><div class="product-info"><strong>${p.name}</strong><span>${salesFor(p.id)} terjual</span></div><div class="row-value ${profit(p) >= 0 ? "positive" : "negative"}">${rupiah(profit(p))}<span>keuntungan</span></div></div>`,
    )
    .join(
      "",
    )}</section><section class="card"><div class="card-head"><div><div class="card-title">Keuntungan per produk</div><div class="card-sub">Total keuntungan dari penjualan</div></div></div><div class="chart-wrap"><canvas id="productChart"></canvas></div></section><section class="card ai-card"><div class="card-head"><div><div class="ai-label">INSIGHT BISNIS</div><div class="card-title" style="margin-top:7px">Ringkasan usaha Anda</div></div></div><div class="ai-message">${top[0] ? `${top[0].name} mencatat keuntungan tertinggi sebesar ${rupiah(profit(top[0]))}. Tinjau biaya bahan baku dan volume penjualan secara berkala untuk menjaga margin.` : "Tambahkan data produk dan penjualan untuk melihat insight."}<br><br><small>Insight berbasis perhitungan lokal dari data demo.</small></div><button class="small-link" onclick="go('advisor')">Buka Business Advisor →</button></section></div>`;
}
function drawCharts() {
  let labels = products().map((p) => p.name),
    vals = products().map((p) => profit(p));
  const common = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 }, color: "#938b80" },
      },
      y: {
        grid: { color: "#f1ede7" },
        ticks: { font: { size: 9 }, color: "#938b80" },
      },
    },
  };
  if (document.querySelector("#revenueChart"))
    chartInstances.push(
      new Chart(document.querySelector("#revenueChart"), {
        type: "line",
        data: {
          labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
          datasets: [
            {
              label: "Pendapatan",
              data: [0.62, 0.72, 0.68, 0.87, 0.75, 0.96, 1].map((x) =>
                Math.round((totalRevenue() / 5) * x),
              ),
              borderColor: "#b99a65",
              backgroundColor: "#b99a651b",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Biaya",
              data: [0.44, 0.52, 0.49, 0.6, 0.57, 0.68, 0.72].map((x) =>
                Math.round((totalCost() / 5) * x),
              ),
              borderColor: "#a9a093",
              backgroundColor: "transparent",
              tension: 0.4,
            },
          ],
        },
        options: {
          ...common,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { boxWidth: 8, font: { size: 9 } },
            },
          },
        },
      }),
    );
  if (document.querySelector("#donutChart"))
    chartInstances.push(
      new Chart(document.querySelector("#donutChart"), {
        type: "doughnut",
        data: {
          labels: ["Pendapatan", "Biaya"],
          datasets: [
            {
              data: [Math.max(totalRevenue(), 1), Math.max(totalCost(), 1)],
              backgroundColor: ["#64836d", "#e9dfd0"],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 9, font: { size: 9 } },
            },
          },
        },
      }),
    );
  if (document.querySelector("#productChart"))
    chartInstances.push(
      new Chart(document.querySelector("#productChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data: vals,
              backgroundColor: "#b99a65",
              borderRadius: 4,
              barThickness: 17,
            },
          ],
        },
        options: common,
      }),
    );
  if (document.querySelector("#financeChart"))
    chartInstances.push(
      new Chart(document.querySelector("#financeChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Pendapatan",
              data: products().map((p) => p.price * salesFor(p.id)),
              backgroundColor: "#64836d",
              borderRadius: 4,
            },
            {
              label: "Biaya",
              data: products().map((p) => p.cost * salesFor(p.id)),
              backgroundColor: "#d8cbb5",
              borderRadius: 4,
            },
          ],
        },
        options: {
          ...common,
          plugins: { legend: { display: true, position: "bottom" } },
        },
      }),
    );
  if (document.querySelector("#compareChart"))
    chartInstances.push(
      new Chart(document.querySelector("#compareChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Keuntungan",
              data: vals,
              backgroundColor: vals.map((v) => (v < 0 ? "#b96b65" : "#b99a65")),
              borderRadius: 4,
            },
          ],
        },
        options: { ...common, indexAxis: "y" },
      }),
    );
}
function go(p) {
  page = p;
  document
    .querySelectorAll(".nav-item")
    .forEach((x) => x.classList.toggle("active", x.dataset.page === p));
  document.querySelector("#crumb").textContent = titles[p];
  render();
}
function productPage() {
  return `${head("Data Produk", "Kelola menu dan harga jual MAK IGA.", '<button class="primary" onclick="openProduct()">＋ Tambah produk</button>')}${note}<div class="card"><div class="toolbar"><input class="search" id="productSearch" placeholder="Cari nama produk…" oninput="filterRows()"><select id="categoryFilter" class="select" onchange="filterRows()"><option value="">Semua kategori</option>${[...new Set(products().map((p) => p.category))].map((c) => `<option>${c}</option>`).join("")}</select></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama Produk</th><th>Kategori</th><th>Harga Jual</th><th>Biaya / Unit</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="productRows">${products()
    .map(
      (p) =>
        `<tr data-search="${p.name.toLowerCase()}" data-category="${p.category}"><td><b>${p.name}</b><div class="stat-foot">${p.description || ""}</div></td><td>${p.category}</td><td>${rupiah(p.price)}</td><td>${rupiah(p.cost)}</td><td><span class="badge">${p.status}</span></td><td class="actions"><button onclick="openProduct(${p.id})">Edit</button><button onclick="deleteProduct(${p.id})">Hapus</button></td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
}
function filterRows() {
  let q = document.querySelector("#productSearch").value.toLowerCase(),
    cat = document.querySelector("#categoryFilter").value;
  document
    .querySelectorAll("#productRows tr")
    .forEach(
      (r) =>
        (r.hidden =
          !r.dataset.search.includes(q) || (cat && r.dataset.category !== cat)),
    );
}
function materialPage() {
  return `${head("Data Bahan Baku", "Pantau harga pembelian dan satuan bahan produksi.", '<button class="primary" onclick="openMaterial()">＋ Tambah bahan</button>')}${note}<div class="card"><div class="toolbar"><input class="search" placeholder="Cari bahan baku…" oninput="document.querySelectorAll('#materialRows tr').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(this.value.toLowerCase()))"></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Bahan Baku</th><th>Jumlah Pembelian</th><th>Satuan</th><th>Harga / Satuan</th><th>Nilai Pembelian</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody id="materialRows">${db.materials.map((m) => `<tr><td><b>${m.name}</b></td><td>${fmt(m.qty)}</td><td>${m.unit}</td><td>${rupiah(m.price)}</td><td>${rupiah(m.qty * m.price)}</td><td>${m.note || "—"}</td><td class="actions"><button onclick="openMaterial(${m.id})">Edit</button><button onclick="deleteMaterial(${m.id})">Hapus</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
function productionPage() {
  return `${head("Simulasi Biaya Produksi", "Hitung modal produksi dan biaya per unit.")} ${note}<div class="grid-main"><section class="card"><div class="card-head"><div class="card-title">Detail simulasi</div></div><div class="form-grid"><div class="field"><label>Nama produk</label><select id="simProduct" onchange="calculateProduction()">${products()
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join(
      "",
    )}</select></div><div class="field"><label>Jumlah hasil produksi (unit)</label><input type="number" id="yield" min="1" value="10" oninput="calculateProduction()"></div><div class="field full"><label>Bahan baku yang digunakan</label><div id="ingredients">${ingredientRow()}</div><button class="ghost" onclick="addIngredient()">＋ Tambah bahan baku</button></div><div class="field"><label>Biaya operasional tambahan (Rp)</label><input id="overhead" type="number" min="0" value="50000" oninput="calculateProduction()"></div></div></section><section class="card"><div class="card-head"><div class="card-title">Ringkasan biaya</div></div><div id="productionResult"></div><button class="primary" style="width:100%;margin-top:15px" onclick="saveSimulation()">Simpan simulasi</button></section></div>`;
}
function ingredientRow() {
  return `<div class="ingredient" style="display:flex;gap:8px;margin:8px 0"><select class="materialChoice" onchange="calculateProduction()" style="flex:1;padding:9px;border:1px solid var(--line);border-radius:6px">${db.materials.map((m) => `<option value="${m.id}">${m.name} · ${rupiah(m.price)}/${m.unit}</option>`).join("")}</select><input class="materialQty" type="number" min="0" value="1" oninput="calculateProduction()" style="width:82px;padding:9px;border:1px solid var(--line);border-radius:6px"><button class="ghost" onclick="this.parentNode.remove();calculateProduction()">×</button></div>`;
}
function addIngredient() {
  document
    .querySelector("#ingredients")
    .insertAdjacentHTML("beforeend", ingredientRow());
  calculateProduction();
}
function calculateProduction() {
  if (!document.querySelector("#productionResult")) return;
  let mats = [...document.querySelectorAll(".ingredient")].map((r) => {
    let m = db.materials.find(
      (x) => x.id == r.querySelector(".materialChoice").value,
    );
    return m ? m.price * Number(r.querySelector(".materialQty").value) : 0;
  });
  let raw = mats.reduce((a, b) => a + b, 0),
    over = Number(document.querySelector("#overhead").value),
    qty = Math.max(1, Number(document.querySelector("#yield").value));
  document.querySelector("#productionResult").innerHTML =
    `<div class="product-row"><span class="product-info">Biaya bahan baku</span><b>${rupiah(raw)}</b></div><div class="product-row"><span class="product-info">Biaya operasional</span><b>${rupiah(over)}</b></div><div class="result-box"><span>Total biaya produksi</span><strong>${rupiah(raw + over)}</strong></div><div class="result-box"><span>Biaya produksi per unit</span><strong>${rupiah((raw + over) / qty)}</strong></div>`;
}
function saveSimulation() {
  let p = products().find(
    (p) => p.id == document.querySelector("#simProduct").value,
  );
  let cost = Number(
    document
      .querySelector("#productionResult")
      .querySelectorAll("strong")[1]
      .textContent.replace(/[^0-9]/g, ""),
  );
  if (p) {
    p.cost = cost;
    db.simulations.push({
      productId: p.id,
      cost,
      date: new Date().toISOString(),
    });
    save();
    toast("Simulasi disimpan dan biaya produk diperbarui.");
  }
}
function pricingPage() {
  return `${head("Simulasi Harga Jual", "Tentukan harga dengan target margin yang Anda inginkan.")}${note}<div class="card" style="max-width:760px"><div class="form-grid"><div class="field"><label>Pilih produk</label><select id="priceProduct" onchange="calcPrice()">${products()
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join(
      "",
    )}</select></div><div class="field"><label>Target keuntungan (%)</label><input id="margin" type="number" value="40" min="0" oninput="calcPrice()"></div><div class="field"><label>Biaya produksi per unit</label><input id="baseCost" readonly></div><div class="field"><label>Harga jual manual (opsional)</label><input id="manualPrice" type="number" placeholder="Gunakan rekomendasi" oninput="calcPrice()"></div></div><div id="priceResult"></div><button class="primary" onclick="toast('Simulasi harga tersimpan.')">Simpan simulasi harga</button></div>`;
}
function calcPrice() {
  let p = products().find(
    (p) => p.id == document.querySelector("#priceProduct").value,
  );
  if (!p) return;
  let cost = Number(p.cost),
    target = Number(document.querySelector("#margin").value),
    suggest = cost * (1 + target / 100),
    price = Number(document.querySelector("#manualPrice").value) || suggest;
  document.querySelector("#baseCost").value = rupiah(cost);
  document.querySelector("#priceResult").innerHTML =
    `<div class="result-box"><span>Target keuntungan / unit</span><strong>${rupiah((cost * target) / 100)}</strong></div><div class="result-box"><span>Harga jual rekomendasi</span><strong>${rupiah(suggest)}</strong></div><div class="result-box"><span>Estimasi keuntungan / unit</span><strong class="${price >= cost ? "positive" : "negative"}">${rupiah(price - cost)}</strong></div>`;
}
function profitsPage() {
  return `${head("Keuntungan & Kerugian", "Pendapatan hanya dihitung dari unit yang tercatat terjual.")}${note}<div class="card"><div class="toolbar"><select class="select"><option>Periode: semua data</option><option>Bulan ini</option></select><button class="secondary" onclick="toast('Data dihitung dari penjualan demo.')">Perbarui</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Harga / unit</th><th>Biaya / unit</th><th>Terjual</th><th>Pendapatan</th><th>Biaya terjual</th><th>Laba / rugi</th></tr></thead><tbody>${products()
    .map(
      (p) =>
        `<tr><td><b>${p.name}</b></td><td>${rupiah(p.price)}</td><td>${rupiah(p.cost)}</td><td>${salesFor(p.id)}</td><td>${rupiah(p.price * salesFor(p.id))}</td><td>${rupiah(p.cost * salesFor(p.id))}</td><td class="${profit(p) >= 0 ? "positive" : "negative"}"><b>${rupiah(profit(p))}</b></td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
}
function comparePage() {
  return `${head("Perbandingan Produk", "Kenali kontribusi keuntungan setiap produk.")}${note}<div class="grid-main"><section class="card"><div class="card-head"><div><div class="card-title">Keuntungan total per produk</div><div class="card-sub">Pendapatan dikurangi biaya produksi terjual</div></div></div><div class="chart-wrap"><canvas id="compareChart"></canvas></div></section><section class="card"><div class="card-title">Peringkat keuntungan</div>${[
    ...products(),
  ]
    .sort((a, b) => profit(b) - profit(a))
    .map(
      (p, i) =>
        `<div class="product-row"><div class="product-thumb">0${i + 1}</div><div class="product-info"><strong>${p.name}</strong><span>${salesFor(p.id)} unit · Margin ${p.price ? fmt(((p.price - p.cost) / p.price) * 100) : 0}%</span></div><div class="row-value ${profit(p) >= 0 ? "positive" : "negative"}">${rupiah(profit(p))}</div></div>`,
    )
    .join(
      "",
    )}</section></div><div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Biaya / unit</th><th>Harga jual</th><th>Laba / unit</th><th>Terjual</th><th>Total laba</th></tr></thead><tbody>${products()
    .map(
      (p) =>
        `<tr><td>${p.name}</td><td>${rupiah(p.cost)}</td><td>${rupiah(p.price)}</td><td class="${p.price >= p.cost ? "positive" : "negative"}">${rupiah(p.price - p.cost)}</td><td>${salesFor(p.id)}</td><td class="${profit(p) >= 0 ? "positive" : "negative"}"><b>${rupiah(profit(p))}</b></td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
}
function financePage() {
  return `${head("Analisis Keuangan", "Visualisasi pendapatan, biaya, dan keuntungan usaha.")}${note}<div class="stats">${[
    ["Pendapatan", rupiah(totalRevenue())],
    ["Biaya Produksi", rupiah(totalCost())],
    ["Keuntungan Bersih", rupiah(totalRevenue() - totalCost())],
  ]
    .map(
      (x) =>
        `<div class="stat-card"><div class="stat-top">${x[0]}</div><div class="stat-value">${x[1]}</div><div class="stat-foot">Berdasarkan penjualan tercatat</div></div>`,
    )
    .join(
      "",
    )}</div><div class="card"><div class="card-head"><div><div class="card-title">Pendapatan vs biaya per produk</div><div class="card-sub">Periode: seluruh data penjualan</div></div><select class="select"><option>Semua waktu</option><option>Bulanan</option></select></div><div class="chart-wrap" style="height:300px"><canvas id="financeChart"></canvas></div></div>`;
}
function advisorPage() {
  return `${head("AI Business Advisor", "Tanya dan telaah kondisi usaha berdasarkan data yang tersedia.")}${note}<div class="grid-main"><section class="card"><div class="ai-label">SMARTCOST INSIGHT</div><h2 style="font:600 20px 'Playfair Display';color:var(--brown)">Ringkasan bisnis Anda</h2><p style="font-size:12px;line-height:1.8;color:#746d63">${products().length ? `Berdasarkan data demo, pendapatan tercatat <b>${rupiah(totalRevenue())}</b> dengan biaya produksi <b>${rupiah(totalCost())}</b> dan keuntungan <b>${rupiah(totalRevenue() - totalCost())}</b>. Produk dengan keuntungan tertinggi adalah <b>${[...products()].sort((a, b) => profit(b) - profit(a))[0].name}</b>.` : "Tambahkan data produk dan penjualan untuk mendapatkan analisis."}</p><p class="stat-foot">Analisis otomatis lokal, bukan respons OpenAI. Integrasi backend memerlukan server PHP, database, dan API key.</p></section><section class="card"><div class="card-title">Apa yang bisa ditinjau</div><div class="product-row"><span>✳</span><span class="product-info">Margin dan produk unggulan</span></div><div class="product-row"><span>✳</span><span class="product-info">Kesenjangan harga dengan biaya</span></div><div class="product-row"><span>✳</span><span class="product-info">Kelengkapan data penjualan</span></div></section></div><section class="card"><div class="card-head"><div><div class="card-title">Tanya Business Advisor</div><div class="card-sub">Jawaban ringkas dari angka yang tersedia</div></div></div><div class="chat" id="chat"><div class="bubble">Halo! Saya dapat membantu membaca ringkasan data usaha yang ada di halaman ini. Apa yang ingin Anda ketahui?</div></div><div class="quick"><button onclick="ask('Produk apa yang paling menguntungkan?')">Produk paling menguntungkan?</button><button onclick="ask('Bagaimana cara mengurangi biaya produksi?')">Cara mengurangi biaya?</button><button onclick="ask('Bagaimana kondisi keuntungan usaha saya?')">Kondisi keuntungan?</button></div><form class="chat-form" onsubmit="event.preventDefault();ask(this.querySelector('input').value);this.reset()"><input placeholder="Tulis pertanyaan…"><button class="primary">Kirim</button></form></section>`;
}
function ask(q) {
  if (!q) return;
  let c = document.querySelector("#chat");
  c.insertAdjacentHTML(
    "beforeend",
    `<div class="bubble me">${escapeHtml(q)}</div>`,
  );
  let answer = "";
  if (/paling menguntungkan|produk unggulan/i.test(q)) {
    let p = [...products()].sort((a, b) => profit(b) - profit(a))[0];
    answer = p
      ? `${p.name} menghasilkan keuntungan tercatat ${rupiah(profit(p))} dari ${salesFor(p.id)} unit terjual. Ini berasal dari harga dan biaya pada data yang tersimpan.`
      : "Belum ada data produk.";
  } else if (/biaya/i.test(q)) {
    let m = [...db.materials].sort((a, b) => b.price - a.price)[0];
    answer = `Bahan dengan harga satuan tertinggi pada daftar adalah ${m?.name || "belum tersedia"} (${rupiah(m?.price || 0)}/${m?.unit || "unit"}). Catat pemakaian bahan per resep dan bandingkan pemasok untuk menilai peluang efisiensi.`;
  } else
    answer = `Dari penjualan yang tercatat, pendapatan ${rupiah(totalRevenue())}, biaya produksi ${rupiah(totalCost())}, dan keuntungan ${rupiah(totalRevenue() - totalCost())}. Data ini demo lokal; tambahkan transaksi aktual dan biaya operasional agar analisis lebih representatif.`;
  setTimeout(() => {
    c.insertAdjacentHTML(
      "beforeend",
      `<div class="bubble">${escapeHtml(answer)}</div>`,
    );
    c.scrollTop = c.scrollHeight;
  }, 220);
  c.scrollTop = c.scrollHeight;
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function reportsPage() {
  return `${head("Laporan", "Tinjau dan cetak ringkasan data usaha.")}${note}<div class="card"><div class="toolbar"><select class="select"><option>Semua periode</option><option>Bulan ini</option></select><button class="secondary" onclick="window.print()">Cetak / Simpan PDF</button></div><h3 style="font:600 18px 'Playfair Display'">Ringkasan penjualan produk</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Unit terjual</th><th>Pendapatan</th><th>Biaya produksi</th><th>Keuntungan</th></tr></thead><tbody>${products()
    .map(
      (p) =>
        `<tr><td>${p.name}</td><td>${salesFor(p.id)}</td><td>${rupiah(p.price * salesFor(p.id))}</td><td>${rupiah(p.cost * salesFor(p.id))}</td><td class="${profit(p) >= 0 ? "positive" : "negative"}">${rupiah(profit(p))}</td></tr>`,
    )
    .join(
      "",
    )}</tbody><tfoot><tr><td><b>Total</b></td><td>—</td><td><b>${rupiah(totalRevenue())}</b></td><td><b>${rupiah(totalCost())}</b></td><td><b>${rupiah(totalRevenue() - totalCost())}</b></td></tr></tfoot></table></div><div class="stat-foot" style="margin-top:14px">Laporan dihasilkan ${new Date().toLocaleDateString("id-ID")} · MAK IGA SmartCost</div></div>`;
}
function settingsPage() {
  return `${head("Pengaturan", "Kelola preferensi dan informasi bisnis.")}${note}<section class="card" style="max-width:720px"><h3 style="font:600 17px 'Playfair Display'">Profil usaha</h3><div class="form-grid"><div class="field"><label>Nama usaha</label><input value="MAK IGA"></div><div class="field"><label>Tagline</label><input value="Mak Iga Khas Probolinggo"></div><div class="field"><label>Nama pengguna</label><input value="Mak Iga Admin"></div><div class="field"><label>Email</label><input type="email" value="admin@makiga.id"></div><div class="field full"><label>Alamat usaha</label><input placeholder="Tambahkan alamat usaha"></div></div><button class="primary" style="margin-top:16px" onclick="toast('Pengaturan disimpan pada sesi demo.')">Simpan pengaturan</button><p class="stat-foot">Profil contoh hanya tampilan demo, belum ada autentikasi akun.</p></section>`;
}
function openModal(title, body, saveFn) {
  document.querySelector("#modalRoot").innerHTML =
    `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div>${body}<div class="modal-actions"><button class="secondary" onclick="closeModal()">Batal</button><button class="primary" onclick="${saveFn}">Simpan</button></div></div></div>`;
}
function closeModal() {
  document.querySelector("#modalRoot").innerHTML = "";
}
function openProduct(id) {
  let p = products().find((x) => x.id === id) || {
    name: "",
    category: "Menu utama",
    description: "",
    price: "",
    cost: "",
    status: "Aktif",
  };
  openModal(
    id ? "Edit produk" : "Tambah produk",
    `<div class="form-grid"><div class="field"><label>Nama produk</label><input id="fName" value="${escapeHtml(p.name)}"></div><div class="field"><label>Kategori</label><input id="fCategory" value="${escapeHtml(p.category)}"></div><div class="field"><label>Harga jual (Rp)</label><input id="fPrice" type="number" value="${p.price}"></div><div class="field"><label>Biaya produksi / unit (Rp)</label><input id="fCost" type="number" value="${p.cost}"></div><div class="field"><label>Status</label><select id="fStatus"><option ${p.status === "Aktif" ? "selected" : ""}>Aktif</option><option ${p.status === "Nonaktif" ? "selected" : ""}>Nonaktif</option></select></div><div class="field full"><label>Deskripsi</label><textarea id="fDesc">${escapeHtml(p.description)}</textarea></div></div>`,
    `saveProduct(${id || 0})`,
  );
}
function saveProduct(id) {
  let name = document.querySelector("#fName").value.trim(),
    price = Number(document.querySelector("#fPrice").value),
    cost = Number(document.querySelector("#fCost").value);
  if (!name || price < 0 || cost < 0) {
    toast("Lengkapi nama dan angka harga yang valid.");
    return;
  }
  let obj = {
    id: id || Date.now(),
    name,
    category: document.querySelector("#fCategory").value || "Lainnya",
    description: document.querySelector("#fDesc").value,
    price,
    cost,
    status: document.querySelector("#fStatus").value,
  };
  if (id) db.products = db.products.map((p) => (p.id === id ? obj : p));
  else db.products.push(obj);
  save();
  closeModal();
  render();
  toast("Produk berhasil disimpan.");
}
function deleteProduct(id) {
  let p = products().find((x) => x.id === id);
  if (confirm(`Hapus produk ${p.name}?`)) {
    db.products = db.products.filter((x) => x.id !== id);
    save();
    render();
    toast("Produk dihapus.");
  }
}
function openMaterial(id) {
  let m = db.materials.find((x) => x.id === id) || {
    name: "",
    qty: "",
    unit: "kg",
    price: "",
    note: "",
  };
  openModal(
    id ? "Edit bahan baku" : "Tambah bahan baku",
    `<div class="form-grid"><div class="field"><label>Nama bahan</label><input id="mName" value="${escapeHtml(m.name)}"></div><div class="field"><label>Jumlah pembelian</label><input id="mQty" type="number" value="${m.qty}"></div><div class="field"><label>Satuan</label><input id="mUnit" value="${m.unit}"></div><div class="field"><label>Harga per satuan (Rp)</label><input id="mPrice" type="number" value="${m.price}"></div><div class="field full"><label>Keterangan</label><input id="mNote" value="${escapeHtml(m.note)}"></div></div>`,
    `saveMaterial(${id || 0})`,
  );
}
function saveMaterial(id) {
  let name = document.querySelector("#mName").value.trim(),
    qty = Number(document.querySelector("#mQty").value),
    price = Number(document.querySelector("#mPrice").value);
  if (!name || qty < 0 || price < 0) {
    toast("Lengkapi nama dan angka yang valid.");
    return;
  }
  let o = {
    id: id || Date.now(),
    name,
    qty,
    unit: document.querySelector("#mUnit").value || "unit",
    price,
    note: document.querySelector("#mNote").value,
  };
  if (id) db.materials = db.materials.map((x) => (x.id === id ? o : x));
  else db.materials.push(o);
  save();
  closeModal();
  render();
  toast("Bahan baku berhasil disimpan.");
}
function deleteMaterial(id) {
  let m = db.materials.find((x) => x.id === id);
  if (confirm(`Hapus ${m.name}?`)) {
    db.materials = db.materials.filter((x) => x.id !== id);
    save();
    render();
    toast("Bahan baku dihapus.");
  }
}
render();
if (page === "pricing") calcPrice();
if (page === "production") calculateProduction();
const observer = new MutationObserver(() => {
  if (page === "pricing") calcPrice();
  if (page === "production") calculateProduction();
});
observer.observe(document.querySelector("#content"), { childList: true });
// When served through PHP, use authenticated MySQL APIs. Opening the HTML file
// directly keeps the self-contained local demo available.
let backendEnabled = false;
async function api(resource, method = "GET", payload = null, id = null) {
  const url = `backend/api.php?resource=${encodeURIComponent(resource)}${id ? `&id=${id}` : ""}`;
  const r = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Permintaan gagal");
  return data;
}
async function refreshBackend() {
  try {
    const [ps, ms, ss] = await Promise.all([
      api("products"),
      api("materials"),
      api("sales"),
    ]);
    db.products = ps.map((p) => ({
      ...p,
      id: Number(p.id),
      price: Number(p.price),
      cost: Number(p.cost),
    }));
    db.materials = ms.map((m) => ({
      ...m,
      id: Number(m.id),
      qty: Number(m.qty),
      price: Number(m.price),
    }));
    db.sales = ss.map((s) => ({
      productId: Number(s.productId),
      qty: Number(s.qty),
      date: s.date,
    }));
    backendEnabled = true;
    render();
    document
      .querySelectorAll(".demo-note")
      .forEach(
        (n) =>
          (n.textContent =
            "Terhubung ke database usaha. Ringkasan menggunakan data tersimpan di MySQL."),
      );
  } catch (e) {
    backendEnabled = false;
  }
}
saveProduct = async function (id) {
  let name = document.querySelector("#fName").value.trim(),
    price = Number(document.querySelector("#fPrice").value),
    cost = Number(document.querySelector("#fCost").value);
  if (!name || price < 0 || cost < 0) {
    toast("Lengkapi nama dan angka harga yang valid.");
    return;
  }
  let o = {
    id,
    name,
    category: document.querySelector("#fCategory").value || "Lainnya",
    description: document.querySelector("#fDesc").value,
    price,
    cost,
    status: document.querySelector("#fStatus").value,
  };
  try {
    if (backendEnabled) {
      await api("products", id ? "PUT" : "POST", o);
      await refreshBackend();
    } else {
      if (id) db.products = db.products.map((p) => (p.id === id ? o : p));
      else db.products.push({ ...o, id: Date.now() });
      save();
    }
  } catch (e) {
    toast(e.message);
    return;
  }
  closeModal();
  render();
  toast("Produk berhasil disimpan.");
};
deleteProduct = async function (id) {
  let p = products().find((x) => x.id === id);
  if (!confirm(`Hapus produk ${p.name}?`)) return;
  try {
    if (backendEnabled) {
      await api("products", "DELETE", null, id);
      await refreshBackend();
    } else {
      db.products = db.products.filter((x) => x.id !== id);
      save();
    }
    render();
    toast("Produk dihapus.");
  } catch (e) {
    toast(e.message);
  }
};
saveMaterial = async function (id) {
  let name = document.querySelector("#mName").value.trim(),
    qty = Number(document.querySelector("#mQty").value),
    price = Number(document.querySelector("#mPrice").value);
  if (!name || qty < 0 || price < 0) {
    toast("Lengkapi nama dan angka yang valid.");
    return;
  }
  let o = {
    id,
    name,
    qty,
    unit: document.querySelector("#mUnit").value || "unit",
    price,
    note: document.querySelector("#mNote").value,
  };
  try {
    if (backendEnabled) {
      await api("materials", id ? "PUT" : "POST", o);
      await refreshBackend();
    } else {
      if (id) db.materials = db.materials.map((x) => (x.id === id ? o : x));
      else db.materials.push({ ...o, id: Date.now() });
      save();
    }
  } catch (e) {
    toast(e.message);
    return;
  }
  closeModal();
  render();
  toast("Bahan baku berhasil disimpan.");
};
deleteMaterial = async function (id) {
  let m = db.materials.find((x) => x.id === id);
  if (!confirm(`Hapus ${m.name}?`)) return;
  try {
    if (backendEnabled) {
      await api("materials", "DELETE", null, id);
      await refreshBackend();
    } else {
      db.materials = db.materials.filter((x) => x.id !== id);
      save();
    }
    render();
    toast("Bahan baku dihapus.");
  } catch (e) {
    toast(e.message);
  }
};
document.querySelector("#resetBtn").onclick = () =>
  (location.href = "logout.php");
// MySQL-backed sales entry and AI chat become available when the app runs via PHP.
profitsPage = function () {
  return `${head("Keuntungan & Kerugian", "Pendapatan hanya dihitung dari unit yang tercatat terjual.", '<button class="primary" onclick="openSale()">＋ Catat penjualan</button>')}${note}<div class="card"><div class="toolbar"><span class="card-sub">Ringkasan semua transaksi yang tercatat</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Harga / unit</th><th>Biaya / unit</th><th>Terjual</th><th>Pendapatan</th><th>Biaya terjual</th><th>Laba / rugi</th></tr></thead><tbody>${products()
    .map(
      (p) =>
        `<tr><td><b>${p.name}</b></td><td>${rupiah(p.price)}</td><td>${rupiah(p.cost)}</td><td>${salesFor(p.id)}</td><td>${rupiah(p.price * salesFor(p.id))}</td><td>${rupiah(p.cost * salesFor(p.id))}</td><td class="${profit(p) >= 0 ? "positive" : "negative"}"><b>${rupiah(profit(p))}</b></td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
};
function openSale() {
  if (!products().length) {
    toast("Tambahkan produk terlebih dahulu.");
    return;
  }
  openModal(
    "Catat penjualan",
    `<div class="form-grid"><div class="field"><label>Tanggal transaksi</label><input type="date" id="saleDate" value="${new Date().toISOString().slice(0, 10)}"></div><div class="field"><label>Produk terjual</label><select id="saleProduct">${products()
      .map(
        (p) =>
          `<option value="${p.id}">${p.name} · ${rupiah(p.price)}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="field"><label>Jumlah terjual</label><input type="number" id="saleQty" min="1" value="1"></div><div class="field"><label>Catatan</label><input id="saleNote" placeholder="Opsional"></div></div>`,
    `submitSale()`,
  );
}
async function submitSale() {
  let product_id = Number(document.querySelector("#saleProduct").value),
    quantity = Number(document.querySelector("#saleQty").value),
    date = document.querySelector("#saleDate").value;
  if (!date || quantity <= 0) {
    toast("Isi tanggal dan jumlah yang valid.");
    return;
  }
  try {
    if (backendEnabled) {
      await api("sales", "POST", {
        date,
        note: document.querySelector("#saleNote").value,
        items: [{ product_id, quantity }],
      });
      await refreshBackend();
    } else {
      let p = products().find((x) => x.id === product_id);
      db.sales.push({ productId: product_id, qty: quantity, date });
      save();
    }
    closeModal();
    render();
    toast("Penjualan berhasil dicatat.");
  } catch (e) {
    toast(e.message);
  }
}
ask = async function (q) {
  if (!q) return;
  let c = document.querySelector("#chat");
  c.insertAdjacentHTML(
    "beforeend",
    `<div class="bubble me">${escapeHtml(q)}</div>`,
  );
  c.scrollTop = c.scrollHeight;
  let answer;
  try {
    if (backendEnabled) {
      let res = await api("ai", "POST", { message: q });
      answer = res.answer;
    } else
      answer =
        "Sambungkan aplikasi ke PHP dan MySQL, lalu atur OPENAI_API_KEY di environment server untuk analisis AI berbasis data usaha. Versi file lokal hanya menjalankan ringkasan demo.";
  } catch (e) {
    answer = e.message;
  }
  c.insertAdjacentHTML(
    "beforeend",
    `<div class="bubble">${escapeHtml(answer)}</div>`,
  );
  c.scrollTop = c.scrollHeight;
};
pricingPage = function () {
  return `${head("Simulasi Harga Jual", "Tentukan harga dengan target margin yang Anda inginkan.")}${note}<div class="card" style="max-width:760px"><div class="form-grid"><div class="field"><label>Pilih produk</label><select id="priceProduct" onchange="calcPrice()">${products()
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join(
      "",
    )}</select></div><div class="field"><label>Target keuntungan (%)</label><input id="margin" type="number" value="40" min="0" oninput="calcPrice()"></div><div class="field"><label>Biaya produksi per unit</label><input id="baseCost" readonly></div><div class="field"><label>Harga jual manual (opsional)</label><input id="manualPrice" type="number" placeholder="Gunakan rekomendasi" oninput="calcPrice()"></div></div><div id="priceResult"></div><button class="primary" onclick="savePrice()">Simpan simulasi harga</button><div id="priceHistory" class="stat-foot" style="margin-top:16px"></div></div>`;
};
async function savePrice() {
  let pId = Number(document.querySelector("#priceProduct").value),
    p = products().find((x) => x.id === pId),
    margin = Number(document.querySelector("#margin").value),
    manual = document.querySelector("#manualPrice").value;
  if (!p || margin < 0) {
    toast("Pilih produk dan masukkan persentase yang valid.");
    return;
  }
  try {
    if (backendEnabled) {
      await api("pricing", "POST", {
        product_id: pId,
        unit_cost: Number(p.cost),
        target_margin: margin,
        manual_price: manual || null,
      });
      await loadPriceHistory();
    } else {
      db.priceSimulations ??= [];
      db.priceSimulations.push({
        productId: pId,
        unitCost: p.cost,
        targetMargin: margin,
        recommendedPrice: Number(p.cost) * (1 + margin / 100),
        manualPrice: manual || null,
        date: new Date().toISOString(),
      });
      save();
    }
    toast("Simulasi harga tersimpan.");
  } catch (e) {
    toast(e.message);
  }
}
async function loadPriceHistory() {
  if (!backendEnabled) return;
  try {
    let rows = await api("pricing");
    let el = document.querySelector("#priceHistory");
    if (el)
      el.innerHTML = `<b>Simulasi tersimpan terakhir</b><br>${
        rows
          .slice(0, 5)
          .map(
            (r) =>
              `${escapeHtml(r.name)} · target ${fmt(r.targetMargin)}% · ${rupiah(r.manualPrice || r.recommendedPrice)}`,
          )
          .join("<br>") || "Belum ada simulasi tersimpan."
      }`;
  } catch (e) {
    toast(e.message);
  }
}
reportsPage = function () {
  return `${head("Laporan", "Tinjau dan cetak ringkasan data usaha.")}${note}<div class="card"><div class="toolbar"><label class="stat-foot">Dari <input type="date" id="reportFrom" class="select" onchange="filterReport()"></label><label class="stat-foot">Sampai <input type="date" id="reportTo" class="select" onchange="filterReport()"></label><button class="secondary" onclick="window.print()">Cetak / Simpan PDF</button></div><h3 style="font:600 18px 'Playfair Display'">Ringkasan penjualan produk</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Unit terjual</th><th>Pendapatan</th><th>Biaya produksi</th><th>Keuntungan</th></tr></thead><tbody id="reportRows"></tbody><tfoot id="reportTotals"></tfoot></table></div><div class="stat-foot" style="margin-top:14px">Laporan dihitung dari transaksi penjualan yang tersimpan.</div></div>`;
};
financePage = function () {
  return `${head("Analisis Keuangan", "Tinjau pendapatan, biaya produksi, dan keuntungan aktual.")}${note}<div class="stats"><div class="stat-card"><div class="stat-top">Pendapatan</div><div class="stat-value">${rupiah(totalRevenue())}</div><div class="stat-foot">Dari transaksi tercatat</div></div><div class="stat-card"><div class="stat-top">Biaya Produksi</div><div class="stat-value">${rupiah(totalCost())}</div><div class="stat-foot">Biaya produk terjual</div></div><div class="stat-card"><div class="stat-top">Keuntungan Bersih</div><div class="stat-value">${rupiah(totalRevenue() - totalCost())}</div><div class="stat-foot">Pendapatan dikurangi biaya produk</div></div></div><div class="card"><div class="card-head"><div><div class="card-title">Perubahan pendapatan dan biaya</div><div class="card-sub">Berdasarkan tanggal penjualan</div></div><select class="select" id="financePeriod" onchange="drawFinanceTimeline()"><option value="daily">Harian · 7 hari</option><option value="weekly">Mingguan · 8 minggu</option><option value="monthly" selected>Bulanan · 12 bulan</option><option value="yearly">Tahunan · 5 tahun</option></select></div><div class="chart-wrap" style="height:300px"><canvas id="financeTimeline"></canvas></div></div><div class="card" style="margin-top:15px"><div class="card-head"><div><div class="card-title">Keuntungan berdasarkan produk</div><div class="card-sub">Menggunakan harga dan biaya pada saat transaksi</div></div></div><div class="chart-wrap" style="height:260px"><canvas id="financeChart"></canvas></div></div>`;
};
function drawFinanceTimeline() {
  const canvas = document.querySelector("#financeTimeline");
  if (!canvas || !window.Chart) return;
  const period = document.querySelector("#financePeriod")?.value || "monthly";
  const now = new Date();
  const buckets = [];
  if (period === "daily") {
    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - offset,
      );
      buckets.push({
        key: toDateKey(day),
        label: day.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
      });
    }
  } else if (period === "weekly") {
    const mondayOffset = (now.getDay() + 6) % 7;
    const currentMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - mondayOffset,
    );
    for (let offset = 7; offset >= 0; offset--) {
      const monday = new Date(
        currentMonday.getFullYear(),
        currentMonday.getMonth(),
        currentMonday.getDate() - offset * 7,
      );
      buckets.push({
        key: toDateKey(monday),
        label: monday.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
      });
    }
  } else if (period === "yearly") {
    for (let offset = 4; offset >= 0; offset--) {
      const year = now.getFullYear() - offset;
      buckets.push({ key: String(year), label: String(year) });
    }
  } else {
    for (let offset = 11; offset >= 0; offset--) {
      const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: month.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        }),
      });
    }
  }
  const totals = buckets.map((bucket, index) => {
    const from = period === "weekly" ? bucket.key : bucket.key;
    let to = bucket.key;
    if (period === "weekly") {
      const monday = new Date(`${bucket.key}T12:00:00`);
      to = toDateKey(
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6),
      );
    } else if (period === "monthly") {
      const [year, month] = bucket.key.split("-").map(Number);
      to = toDateKey(new Date(year, month, 0));
    } else if (period === "yearly") {
      to = `${bucket.key}-12-31`;
    }
    const items = db.sales.filter(
      (sale) => sale.date >= from && sale.date <= to,
    );
    return {
      revenue: items.reduce((sum, sale) => {
        const product = products().find(
          (item) => Number(item.id) === Number(sale.productId),
        );
        return (
          sum + Number(sale.price ?? product?.price ?? 0) * Number(sale.qty)
        );
      }, 0),
      cost: items.reduce((sum, sale) => {
        const product = products().find(
          (item) => Number(item.id) === Number(sale.productId),
        );
        return sum + Number(sale.cost ?? product?.cost ?? 0) * Number(sale.qty);
      }, 0),
    };
  });
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Pendapatan",
          data: totals.map((item) => item.revenue),
          borderColor: "#64836d",
          backgroundColor: "#64836d18",
          fill: true,
          tension: 0.3,
        },
        {
          label: "Biaya produksi",
          data: totals.map((item) => item.cost),
          borderColor: "#b99a65",
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 9, font: { size: 10 } },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { callback: (value) => rupiah(value) } },
      },
    },
  });
  chartInstances.push(chart);
}
function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function drawDashboardTimeline() {
  const canvas = document.querySelector("#revenueChart");
  if (!canvas || !window.Chart) return;
  const monthly =
    document.querySelector("#dashboardRange")?.value === "monthly";
  const now = new Date();
  const buckets = Array.from({ length: monthly ? 12 : 7 }, (_, index) => {
    const offset = (monthly ? 11 : 6) - index;
    const date = monthly
      ? new Date(now.getFullYear(), now.getMonth() - offset, 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = monthly
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : toDateKey(date);
    const end = monthly
      ? toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0))
      : key;
    return {
      key,
      end,
      label: date.toLocaleDateString(
        "id-ID",
        monthly
          ? { month: "short", year: "2-digit" }
          : { day: "numeric", month: "short" },
      ),
    };
  });
  const values = buckets.map((bucket) => {
    const sales = db.sales.filter(
      (sale) => sale.date >= bucket.key && sale.date <= bucket.end,
    );
    return sales.reduce(
      (totals, sale) => {
        const product = products().find(
          (item) => Number(item.id) === Number(sale.productId),
        );
        totals.revenue +=
          Number(sale.price ?? product?.price ?? 0) * Number(sale.qty);
        totals.cost +=
          Number(sale.cost ?? product?.cost ?? 0) * Number(sale.qty);
        return totals;
      },
      { revenue: 0, cost: 0 },
    );
  });
  Chart.getChart(canvas)?.destroy();
  chartInstances.push(
    new Chart(canvas, {
      type: "line",
      data: {
        labels: buckets.map((bucket) => bucket.label),
        datasets: [
          {
            label: "Pendapatan",
            data: values.map((value) => value.revenue),
            borderColor: "#b99a65",
            backgroundColor: "#b99a651b",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Biaya produksi",
            data: values.map((value) => value.cost),
            borderColor: "#a9a093",
            backgroundColor: "transparent",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { boxWidth: 8, font: { size: 9 } },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (value) => rupiah(value) },
          },
        },
      },
    }),
  );
}
function filterReport() {
  let from = document.querySelector("#reportFrom")?.value || "",
    to = document.querySelector("#reportTo")?.value || "",
    rows = db.sales.filter(
      (s) => (!from || s.date >= from) && (!to || s.date <= to),
    ),
    agg = products().map((p) => {
      let qty = rows
        .filter((s) => Number(s.productId) === Number(p.id))
        .reduce((a, s) => a + Number(s.qty), 0);
      return { p, qty, rev: qty * p.price, cost: qty * p.cost };
    }),
    tbody = document.querySelector("#reportRows");
  if (!tbody) return;
  tbody.innerHTML = agg
    .map(
      (x) =>
        `<tr><td>${escapeHtml(x.p.name)}</td><td>${fmt(x.qty)}</td><td>${rupiah(x.rev)}</td><td>${rupiah(x.cost)}</td><td class="${x.rev >= x.cost ? "positive" : "negative"}">${rupiah(x.rev - x.cost)}</td></tr>`,
    )
    .join("");
  let rev = agg.reduce((a, x) => a + x.rev, 0),
    cost = agg.reduce((a, x) => a + x.cost, 0);
  document.querySelector("#reportTotals").innerHTML =
    `<tr><td><b>Total</b></td><td>—</td><td><b>${rupiah(rev)}</b></td><td><b>${rupiah(cost)}</b></td><td><b>${rupiah(rev - cost)}</b></td></tr>`;
}
settingsPage = function () {
  return `${head("Pengaturan", "Kelola profil akun, keamanan, dan informasi usaha.")}${note}<section class="card" style="max-width:720px"><h3 style="font:600 17px 'Playfair Display'">Profil pengguna dan usaha</h3><div class="form-grid"><div class="field"><label>Nama pengguna</label><input id="settingName" value="Mak Iga Admin"></div><div class="field"><label>Email</label><input id="settingEmail" type="email" placeholder="email@usaha.id"></div><div class="field"><label>Nama usaha</label><input id="businessName" value="MAK IGA"></div><div class="field"><label>Tagline</label><input id="businessTagline" value="Mak Iga Khas Probolinggo"></div><div class="field full"><label>Alamat usaha</label><input id="businessAddress" placeholder="Alamat usaha"></div></div><button class="primary" style="margin-top:16px" onclick="saveSettings()">Simpan profil</button><hr style="border:0;border-top:1px solid var(--line);margin:23px 0"><h3 style="font:600 17px 'Playfair Display'">Ubah password</h3><div class="form-grid"><div class="field"><label>Password saat ini</label><input type="password" id="currentPassword" autocomplete="current-password"></div><div class="field"><label>Password baru (min. 10 karakter)</label><input type="password" id="newPassword" autocomplete="new-password"></div></div><button class="secondary" style="margin-top:14px" onclick="changePassword()">Perbarui password</button></section>`;
};
async function loadSettings() {
  if (!backendEnabled) return;
  try {
    let u = await api("settings");
    document.querySelector("#settingName").value = u.name || "";
    document.querySelector("#settingEmail").value = u.email || "";
  } catch (e) {
    toast(e.message);
  }
}
async function saveSettings() {
  let name = document.querySelector("#settingName").value.trim(),
    email = document.querySelector("#settingEmail").value.trim();
  if (!name || !email) {
    toast("Nama dan email wajib diisi.");
    return;
  }
  try {
    if (backendEnabled) {
      await api("settings", "PUT", { name, email });
    }
    save();
    toast("Profil berhasil disimpan.");
  } catch (e) {
    toast(e.message);
  }
}
async function changePassword() {
  let current_password = document.querySelector("#currentPassword").value,
    new_password = document.querySelector("#newPassword").value;
  if (!backendEnabled) {
    toast("Ubah password tersedia setelah backend PHP/MySQL tersambung.");
    return;
  }
  try {
    let res = await api("password", "PUT", { current_password, new_password });
    toast(res.message);
    document.querySelector("#currentPassword").value = "";
    document.querySelector("#newPassword").value = "";
  } catch (e) {
    toast(e.message);
  }
}
async function loadAiHistory() {
  let slot = document.querySelector("#aiHistory");
  if (!slot || !backendEnabled) return;
  try {
    let data = await api("ai/history");
    let groups = {};
    for (let row of data) {
      if (!groups[row.id]) groups[row.id] = [];
      if (row.content) groups[row.id].push(row);
    }
    let keys = Object.keys(groups);
    slot.innerHTML = keys.length
      ? `<div class="stat-foot" style="margin-bottom:7px">Riwayat percakapan</div>${keys
          .slice(0, 5)
          .map(
            (id) =>
              `<button class="quick" style="margin:0 5px 6px 0" onclick="showConversation(${id})">${escapeHtml(groups[id][0].title)}</button>`,
          )
          .join("")}`
      : "";
    window.aiHistoryGroups = groups;
  } catch (e) {}
}
async function showConversation(id) {
  let c = document.querySelector("#chat");
  try {
    let rows = window.aiHistoryGroups?.[id] || [];
    c.innerHTML = rows
      .map(
        (r) =>
          `<div class="bubble ${r.role === "user" ? "me" : ""}">${escapeHtml(r.content)}</div>`,
      )
      .join("");
  } catch (e) {
    toast(e.message);
  }
}
advisorPage = function () {
  return `${head("AI Business Advisor", "Tanya dan telaah kondisi usaha berdasarkan data tersimpan.")}${note}<div class="grid-main"><section class="card"><div class="ai-label">SMARTCOST INSIGHT</div><h2 style="font:600 20px 'Playfair Display';color:var(--brown)">Ringkasan bisnis Anda</h2><p style="font-size:12px;line-height:1.8;color:#746d63">${products().length ? `Pendapatan tercatat <b>${rupiah(totalRevenue())}</b>, biaya produksi <b>${rupiah(totalCost())}</b>, keuntungan <b>${rupiah(totalRevenue() - totalCost())}</b>. Advisor AI mengambil data transaksi dari database saat backend tersambung.` : "Tambahkan data produk dan penjualan untuk mendapatkan analisis."}</p></section><section class="card"><div class="card-title">Analisis berbasis data</div><div class="product-row"><span>✳</span><span class="product-info">Margin dan produk unggulan</span></div><div class="product-row"><span>✳</span><span class="product-info">Kesenjangan harga dan biaya</span></div><div class="product-row"><span>✳</span><span class="product-info">Kelengkapan data penjualan</span></div></section></div><section class="card"><div class="card-head"><div><div class="card-title">Tanya Business Advisor</div><div id="aiHistory"></div></div></div><div class="chat" id="chat"><div class="bubble">Halo! Saya dapat membantu menganalisis data usaha yang tersimpan. Apa yang ingin Anda ketahui?</div></div><div class="quick"><button onclick="ask('Produk apa yang paling menguntungkan?')">Produk paling menguntungkan?</button><button onclick="ask('Bagaimana cara mengurangi biaya produksi?')">Cara mengurangi biaya?</button><button onclick="ask('Bagaimana kondisi keuntungan usaha saya?')">Kondisi keuntungan?</button></div><form class="chat-form" onsubmit="event.preventDefault();ask(this.querySelector('input').value);this.reset()"><input placeholder="Tulis pertanyaan…"><button class="primary">Kirim</button></form></section>`;
};
const renderBase = render;
render = function () {
  renderBase();
  if (page === "reports") filterReport();
  if (page === "pricing") loadPriceHistory();
  if (page === "settings") loadSettings();
  if (page === "advisor") loadAiHistory();
  if (page === "finance") drawFinanceTimeline();
  if (page === "dashboard") drawDashboardTimeline();
};
let activeConversation = 0;
ask = async function (q) {
  if (!q) return;
  let c = document.querySelector("#chat");
  c.insertAdjacentHTML(
    "beforeend",
    `<div class="bubble me">${escapeHtml(q)}</div>`,
  );
  c.scrollTop = c.scrollHeight;
  let answer;
  try {
    if (backendEnabled) {
      let res = await api("ai", "POST", {
        message: q,
        conversation_id: activeConversation || undefined,
      });
      activeConversation = res.conversation_id;
      answer = res.answer;
    } else
      answer =
        "Sambungkan aplikasi ke PHP dan MySQL, lalu atur OPENAI_API_KEY pada environment server untuk analisis AI. Versi file lokal memakai data demo.";
  } catch (e) {
    answer = e.message;
  }
  c.insertAdjacentHTML(
    "beforeend",
    `<div class="bubble">${escapeHtml(answer)}</div>`,
  );
  c.scrollTop = c.scrollHeight;
};
showConversation = async function (id) {
  let c = document.querySelector("#chat");
  activeConversation = Number(id);
  let rows = window.aiHistoryGroups?.[id] || [];
  c.innerHTML = rows
    .map(
      (r) =>
        `<div class="bubble ${r.role === "user" ? "me" : ""}">${escapeHtml(r.content)}</div>`,
    )
    .join("");
};
loadSettings = async function () {
  let prefs = JSON.parse(
      localStorage.getItem("makig-business-settings") || "{}",
    ),
    n = document.querySelector("#settingName"),
    e = document.querySelector("#settingEmail"),
    b = document.querySelector("#businessName"),
    t = document.querySelector("#businessTagline");
  if (b) b.value = prefs.businessName || "MAK IGA";
  if (t) t.value = prefs.tagline || "Mak Iga Khas Probolinggo";
  const a = document.querySelector("#businessAddress");
  if (a) a.value = prefs.address || "";
  if (n) n.value = prefs.name || "Mak Iga Admin";
  if (e) e.value = prefs.email || "";
  if (backendEnabled) {
    try {
      let u = await api("settings");
      if (n) n.value = u.name || "";
      if (e) e.value = u.email || "";
      if (b) b.value = u.business_name || "MAK IGA";
      if (t) t.value = u.tagline || "";
      if (a) a.value = u.address || "";
    } catch (err) {
      toast(err.message);
    }
  }
};
saveSettings = async function () {
  let name = document.querySelector("#settingName").value.trim(),
    email = document.querySelector("#settingEmail").value.trim(),
    prefs = {
      name,
      email,
      businessName: document.querySelector("#businessName").value.trim(),
      tagline: document.querySelector("#businessTagline").value.trim(),
      address: document.querySelector("#businessAddress").value.trim(),
    };
  if (!name || !email) {
    toast("Nama dan email wajib diisi.");
    return;
  }
  try {
    if (backendEnabled) {
      await api("settings", "PUT", {
        name,
        email,
        business_name: prefs.businessName,
        tagline: prefs.tagline,
        address: prefs.address,
      });
    }
    localStorage.setItem("makig-business-settings", JSON.stringify(prefs));
    toast("Profil berhasil disimpan.");
  } catch (e) {
    toast(e.message);
  }
};
refreshBackend = async function () {
  try {
    const [ps, ms, ss] = await Promise.all([
      api("products"),
      api("materials"),
      api("sales"),
    ]);
    db.products = ps.map((p) => ({
      ...p,
      id: Number(p.id),
      price: Number(p.price),
      cost: Number(p.cost),
    }));
    db.materials = ms.map((m) => ({
      ...m,
      id: Number(m.id),
      qty: Number(m.qty),
      price: Number(m.price),
    }));
    db.sales = ss.map((s) => ({
      productId: Number(s.productId),
      qty: Number(s.qty),
      date: s.date,
      price: Number(s.price),
      cost: Number(s.cost),
    }));
    backendEnabled = true;
    render();
    document
      .querySelectorAll(".demo-note")
      .forEach(
        (n) =>
          (n.textContent =
            "Terhubung ke database usaha. Ringkasan menggunakan data tersimpan di MySQL."),
      );
  } catch (e) {
    backendEnabled = false;
  }
};
salesFor = function (id) {
  return db.sales
    .filter((s) => Number(s.productId) === Number(id))
    .reduce((a, s) => a + Number(s.qty), 0);
};
profit = function (p) {
  return db.sales
    .filter((s) => Number(s.productId) === Number(p.id))
    .reduce(
      (a, s) =>
        a +
        ((s.price == null ? p.price : Number(s.price)) -
          (s.cost == null ? p.cost : Number(s.cost))) *
          Number(s.qty),
      0,
    );
};
totalRevenue = function () {
  return db.sales.reduce((a, s) => {
    let p = products().find((x) => Number(x.id) === Number(s.productId));
    return (
      a +
      (s.price == null
        ? p
          ? p.price * Number(s.qty)
          : 0
        : Number(s.price) * Number(s.qty))
    );
  }, 0);
};
totalCost = function () {
  return db.sales.reduce((a, s) => {
    let p = products().find((x) => Number(x.id) === Number(s.productId));
    return (
      a +
      (s.cost == null
        ? p
          ? p.cost * Number(s.qty)
          : 0
        : Number(s.cost) * Number(s.qty))
    );
  }, 0);
};
filterReport = function () {
  let from = document.querySelector("#reportFrom")?.value || "",
    to = document.querySelector("#reportTo")?.value || "",
    rows = db.sales.filter(
      (s) => (!from || s.date >= from) && (!to || s.date <= to),
    ),
    agg = products().map((p) => {
      let sales = rows.filter((s) => Number(s.productId) === Number(p.id)),
        qty = sales.reduce((a, s) => a + Number(s.qty), 0),
        rev = sales.reduce(
          (a, s) =>
            a + (s.price == null ? p.price : Number(s.price)) * Number(s.qty),
          0,
        ),
        cost = sales.reduce(
          (a, s) =>
            a + (s.cost == null ? p.cost : Number(s.cost)) * Number(s.qty),
          0,
        );
      return { p, qty, rev, cost };
    }),
    tbody = document.querySelector("#reportRows");
  if (!tbody) return;
  tbody.innerHTML = agg
    .map(
      (x) =>
        `<tr><td>${escapeHtml(x.p.name)}</td><td>${fmt(x.qty)}</td><td>${rupiah(x.rev)}</td><td>${rupiah(x.cost)}</td><td class="${x.rev >= x.cost ? "positive" : "negative"}">${rupiah(x.rev - x.cost)}</td></tr>`,
    )
    .join("");
  let rev = agg.reduce((a, x) => a + x.rev, 0),
    cost = agg.reduce((a, x) => a + x.cost, 0);
  document.querySelector("#reportTotals").innerHTML =
    `<tr><td><b>Total</b></td><td>—</td><td><b>${rupiah(rev)}</b></td><td><b>${rupiah(cost)}</b></td><td><b>${rupiah(rev - cost)}</b></td></tr>`;
};
refreshBackend();
productPage = function () {
  return `${head("Data Produk", "Kelola menu, harga, dan foto produk MAK IGA.", '<button class="primary" onclick="openProduct()">＋ Tambah produk</button>')}${note}<div class="card"><div class="toolbar"><input class="search" id="productSearch" placeholder="Cari nama produk…" oninput="filterRows()"><select id="categoryFilter" class="select" onchange="filterRows()"><option value="">Semua kategori</option>${[...new Set(products().map((product) => product.category))].map((category) => `<option>${escapeHtml(category)}</option>`).join("")}</select></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Harga jual</th><th>Biaya / unit</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="productRows">${products()
    .map(
      (product) =>
        `<tr data-search="${escapeHtml(product.name.toLowerCase())}" data-category="${escapeHtml(product.category)}"><td><div style="display:flex;align-items:center;gap:9px">${product.photo ? `<img src="${escapeHtml(product.photo)}" alt="" style="width:38px;height:38px;object-fit:cover;border-radius:6px">` : '<span class="product-thumb">♨</span>'}<span><b>${escapeHtml(product.name)}</b><small class="stat-foot" style="display:block">${escapeHtml(product.description || "")}</small></span></div></td><td>${escapeHtml(product.category)}</td><td>${rupiah(product.price)}</td><td>${rupiah(product.cost)}</td><td><span class="badge ${product.status === "Aktif" ? "" : "off"}">${escapeHtml(product.status)}</span></td><td class="actions"><button onclick="openProduct(${product.id})">Edit</button><button onclick="deleteProduct(${product.id})">Hapus</button></td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
};
openProduct = function (id) {
  const product = products().find((item) => Number(item.id) === Number(id)) || {
    name: "",
    category: "Menu utama",
    description: "",
    price: "",
    cost: "",
    status: "Aktif",
    photo: "",
  };
  openModal(
    id ? "Edit produk" : "Tambah produk",
    `<div class="form-grid"><div class="field"><label>Nama produk</label><input id="fName" value="${escapeHtml(product.name)}"></div><div class="field"><label>Kategori</label><input id="fCategory" value="${escapeHtml(product.category)}"></div><div class="field"><label>Harga jual (Rp)</label><input id="fPrice" type="number" min="0" value="${product.price}"></div><div class="field"><label>Biaya produksi / unit (Rp)</label><input id="fCost" type="number" min="0" value="${product.cost}"></div><div class="field"><label>Status</label><select id="fStatus"><option ${product.status === "Aktif" ? "selected" : ""}>Aktif</option><option ${product.status === "Nonaktif" ? "selected" : ""}>Nonaktif</option></select></div><div class="field full"><label>Deskripsi</label><textarea id="fDesc">${escapeHtml(product.description || "")}</textarea></div><div class="field full"><label>Foto produk (JPG, PNG, WebP · maks. 5 MB)</label><input type="file" id="fPhoto" accept="image/jpeg,image/png,image/webp" onchange="previewProductPhoto()"><input type="hidden" id="currentPhoto" value="${escapeHtml(product.photo || "")}"><img id="photoPreview" src="${escapeHtml(product.photo || "")}" alt="Pratinjau foto" style="${product.photo ? "" : "display:none"}max-width:140px;max-height:100px;object-fit:cover;border-radius:6px"></div></div>`,
    `saveProduct(${Number(id) || 0})`,
  );
};
function previewProductPhoto() {
  const file = document.querySelector("#fPhoto")?.files?.[0];
  const preview = document.querySelector("#photoPreview");
  if (!file || !preview) return;
  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = backendEnabled ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
  if (!acceptedTypes.includes(file.type) || file.size > maxSize) {
    toast(
      `Pilih JPG, PNG, atau WebP maksimal ${backendEnabled ? "5" : "2"} MB.`,
    );
    document.querySelector("#fPhoto").value = "";
    return;
  }
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}
function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Foto gagal dibaca."));
    reader.readAsDataURL(file);
  });
}
saveProduct = async function (id) {
  const name = document.querySelector("#fName").value.trim();
  const price = Number(document.querySelector("#fPrice").value);
  const cost = Number(document.querySelector("#fCost").value);
  if (!name || price < 0 || cost < 0) {
    toast("Lengkapi nama dan angka harga yang valid.");
    return;
  }
  const photoFile = document.querySelector("#fPhoto").files[0];
  if (photoFile && !backendEnabled && photoFile.size > 2 * 1024 * 1024) {
    toast("Foto pada mode demo lokal maksimal 2 MB.");
    return;
  }
  let photo = document.querySelector("#currentPhoto").value;
  try {
    if (photoFile && backendEnabled) {
      const form = new FormData();
      form.append("photo", photoFile);
      const response = await fetch("backend/upload.php", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Foto gagal diunggah.");
      photo = result.photo;
    } else if (photoFile) {
      photo = await fileAsDataUrl(photoFile);
    }
    const product = {
      id,
      name,
      category: document.querySelector("#fCategory").value || "Lainnya",
      description: document.querySelector("#fDesc").value,
      price,
      cost,
      status: document.querySelector("#fStatus").value,
      photo,
    };
    if (backendEnabled) {
      await api("products", id ? "PUT" : "POST", product);
      await refreshBackend();
    } else {
      if (id)
        db.products = db.products.map((item) =>
          Number(item.id) === Number(id) ? product : item,
        );
      else db.products.push({ ...product, id: Date.now() });
      save();
    }
    closeModal();
    render();
    toast("Produk berhasil disimpan.");
  } catch (error) {
    toast(error.message);
  }
};
materialPage = function () {
  return `${head("Data Bahan Baku", "Pantau harga pembelian, satuan, dan perubahan harga.", '<button class="primary" onclick="openMaterial()">＋ Tambah bahan</button>')}${note}<div class="card"><div class="toolbar"><input class="search" placeholder="Cari bahan baku…" oninput="document.querySelectorAll('#materialRows tr').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(this.value.toLowerCase()))"></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Bahan baku</th><th>Jumlah pembelian</th><th>Satuan</th><th>Harga / satuan</th><th>Nilai pembelian</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody id="materialRows">${db.materials.map((m) => `<tr><td><b>${escapeHtml(m.name)}</b></td><td>${fmt(m.qty)}</td><td>${escapeHtml(m.unit)}</td><td>${rupiah(m.price)}</td><td>${rupiah(m.qty * m.price)}</td><td>${escapeHtml(m.note || "—")}</td><td class="actions"><button onclick="openMaterial(${m.id})">Edit</button><button onclick="showMaterialHistory(${m.id})">Riwayat</button><button onclick="deleteMaterial(${m.id})">Hapus</button></td></tr>`).join("")}</tbody></table></div></div>`;
};
async function showMaterialHistory(id) {
  const material = db.materials.find((item) => Number(item.id) === Number(id));
  if (!material) return;
  if (!backendEnabled) {
    toast("Riwayat harga tersedia setelah database tersambung.");
    return;
  }
  try {
    const history = await api("materials/history", "GET", null, id);
    const rows = history.length
      ? history
          .map(
            (entry) =>
              `<tr><td>${new Date(entry.changedAt).toLocaleString("id-ID")}</td><td>${rupiah(entry.oldPrice)}</td><td>${rupiah(entry.newPrice)}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="3" class="empty">Belum ada perubahan harga.</td></tr>';
    openModal(
      `Riwayat harga · ${escapeHtml(material.name)}`,
      `<div class="table-wrap"><table class="data-table"><thead><tr><th>Waktu</th><th>Harga lama</th><th>Harga baru</th></tr></thead><tbody>${rows}</tbody></table></div>`,
      "closeModal()",
    );
  } catch (error) {
    toast(error.message);
  }
}
reportsPage = function () {
  return `${head("Laporan", "Tinjau penjualan dan pemakaian bahan baku.")}${note}<div class="card"><div class="toolbar"><label class="stat-foot">Dari <input type="date" id="reportFrom" class="select" onchange="filterReport()"></label><label class="stat-foot">Sampai <input type="date" id="reportTo" class="select" onchange="filterReport()"></label><button class="secondary" onclick="window.print()">Cetak / Simpan PDF</button></div><h3 style="font:600 18px 'Playfair Display'">Penjualan dan laba rugi</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Unit terjual</th><th>Pendapatan</th><th>Biaya produk</th><th>Keuntungan</th></tr></thead><tbody id="reportRows"></tbody><tfoot id="reportTotals"></tfoot></table></div></div><div class="card" style="margin-top:15px"><h3 style="font:600 18px 'Playfair Display'">Pemakaian bahan baku</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>Bahan baku</th><th>Jumlah terpakai</th><th>Satuan</th><th>Total biaya</th></tr></thead><tbody id="materialReportRows"><tr><td colspan="4" class="empty">Memuat data…</td></tr></tbody></table></div></div>`;
};
filterReport = async function () {
  const from = document.querySelector("#reportFrom")?.value || "";
  const to = document.querySelector("#reportTo")?.value || "";
  const sales = db.sales.filter(
    (sale) => (!from || sale.date >= from) && (!to || sale.date <= to),
  );
  const rows = products().map((product) => {
    const selected = sales.filter(
      (sale) => Number(sale.productId) === Number(product.id),
    );
    return selected.reduce(
      (totals, sale) => ({
        quantity: totals.quantity + Number(sale.qty),
        revenue:
          totals.revenue +
          Number(sale.price ?? product.price) * Number(sale.qty),
        cost:
          totals.cost + Number(sale.cost ?? product.cost) * Number(sale.qty),
      }),
      { product, quantity: 0, revenue: 0, cost: 0 },
    );
  });
  const table = document.querySelector("#reportRows");
  if (!table) return;
  table.innerHTML = rows
    .map(
      ({ product, quantity, revenue, cost }) =>
        `<tr><td>${escapeHtml(product.name)}</td><td>${fmt(quantity)}</td><td>${rupiah(revenue)}</td><td>${rupiah(cost)}</td><td class="${revenue >= cost ? "positive" : "negative"}">${rupiah(revenue - cost)}</td></tr>`,
    )
    .join("");
  const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const cost = rows.reduce((sum, row) => sum + row.cost, 0);
  document.querySelector("#reportTotals").innerHTML =
    `<tr><td><b>Total</b></td><td>—</td><td><b>${rupiah(revenue)}</b></td><td><b>${rupiah(cost)}</b></td><td><b>${rupiah(revenue - cost)}</b></td></tr>`;

  const materialTable = document.querySelector("#materialReportRows");
  if (!materialTable) return;
  if (!backendEnabled) {
    materialTable.innerHTML =
      '<tr><td colspan="4" class="empty">Pemakaian bahan tersedia dari catatan produksi di database.</td></tr>';
    return;
  }
  try {
    const params = new URLSearchParams({ from, to });
    const response = await fetch(
      `backend/api.php?resource=reports/material-usage&${params}`,
      { credentials: "same-origin" },
    );
    const usage = await response.json();
    if (!response.ok) throw new Error(usage.error || "Laporan gagal dimuat.");
    materialTable.innerHTML = usage.length
      ? usage
          .map(
            (item) =>
              `<tr><td>${escapeHtml(item.name || "Bahan dihapus")}</td><td>${fmt(item.used_quantity)}</td><td>${escapeHtml(item.unit || "—")}</td><td>${rupiah(item.total_cost)}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4" class="empty">Belum ada catatan produksi pada periode ini.</td></tr>';
  } catch (error) {
    materialTable.innerHTML = `<tr><td colspan="4" class="empty">${escapeHtml(error.message)}</td></tr>`;
  }
};
profitsPage = function () {
  return `${head("Keuntungan & Kerugian", "Pendapatan hanya dihitung dari unit yang tercatat terjual.", '<button class="primary" onclick="openSale()">＋ Catat penjualan</button>')}${note}<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Produk</th><th>Harga jual aktual</th><th>Biaya aktual</th><th>Terjual</th><th>Pendapatan</th><th>Biaya produk</th><th>Laba / rugi</th></tr></thead><tbody>${products()
    .map((p) => {
      let s = db.sales.filter((x) => Number(x.productId) === Number(p.id)),
        qty = s.reduce((a, x) => a + Number(x.qty), 0),
        revenue = s.reduce(
          (a, x) =>
            a + (x.price == null ? p.price : Number(x.price)) * Number(x.qty),
          0,
        ),
        cost = s.reduce(
          (a, x) =>
            a + (x.cost == null ? p.cost : Number(x.cost)) * Number(x.qty),
          0,
        );
      return `<tr><td><b>${escapeHtml(p.name)}</b></td><td>${rupiah(qty ? revenue / qty : p.price)}</td><td>${rupiah(qty ? cost / qty : p.cost)}</td><td>${fmt(qty)}</td><td>${rupiah(revenue)}</td><td>${rupiah(cost)}</td><td class="${revenue >= cost ? "positive" : "negative"}"><b>${rupiah(revenue - cost)}</b></td></tr>`;
    })
    .join("")}</tbody></table></div></div>`;
};
drawCharts = function () {
  const labels = products().map((p) => p.name),
    vals = products().map((p) => profit(p)),
    common = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, color: "#938b80" },
        },
        y: {
          grid: { color: "#f1ede7" },
          ticks: { font: { size: 9 }, color: "#938b80" },
        },
      },
    };
  let recent = Array.from({ length: 7 }, (_, i) => {
    let d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  if (document.querySelector("#revenueChart")) {
    let rev = recent.map((day) =>
        db.sales
          .filter((s) => s.date === day)
          .reduce((a, s) => {
            let p = products().find(
              (p) => Number(p.id) === Number(s.productId),
            );
            return (
              a +
              (s.price == null
                ? p
                  ? p.price * Number(s.qty)
                  : 0
                : Number(s.price) * Number(s.qty))
            );
          }, 0),
      ),
      cost = recent.map((day) =>
        db.sales
          .filter((s) => s.date === day)
          .reduce((a, s) => {
            let p = products().find(
              (p) => Number(p.id) === Number(s.productId),
            );
            return (
              a +
              (s.cost == null
                ? p
                  ? p.cost * Number(s.qty)
                  : 0
                : Number(s.cost) * Number(s.qty))
            );
          }, 0),
      );
    chartInstances.push(
      new Chart(document.querySelector("#revenueChart"), {
        type: "line",
        data: {
          labels: recent.map((d) =>
            new Date(`${d}T00:00:00`).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            }),
          ),
          datasets: [
            {
              label: "Pendapatan",
              data: rev,
              borderColor: "#b99a65",
              backgroundColor: "#b99a651b",
              fill: true,
              tension: 0.3,
            },
            {
              label: "Biaya produksi",
              data: cost,
              borderColor: "#a9a093",
              backgroundColor: "transparent",
              tension: 0.3,
            },
          ],
        },
        options: {
          ...common,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { boxWidth: 8, font: { size: 9 } },
            },
          },
        },
      }),
    );
  }
  if (document.querySelector("#donutChart"))
    chartInstances.push(
      new Chart(document.querySelector("#donutChart"), {
        type: "doughnut",
        data: {
          labels: ["Pendapatan", "Biaya"],
          datasets: [
            {
              data: [Math.max(totalRevenue(), 0), Math.max(totalCost(), 0)],
              backgroundColor: ["#64836d", "#e9dfd0"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 9, font: { size: 9 } },
            },
          },
        },
      }),
    );
  if (document.querySelector("#productChart"))
    chartInstances.push(
      new Chart(document.querySelector("#productChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data: vals,
              backgroundColor: "#b99a65",
              borderRadius: 4,
              barThickness: 17,
            },
          ],
        },
        options: common,
      }),
    );
  if (document.querySelector("#financeChart"))
    chartInstances.push(
      new Chart(document.querySelector("#financeChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Pendapatan",
              data: products().map((p) =>
                db.sales
                  .filter((s) => Number(s.productId) === Number(p.id))
                  .reduce(
                    (a, s) =>
                      a +
                      (s.price == null ? p.price : Number(s.price)) *
                        Number(s.qty),
                    0,
                  ),
              ),
              backgroundColor: "#64836d",
              borderRadius: 4,
            },
            {
              label: "Biaya",
              data: products().map((p) =>
                db.sales
                  .filter((s) => Number(s.productId) === Number(p.id))
                  .reduce(
                    (a, s) =>
                      a +
                      (s.cost == null ? p.cost : Number(s.cost)) *
                        Number(s.qty),
                    0,
                  ),
              ),
              backgroundColor: "#d8cbb5",
              borderRadius: 4,
            },
          ],
        },
        options: {
          ...common,
          plugins: { legend: { display: true, position: "bottom" } },
        },
      }),
    );
  if (document.querySelector("#compareChart"))
    chartInstances.push(
      new Chart(document.querySelector("#compareChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Keuntungan",
              data: vals,
              backgroundColor: vals.map((v) => (v < 0 ? "#b96b65" : "#b99a65")),
              borderRadius: 4,
            },
          ],
        },
        options: { ...common, indexAxis: "y" },
      }),
    );
};
saveSimulation = async function () {
  let pId = Number(document.querySelector("#simProduct").value),
    items = [...document.querySelectorAll(".ingredient")].map((r) => ({
      material_id: Number(r.querySelector(".materialChoice").value),
      quantity: Number(r.querySelector(".materialQty").value),
    }));
  try {
    if (backendEnabled) {
      let result = await api("production", "POST", {
        product_id: pId,
        output_quantity: Number(document.querySelector("#yield").value),
        operational_cost: Number(document.querySelector("#overhead").value),
        materials: items,
      });
      await refreshBackend();
      toast(`Simulasi tersimpan · biaya per unit ${rupiah(result.unit_cost)}`);
    } else {
      let p = products().find((p) => p.id === pId);
      let cost = Number(
        document
          .querySelector("#productionResult")
          .querySelectorAll("strong")[1]
          .textContent.replace(/[^0-9]/g, ""),
      );
      if (p) {
        p.cost = cost;
        db.simulations.push({
          productId: p.id,
          cost,
          date: new Date().toISOString(),
        });
        save();
        toast("Simulasi disimpan dan biaya produk diperbarui.");
      }
    }
  } catch (e) {
    toast(e.message);
  }
};
