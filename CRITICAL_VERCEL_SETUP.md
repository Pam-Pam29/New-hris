# ⚠️ CRITICAL: Vercel Root Directory Setup

## 🔴 The Problem

Vercel is building from the **repository root** instead of `hr-platform/` or `employee-platform/`. This causes:
- ❌ Vercel doesn't find `vercel.json` (it's in subdirectories)
- ❌ Vercel auto-detects Vite and tries to run `vite build` directly
- ❌ `vite` command not found because it's in `node_modules` of subdirectories

## ✅ The Solution: Set Root Directory in Vercel Dashboard

**You MUST configure this in Vercel Dashboard - it cannot be fixed with code alone!**

### For hr-platform:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find and select your **hr-platform** project
3. Click **Settings** (gear icon)
4. Click **General** in the left sidebar
5. Scroll down to **Root Directory**
6. Click **Edit**
7. Enter: `hr-platform`
8. Click **Save**

### For employee-platform:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find and select your **employee-platform** project
3. Click **Settings** (gear icon)
4. Click **General** in the left sidebar
5. Scroll down to **Root Directory**
6. Click **Edit**
7. Enter: `employee-platform`
8. Click **Save**

## 🎯 What This Does

Setting Root Directory tells Vercel:
- ✅ Run `npm install` from `hr-platform/` (finds `package.json` there)
- ✅ Run `npm run build` from `hr-platform/` (uses the build script)
- ✅ Read `vercel.json` from `hr-platform/`
- ✅ Output build artifacts from `hr-platform/dist/`

## 📋 After Setting Root Directory

1. **Trigger a new deployment:**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger auto-deploy

2. **Monitor the build:**
   - Watch the build logs
   - Should now see: `Running "npm run build"` instead of `vite build`
   - Build should succeed! ✅

## 🔍 How to Verify It's Set Correctly

After setting Root Directory, the next build should show:
```
Installing dependencies...
Running "npm run build"
```

Instead of:
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

## ⚠️ Important Notes

- **Root Directory must be set for EACH project** (hr-platform and employee-platform are separate projects)
- **This is a Vercel Dashboard setting** - it cannot be configured via code
- **After setting, trigger a new deployment** to apply the change

---

**This is the ONLY way to fix the build issue. The code changes are correct, but Vercel needs to know WHERE to build from!** 🚀

