# 🏢 HRIS (Human Resources Information System)

A comprehensive **three-platform** HR management system built with React, TypeScript, and Firebase.

---

## 🎯 Three Platforms

| Platform | Port | Access | Purpose |
|----------|------|--------|---------|
| **HR Platform** | 3003 | Internal (Auth) | HR management & recruitment |
| **Employee Platform** | 3001 | Internal (Auth) | Employee self-service portal |
| **Careers Platform** | 3004 | **Public** | Public job board for candidates ⭐ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for production) or works with mock data

### Initial Setup

1. **Clone and Install Dependencies**
```bash
# HR Platform
cd hr-platform
npm install

# Employee Platform
cd employee-platform
npm install

# Careers Platform (NEW!)
cd careers-platform
npm install
```

2. **Configure Environment Variables**
```bash
# HR Platform
cp hr-platform/.env.example hr-platform/.env
# Edit .env with your Firebase credentials

# Employee Platform  
cp employee-platform/.env.example employee-platform/.env
# Edit .env with your Firebase credentials
```

3. **Run Development Servers**
```bash
# HR Platform (Terminal 1)
cd hr-platform
npm run dev
# Opens on http://localhost:3003

# Employee Platform (Terminal 2)
cd employee-platform
npm run dev
# Opens on http://localhost:3001

# Careers Platform (Terminal 3) - PUBLIC JOB BOARD ⭐
cd careers-platform
npm run dev
# Opens on http://localhost:3004
```

---

## 📦 Project Structure

```
New-hris/
├── hr-platform/              # HR Management Dashboard
├── employee-platform/        # Employee Self-Service Portal
├── shared-types/            # Shared TypeScript types
├── shared-services/         # Shared service layer (planned)
├── docs/                    # Documentation
│   ├── setup/              # Setup and configuration guides
│   ├── features/           # Feature documentation
│   ├── troubleshooting/    # Debug and troubleshooting guides
│   └── archive/            # Historical documentation
└── README.md               # This file
```

---

## 🎯 Platform Overview

### HR Platform (Port 3001)
**For HR Administrators**

Features:
- 👥 Employee Management
- 📅 Leave Management & Approvals
- 💰 Payroll & Compensation
- 📊 Performance Management
- 🎯 Goal Tracking
- 📋 Asset Management
- 📝 Policy Management
- ⏰ Time & Attendance Tracking
- 👔 Recruitment & Onboarding

### Employee Platform (Port 3002)
**For Employees**

Features:
- 👤 Personal Profile Management
- 📅 Leave Requests
- 💼 Payroll & Compensation View
- 🎯 Performance Goals
- 📋 Asset Requests
- 📖 Policy Acknowledgment
- ⏰ Time Clock In/Out
- 🤝 Meeting Scheduling

---

## 🔥 Firebase Integration

Both platforms connect to Firebase for:
- **Firestore**: Real-time database
- **Authentication**: User management
- **Storage**: File uploads
- **Analytics**: Usage tracking

### Environment Variables Required:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

See [Setup Guide](docs/setup/ENVIRONMENT_SETUP.md) for detailed configuration.

---

## 📚 Documentation

### Setup & Configuration
- [Environment Setup](docs/setup/ENVIRONMENT_SETUP.md)
- [Firebase Configuration](docs/setup/FIREBASE_SETUP.md)
- [Google Meet Integration](docs/setup/GOOGLE_MEET_SETUP.md)

### Features
- [Payroll System](docs/features/PAYROLL_SYSTEM_ANALYSIS.md)
- [Leave Management](docs/features/LEAVE_MANAGEMENT_COMPLETE.md)
- [Asset Management](docs/features/ASSET_MANAGEMENT_COMPLETE.md)
- [Time Tracking](docs/features/TIME_MANAGEMENT_COMPLETE_FINAL.md)
- [Performance Management](docs/features/PERFORMANCE_MANAGEMENT_COMPLETE.md)

### Troubleshooting
- [Common Issues](docs/troubleshooting/)
- [Debugging Guides](docs/troubleshooting/)

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 18
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🧩 Radix UI Components
- 📊 Recharts (Analytics)
- 🔥 Vite (Build tool)

### Backend
- 🔥 Firebase Firestore
- 🔐 Firebase Authentication
- 📦 Firebase Storage

### State Management
- React Hooks
- Real-time Firebase listeners

---

## 🔐 Security

### ⚠️ Important Security Notes:

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use `.env.example` for templates** - Share structure, not secrets
3. **`.gitignore` is configured** - Protects sensitive files automatically
4. **Rotate exposed keys immediately** - If credentials are accidentally committed

See [Security Fix Documentation](SECURITY_FIX_COMPLETE.md) for details.

---

## 📊 Key Features

### Real-Time Synchronization
- Live updates across all platforms
- Instant notifications
- Bidirectional data flow

### Comprehensive HR Modules
- ✅ Employee Management
- ✅ Leave Management
- ✅ Payroll & Compensation
- ✅ Performance Management
- ✅ Asset Management
- ✅ Policy Management
- ✅ Time & Attendance
- ✅ Recruitment & Onboarding

### Smart Notifications
- Real-time alerts
- Action-based notifications
- Cross-platform sync

---

## 🧪 Development

### Available Scripts

**HR Platform:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Employee Platform:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📝 Recent Updates

- ✅ Security fixes applied (`.env` files, `.gitignore`)
- ✅ Documentation organized into `docs/` folder
- ✅ Real-time Firebase integration complete
- ✅ Dual platform architecture operational
- ✅ All core HR modules implemented

---

## 🐛 Known Issues & Limitations

- Code duplication between platforms (planned: shared services)
- Some TypeScript types are duplicated (planned: consolidation)
- Firebase version mismatch between root and platforms
- Hardcoded employee IDs in some components (planned: proper auth)

See [Codebase Issues Report](CODEBASE_ISSUES_REPORT.md) for full details.

---

## 🚧 Roadmap

### Immediate (Done ✅)
- [x] Security fixes (`.env`, `.gitignore`)
- [x] Documentation organization
- [x] Firebase integration

### Short-term (Planned)
- [ ] Consolidate shared services
- [ ] Implement proper authentication
- [ ] Add input validation
- [ ] Add error boundaries

### Long-term (Future)
- [ ] Mobile app versions
- [ ] Advanced reporting
- [ ] Multi-company support
- [ ] API for integrations

---

## 📞 Support & Troubleshooting

1. Check [Documentation](docs/)
2. Review [Troubleshooting Guides](docs/troubleshooting/)
3. See [Codebase Issues Report](CODEBASE_ISSUES_REPORT.md)

---

## 📄 License

[Your License Here]

---

## 🤝 Contributing

[Your Contributing Guidelines Here]

---

**Last Updated:** October 10, 2025  
**Version:** 1.0.0  
**Status:** ✅ Operational



