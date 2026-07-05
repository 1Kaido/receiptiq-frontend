import { loadReceipts } from "./get_receipts.js";
import { drawCategoryPieChart, drawExpenseTrend, renderRecentReceipts, renderTopVendor, all_charts } from "./charts.js";

console.log("main");

const navItems = document.querySelectorAll(".nav-item");
navItems[1].addEventListener("click", () => { window.location.href = "./receipts.html"; });
navItems[2].addEventListener("click", () => { window.location.href = "./analytics.html"; });
navItems[3].addEventListener("click", () => { window.location.href = "./profile.html"; });

async function init() {
  // Show loader, hide content
  document.getElementById('dashboardLoader').classList.remove('hidden');
  document.getElementById('dashboardContent').classList.add('hidden');

  const receipts = await loadReceipts();

  drawCategoryPieChart(receipts);
  drawExpenseTrend(receipts);
  renderRecentReceipts(receipts);
  renderTopVendor(receipts);
  all_charts(receipts);

  // Hide loader, show content
  document.getElementById('dashboardLoader').classList.add('hidden');
  document.getElementById('dashboardContent').classList.remove('hidden');
}

init();
