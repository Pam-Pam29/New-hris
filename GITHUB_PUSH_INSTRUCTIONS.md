# Push to GitHub - Quick Instructions

## 🚀 Quick Push (Using Script)

Run the PowerShell script:
```powershell
.\push-to-github.ps1
```

## 📝 Manual Push Steps

### Step 1: Check Status
```powershell
git status
```

### Step 2: Add All Changes (if needed)
```powershell
git add -A
```

### Step 3: Commit Changes (if needed)
```powershell
git commit -m "Update: Merged meeting features, added configurable late threshold, and improved performance management"
```

### Step 4: Push to GitHub
```powershell
git push origin clean-main
```

## 🔍 Check What Will Be Pushed

To see what commits will be pushed:
```powershell
git log origin/clean-main..HEAD
```

## ⚠️ If Push Fails

### Authentication Issues
- Make sure you're logged into GitHub
- Use GitHub CLI: `gh auth login`
- Or use SSH keys instead of HTTPS

### Check Remote URL
```powershell
git remote -v
```

If you need to change to SSH:
```powershell
git remote set-url origin git@github.com:yourusername/yourrepo.git
```

## ✅ Verify Push Success

After pushing, check GitHub:
- Go to your repository on GitHub
- Verify the latest commit appears
- Check that all files are updated

---

## 📋 Summary of Changes Being Pushed

This push includes:
- ✅ Merged Book Meeting features (all meeting functionality in one place)
- ✅ Performance Review form with employee dropdown
- ✅ Moved meeting stat cards to Book Meeting page
- ✅ Removed Meetings tab from Performance Management
- ✅ Fixed absent employee calculation
- ✅ Added configurable late threshold in Office Settings
- ✅ Updated all late calculation logic
- ✅ Added deployment and testing guides

---

**Ready to push?** Run `.\push-to-github.ps1` or follow the manual steps above!

