# 🔧 Environment Configuration Setup

## 📁 **WHERE TO PLACE ENV FILES:**

Since you have **2 separate platforms** connecting to Firebase, create **separate `.env` files** for each:

```
📦 Your Project Structure
├── employee-platform/
│   ├── .env                    ← Create this file
│   ├── src/
│   └── package.json
├── hr-platform/
│   ├── .env                    ← Create this file
│   ├── src/
│   └── package.json
└── HRIS-System-main/
```

## 🚀 **STEP-BY-STEP SETUP:**

### **1. Create Employee Platform Environment File:**

Create `employee-platform/.env` with this content:

```env
# Firebase Configuration for Employee Platform
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92

# Service Configuration
VITE_DEFAULT_SERVICE=firebase

# Platform Identification
VITE_PLATFORM_TYPE=employee
VITE_APP_NAME=Employee Dashboard

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

### **2. Create HR Platform Environment File:**

Create `hr-platform/.env` with this content:

```env
# Firebase Configuration for HR Platform
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92

# Service Configuration
VITE_DEFAULT_SERVICE=firebase

# Platform Identification
VITE_PLATFORM_TYPE=hr
VITE_APP_NAME=HR Dashboard

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ADMIN_FEATURES=true
```

## 🔒 **SECURITY BEST PRACTICES:**

### **1. Add .env to .gitignore:**

Make sure both platforms have `.env` in their `.gitignore` files:

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### **2. Use Different Firebase Projects (Recommended):**

For **production security**, consider using **separate Firebase projects**:

- **Employee Platform**: `hris-employee-prod`
- **HR Platform**: `hris-hr-admin-prod`

This provides:
- ✅ **Better Security Isolation**
- ✅ **Granular Access Control**
- ✅ **Independent Scaling**
- ✅ **Separate Billing/Monitoring**

## 🛠️ **QUICK SETUP COMMANDS:**

Run these commands in your terminal:

```bash
# Navigate to employee platform
cd employee-platform

# Create .env file (copy the content above)
echo "# Employee Platform Environment" > .env
# Then paste the employee platform env content

# Navigate to HR platform
cd ../hr-platform

# Create .env file (copy the content above)
echo "# HR Platform Environment" > .env
# Then paste the HR platform env content
```

## ✅ **VERIFICATION:**

After creating the files, verify they work:

```bash
# Test Employee Platform
cd employee-platform
npm run dev

# Test HR Platform (in another terminal)
cd hr-platform
npm run dev
```

Both platforms should now load with proper Firebase configuration!

## 🔄 **CURRENT STATUS:**

Your Firebase configurations are already set up in:
- `employee-platform/src/config/firebase.ts`
- `hr-platform/src/config/firebase.ts`

They will automatically read from the `.env` files once you create them.

## 📝 **NOTES:**

- Both platforms currently use the **same Firebase project** (`hris-system-baa22`)
- The configurations include **fallback values** if env variables aren't found
- **Vite** requires the `VITE_` prefix for environment variables
- Environment variables are loaded at **build time**, not runtime

