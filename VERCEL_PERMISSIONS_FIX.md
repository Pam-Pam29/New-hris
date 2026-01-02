# Vercel Build Fix - Permission Denied Error

## 🔴 Problem
```
sh: line 1: /vercel/path0/hr-platform/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

## ✅ Solution Applied

Changed build script from `npx vite build` to `node node_modules/vite/bin/vite.js build` in:
- `hr-platform/package.json`
- `employee-platform/package.json`

**Why?** The vite binary in `node_modules/.bin/vite` doesn't have execute permissions in Vercel's build environment. Running vite directly via Node.js bypasses this permission issue.

## 🚀 Push the Fix

```powershell
git add -A
git commit -m "Fix: Use node to run vite directly to avoid permission issues"
git push origin clean-main
```

## ✅ What Changed

- ✅ Build script now uses `node node_modules/vite/bin/vite.js build`
- ✅ This runs vite via Node.js instead of relying on executable permissions
- ✅ Should work in Vercel's build environment

---

**After pushing, the build should succeed!** 🚀

