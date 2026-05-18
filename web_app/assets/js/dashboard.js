document.addEventListener('DOMContentLoaded', () => {
  const data = window.RNN_AUDIO_RESULTS;
  if (!data) return;

  const pages = Array.from(document.querySelectorAll('.page'));
  const menuLinks = Array.from(document.querySelectorAll('[data-page], [data-page-link]'));
  const sidebar = document.getElementById('appSidebar');
  const pageTitleText = document.getElementById('pageTitleText');
  const pageSubtitleText = document.getElementById('pageSubtitleText');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const detailDrawer = document.getElementById('detailDrawer');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerBody = document.getElementById('drawerBody');

  const bestModel = data.best_model || {};
  const architectureSummary = Array.isArray(data.architecture_summary) ? data.architecture_summary : [];
  const thresholdDetails = Array.isArray(data.threshold_details) ? data.threshold_details : [];
  const confusionMatrices = Array.isArray(data.confusion_matrices) ? data.confusion_matrices : [];
  const dataset = data.dataset || {};
  const datasetSummary = Array.isArray(dataset.summary) ? dataset.summary : [];
  const usedSamples = dataset.used_samples || {};
  const visuals = data.visuals || {};
  const audioSamples = data.audio_samples || {};
  const errorAnalysis = data.error_analysis || {};

  const pageMeta = {
    dashboard: ['Dashboard', 'Notebook-exported summary of the experiment output'],
    walkthrough: ['Method Walkthrough', 'Pipeline steps from raw audio to dashboard export'],
    audio: ['Real vs Fake Audio', 'Waveform, STFT, and sample playback exported by the notebook'],
    results: ['Seven RNN Results', 'Ranked model results and threshold settings'],
    confusion: ['Confusion Matrix', 'Per-architecture confusion counts and best-model view'],
    training: ['Training and Threshold', 'Training history, tuned threshold, and ROC curves'],
    methodology: ['Detailed Methodology', 'Research-ready explanation of the workflow'],
    architecture: ['Architecture Guide', 'What each RNN architecture variant tests'],
    evaluation: ['Evaluation Guide', 'How to interpret the exported metrics'],
    discussion: ['Discussion', 'Why the observed model behavior likely happened'],
    findings: ['Findings', 'High-signal results pulled from the notebook export'],
    limitations: ['Limitations', 'Scope constraints and logical next steps']
  };

  const walkthroughSteps = [
    {
      title: 'Load and label audio',
      body: 'The notebook reads real and fake audio files, keeps the source filenames, and assigns labels before any feature extraction.'
    },
    {
      title: 'Normalize to a fixed input',
      body: 'Each clip is converted to a consistent 16 kHz, mono, 2-second format so the models see uniform-length signals.'
    },
    {
      title: 'Compute STFT sequences',
      body: `Short-Time Fourier Transform converts each waveform into ${dataset.input_shape?.label || 'time-frequency'} frames that capture how frequency content changes over time.`
    },
    {
      title: 'Train seven RNN variants',
      body: 'The ablation compares seven GRU/BiGRU/BiLSTM variants while keeping the feature pipeline aligned across runs.'
    },
    {
      title: 'Evaluate and export',
      body: 'Metrics, confusion matrices, audio examples, and figure paths are exported for the web app so the dashboard stays synchronized with the notebook.'
    }
  ];

  const methodologyCards = [
    {
      tag: 'Data',
      title: 'Dataset Handling',
      body: `The notebook tracks class counts per split and samples ${formatInteger(usedSamples.total || 0)} files for the dashboard experiment while preserving the full split summary for context.`
    },
    {
      tag: 'Features',
      title: 'STFT Feature Shape',
      body: `Each sample becomes a ${dataset.input_shape?.label || 'fixed'} STFT tensor using n_fft=${dataset.n_fft || 0} and hop_length=${dataset.hop_length || 0}, which gives the RNN a time-ordered frequency sequence.`
    },
    {
      tag: 'Models',
      title: 'Architecture Ablation',
      body: 'The study changes only the recurrent architecture design across seven models so differences in accuracy, recall, and F1-score can be compared directly.'
    },
    {
      tag: 'Export',
      title: 'Dashboard Synchronization',
      body: 'The web app reads generated JSON and figure paths instead of manual values, which prevents stale charts and mismatched claims.'
    }
  ];

  const architectureCards = [
    {
      tag: 'RNN-1',
      title: 'Basic GRU',
      body: 'Reference single-direction GRU baseline for the ablation.'
    },
    {
      tag: 'RNN-2',
      title: 'GRU + Dropout',
      body: 'Adds dropout to test whether regularization improves generalization.'
    },
    {
      tag: 'RNN-3',
      title: 'Stacked GRU',
      body: 'Adds recurrent depth to test whether multiple GRU layers improve sequence modeling.'
    },
    {
      tag: 'RNN-4',
      title: 'BiGRU',
      body: 'Processes each STFT sequence in forward and backward directions to capture richer temporal context.'
    },
    {
      tag: 'RNN-5',
      title: 'BiGRU + Dropout + LayerNorm',
      body: 'Combines bidirectionality with normalization and regularization for training stability.'
    },
    {
      tag: 'RNN-6',
      title: 'BiGRU + Attention',
      body: 'Adds an attention mechanism so the network can emphasize informative frames.'
    },
    {
      tag: 'RNN-7',
      title: 'BiLSTM + Attention',
      body: 'Tests whether an LSTM-based bidirectional attention model changes the precision-recall tradeoff.'
    }
  ];

  const evaluationCards = [
    {
      tag: 'Accuracy',
      title: 'Overall Correctness',
      body: 'Accuracy reports the share of correct predictions across both classes, but can hide which type of error is more damaging.'
    },
    {
      tag: 'Precision',
      title: 'Predicted Fake Reliability',
      body: 'High precision means clips predicted as fake are usually fake, which helps reduce false alarms.'
    },
    {
      tag: 'Recall',
      title: 'Fake Detection Coverage',
      body: 'Recall measures how many fake clips were caught. For deepfake screening this is often the key operational metric.'
    },
    {
      tag: 'F1-score',
      title: 'Balanced Detection Metric',
      body: 'F1-score balances precision and recall, making it a better ranking metric when both missed fakes and false alarms matter.'
    }
  ];

  const discussionCards = [
    {
      tag: 'Result',
      title: 'Why The Top Model Won',
      body: `${bestModel.architecture || 'The top model'} leads the ranking because it preserves very high precision while lifting recall above the rest of the field.`
    },
    {
      tag: 'Threshold',
      title: 'Threshold Effects',
      body: 'Several architectures improve after threshold tuning, showing that the raw probability cutoff can materially change the operating point even when ROC-AUC is unchanged.'
    },
    {
      tag: 'Tradeoff',
      title: 'Recall Remains Hard',
      body: 'Most models keep precision high but sacrifice recall, which suggests fake samples are still being mistaken for real under conservative decision thresholds.'
    },
    {
      tag: 'Interpretation',
      title: 'What The Visuals Contribute',
      body: 'Waveforms and spectrograms are explanatory views, while the STFT-based model figures show how architecture and threshold choices change final classification behavior.'
    }
  ];

  const metricLegendItems = [
    { label: 'Accuracy', color: '#0b74de' },
    { label: 'Precision', color: '#22a447' },
    { label: 'Recall', color: '#f59e0b' },
    { label: 'F1-score', color: '#6544e9' }
  ];

  const visualLegendConfig = {
    waveform_overlay: {
      title: 'Legend',
      items: [
        { label: 'Real audio waveform', color: '#0b74de' },
        { label: 'Fake audio waveform', color: '#e5484d' }
      ]
    },
    real_waveform: {
      title: 'Interpretation',
      items: [
        { label: 'X-axis: time', tone: 'neutral' },
        { label: 'Y-axis: amplitude', tone: 'neutral' },
        { label: 'Single trace: exported real sample', color: '#0b74de' }
      ]
    },
    fake_waveform: {
      title: 'Interpretation',
      items: [
        { label: 'X-axis: time', tone: 'neutral' },
        { label: 'Y-axis: amplitude', tone: 'neutral' },
        { label: 'Single trace: exported fake sample', color: '#e5484d' }
      ]
    },
    real_stft: {
      title: 'Interpretation',
      items: [
        { label: 'X-axis: time', tone: 'neutral' },
        { label: 'Y-axis: frequency (Hz)', tone: 'neutral' },
        { label: 'Brighter regions indicate stronger spectral energy', tone: 'accent' }
      ]
    },
    fake_stft: {
      title: 'Interpretation',
      items: [
        { label: 'X-axis: time', tone: 'neutral' },
        { label: 'Y-axis: frequency (Hz)', tone: 'neutral' },
        { label: 'Brighter regions indicate stronger spectral energy', tone: 'accent' }
      ]
    },
    frequency_profile: {
      title: 'Legend',
      items: [
        { label: 'Real mean frequency profile', color: '#0b74de' },
        { label: 'Fake mean frequency profile', color: '#e5484d' }
      ]
    },
    best_confusion_matrix: {
      title: 'Legend',
      items: [
        { label: 'TN and TP cells are correct classifications', color: '#22a447' },
        { label: 'FP and FN cells are model errors', color: '#e5484d' }
      ]
    },
    training_history: {
      title: 'Interpretation',
      items: [
        { label: 'Each line corresponds to an exported model validation-loss history', tone: 'accent' },
        { label: 'Lower curves indicate better validation loss', tone: 'neutral' }
      ]
    },
    threshold_curve_best: {
      title: 'Legend',
      items: [
        { label: 'Solid curve: validation F1-score by threshold', color: '#0b74de' },
        { label: 'Dashed marker: selected operating threshold', color: '#e5484d' }
      ]
    },
    roc_curves: {
      title: 'Legend',
      items: [
        { label: 'Each colored line is one RNN architecture ROC curve', tone: 'accent' },
        { label: 'Higher and farther-left curves are better', tone: 'neutral' }
      ]
    }
  };

  function formatMetric(value) {
    return Number.isFinite(Number(value)) ? Number(value).toFixed(4) : '-';
  }

  function formatPercent(value) {
    return Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(2)}%` : '-';
  }

  function formatInteger(value) {
    return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '-';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderVisuals() {
    document.querySelectorAll('[data-visual]').forEach((img) => {
      const key = img.getAttribute('data-visual');
      const src = visuals[key];
      if (!src) return;
      img.src = src;
      img.alt = key.replace(/_/g, ' ');
    });
  }

  function renderMetricLegend() {
    const canvas = document.getElementById('metricCanvas');
    if (!canvas) return;

    let legend = canvas.parentElement?.querySelector('.chart-legend');
    if (!legend) {
      legend = document.createElement('div');
      legend.className = 'chart-legend';
      canvas.insertAdjacentElement('afterend', legend);
    }

    legend.innerHTML = metricLegendItems.map((item) => `
      <span class="legend-chip">
        <i class="legend-swatch" style="background:${item.color}"></i>
        ${escapeHtml(item.label)}
      </span>
    `).join('');
  }

  function renderVisualLegends() {
    document.querySelectorAll('[data-visual]').forEach((img) => {
      const key = img.getAttribute('data-visual');
      const config = visualLegendConfig[key];
      const existing = img.parentElement?.querySelector('.visual-legend');
      if (existing) existing.remove();
      if (!config) return;

      const legend = document.createElement('div');
      legend.className = 'visual-legend';
      const itemsHtml = config.items.map((item) => {
        if (item.color) {
          return `<li><i class="legend-swatch" style="background:${item.color}"></i><span>${escapeHtml(item.label)}</span></li>`;
        }
        return `<li><i class="legend-dot ${item.tone === 'accent' ? 'accent' : ''}"></i><span>${escapeHtml(item.label)}</span></li>`;
      }).join('');

      legend.innerHTML = `
        <strong>${escapeHtml(config.title)}</strong>
        <ul>${itemsHtml}</ul>
      `;
      img.insertAdjacentElement('afterend', legend);
    });
  }

  function renderAudio() {
    const realAudio = document.getElementById('realAudio');
    const fakeAudio = document.getElementById('fakeAudio');
    const realAudioNote = document.getElementById('realAudioNote');
    const fakeAudioNote = document.getElementById('fakeAudioNote');

    if (realAudio && audioSamples.real) realAudio.src = audioSamples.real;
    if (fakeAudio && audioSamples.fake) fakeAudio.src = audioSamples.fake;
    if (realAudioNote) realAudioNote.textContent = audioSamples.real ? 'Notebook-exported real sample.' : 'No exported real sample was found.';
    if (fakeAudioNote) fakeAudioNote.textContent = audioSamples.fake ? 'Notebook-exported fake sample.' : 'No exported fake sample was found.';
  }

  function renderSummaryCards() {
    const bestChip = document.querySelector('#dashboard .summary-card .chip');
    if (bestChip) bestChip.textContent = bestModel.rnn_no || '-';

    setText('bestModelValue', bestModel.architecture || '-');
    setText('f1Value', formatMetric(bestModel.f1_score));
    setText('confusionValue', `${formatInteger(confusionMatrices[0]?.tp || 0)} / ${formatInteger(confusionMatrices[0]?.tn || 0)}`);
    setText('shapeValue', dataset.input_shape?.label || '-');
    setText('bestModelFoot', `${bestModel.best_setting || 'Best'} threshold ${Number(bestModel.threshold || 0).toFixed(2)}`);

    renderMiniBars('miniF1Bars', architectureSummary.map((row) => ({
      value: Number(row['F1-score']) || 0,
      title: `${row['RNN No.']} ${row.Architecture}`,
      color: '#22a447'
    })));

    renderMiniBars('miniConfusionBars', [
      { value: confusionMatrices[0]?.tp || 0, title: 'True Positive', color: '#22a447' },
      { value: confusionMatrices[0]?.tn || 0, title: 'True Negative', color: '#0b74de' },
      { value: confusionMatrices[0]?.fp || 0, title: 'False Positive', color: '#e5484d' },
      { value: confusionMatrices[0]?.fn || 0, title: 'False Negative', color: '#f59e0b' }
    ]);

    renderMiniBars('miniShapeBars', [
      { value: dataset.input_shape?.time_frames || 0, title: 'Time Frames', color: '#0b74de' },
      { value: dataset.input_shape?.frequency_bins || 0, title: 'Frequency Bins', color: '#f59e0b' }
    ]);

    renderMiniLine('miniModelChart', architectureSummary.map((row) => Number(row['F1-score']) || 0));
  }

  function renderMiniBars(containerId, bars) {
    const container = document.getElementById(containerId);
    if (!container || !bars.length) return;

    const maxValue = Math.max(...bars.map((item) => Number(item.value) || 0), 1);
    container.innerHTML = bars.map((item) => {
      const width = ((Number(item.value) || 0) / maxValue) * 100;
      return `<div class="bar" title="${escapeHtml(item.title)}"><i style="width:${width}%;background:${item.color}"></i></div>`;
    }).join('');
  }

  function renderMiniLine(containerId, values) {
    const container = document.getElementById(containerId);
    if (!container || !values.length) return;

    const width = 280;
    const height = 86;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 0.01);
    const points = values.map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * (width - 16) + 8;
      const y = height - (((value - min) / range) * (height - 20) + 10);
      return `${x},${y}`;
    }).join(' ');

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" aria-label="F1 trend by architecture">
        <polyline fill="none" stroke="#0b74de" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${points}"></polyline>
      </svg>
    `;
  }

  function renderProcessStrip() {
    const processStrip = document.getElementById('processStrip');
    if (!processStrip) return;

    const items = [
      ['1', 'Load audio', 'Balanced real and fake clips by split'],
      ['2', 'Normalize', '2-second mono audio at 16 kHz'],
      ['3', 'Extract STFT', `${dataset.input_shape?.label || 'Fixed'} input sequence`],
      ['4', 'Train RNNs', `${formatInteger(architectureSummary.length)} architectures compared`],
      ['5', 'Export dashboard', 'Charts and metrics synchronized from notebook']
    ];

    processStrip.innerHTML = items.map(([step, title, note]) => `
      <article class="process-step">
        <strong>${step}</strong>
        <div><div>${title}</div><span>${note}</span></div>
      </article>
    `).join('');
  }

  function renderDatasetOverview() {
    setText('sampleTotal', formatInteger(usedSamples.total || 0));

    const rows = document.getElementById('datasetRows');
    if (!rows) return;

    const maxCount = Math.max(...datasetSummary.map((item) => Number(item.Count) || 0), 1);
    rows.innerHTML = datasetSummary.map((item) => {
      const width = ((Number(item.Count) || 0) / maxCount) * 100;
      const tone = item.Class === 'fake' ? 'orange' : item.Split === 'training' ? 'green' : '';
      return `
        <div class="dataset-row">
          <span>${escapeHtml(item.Split)} / ${escapeHtml(item.Class)}</span>
          <strong>${formatInteger(item.Count)}</strong>
          <div class="bar ${tone}"><i style="width:${width}%"></i></div>
        </div>
      `;
    }).join('');
  }

  function renderMetricCanvas() {
    const canvas = document.getElementById('metricCanvas');
    if (!canvas || !canvas.getContext || !architectureSummary.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width || 760), 760);
    const height = 270;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 56, left: 44 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barCount = architectureSummary.length * 4;
    const gap = 10;
    const barWidth = Math.max((chartWidth - gap * (barCount - 1)) / barCount, 6);
    const colors = Object.fromEntries(metricLegendItems.map((item) => [item.label, item.color]));

    ctx.strokeStyle = '#d8dee9';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#687386';

    for (let i = 0; i <= 5; i += 1) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const label = (1 - i / 5).toFixed(1);
      ctx.fillText(label, 10, y + 4);
    }

    let x = padding.left;
    architectureSummary.forEach((row, index) => {
      ['Accuracy', 'Precision', 'Recall', 'F1-score'].forEach((metric) => {
        const value = Number(row[metric]) || 0;
        const barHeight = value * chartHeight;
        ctx.fillStyle = colors[metric];
        ctx.fillRect(x, padding.top + chartHeight - barHeight, barWidth, barHeight);
        x += barWidth + gap;
      });

      const labelX = padding.left + index * ((barWidth + gap) * 4) + ((barWidth + gap) * 4 - gap) / 2;
      ctx.save();
      ctx.translate(labelX, height - 8);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#374151';
      ctx.fillText(row['RNN No.'], 0, 0);
      ctx.restore();
    });

  }

  function renderArchitectureTable(targetId, rows, clickable) {
    const body = document.getElementById(targetId);
    if (!body) return;

    body.innerHTML = rows.map((row, index) => `
      <tr class="${clickable ? 'clickable-row' : ''}" ${clickable ? `data-arch-index="${index}"` : ''}>
        <td><span class="rank-pill ${Number(row.Rank) === 1 ? 'top' : ''}">${escapeHtml(row.Rank ?? index + 1)}</span></td>
        <td>${escapeHtml(row['RNN No.'])}</td>
        <td class="model-name">${escapeHtml(row.Architecture)}</td>
        <td>${escapeHtml(row['Best Setting'])}</td>
        <td>${Number(row.Threshold || 0).toFixed(2)}</td>
        <td>${formatPercent(row.Accuracy)}</td>
        <td>${formatPercent(row.Precision)}</td>
        <td>${formatPercent(row.Recall)}</td>
        <td>${formatPercent(row['F1-score'])}</td>
        <td>${formatPercent(row['ROC-AUC'])}</td>
      </tr>
    `).join('');
  }

  function renderThresholdTable() {
    const body = document.getElementById('thresholdTable');
    if (!body) return;

    body.innerHTML = thresholdDetails.map((row) => `
      <tr>
        <td>${escapeHtml(row['RNN No.'])}</td>
        <td class="model-name">${escapeHtml(row.Architecture)}</td>
        <td>${escapeHtml(row['Evaluation Setting'])}</td>
        <td>${Number(row.Threshold || 0).toFixed(2)}</td>
        <td>${formatPercent(row.Accuracy)}</td>
        <td>${formatPercent(row.Precision)}</td>
        <td>${formatPercent(row.Recall)}</td>
        <td>${formatPercent(row['F1-score'])}</td>
        <td>${formatPercent(row['ROC-AUC'])}</td>
      </tr>
    `).join('');
  }

  function renderWalkthrough() {
    const list = document.getElementById('methodSteps');
    const detail = document.getElementById('stepDetail');
    if (!list || !detail) return;

    const showStep = (index) => {
      const step = walkthroughSteps[index] || walkthroughSteps[0];
      list.querySelectorAll('.step-card').forEach((card, cardIndex) => {
        card.classList.toggle('active', cardIndex === index);
      });
      detail.innerHTML = `
        <div class="big-num">${index + 1}</div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.body)}</p>
      `;
    };

    list.innerHTML = walkthroughSteps.map((step, index) => `
      <article class="step-card ${index === 0 ? 'active' : ''}" data-step-index="${index}">
        <strong>${index + 1}</strong>
        <div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p></div>
      </article>
    `).join('');

    list.addEventListener('click', (event) => {
      const card = event.target.closest('.step-card');
      if (!card) return;
      showStep(Number(card.getAttribute('data-step-index')) || 0);
    });

    showStep(0);
  }

  function renderCards(targetId, cards, extraClass = '') {
    const container = document.getElementById(targetId);
    if (!container) return;

    container.innerHTML = cards.map((card, index) => `
      <section class="method-card ${extraClass} ${index === 0 ? 'highlight-method' : ''}">
        <span>${escapeHtml(card.tag)}</span>
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.body)}</p>
      </section>
    `).join('');
  }

  function renderConfusionViews() {
    const confusionSelect = document.getElementById('confusionSelect');
    const confusionSummaryGrid = document.getElementById('confusionSummaryGrid');
    if (confusionSelect) {
      confusionSelect.innerHTML = confusionMatrices.map((item, index) => `
        <option value="${index}">${escapeHtml(item.rnn_no)} - ${escapeHtml(item.architecture)}</option>
      `).join('');
    }

    if (confusionSummaryGrid) {
      confusionSummaryGrid.innerHTML = confusionMatrices.map((item) => `
        <article class="confusion-small-card">
          <h3>${escapeHtml(item.rnn_no)} <span class="muted">${escapeHtml(item.architecture)}</span></h3>
          <div class="mini-matrix">
            <div class="ok">TN ${formatInteger(item.tn)}</div>
            <div class="err">FP ${formatInteger(item.fp)}</div>
            <div class="err">FN ${formatInteger(item.fn)}</div>
            <div class="ok">TP ${formatInteger(item.tp)}</div>
          </div>
        </article>
      `).join('');
    }
  }

  function renderFindings() {
    const findingSummaryCards = document.getElementById('findingSummaryCards');
    if (findingSummaryCards) {
      const cards = [
        { label: 'Best Architecture', value: bestModel.architecture || '-', note: `${bestModel.rnn_no || '-'} ranked first` },
        { label: 'Best F1-score', value: formatMetric(bestModel.f1_score), note: `${formatPercent(bestModel.f1_score)} on test data` },
        { label: 'False Positives', value: formatInteger(errorAnalysis.false_positive_count || 0), note: 'Real clips predicted as fake' },
        { label: 'False Negatives', value: formatInteger(errorAnalysis.false_negative_count || 0), note: 'Fake clips predicted as real' }
      ];

      findingSummaryCards.innerHTML = cards.map((card) => `
        <article class="finding-summary-card">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
          <p>${escapeHtml(card.note)}</p>
        </article>
      `).join('');
    }

    const thresholdNarrative = document.getElementById('thresholdNarrative');
    if (thresholdNarrative) {
      thresholdNarrative.textContent = `${bestModel.architecture || 'The best model'} used a ${Number(bestModel.threshold || 0).toFixed(2)} threshold under the ${bestModel.best_setting || 'best'} setting.`;
    }

    const findingsConclusion = document.getElementById('findingsConclusion');
    if (findingsConclusion) {
      findingsConclusion.textContent = `${bestModel.architecture || 'The top architecture'} (${bestModel.rnn_no || 'best model'}) achieved the strongest exported result with F1-score ${formatMetric(bestModel.f1_score)} and ROC-AUC ${formatMetric(bestModel.roc_auc)}. In this run, bidirectional GRU context outperformed the other tested variants.`;
    }
  }

  function openDrawerForArchitecture(index) {
    const row = architectureSummary[index];
    if (!row || !detailDrawer || !drawerTitle || !drawerBody) return;

    const confusion = confusionMatrices.find((item) => item.rnn_no === row['RNN No.']);
    const thresholdRows = thresholdDetails.filter((item) => item['RNN No.'] === row['RNN No.']);

    drawerTitle.textContent = `${row['RNN No.']} - ${row.Architecture}`;
    drawerBody.innerHTML = `
      <div class="drawer-metric"><span>Best Setting</span><strong>${escapeHtml(row['Best Setting'])}</strong></div>
      <div class="drawer-metric"><span>Threshold</span><strong>${Number(row.Threshold || 0).toFixed(2)}</strong></div>
      <div class="drawer-metric"><span>Accuracy</span><strong>${formatPercent(row.Accuracy)}</strong></div>
      <div class="drawer-metric"><span>Precision</span><strong>${formatPercent(row.Precision)}</strong></div>
      <div class="drawer-metric"><span>Recall</span><strong>${formatPercent(row.Recall)}</strong></div>
      <div class="drawer-metric"><span>F1-score</span><strong>${formatPercent(row['F1-score'])}</strong></div>
      <div class="drawer-metric"><span>ROC-AUC</span><strong>${formatPercent(row['ROC-AUC'])}</strong></div>
      ${confusion ? `
        <div class="drawer-metric"><span>TN / FP</span><strong>${formatInteger(confusion.tn)} / ${formatInteger(confusion.fp)}</strong></div>
        <div class="drawer-metric"><span>FN / TP</span><strong>${formatInteger(confusion.fn)} / ${formatInteger(confusion.tp)}</strong></div>
      ` : ''}
      ${thresholdRows.length ? `
        <div class="drawer-metric"><span>Threshold Views</span><strong>${thresholdRows.map((item) => `${item['Evaluation Setting']} ${Number(item.Threshold || 0).toFixed(2)}`).join(' | ')}</strong></div>
      ` : ''}
    `;
    detailDrawer.classList.add('open');
  }

  function closeDrawer() {
    if (detailDrawer) detailDrawer.classList.remove('open');
  }

  function activatePage(pageId, updateHash) {
    const targetId = pageMeta[pageId] ? pageId : 'dashboard';
    pages.forEach((page) => page.classList.toggle('active', page.id === targetId));
    document.querySelectorAll('.menu-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-page') === targetId);
    });

    const meta = pageMeta[targetId];
    if (pageTitleText) pageTitleText.textContent = meta[0];
    if (pageSubtitleText) pageSubtitleText.textContent = meta[1];
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = meta[0];
    if (updateHash && window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }
  }

  function exportTable(tableBodyId, filename) {
    const body = document.getElementById(tableBodyId);
    if (!body) return;
    const rows = Array.from(body.closest('table').querySelectorAll('tr'));
    const csv = rows.map((row) =>
      Array.from(row.children)
        .map((cell) => `"${cell.textContent.replace(/"/g, '""').trim()}"`)
        .join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  renderVisuals();
  renderAudio();
  renderSummaryCards();
  renderProcessStrip();
  renderDatasetOverview();
  renderArchitectureTable('architectureTable', architectureSummary, false);
  renderArchitectureTable('architectureTableFull', architectureSummary, true);
  renderThresholdTable();
  renderMetricCanvas();
  renderMetricLegend();
  renderWalkthrough();
  renderCards('methodologyCards', methodologyCards);
  renderCards('architectureCards', architectureCards);
  renderCards('evaluationCards', evaluationCards);
  renderCards('discussionCards', discussionCards);
  renderConfusionViews();
  renderFindings();
  renderVisualLegends();

  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
      if (!pageId) return;
      event.preventDefault();
      activatePage(pageId, true);
      if (window.innerWidth <= 780) sidebar?.classList.remove('open');
    });
  });

  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    if (window.innerWidth <= 780) {
      sidebar?.classList.toggle('open');
    } else {
      sidebar?.classList.toggle('collapsed');
    }
  });

  document.getElementById('compactToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('compact');
  });

  document.getElementById('printBtn')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);

  document.querySelectorAll('.clickable-card').forEach((card) => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-page-link');
      if (target) activatePage(target, true);
    });
  });

  document.querySelectorAll('.panel-collapse').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = button.closest('.panel');
      if (!panel) return;
      panel.classList.toggle('collapsed-panel');
    });
  });

  document.getElementById('architectureTableFull')?.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-arch-index]');
    if (!row) return;
    openDrawerForArchitecture(Number(row.getAttribute('data-arch-index')) || 0);
  });

  document.querySelectorAll('[data-highlight-metric]').forEach((button) => {
    button.addEventListener('click', () => {
      const metric = button.getAttribute('data-highlight-metric');
      document.querySelectorAll('[data-highlight-metric]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const table = document.getElementById('architectureTableFull')?.closest('table');
      if (!table) return;
      table.classList.remove('metric-highlight-f1', 'metric-highlight-recall', 'metric-highlight-roc');
      if (metric === 'f1') table.classList.add('metric-highlight-f1');
      if (metric === 'recall') table.classList.add('metric-highlight-recall');
      if (metric === 'roc') table.classList.add('metric-highlight-roc');
    });
  });

  document.querySelector('[data-export-table="architectureTableFull"]')?.addEventListener('click', () => {
    exportTable('architectureTableFull', 'seven-rnn-results.csv');
  });

  window.addEventListener('hashchange', () => {
    activatePage(window.location.hash.replace('#', ''), false);
  });

  window.addEventListener('resize', () => {
    renderMetricCanvas();
    renderMetricLegend();
  });

  const initialPage = window.location.hash.replace('#', '') || 'dashboard';
  activatePage(initialPage, false);
});
