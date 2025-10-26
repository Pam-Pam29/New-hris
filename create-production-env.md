# ⚡ CREATE PRODUCTION .ENV FILES

**Copy these files manually to enable production URLs**

---

## 📁 **FILE 1: hr-platform/.env**

Create this file: `hr-platform/.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase
VITE_RESEND_API_KEY=re_dBNbY32R_GPehmLvH81P3kziyr9a4Nmed
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_FROM_NAME=Your HRIS
VITE_HR_PLATFORM_URL=https://hris-system-baa22.web.app
VITE_EMPLOYEE_PLATFORM_URL=https://hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app
VITE_CAREERS_PLATFORM_URL=https://hris-careers-platform-cgnkc9kdj-pam-pam29s-projects.vercel.app
```

---

## 📁 **FILE 2: employee-platform/.env**

Create this file: `employee-platform/.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase
VITE_RESEND_API_KEY=re_dBNbY32R_GPehmLvH81P3kziyr9a4Nmed
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_FROM_NAME=Your HRIS
VITE_HR_PLATFORM_URL=https://hris-system-baa22.web.app
VITE_EMPLOYEE_PLATFORM_URL=https://hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app
VITE_CAREERS_PLATFORM_URL=https://hris-careers-platform-cgnkc9kdj-pam-pam29s-projects.vercel.app
```

---

## 📁 **FILE 3: careers-platform/.env**

Create this file: `careers-platform/.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyC6ovwlhX4Mr8WpHoS045wLxHA7t8fRXPI
VITE_FIREBASE_AUTH_DOMAIN=hris-system-baa22.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hris-system-baa22
VITE_FIREBASE_STORAGE_BUCKET=hris-system-baa22.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=563898942372
VITE_FIREBASE_APP_ID=1:563898942372:web:8c5ebae1dfaf072858b731
VITE_FIREBASE_MEASUREMENT_ID=G-1DJP5DJX92
VITE_DEFAULT_SERVICE=firebase
VITE_HR_PLATFORM_URL=https://hris-system-baa22.web.app
VITE_EMPLOYEE_PLATFORM_URL=https://hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app
VITE_CAREERS_PLATFORM_URL=https://hris-careers-platform-cgnkc9kdj-pam-pam29s-projects.vercel.app
```

---

## ✅ **AFTER CREATING FILES:**

### **Rebuild all platforms:**

```bash
cd hr-platform
npm run build

cd ../employee-platform
npm run build

cd ../careers-platform
npx vite build
```

### **Redeploy:**

```bash
# HR Platform (Firebase)
cd ..
firebase deploy --only hosting

# Employee Platform (Vercel)
cd employee-platform
vercel deploy --prod

# Careers Platform (Vercel)
cd ../careers-platform
vercel deploy --prod
```

---

## 🎯 **WHAT THIS FIXES:**

✅ **Employee invitation links** will point to production Employee platform  
✅ **Email links** will work correctly  
✅ **Redirects** between platforms work  
✅ **Professional URLs** throughout  

---

## ⏭️ **NEXT:**

Once deployed with production URLs:
- Test creating an employee
- Check the invitation link
- It should point to your Vercel Employee platform!
- ✅ Everything connected!






