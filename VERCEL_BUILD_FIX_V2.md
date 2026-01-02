# Vercel Build Fix V2 - vite command not found

## 🔴 Problem
Build failing with:
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

**Root Cause:** Vite is in `devDependencies`, but Vercel might not be installing devDependencies during production builds.

## ✅ Solution Applied

### 1. Updated Build Scripts
Changed `vite build` to `npx vite build` in both:
- `hr-platform/package.json`
- `employee-platform/package.json`

This ensures vite runs even if not in PATH.

### 2. Updated Install Commands
Set `NODE_ENV=development` during install to ensure devDependencies are installed:
- `hr-platform/vercel.json` - `"installCommand": "NODE_ENV=development npm install"`
- `employee-platform/vercel.json` - `"installCommand": "NODE_ENV=development npm install"`

## 🚀 Push the Fix

```powershell
git add -A
git commit -m "Fix: Use npx vite build and ensure devDependencies are installed"
git push origin clean-main
```

## 📝 Alternative: Vercel Project Settings

If the above doesn't work, check Vercel project settings:
1. Go to Vercel Dashboard → Your Project → Settings
2. Check "Build & Development Settings"
3. Ensure "Install Command" is set to install dev dependencies
4. Or set "Root Directory" to `hr-platform` if building from root

## ✅ What Changed

- ✅ Updated build scripts to use `npx vite build`
- ✅ Updated install commands to set `NODE_ENV=development`
- ✅ This ensures vite and other devDependencies are installed

---

**Ready to push?** The changes are ready to commit and push!

