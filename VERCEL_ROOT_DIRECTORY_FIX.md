# Vercel Build Fix - Root Directory Configuration

## 🔴 Problem
`vite: command not found` - Vercel is likely building from the repository root instead of the `hr-platform` directory.

## ✅ Solution

### Option 1: Configure Root Directory in Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `hr-platform` project
3. Go to **Settings** → **General**
4. Find **Root Directory** setting
5. Set it to: `hr-platform`
6. Click **Save**

This tells Vercel to:
- Run `npm install` from `hr-platform/` directory
- Run `npm run build` from `hr-platform/` directory
- Look for `package.json` in `hr-platform/`

### Option 2: Use Build Command with Directory Change

If you can't change root directory, update `vercel.json`:

```json
{
    "buildCommand": "cd hr-platform && npm run build",
    "outputDirectory": "hr-platform/dist",
    "installCommand": "cd hr-platform && npm install",
    "framework": "vite"
}
```

## 📝 Current Configuration

The `vercel.json` files are already configured correctly. The issue is likely that Vercel needs to know the **Root Directory**.

## 🚀 After Fixing Root Directory

1. **Push current changes:**
   ```powershell
   git add -A
   git commit -m "Fix: Update build scripts to use npx vite build"
   git push origin clean-main
   ```

2. **Set Root Directory in Vercel Dashboard** (see Option 1 above)

3. **Redeploy** - Vercel will automatically redeploy or you can trigger a new deployment

## ✅ What We've Fixed

- ✅ Updated build scripts to use `npx vite build` (works even if vite not in PATH)
- ✅ Removed `requirements.txt` (Python dependencies)
- ✅ Updated `.gitignore` to ignore Python files
- ✅ Configured `vercel.json` with explicit build settings

**Next Step:** Configure Root Directory in Vercel Dashboard!

