# 🌐 Careers Platform - Public Job Board

**Standalone, public-facing careers website** that syncs in real-time with HR platform job postings.

---

## 🎯 Purpose

This is a **completely separate application** from the HR platform, designed for:
- ✅ **Public access** - No login required
- ✅ **External candidates** - Browse and apply for jobs
- ✅ **Real-time sync** - Auto-updates when HR posts jobs
- ✅ **Professional branding** - Beautiful, modern design

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
cd careers-platform
npm install
```

### **2. Start Development Server**

```bash
npm run dev
```

The app will open at: **http://localhost:3004**

### **3. Build for Production**

```bash
npm run build
```

---

## 📍 Access Points

### **Development:**
```
http://localhost:3004/          → Careers home page
http://localhost:3004/careers   → Same page (alias)
http://localhost:3004/jobs      → Same page (alias)
```

### **Production:**
```
https://careers.yourcompany.com/
https://jobs.yourcompany.com/
```

---

## 🔄 How It Syncs with HR Platform

### **Architecture:**

```
┌─────────────────────────────────────────────┐
│         FIREBASE (job_postings)             │
│         Single Source of Truth              │
└──────────────┬────────────────┬─────────────┘
               ↓                ↓
    ┌──────────────────┐  ┌───────────────────┐
    │   HR Platform    │  │ Careers Platform  │
    │   localhost:3003 │  │  localhost:3004   │
    ├──────────────────┤  ├───────────────────┤
    │ ✅ Post jobs     │  │ ✅ View jobs      │
    │ ✅ Edit jobs     │  │ ✅ Search jobs    │
    │ ✅ Manage all    │  │ ✅ Apply (future) │
    │ (Internal/Auth)  │  │ (Public/No auth)  │
    └──────────────────┘  └───────────────────┘
```

### **Real-Time Sync:**

When HR posts a job:
1. Job saved to Firebase `job_postings` collection
2. Careers Platform receives update via WebSocket
3. New job appears on careers site **instantly**
4. No manual refresh needed!

---

## 🎨 Features

### **1. Beautiful Landing Page**
- Gradient hero section
- Professional design
- Responsive layout
- Modern UI components

### **2. Live Job Statistics**
- Open positions count
- Number of departments hiring
- Number of locations
- Auto-updates in real-time

### **3. Smart Search & Filtering**
- Search by title, department, location, or description
- Filter by department
- Real-time filtering as you type
- Clear filters button

### **4. Job Cards**
Each job displays:
- Job title and department
- Location and employment type
- Salary range
- Description preview
- "Apply Now" button

### **5. Mobile Responsive**
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for all screen sizes

---

## 📁 Project Structure

```
careers-platform/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Router setup
│   ├── index.css             # Global styles
│   ├── pages/
│   │   └── Careers.tsx       # Main careers page
│   ├── components/
│   │   └── ui/               # Shared UI components
│   ├── config/
│   │   └── firebase.ts       # Firebase configuration
│   └── lib/
│       └── utils.ts          # Utility functions
├── public/                   # Static assets
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

---

## 🔧 Configuration

### **Firebase Setup**

The app uses the **same Firebase database** as HR platform.

**No additional setup needed!** It reads from the same `job_postings` collection.

**Firestore Rules** (already set):
```javascript
// job_postings - read-only for public
match /job_postings/{jobId} {
  allow read: if true; // Public can read published jobs
  allow write: if false; // Only HR can write
}
```

---

## 🎯 Ports

- **HR Platform:** http://localhost:3003
- **Employee Platform:** http://localhost:3001 (or 3002)
- **Careers Platform:** http://localhost:3004 ⭐

---

## 🚀 Deployment

### **Option 1: Separate Domain (Recommended)**
```
Deploy to: careers.yourcompany.com
- Own subdomain
- SEO-friendly
- Easy to market
```

### **Option 2: Subdirectory**
```
Deploy to: yourcompany.com/careers
- Same domain as main site
- Easier SSL management
```

### **Build Commands:**
```bash
npm run build
# Output: dist/

# Upload dist/ to:
# - Netlify
# - Vercel
# - Firebase Hosting
# - Any static hosting
```

---

## 📊 Features Coming Soon

### **Phase 2: Application System**
- [ ] `/apply/:jobId` - Application form
- [ ] Resume upload
- [ ] Auto-create recruitment candidate
- [ ] Email confirmations

### **Phase 3: Job Details**
- [ ] `/jobs/:jobId` - Full job details page
- [ ] Requirements list
- [ ] Benefits section
- [ ] Team information

### **Phase 4: Advanced**
- [ ] Save jobs (localStorage)
- [ ] Email job alerts
- [ ] Social sharing
- [ ] Apply with LinkedIn

---

## ✅ Testing

### **Test Real-Time Sync:**

1. **Start both platforms:**
   ```bash
   # Terminal 1: HR Platform
   cd hr-platform
   npm run dev

   # Terminal 2: Careers Platform
   cd careers-platform
   npm run dev
   ```

2. **Open both in browser:**
   - HR: http://localhost:3003/hr/hiring/recruitment
   - Careers: http://localhost:3004

3. **Post a job in HR** → Watch it appear on Careers instantly! ✨

---

## 📝 Console Logs

### **Success:**
```
✅ Public Careers: Loaded 5 jobs in real-time
```

### **On Unmount:**
```
🔌 Public Careers: Real-time sync disconnected
```

---

## 🎊 Summary

**Careers Platform is:**
- ✅ **Standalone application** (separate from HR platform)
- ✅ **Different port** (3004)
- ✅ **Public access** (no authentication)
- ✅ **Real-time sync** (with HR job postings)
- ✅ **Production-ready** (can deploy independently)

**Runs independently** - Can deploy to its own domain!

---

## 🚀 Quick Commands

```bash
# Install
npm install

# Development
npm run dev          # Starts on port 3004

# Production
npm run build        # Creates dist/ folder
npm run preview      # Preview production build

# Lint
npm run lint
```

---

**🎉 Ready to use!** Just `npm install` and `npm run dev`!





