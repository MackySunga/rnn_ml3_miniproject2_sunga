# RNN Audio Deepfake Single-Notebook + Web App Package v2

Final title:

RNN-Based Audio Deepfake Detection Using FFT-Derived STFT Features: An Ablation Study of GRU Architecture Improvements

Created by: Bob Mathew Sunga

## What is improved in this version

- One complete Jupyter notebook only
- The notebook exports the exact same values used by the web application
- Seven RNN architectures only
- Default and tuned thresholds are treated as evaluation settings, not extra models
- Audio playback support for real and fake samples after the notebook runs
- Visual step-by-step method walkthrough in the web app
- Waveform, STFT spectrogram, frequency profile, ROC curve, threshold curve, training history, probability distribution, and confusion matrix visuals
- Error analysis with false positives and false negatives
- Discussion, findings, limitations, and future work pages

## Run order

1. Place the Fake-or-Real `for-2sec` dataset under `data/raw/for-2sec/`.
2. Open and run `notebooks/01_full_rnn_audio_deepfake_ablation_dashboard_export.ipynb`.
3. Open `web_app/index.html`.

## Dataset folder

```text
data/raw/for-2sec/
├── training/
│   ├── real/
│   └── fake/
├── validation/
│   ├── real/
│   └── fake/
└── testing/
    ├── real/
    └── fake/
```

## Important note

The web app has preview values before running the notebook. After the notebook runs, it overwrites `web_app/assets/js/results-data.js` with the actual notebook values and figure paths.


## V3 Detailed Methodology Update

This version adds deeper methodology and discussion sections in both the notebook and the web application.

Added notebook sections:
- Detailed dataset methodology
- Detailed research pipeline methodology
- Audio visualization methodology
- STFT and RNN input methodology
- Architecture-by-architecture methodology
- Evaluation methodology
- Expanded discussion by study component

Added web app pages:
- Detailed Methodology
- Architecture Guide
- Evaluation Guide
- Expanded Discussion Narrative


## v4 Dashboard Improvements

This version improves the web dashboard only. The notebook workflow is unchanged.

Dashboard improvements:
- Cleaner hero summary section
- Better visual hierarchy and spacing
- Interactive method walkthrough with a detail pane
- Improved dashboard process strip
- Better real vs fake audio visualization layout
- Improved architecture guide, methodology guide, and evaluation guide pages
- Cleaner seven-architecture results page
- Clickable model rows with a detail drawer
- Print button for the current dashboard view
- Responsive layout improvements
