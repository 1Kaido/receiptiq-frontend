let totalCategories;

const categoryIcons = {
  food:          'fa-utensils',
  shopping:      'fa-bag-shopping',
  travel:        'fa-plane',
  transport:     'fa-car',
  health:        'fa-heart-pulse',
  healthcare:    'fa-heart-pulse',
  office:        'fa-briefcase',
  electronics:   'fa-laptop',
  entertainment: 'fa-film',
  restaurant:    'fa-fork-knife',
  default:       'fa-tag'
};

function getCatIcon(category) {
  return categoryIcons[(category || '').toLowerCase()] || categoryIcons.default;
}

// ── RECENT RECEIPTS ──
export function renderRecentReceipts(receipts) {
  const container = document.getElementById("recentReceipts");

  const latest = [...receipts]
    .sort((a, b) => new Date(b.receipt_date) - new Date(a.receipt_date))
    .slice(0, 5);

  if (!latest.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <p>No receipts yet — upload one!</p>
      </div>`;
    return;
  }

  container.innerHTML = latest.map(r => `
    <div class="receipt-card">
      <div class="receipt-logo">
        <i class="fa-solid ${getCatIcon(r.category)}"></i>
      </div>
      <div class="receipt-info">
        <h5>${r.supplier || 'Unknown'}</h5>
        <p>${r.category || '—'}</p>
      </div>
      <div class="receipt-right">
        <h5>&#8377;${Number(r.amount || 0).toFixed(2)}</h5>
        <p>${r.receipt_date || '—'}</p>
      </div>
      <i class="fa-solid fa-chevron-right receipt-arrow"></i>
    </div>
  `).join('');
}

// ── PIE CHART ──
export function drawCategoryPieChart(receipts) {
  const categoryTotals = {};

  receipts.forEach(receipt => {
    const category = receipt.category || "Unknown";
    const amount = Number(receipt.amount) || 0;
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  totalCategories = labels.length;

  if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
  window.expenseChart.destroy();
}

  const ctx = document.getElementById("categoryPieChart").getContext("2d");

  window.categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#6C5CE7", "#2ECC71", "#F39C12",
          "#3498DB", "#E91E63", "#00BCD4",
          "#9C27B0", "#FF9800"
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, pointStyle: "circle" }
        }
      }
    }
  });
}

// ── LINE CHART ──
export function drawExpenseTrend(receipts) {
  const totals = {};

  receipts.forEach(receipt => {
    const date = receipt.receipt_date;
    const amount = Number(receipt.amount) || 0;
    totals[date] = (totals[date] || 0) + amount;
  });

  const labels = Object.keys(totals).sort();
  const values = labels.map(date => totals[date]);

  if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
  window.expenseChart.destroy();
}

  const ctx = document.getElementById("expenseChart").getContext("2d");

  window.expenseChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: "#6C5CE7",
        backgroundColor: "rgba(108,92,231,0.15)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#6C5CE7",
        fill: false,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "#EEEEEE" } }
      }
    }
  });
}

// ── TOP VENDOR ──
export function renderTopVendor(receipts) {
  const vendors = {};

  for (const receipt of receipts) {
    if (!vendors[receipt.supplier]) vendors[receipt.supplier] = 0;
    vendors[receipt.supplier] += receipt.amount;
  }

  const topVendor = { supplier: "", amount: 0 };

  for (const supplier in vendors) {
    if (vendors[supplier] > topVendor.amount) {
      topVendor.supplier = supplier;
      topVendor.amount = vendors[supplier];
    }
  }

  document.getElementById("vendorName").textContent = topVendor.supplier || "—";
  document.getElementById("vendorAmount").textContent = `${topVendor.amount.toFixed(2)}`;
}

// ── STAT CARDS ──
export function all_charts(receipts) {
  const total_receipts = receipts.length;
  let total_spends = 0;

  for (let i = 0; i < receipts.length; i++) {
    total_spends += receipts[i].amount;
  }

  document.getElementById("totalReceipts").textContent = total_receipts;
  document.getElementById("totalSpent").textContent    = `${total_spends.toFixed(2)}`;
  document.getElementById("avgExpense").textContent = `${(total_spends / total_receipts).toFixed(1)}`;
  document.getElementById("totalCategories").textContent = totalCategories;
}
