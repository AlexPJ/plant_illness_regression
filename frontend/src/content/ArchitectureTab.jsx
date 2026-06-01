import FigureZoom from '../components/FigureZoom'

const ARCHITECTURE_INFOGRAPHIC = '/architecture/architecture-flow.png'

function ArchBlock({ icon, title, children, tags = [] }) {
  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
          {title}
        </h3>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-3">{children}</div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-emerald-500/10">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/15"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function FlowStep({ n, label, detail }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center">
        {n}
      </div>
      <div>
        <div className="font-semibold text-slate-200 text-sm">{label}</div>
        <div className="text-xs text-slate-400 mt-1 leading-relaxed">{detail}</div>
      </div>
    </div>
  )
}

export default function ArchitectureTab() {
  return (
    <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
      <header className="text-center mb-4">
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Deployment map</p>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
          How the stack fits together
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-3">
          Static React on Firebase Hosting, API on Cloud Run behind a single origin, model weights baked into the container image.
        </p>
      </header>

      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-emerald-500/15">
        <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">
          Architecture &amp; prediction flow
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          End-to-end view: upload via Firebase Hosting, 57-dimensional feature extraction aligned with the training notebook,
          NumPy MLP inference, and the deployment stack (Cloud Run, Docker, GitHub Actions).
        </p>
        <FigureZoom
          src={ARCHITECTURE_INFOGRAPHIC}
          alt="Plant Health AI architecture and prediction flow infographic"
          title="Plant Health AI: Architecture & Prediction Flow"
          caption="Prediction pipeline (upload → PIL features → MLP) and deployment stack (FastAPI on Cloud Run, React on Firebase, CI/CD via GitHub Actions)."
          className="my-0"
        />
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-emerald-500/15">
        <h3 className="text-sm font-bold text-emerald-400 mb-6 uppercase tracking-wider">Request path (production)</h3>
        <div className="space-y-5">
          <FlowStep
            n="1"
            label="Browser → Firebase Hosting"
            detail="Vite builds the SPA into frontend/dist. Firebase serves index.html for all routes and static assets with caching."
          />
          <FlowStep
            n="2"
            label="Same-origin /api/* rewrite"
            detail="firebase.json rewrites /api/** to the Cloud Run service plant-illness-regression (us-central1). The frontend uses VITE_API_URL=/api so cookies and CORS stay simple."
          />
          <FlowStep
            n="3"
            label="Cloud Run → FastAPI container"
            detail="Docker image (Python 3.12 slim) runs uvicorn on PORT 8080. CORS allows the Hosting origin via ALLOWED_ORIGIN. POST /predict accepts JPEG/PNG up to MAX_UPLOAD_MB (default 6)."
          />
          <FlowStep
            n="4"
            label="Inference"
            detail="PIL opens the upload, compact_features_from_pil builds the 57-vector, NumPy runs the exported MLP, JSON returns rating, overlay, and feature comparison."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArchBlock icon="⚛️" title="Frontend (React + Vite)" tags={['React', 'Tailwind', 'pnpm', 'Vite']}>
          <p>
            The UI lives under <code className="text-emerald-400/80 text-xs">frontend/</code>. Local dev: <code className="text-emerald-400/80 text-xs">pnpm run dev</code> on port 5173, pointing at <code className="text-emerald-400/80 text-xs">VITE_API_URL</code> (localhost:8080 or /api in prod).
          </p>
          <p>
            Components call <code className="text-emerald-400/80 text-xs">/predict</code> with multipart form data; results drive the disease gauge, image tabs, and feature comparison bars.
          </p>
        </ArchBlock>

        <ArchBlock icon="🐍" title="API (FastAPI)" tags={['FastAPI', 'Uvicorn', 'NumPy', 'Pillow']}>
          <p>
            <code className="text-emerald-400/80 text-xs">api/main.py</code> exposes <code className="text-emerald-400/80 text-xs">GET /health</code> and <code className="text-emerald-400/80 text-xs">POST /predict</code>. Weights load from <code className="text-emerald-400/80 text-xs">MODEL_PATH</code>; references from <code className="text-emerald-400/80 text-xs">REF_JSON</code>.
          </p>
          <p>
            Feature extraction in <code className="text-emerald-400/80 text-xs">api/utils.py</code> mirrors the training notebook so training and serving stay aligned.
          </p>
        </ArchBlock>

        <ArchBlock icon="🐳" title="Container (Docker)" tags={['Docker', 'Python 3.12', 'uv']}>
          <p>
            <code className="text-emerald-400/80 text-xs">api/Dockerfile</code> copies <code className="text-emerald-400/80 text-xs">main.py</code>, <code className="text-emerald-400/80 text-xs">utils.py</code>, and <code className="text-emerald-400/80 text-xs">model/</code> (npz + reference JSON). Build context is the <code className="text-emerald-400/80 text-xs">api/</code> folder; deploy that image to Cloud Run.
          </p>
          <p>
            Podman works locally with the same Dockerfile (<code className="text-emerald-400/80 text-xs">api/README.md</code>). <code className="text-emerald-400/80 text-xs">.gcloudignore</code> trims upload size when using gcloud.
          </p>
        </ArchBlock>

        <ArchBlock icon="☁️" title="Cloud Run + Firebase Hosting" tags={['Cloud Run', 'Firebase', 'Rewrite']}>
          <p>
            Cloud Run hosts the API with autoscaling and HTTPS. Firebase Hosting serves the built SPA and proxies <code className="text-emerald-400/80 text-xs">/api/**</code> to the service — one public domain, no browser CORS headaches when <code className="text-emerald-400/80 text-xs">ALLOWED_ORIGIN</code> matches the Hosting URL.
          </p>
          <p>
            Project ID: <code className="text-emerald-400/80 text-xs">plant-illness-regression</code> (<code className="text-emerald-400/80 text-xs">.firebaserc</code>).
          </p>
        </ArchBlock>

        <ArchBlock icon="🔄" title="CI/CD (GitHub Actions)" tags={['GitHub Actions', 'Firebase Deploy']}>
          <p>
            <strong className="text-slate-200">On merge to main:</strong>{' '}
            <code className="text-emerald-400/80 text-xs">firebase-hosting-merge.yml</code> installs pnpm deps, runs <code className="text-emerald-400/80 text-xs">pnpm run build</code> with repo variable <code className="text-emerald-400/80 text-xs">VITE_API_URL</code>, deploys to live Hosting via <code className="text-emerald-400/80 text-xs">FirebaseExtended/action-hosting-deploy</code>.
          </p>
          <p>
            <strong className="text-slate-200">On pull requests:</strong>{' '}
            <code className="text-emerald-400/80 text-xs">firebase-hosting-pull-request.yml</code> builds preview channels for review before merge.
          </p>
          <p className="text-xs text-slate-500">
            API image updates are separate from these workflows (typically manual or another pipeline: build → push to Artifact Registry → deploy Cloud Run).
          </p>
        </ArchBlock>

        <ArchBlock icon="📦" title="Other pieces worth knowing" tags={['uv', 'Env vars', 'Secrets']}>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li><strong className="text-slate-200">uv</strong> — Python deps in root and API; Docker uses pip for deterministic installs, uv to run uvicorn in the image.</li>
            <li><strong className="text-slate-200">VITE_API_URL</strong> — Baked at build time; set in GitHub repo variables for prod (<code className="text-xs">/api</code> recommended with Hosting rewrite).</li>
            <li><strong className="text-slate-200">FIREBASE_SERVICE_ACCOUNT_*</strong> — GitHub secret for automated Hosting deploys.</li>
            <li><strong className="text-slate-200">Training artifacts</strong> — <code className="text-xs">*.ipynb</code> and <code className="text-xs">data/</code> are gitignored; only <code className="text-xs">.npz</code> + <code className="text-xs">reference_features.json</code> ship with the API.</li>
          </ul>
        </ArchBlock>
      </div>

      <div className="glass-panel rounded-2xl p-5 text-xs text-slate-400 leading-relaxed border border-dashed border-emerald-500/10">
        <span className="font-bold text-emerald-400">Local dev pairing</span> — Terminal 1:{' '}
        <code className="text-emerald-400/80">uv run uvicorn main:app --port 8080</code> in <code className="text-emerald-400/80">api/</code>.
        Terminal 2: <code className="text-emerald-400/80">pnpm run dev</code> in <code className="text-emerald-400/80">frontend/</code> with{' '}
        <code className="text-emerald-400/80">VITE_API_URL=http://localhost:8080</code>.
      </div>
    </div>
  )
}
