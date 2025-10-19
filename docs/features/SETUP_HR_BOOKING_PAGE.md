# 📅 Setup HR Booking Page Integration

## 🎯 What This Does

Allows employees to see a **"Open HR Booking Page"** button in the Performance Management meeting form that opens your **Google Calendar appointment booking page** in a new tab.

This way, employees can:
1. Book a time slot directly on your Google Calendar
2. Get the auto-generated Google Meet link from that booking
3. Copy it and paste it into the meeting form

---

## 🚀 Quick Setup (2 Minutes)

### **Option 1: Via Firebase Console (Easiest)**

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/project/hris-system-baa22/firestore

2. **Create the settings document:**
   - Click "**Start collection**" (if first time) or navigate to **Firestore Database**
   - Create collection: `hrSettings`
   - Document ID: `general`
   - Add field:
     - Field: `bookingPageUrl`
     - Type: `string`
     - Value: `YOUR_GOOGLE_CALENDAR_BOOKING_URL`
       - Example: `https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ22KWqsurF6XMFdmZUqfxtS__OxWhmnD2f_uTqy5zl9FuyCZ3NjkXTNfYcthIFHxVoItxA5LS6R?gv=true`

3. **Click "Save"**

4. **Done!** ✅

---

### **Option 2: Via Script (For Developers)**

1. **Get your Firebase Service Account Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in `hr-platform/` folder

2. **Run the setup script:**
   ```bash
   cd New-hris/hr-platform
   node setup-booking-page.js
   ```

3. **Enter your booking page URL** when prompted

4. **Done!** ✅

---

## 📋 How to Get Your Google Calendar Booking Page URL

### **Step-by-Step:**

1. **Open Google Calendar:**
   - Go to: https://calendar.google.com

2. **Create an Appointment Schedule:**
   - Click the **"+" button** or **"Create"**
   - Select **"Appointment schedule"**
   - Name it: "Employee Meetings" (or any name)
   - Set your availability (e.g., Mon-Fri 9AM-5PM)
   - Duration: 30 minutes or 1 hour
   - Click **"Next"** and finish setup

3. **Get the Booking Page URL:**
   - After creating, click on the appointment schedule
   - Click **"Copy link"** or **"Share booking page"**
   - Copy the URL (it looks like this):
     ```
     https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ...
     ```

4. **Use this URL** in the setup above!

---

## 🎨 What Employees Will See

### **Before (No Booking Page Configured):**
```
Meeting Link *
💡 Create a meeting link first (Google Meet, Zoom, Teams)

[________________] (empty input)

💡 Click to create Google Meet (link)
```

### **After (With Booking Page Configured):**
```
Meeting Link *

┌──────────────────────────────────────┐
│ ✨ HR has a booking page!            │
│ Book there to get your Google Meet:  │
│                                      │
│  [Open HR Booking Page (New Tab)] ← │
│                                      │
│ 👉 After booking, copy the Google    │
│    Meet link and paste it below      │
└──────────────────────────────────────┘

💡 Or create a meeting link manually:

[________________] (input field)
```

---

## 🔄 Complete User Flow

### **Employee Experience:**

1. **Goes to Performance Management** → Meetings tab
2. **Clicks "Schedule Meeting"** button
3. **Fills in:**
   - Meeting Title: "Check-in with Victoria"
   - Description: "30 minute discussion"
   - Date: 10/10/2025
   - **Sees HR available time slots** (if you set availability)
   - Duration: **30 minutes** (default now!)
   - Location: Online

4. **Gets to "Meeting Link" field**
5. **Sees green box:** "✨ HR has a booking page!"
6. **Clicks:** "Open HR Booking Page" button
7. **New tab opens** with YOUR Google Calendar booking page
8. **Selects a time slot** (e.g., Monday 2PM)
9. **Google Calendar creates the meeting** with auto-generated Google Meet link
10. **Copies the Google Meet link** from the booking confirmation
11. **Goes back to the form**
12. **Pastes the link** in the "Meeting Link" field
13. **Clicks "Schedule Meeting"**
14. **Done!** ✅

---

## 🔧 Update Your Booking Page URL

**If you need to change it later:**

### **Via Firebase Console:**
1. Go to Firestore Database
2. Navigate to: `hrSettings` → `general`
3. Edit the `bookingPageUrl` field
4. Save

### **Via Script:**
```bash
cd New-hris/hr-platform
node setup-booking-page.js
```
Enter the new URL when prompted.

---

## 🗑️ Remove Booking Page Integration

**If you want to disable the button:**

### **Via Firebase Console:**
1. Go to Firestore Database
2. Navigate to: `hrSettings` → `general`
3. Delete the `bookingPageUrl` field (or delete the entire document)
4. Save

**The button will disappear** and employees will see the regular meeting link input.

---

## 🧪 Testing

### **Test as an Employee:**

1. **Open Employee Platform** (localhost:3000)
2. **Go to Performance Management** → Meetings tab
3. **Click "Schedule Meeting"**
4. **Scroll to "Meeting Link" field**
5. **Look for the green box**
6. **If you see it:**
   - ✅ Booking page configured correctly
   - Click "Open HR Booking Page" → Should open your Google Calendar booking page
7. **If you don't see it:**
   - ⚠️ Booking page not configured yet
   - Follow setup instructions above

---

## ⚙️ Firebase Rules

**Already included in your deployed rules:**

```javascript
// HR Settings - Allow employees to read booking page URL
match /hrSettings/{settingId} {
  allow read: if true; // Employees can see booking page URL
  allow write: if false; // Only admin/HR can modify via console/script
}
```

---

## 📊 Benefits

### **For Employees:**
✅ **One-click** access to HR's booking page  
✅ **Auto-generated** Google Meet links  
✅ **No manual setup** required  
✅ **Clear instructions** on what to do  
✅ **Real availability** (from your Google Calendar)

### **For HR:**
✅ **Control your calendar** (Google Calendar manages availability)  
✅ **Auto-sync** with your existing calendar  
✅ **No double-booking** (Google Calendar prevents conflicts)  
✅ **Professional appearance** (official Google Calendar booking)  
✅ **Easy to update** (change URL anytime)

---

## 💡 Pro Tips

### **For Best Results:**

1. **Set up Google Calendar appointment schedule** with:
   - Clear duration options (30 min, 1 hour)
   - Buffer time between meetings
   - Your actual availability

2. **Keep the booking page URL** handy:
   - Bookmark it for easy access
   - Share with employees directly if needed

3. **Update availability regularly:**
   - Block time off when unavailable
   - Adjust working hours as needed

4. **Test it yourself first:**
   - Book a test appointment
   - Verify Google Meet link is generated
   - Make sure the flow works smoothly

---

## 🎊 Status

✅ **Feature is live** in the Performance Management meeting form!  
✅ **Duration defaults to 30 minutes** as requested!  
✅ **HR available time slots** still show up when selecting a date!  
✅ **"Open HR Booking Page" button** appears when configured!  

---

## 📝 Summary

**What changed:**

1. ✅ **Duration now defaults to 30 minutes** (not 60)
2. ✅ **HR available time slots** still display when date is selected
3. ✅ **New "Open HR Booking Page" button** in Meeting Link section
4. ✅ **Opens your Google Calendar booking page** in new tab
5. ✅ **Only shows if you configure your booking page URL**
6. ✅ **Otherwise, regular manual input** (as before)

**Ready to use!** Just configure your booking page URL following the steps above. 🚀


