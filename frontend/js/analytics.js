// Category icons mapping
import { BASE_URL } from "./config.js";

const categoryIcons = {
  food:        'fa-utensils',
  shopping:    'fa-bag-shopping',
  travel:      'fa-plane',
  transport:   'fa-car',
  health:      'fa-heart-pulse',
  healthcare:  'fa-heart-pulse',
  office:      'fa-briefcase',
  electronics: 'fa-laptop',
  entertainment: 'fa-film',
  default:     'fa-tag'
};

function getCategoryIcon(category) {
  const key = (category || '').toLowerCase();
  return categoryIcons[key] || categoryIcons.default;
}

function getScoreClass(label) {
  const map = { 'Poor': 'poor', 'Average': 'average', 'Good': 'good', 'Excellent': 'excellent' };
  return map[label] || 'good';
}

function renderInsights(data) {
  // Summary + Personality + Score
  document.getElementById('summaryLine').textContent      = data.summary_line || '—';
  document.getElementById('spendingPersonality').textContent = data.spending_personality || '—';
  document.getElementById('scoreValue').textContent       = data.score?.value ?? '—';
  document.getElementById('scoreLabel').textContent       = data.score?.label || '—';
  document.getElementById('scoreReason').textContent      = data.score?.reason || '—';

  // Score circle color
  const scoreCircle = document.getElementById('scoreCircle');
  scoreCircle.className = 'score-circle ' + getScoreClass(data.score?.label);

  // Insights
  const insightsList = document.getElementById('insightsList');
  insightsList.innerHTML = (data.insights || [])
    .map(i => `<li>${i}</li>`)
    .join('');

  // Warnings
  const warningsCard = document.getElementById('warningsCard');
  const warningsList = document.getElementById('warningsList');
  if (data.warnings && data.warnings.length > 0) {
    warningsList.innerHTML = data.warnings.map(w => `<li>${w}</li>`).join('');
    warningsCard.parentElement.style.display = 'block';
  } else {
    warningsCard.parentElement.style.display = 'none';
  }

  // Tip
  document.getElementById('tipOfDay').textContent = data.tip_of_the_day || '—';

  // Detailed Advice
  const adviceContainer = document.getElementById('detailedAdvice');
  adviceContainer.innerHTML = Object.entries(data.detailed_advice || {})
    .map(([cat, advice]) => `
      <div class="advice-item">
        <div class="advice-icon">
          <i class="fa-solid ${getCategoryIcon(cat)}"></i>
        </div>
        <div class="advice-text">
          <h5>${cat}</h5>
          <p>${advice}</p>
        </div>
      </div>
    `).join('');

  // Forecast
  document.getElementById('monthlyForecast').textContent = data.monthly_forecast || '—';

  // Show the response section
  document.getElementById('aiResponse').classList.remove('hidden');
}

// Back button
document.getElementById('backBtn').onclick = () => {
  location.href = './index.html';
};

// Analyze button
document.getElementById('analyzeBtn').onclick = async () => {
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

  try {
    const res  = await fetch(`${BASE_URL}/insights`);
    const data = await res.json();
    renderInsights(data);
  } catch (e) {
    alert('Failed to load insights: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Regenerate Insights';
  }
};
