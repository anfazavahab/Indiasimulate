/* IndiaSimulate Social Protection Atlas — main.js */

const POVERTY_LINE = 1622;
const PMJAY_PER_CAPITA = 200;
const MGN_NATIONAL_AVG = 289;

let charts = {};

/* ── DATA LOADING ───────────────────────────────────────────── */
async function loadData(file) {
  const res = await fetch(`data/${file}`);
  return res.json();
}

/* ── TAB SWITCHING ──────────────────────────────────────────── */
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tabId).classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

/* ── SORT BUTTON HELPER ─────────────────────────────────────── */
function setSortActive(groupSelector, clickedBtn) {
  document.querySelectorAll(groupSelector + ' .sort-btn').forEach(b => b.classList.remove('active'));
  clickedBtn.classList.add('active');
}

/* ── CHART: OLD-AGE PENSION ─────────────────────────────────── */
async function buildPensionChart(sortMode = 'desc') {
  const raw = await loadData('pensions.json');

  let data = [...raw];
  if (sortMode === 'desc') data.sort((a, b) => b.amount - a.amount);
  else if (sortMode === 'asc') data.sort((a, b) => a.amount - b.amount);
  else data.sort((a, b) => a.state.localeCompare(b.state));

  const labels = data.map(d => d.state);
  const values = data.map(d => d.amount);
  const colors = data.map(d =>
    d.amount >= POVERTY_LINE
      ? 'rgba(29, 158, 117, 0.75)'
      : 'rgba(55, 138, 221, 0.75)'
  );
  const borders = data.map(d =>
    d.amount >= POVERTY_LINE ? '#0F6E56' : '#185FA5'
  );

  if (charts.pension) charts.pension.destroy();

  const ctx = document.getElementById('pensionChart').getContext('2d');
  charts.pension = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 0.5,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => '₹' + ctx.raw.toLocaleString() + '/month',
            afterLabel: ctx => {
              const d = data[ctx.dataIndex];
              const pct = Math.round(ctx.raw / POVERTY_LINE * 100);
              return [
                pct + '% of poverty line',
                'Scheme: ' + d.scheme,
                'Source: ' + d.source,
                d.confirmed ? '✓ Confirmed official source' : '~ Cross-verified'
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: { size: 10 }, maxRotation: 50, minRotation: 50, autoSkip: false },
          grid: { display: false }
        },
        y: {
          min: 0,
          max: 4500,
          ticks: { font: { size: 11 }, callback: v => '₹' + v.toLocaleString() },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    },
    plugins: [{
      id: 'poverty-line',
      afterDraw(chart) {
        const { ctx, scales: { x, y }, chartArea } = chart;
        const py = y.getPixelForValue(POVERTY_LINE);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#D85A30';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(chartArea.left, py);
        ctx.lineTo(chartArea.right, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#D85A30';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Poverty line ₹1,622', chartArea.right - 4, py - 5);
        ctx.restore();
      }
    }]
  });

  window._pensionData = data;
}

/* ── CHART: HEALTH INSURANCE ────────────────────────────────── */
async function buildHealthChart(sortMode = 'budget') {
  const raw = await loadData('health_insurance.json');

  let data = [...raw];
  if (sortMode === 'budget') data.sort((a, b) => b.budget_per_capita - a.budget_per_capita);
  else data.sort((a, b) => b.coverage_pct - a.coverage_pct);

  if (charts.health) charts.health.destroy();

  const ctx = document.getElementById('healthChart').getContext('2d');
  charts.health = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.state),
      datasets: [{
        data: data.map(d => d.budget_per_capita),
        backgroundColor: 'rgba(83, 74, 183, 0.7)',
        borderColor: '#3C3489',
        borderWidth: 0.5,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => '₹' + ctx.raw + ' per capita (SHIP budget)',
            afterLabel: ctx => {
              const d = data[ctx.dataIndex];
              return [
                'Coverage: ' + (d.coverage_pct > 0 ? d.coverage_pct + '% of population' : 'n/a'),
                'Scheme: ' + d.scheme,
                'Launched: ' + d.launched
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: { size: 10 }, maxRotation: 50, minRotation: 50, autoSkip: false },
          grid: { display: false }
        },
        y: {
          ticks: { font: { size: 11 }, callback: v => '₹' + v },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    },
    plugins: [{
      id: 'pmjay-line',
      afterDraw(chart) {
        const { ctx, scales: { x, y }, chartArea } = chart;
        const py = y.getPixelForValue(PMJAY_PER_CAPITA);
        if (py < chartArea.top || py > chartArea.bottom) return;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#BA7517';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(chartArea.left, py);
        ctx.lineTo(chartArea.right, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#BA7517';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('PMJAY per-capita ~₹200', chartArea.right - 4, py - 5);
        ctx.restore();
      }
    }]
  });

  window._healthData = data;
}

/* ── CHART: MGNREGS ─────────────────────────────────────────── */
async function buildMgnChart(sortMode = 'desc') {
  const raw = await loadData('mgnregs.json');

  let data = [...raw];
  if (sortMode === 'desc') data.sort((a, b) => b.wage - a.wage);
  else data.sort((a, b) => a.wage - b.wage);

  const regionColors = {
    South: 'rgba(29, 158, 117, 0.75)',
    North: 'rgba(55, 138, 221, 0.75)',
    East: 'rgba(186, 117, 23, 0.75)',
    West: 'rgba(211, 84, 126, 0.75)',
    Central: 'rgba(83, 74, 183, 0.75)',
    NE: 'rgba(100, 130, 200, 0.75)',
  };

  if (charts.mgn) charts.mgn.destroy();

  const ctx = document.getElementById('mgnChart').getContext('2d');
  charts.mgn = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.state),
      datasets: [{
        data: data.map(d => d.wage),
        backgroundColor: data.map(d => regionColors[d.region] || 'rgba(100,100,100,0.7)'),
        borderColor: data.map(d => regionColors[d.region]?.replace('0.75', '1') || '#666'),
        borderWidth: 0.5,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => '₹' + ctx.raw + '/day (MGNREGS wage)',
            afterLabel: ctx => {
              const d = data[ctx.dataIndex];
              const diff = ctx.raw - MGN_NATIONAL_AVG;
              return [
                'Region: ' + d.region,
                (diff >= 0 ? '+' : '') + diff + ' vs national average ₹' + MGN_NATIONAL_AVG
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: { size: 10 }, maxRotation: 50, minRotation: 50, autoSkip: false },
          grid: { display: false }
        },
        y: {
          min: 200,
          ticks: { font: { size: 11 }, callback: v => '₹' + v },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    },
    plugins: [{
      id: 'avg-line',
      afterDraw(chart) {
        const { ctx, scales: { x, y }, chartArea } = chart;
        const py = y.getPixelForValue(MGN_NATIONAL_AVG);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#993C1D';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(chartArea.left, py);
        ctx.lineTo(chartArea.right, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#993C1D';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('National avg ₹289', chartArea.right - 4, py - 5);
        ctx.restore();
      }
    }]
  });
}

/* ── PENSION SORT HANDLER ───────────────────────────────────── */
function sortPension(mode, btn) {
  setSortActive('#pension-sorts', btn);
  buildPensionChart(mode);
}

/* ── HEALTH SORT HANDLER ────────────────────────────────────── */
function sortHealth(mode, btn) {
  setSortActive('#health-sorts', btn);
  buildHealthChart(mode);
}

/* ── MGN SORT HANDLER ───────────────────────────────────────── */
function sortMgn(mode, btn) {
  setSortActive('#mgn-sorts', btn);
  buildMgnChart(mode);
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildPensionChart('desc');
  buildHealthChart('budget');
  buildMgnChart('desc');
});
