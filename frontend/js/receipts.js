import { BASE_URL } from "./config.js";

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

function getIcon(category) {
  return categoryIcons[(category || '').toLowerCase()] || categoryIcons.default;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

document.addEventListener("DOMContentLoaded", () => {
  const container  = document.getElementById("receiptContainer");
  const loader     = document.getElementById("loader");
  const countBadge = document.getElementById("receiptCount");

  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/frontend/index.html";
  });

  async function getAllReceipts() {
    try {
      const res  = await fetch(`${BASE_URL}/detailed_receipts`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      loader.classList.add("hidden");
      displayReceipts(data);
      countBadge.textContent = data.length;
    } catch (e) {
      loader.classList.add("hidden");
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          <p>Failed to load receipts.<br>Check your connection.</p>
        </div>`;
    }
  }

  function displayReceipts(receipts) {
    if (!receipts.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-receipt"></i>
          <p>No receipts yet — upload one from the home screen!</p>
        </div>`;
      return;
    }

    container.innerHTML = '';

    receipts.forEach((r, idx) => {
      const items = r.items?.length
        ? r.items.map(item => `
            <li class="item-pill">
              <strong>${item.description || '—'}</strong>
              <span class="item-meta">
                Qty: ${item.quantity ?? '—'} &nbsp;|&nbsp;
                ₹${Number(item.unit_price || 0).toFixed(2)} each &nbsp;|&nbsp;
                Total: ₹${Number(item.total_price || 0).toFixed(2)}
              </span>
            </li>`).join('')
        : '<li class="item-pill">No items recorded</li>';

      const taxes = r.taxes?.length
        ? r.taxes.map(t => `
            <li class="tax-pill">
              Rate: ${(t.rate * 100).toFixed(1)}% &nbsp;|&nbsp;
              Base: ₹${Number(t.base || 0).toFixed(2)} &nbsp;|&nbsp;
              Tax: ₹${Number(t.amount || 0).toFixed(2)}
            </li>`).join('')
        : '<li class="tax-pill">No tax data</li>';

      const regs = r.company_registrations?.length
        ? r.company_registrations.map(reg => `
            <li class="reg-pill">${reg.type} : ${reg.number}</li>`).join('')
        : '<li class="reg-pill">None</li>';

      const card = document.createElement('div');
      card.className = 'receipt-card';
      card.innerHTML = `
        <!-- HEADER -->
        <div class="card-header">
          <div class="vendor-avatar">
            <i class="fa-solid ${getIcon(r.purchase_category)}"></i>
          </div>
          <div class="vendor-info">
            <h3>${r.supplier_name || 'Unknown Vendor'}</h3>
            <p>${r.supplier_phone || r.supplier_address?.split('\n')[0] || '—'}</p>
          </div>
          <div class="amount-badge">₹${Number(r.total_amount || 0).toFixed(2)}</div>
        </div>

        <!-- META CHIPS -->
        <div class="card-meta">
          <div class="meta-chip">
            <i class="fa-solid fa-calendar"></i>
            ${formatDate(r.date)}
          </div>
          <div class="meta-chip">
            <i class="fa-solid ${getIcon(r.purchase_category)}"></i>
            ${r.purchase_category || '—'}
          </div>
          ${r.purchase_subcategory ? `
          <div class="meta-chip">
            <i class="fa-solid fa-layer-group"></i>
            ${r.purchase_subcategory}
          </div>` : ''}
          ${r.currency ? `
          <div class="meta-chip">
            <i class="fa-solid fa-coins"></i>
            ${r.currency}
          </div>` : ''}
        </div>

        <!-- KEY ROWS -->
        <div class="card-rows">
          <div class="receipt-row">
            <span class="label">Net Amount</span>
            <span class="value">₹${Number(r.total_net || 0).toFixed(2)}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Tax</span>
            <span class="value">₹${Number(r.total_tax || 0).toFixed(2)}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Time</span>
            <span class="value">${r.time || '—'}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Country</span>
            <span class="value">${r.country || '—'}</span>
          </div>
        </div>

        <!-- TOGGLE -->
        <button class="toggle-btn" data-idx="${idx}">
          <i class="fa-solid fa-chevron-down"></i> View Details
        </button>

        <!-- EXPANDED DETAILS -->
        <div class="card-details" id="details-${idx}">
          ${r.supplier_address ? `
          <div class="detail-section">
            <h4><i class="fa-solid fa-location-dot"></i> Address</h4>
            <p>${r.supplier_address}</p>
          </div>` : ''}

          <div class="detail-section">
            <h4><i class="fa-solid fa-basket-shopping"></i> Items (${r.items?.length || 0})</h4>
            <ul class="item-list">${items}</ul>
          </div>

          <div class="detail-section">
            <h4><i class="fa-solid fa-percent"></i> Taxes</h4>
            <ul class="tax-list">${taxes}</ul>
          </div>

          <div class="detail-section">
            <h4><i class="fa-solid fa-building"></i> Registrations</h4>
            <ul class="reg-list">${regs}</ul>
          </div>
        </div>
      `;

      // Toggle expand/collapse
      card.querySelector('.toggle-btn').addEventListener('click', function() {
        const details = document.getElementById(`details-${this.dataset.idx}`);
        const isOpen  = details.classList.toggle('open');
        this.innerHTML = isOpen
          ? '<i class="fa-solid fa-chevron-up"></i> Hide Details'
          : '<i class="fa-solid fa-chevron-down"></i> View Details';
      });

      container.appendChild(card);
    });
  }

  getAllReceipts();
});
