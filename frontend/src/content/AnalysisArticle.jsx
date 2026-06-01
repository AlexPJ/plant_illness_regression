import FigureZoom from '../components/FigureZoom'

const FIGURES = {
  graphicReport: '/analysis/graphic-report.png',
  illnessComparison: '/analysis/illness-comparison.png',
  maskComparison: '/analysis/mask-comparison.png',
}

function ArticleSection({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-emerald-300 mb-4 tracking-tight">{title}</h2>
      <div className="space-y-4 text-slate-300 text-[15px] leading-relaxed">{children}</div>
    </section>
  )
}

function PullQuote({ children }) {
  return (
    <blockquote className="my-8 pl-5 border-l-4 border-emerald-500/60 text-lg text-emerald-100/90 italic font-medium">
      {children}
    </blockquote>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="glass-panel rounded-xl px-4 py-3 text-center">
      <div className="text-2xl font-extrabold text-emerald-400">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">{label}</div>
    </div>
  )
}

export default function AnalysisArticle() {
  return (
    <article className="animate-fadeIn max-w-3xl mx-auto">
      <header className="mb-10 text-center">
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Field notes · 18 min read</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 leading-tight mb-4">
          I Trained a Tiny Neural Network to Judge How Sick a Leaf Looks — Without Showing It a Single Pixel as Input
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          The story behind <code className="text-emerald-400/90 text-xs">notebook_feature_mlp_plant_model.npz</code>: hand-crafted color features, a 32-neuron MLP, and the training journey from raw photos to segmentation experiments to a small augmentation win.
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl mb-10 relative">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <ArticleSection title="It started with a folder of leaves and a number">
          <p>
            I had leaf photographs and human-assigned disease ratings — not classes like “rust” or “mildew,” but a continuous score from healthy to very sick. The kind of label you get when someone squints at a photo and says, “this one’s maybe a 72 out of 100 on the misery scale.”
          </p>
          <p>
            My first instinct was the obvious one: throw a convolutional network at the pixels and call it a day. PyTorch was already in the project, and notebooks are where ideas go to breathe. But I wanted something I could <em>explain</em> in a browser — something that would tell a user <em>why</em> the model thought a leaf was struggling, not just flash a red badge.
          </p>
          <PullQuote>
            So I made a bet: compress each leaf into a compact spectral fingerprint, then let a small MLP learn the regression. Pixels stay in the notebook; numbers travel to production.
          </PullQuote>
        </ArticleSection>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatPill label="Images" value="97" />
          <StatPill label="Feature dims" value="57" />
          <StatPill label="Epochs" value="800" />
          <StatPill label="Hidden units" value="32" />
        </div>

        <ArticleSection title="Version 1 — The whole pipeline on the original image">
          <p>
            Before I over-engineered anything, I built the full path end to end on the <strong className="text-emerald-300">original photographs</strong> — pot, white table, shadows and all. No masking step yet: resize, extract features, train, evaluate.
          </p>
          <p>
            <strong className="text-slate-200">Step 1 — Resize.</strong> Every image was center-cropped and scaled to <strong className="text-emerald-300">160×160</strong> with bilinear sampling — the same rule now baked into <code className="text-emerald-400/80 text-xs">compact_features_from_pil</code> on the API.
          </p>
          <p>
            <strong className="text-slate-200">Step 2 — Nine channels a pathologist might name.</strong> From RGB I derived HSV, then stacked interpretable masks and indices:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li><strong className="text-slate-200">Excess Green (ExG)</strong> — <code className="text-xs">max(2G − R − B, 0)</code></li>
            <li><strong className="text-slate-200">Yellow–brown mask</strong> — chlorosis and necrotic browning</li>
            <li><strong className="text-slate-200">Dark spot mask</strong> — low mean RGB lesions</li>
          </ul>
          <p>
            Nine channels: R, G, B, H, S, V, ExG, yellow-brown, dark spots. Per channel I recorded mean, std, p10, median, p90 → <strong className="text-emerald-300">45 stats</strong>. Plus a <strong className="text-emerald-300">12-bin hue histogram</strong> → <strong className="text-emerald-300">57 features</strong> total.
          </p>
          <p>
            <strong className="text-slate-200">Step 3 — A deliberately small MLP.</strong> Architecture <strong className="text-emerald-300">57 → 32 → 1</strong>, ReLU hidden layer, standardized features, trained for <strong className="text-emerald-300">800 epochs</strong>. This version already crushed a naive mean baseline (MAE ≈ 32.5) and landed at roughly <strong className="text-emerald-300">test MAE ≈ 13.8</strong>, <strong className="text-emerald-300">R² ≈ 0.75</strong> — good enough to believe the features were real signal, not table noise.
          </p>
          <p>
            I exported those weights as <code className="text-emerald-400/80 text-xs">notebook_feature_mlp_plant_model.npz</code> — the artifact the live API still loads today.
          </p>
        </ArticleSection>

        <ArticleSection title="“Can I do better?” — Segmentation in two flavors">
          <p>
            Version 1 worked, but the white background and pot edges nagged at me. Maybe the model would generalize better if I <em>only</em> measured color inside the canopy. I tried segmentation three ways — simple threshold, <strong className="text-slate-200">contour + largest component</strong>, and <strong className="text-slate-200">GrabCut with seeded foreground/background</strong> — the last two being the serious contenders.
          </p>
          <p>
            Visually, contour and GrabCut were satisfying: cleaner silhouettes, plant area around <strong className="text-emerald-300">26–27%</strong> instead of the hole-ridden <strong className="text-emerald-300">~13%</strong> from raw thresholding. The comparison grid below is exactly that experiment on healthy, mid, and very sick specimens.
          </p>
          <FigureZoom
            src={FIGURES.maskComparison}
            alt="Comparison of segmentation masks: original, threshold, contour, and GrabCut"
            title="Mask comparison on white background"
            caption="Original vs Threshold vs Contour vs GrabCut seeded — labels 1, 38, and 95. Contour and GrabCut agree; threshold eats the canopy."
          />
          <p>
            Then I re-ran the <em>same</em> 57-feature pipeline on masked pixels and retrained. Honest notebook verdict: <strong className="text-slate-200">metrics did not improve</strong> — validation got fussier, not calmer. The masks looked smarter; the regressor did not. I kept the segmentation chapter as a lesson, not as the production path.
          </p>
        </ArticleSection>

        <ArticleSection title="The tweak that actually helped — simple augmentation on originals">
          <p>
            Segmentation hadn’t bought me much, so I went back to the original-image features and tried the smallest data boost I could justify: <strong className="text-emerald-300">light augmentation</strong> at train time only — horizontal flips, gentle rotation, mild brightness/contrast/saturation jitter — <strong className="text-emerald-300">four variants per training image</strong>, still resized to 160×160 before feature extraction.
          </p>
          <p>
            Same MLP shape, slightly different training hyperparameters (larger batches over the inflated train set). The lift was modest but real on held-out photos: about <strong className="text-emerald-300">test MAE ≈ 11.0</strong> and <strong className="text-emerald-300">R² ≈ 0.86</strong> versus ~13.8 / 0.75 before — not a revolution on a 97-image set, but exactly the kind of “slightly better” you want before calling an experiment done. I saved that run as <code className="text-emerald-400/80 text-xs">plant_disease_augmented_feature_model.npz</code> in the notebook folder.
          </p>
          <p>
            For the public demo I kept the <strong className="text-slate-200">non-augmented</strong> export: it matches what the API computes from a single user upload (no random flips at inference), stays deterministic, and still tells the same interpretable story. The augmented model is the “what if we had more data” branch in the lab notebook.
          </p>
        </ArticleSection>

        <ArticleSection title="What the graphic report says about Version 1">
          <p>
            The nine-panel <em>Plant Illness Regression — Graphic Report</em> below documents the <strong className="text-slate-200">original-image model</strong> — the one behind the figures in the App tab.
          </p>
          <p>
            <strong className="text-slate-200">Labels</strong> cluster at low (0–20) and high (80–100) severity. <strong className="text-slate-200">Splits:</strong> 67 train / 15 val / 15 test. <strong className="text-slate-200">Top correlations:</strong>{' '}
            <code className="text-emerald-400/80 text-xs">excess_green_std</code> (−0.64),{' '}
            <code className="text-emerald-400/80 text-xs">excess_green_mean</code> (−0.52),{' '}
            <code className="text-emerald-400/80 text-xs">hue_hist_bin_01</code> (+0.47),{' '}
            <code className="text-emerald-400/80 text-xs">hue_hist_bin_07</code> (+0.44).
          </p>
          <p>
            Training loss flatlines near zero by ~50 epochs; validation MAE settles around <strong className="text-emerald-300">15</strong>. Predicted-vs-real on test: MAE <strong className="text-slate-200">13.80</strong>, R² <strong className="text-slate-200">0.75</strong>, Spearman ρ <strong className="text-slate-200">0.87</strong>.
          </p>
          <FigureZoom
            src={FIGURES.graphicReport}
            alt="Nine-panel graphic report: label distribution, splits, correlations, scatter plots, loss, MAE/RMSE, predicted vs real"
            title="Plant Illness Regression — Graphic Report"
            caption="Original-features model: bimodal labels, correlation bar chart, 800-epoch curves, and per-split predicted-vs-real."
          />
        </ArticleSection>

        <ArticleSection title="Healthy vs very sick — why the UI shows those bars">
          <p>
            Numbers convince; pictures stick. I plotted rating <strong className="text-emerald-300">1</strong> vs <strong className="text-emerald-300">95</strong>, a yellow/brown damage mask on the sick canopy (~<strong className="text-emerald-300">1.1%</strong> of pixels), and the top six normalized features. That figure became <code className="text-emerald-400/80 text-xs">reference_features.json</code> and the comparison panel in the App tab.
          </p>
          <FigureZoom
            src={FIGURES.illnessComparison}
            alt="Healthy vs very sick plant photos, yellow-brown mask, and top feature bar chart"
            title="Healthy plant vs very sick: images and key features"
            caption="Reference specimens, lesion mask, and feature bars — the visual contract the API still echoes."
          />
        </ArticleSection>

        <ArticleSection title="Shipping it — export and production">
          <p>
            Training lived in <code className="text-emerald-400/80 text-xs">notebooks/plant-illness-regression.ipynb</code>. Production received only the NumPy bundle:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-xs">
            <li>W1 (57×32), b1 (32), W2 (32×1), b2 (1)</li>
            <li>feature_mean, feature_std (1×57 each)</li>
          </ul>
          <p>
            FastAPI loads them once, runs linear → ReLU → linear → clip to [0, 100], and never needs PyTorch in the container. The journey was: <strong className="text-slate-200">original pipeline first</strong>, <strong className="text-slate-200">segmentation curiosity second</strong>, <strong className="text-slate-200">augmentation third</strong> — then ship the version that balances clarity, determinism, and metrics you can defend in a blog post.
          </p>
        </ArticleSection>

        <ArticleSection title="What I’d do differently">
          <p>
            More mid-severity labels to soften the bimodal cliff. Earlier stopping. Maybe serve the augmented weights behind a flag. And if I revisit segmentation, I’d need proof on val — pretty masks aren’t enough.
          </p>
          <p>
            Still, for a demo that must run cheaply and explain itself? Hand-crafted 57-vectors, a tiny MLP, and charts you can click to zoom were the right trade.
          </p>
        </ArticleSection>

        <footer className="pt-6 border-t border-emerald-500/10 text-xs text-slate-500 text-center">
          Written for the Plant Health AI demo · Production weights:{' '}
          <span className="text-emerald-500/80">notebook_feature_mlp_plant_model.npz</span>
          {' · '}Lab best with aug:{' '}
          <span className="text-emerald-500/80">plant_disease_augmented_feature_model.npz</span>
        </footer>
      </div>
    </article>
  )
}
