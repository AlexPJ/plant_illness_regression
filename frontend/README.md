# Plant illness regression — Frontend

React + Tailwind frontend for the Plant illness regression demo. 

## Quick setup (Windows)

```powershell
cd frontend
pnpm install
pnpm run dev
```

Visit `http://localhost:5173`.

## Build for Firebase Hosting

```powershell
pnpm run build
```

Output goes to `dist/`.

## Deploy to Firebase Hosting

1. Install Firebase CLI:
```powershell
pnpm add -g firebase-tools
```

2. Authenticate:
```powershell
firebase login
```

3. Set your Firebase project ID in `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

4. Deploy:
```powershell
pnpm run deploy
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:8080`)
  - For local dev: `http://localhost:8080`
  - For production: `https://your-cloud-run-service.a.run.app`

Edit `.env.local` to change.

## Features

- 📸 Image upload with preview
- 🔍 Disease detection & rating
- 📊 Feature analysis visualization
- 🎨 Responsive Tailwind design
- ⚡ Vite for fast builds
