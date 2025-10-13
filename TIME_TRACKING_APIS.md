# 🕐 Time Tracking APIs Used

## 📋 **Summary:**

The Time Tracking system uses **4 main APIs** - all **FREE** and **browser-based** (no external API keys needed):

---

## 🌍 **1. Geolocation API** (Browser Built-in)

### **What it does:**
Gets the employee's current GPS coordinates (latitude & longitude)

### **API Used:**
```javascript
navigator.geolocation.getCurrentPosition()
```

### **How it works:**
- **FREE** - Built into all modern browsers
- **No API Key needed**
- Asks user for location permission (one-time popup)
- Returns: `latitude`, `longitude`, `accuracy`

### **Example:**
```javascript
navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;   // e.g., 6.4281
        const lon = position.coords.longitude;  // e.g., 3.4219
        const accuracy = position.coords.accuracy; // e.g., 20 meters
    },
    (error) => {
        console.error('Location denied');
    }
);
```

### **Browser Support:**
✅ Chrome, Firefox, Safari, Edge, Mobile browsers

### **Location:** 
`New-hris/employee-platform/src/pages/Employee/TimeManagement/index.tsx` (Line 217)

---

## 🗺️ **2. Reverse Geocoding API** (OpenStreetMap Nominatim)

### **What it does:**
Converts GPS coordinates (lat/lon) into human-readable addresses

### **API Used:**
```
https://nominatim.openstreetmap.org/reverse
```

### **How it works:**
- **FREE** - No API key required
- Takes coordinates → Returns full address
- Uses CORS proxy for localhost development

### **Example Request:**
```
https://nominatim.openstreetmap.org/reverse?format=json&lat=6.4281&lon=3.4219&zoom=19&addressdetails=1
```

### **Example Response:**
```json
{
  "address": {
    "office": "TechHub Lagos",
    "house_number": "23",
    "road": "Adeola Odeku Street",
    "neighbourhood": "Victoria Island",
    "suburb": "Eti-Osa",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "postcode": "101241"
  },
  "display_name": "TechHub Lagos, 23 Adeola Odeku Street, Victoria Island..."
}
```

### **CORS Proxy (for localhost):**
```
https://api.allorigins.win/raw?url=<encoded_nominatim_url>
```

### **Usage Limits:**
- **FREE**
- Max 1 request per second
- For production, consider Nominatim self-hosting or paid alternatives

### **Location:**
`New-hris/employee-platform/src/pages/Employee/TimeManagement/index.tsx` (Line 238)

### **Address Building Logic:**
The system intelligently builds addresses from Nominatim data:
1. Office/Building name (if available)
2. House number + Road
3. Neighbourhood
4. Suburb/District
5. City/State
6. Country

---

## 📍 **3. Haversine Formula** (Distance Calculation)

### **What it does:**
Calculates the distance between two GPS points (employee vs office)

### **API Used:**
```javascript
calculateDistance(lat1, lon1, lat2, lon2)
```

### **How it works:**
- **FREE** - Pure JavaScript math (no external API)
- Uses Haversine formula (calculates great-circle distance on Earth)
- Returns distance in kilometers

### **Formula:**
```javascript
const R = 6371; // Earth's radius in km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;

const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
const distance = R * c; // Distance in km
```

### **Example:**
```javascript
// Employee location
const empLat = 6.4281;
const empLon = 3.4219;

// Office location
const officeLat = 6.4350;
const officeLon = 3.4200;

const distance = calculateDistance(empLat, empLon, officeLat, officeLon);
// Returns: 0.78 km (780 meters)

// Check if within office radius (e.g., 100 meters = 0.1 km)
if (distance <= 0.1) {
    console.log("✅ Employee is at the office!");
} else {
    console.log(`❌ Employee is ${distance.toFixed(1)}km from office`);
}
```

### **Location:**
`New-hris/employee-platform/src/services/officeLocationService.ts` (Line 96-116)

---

## 🔋 **4. Battery Status API** (Browser Built-in)

### **What it does:**
Gets the device's battery level (for time tracking reliability)

### **API Used:**
```javascript
navigator.getBattery()
```

### **How it works:**
- **FREE** - Built into browsers
- **No API Key needed**
- Returns battery level as percentage

### **Example:**
```javascript
if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
        const batteryLevel = Math.round(battery.level * 100);
        console.log(`Battery: ${batteryLevel}%`);
        
        if (batteryLevel < 10) {
            alert('⚠️ Low battery! Your time tracking may be interrupted.');
        }
    });
}
```

### **Browser Support:**
✅ Chrome, Edge, Opera
❌ Firefox (limited support)
❌ Safari (not supported)

### **Location:**
`New-hris/employee-platform/src/pages/Employee/TimeManagement/index.tsx` (Line 196)

---

## 🌐 **5. Network Status API** (Browser Built-in)

### **What it does:**
Detects if the device is online or offline

### **API Used:**
```javascript
navigator.onLine
window.addEventListener('online', ...)
window.addEventListener('offline', ...)
```

### **How it works:**
- **FREE** - Built into all browsers
- Real-time detection of internet connection
- Useful for offline time tracking

### **Example:**
```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}, []);
```

### **Location:**
`New-hris/employee-platform/src/pages/Employee/TimeManagement/index.tsx` (Line 59-60)

---

## 🔥 **6. Firebase Firestore** (Database & Real-time Sync)

### **What it does:**
Stores all time entries, schedules, notifications, and office locations

### **Collections Used:**
```
📁 Firebase Database
├── timeEntries           - Clock in/out records
├── timeNotifications     - Late/absent alerts
├── schedules             - Employee work schedules
├── officeLocations       - Office GPS coordinates & radius
└── timeAdjustmentRequests - Manual time correction requests
```

### **API Used:**
```javascript
import { 
    collection, 
    addDoc, 
    getDocs, 
    onSnapshot 
} from 'firebase/firestore';
```

### **Example:**
```javascript
// Save clock-in time
const timeEntry = {
    employeeId: 'EMP001',
    companyId: 'acme-corp',
    clockIn: new Date(),
    location: {
        latitude: 6.4281,
        longitude: 3.4219,
        address: '23 Adeola Odeku, Victoria Island, Lagos'
    },
    distanceFromOffice: 0.05 // km
};

await addDoc(collection(db, 'timeEntries'), timeEntry);
```

### **Real-time Sync:**
```javascript
// Listen for changes in real-time
onSnapshot(collection(db, 'timeEntries'), (snapshot) => {
    const entries = snapshot.docs.map(doc => doc.data());
    setTimeEntries(entries); // Auto-updates UI
});
```

---

## 📊 **Complete Flow:**

```
Employee clicks "Clock In"
        ↓
1️⃣  Get GPS coordinates
    navigator.geolocation.getCurrentPosition()
    → Returns: lat=6.4281, lon=3.4219
        ↓
2️⃣  Convert to address
    Nominatim API: https://nominatim.openstreetmap.org/reverse
    → Returns: "23 Adeola Odeku Street, Victoria Island, Lagos"
        ↓
3️⃣  Get office location
    Firebase Firestore: officeLocations collection
    → Returns: Office lat=6.4350, lon=3.4200, radius=100m
        ↓
4️⃣  Calculate distance
    Haversine Formula
    → Returns: 780 meters from office
        ↓
5️⃣  Check if within radius
    if (780m <= 100m) ❌ NOT AT OFFICE
        ↓
6️⃣  Save to Firebase
    Firebase Firestore: timeEntries collection
    → Saves: Clock-in time, location, address, distance
        ↓
7️⃣  Real-time sync
    onSnapshot() updates HR platform instantly
```

---

## 💰 **Cost Analysis:**

| API | Cost | Rate Limits |
|-----|------|-------------|
| **Geolocation API** | ✅ FREE | Unlimited |
| **Nominatim (OSM)** | ✅ FREE | 1 req/sec |
| **Haversine Formula** | ✅ FREE | Unlimited (pure math) |
| **Battery API** | ✅ FREE | Unlimited |
| **Network API** | ✅ FREE | Unlimited |
| **Firebase Firestore** | ✅ FREE tier (50K reads/day) | See Firebase pricing |

**Total Cost:** ✅ **$0** (on free tiers)

---

## 🔒 **Privacy & Permissions:**

### **Browser Permissions Required:**

1. **Location Permission** (one-time popup):
   ```
   "https://yourapp.com wants to know your location"
   [Block] [Allow]
   ```

2. **No Camera/Photo API used** (despite Camera icon in UI)
   - The camera icon is decorative only
   - No actual photo capture implemented yet

---

## 🌍 **Alternative APIs (if needed):**

### **For Reverse Geocoding:**
| API | Free Tier | Rate Limit | API Key Required |
|-----|-----------|------------|------------------|
| **OpenStreetMap Nominatim** | ✅ Yes | 1 req/sec | ❌ No |
| **Google Maps Geocoding** | 💰 $200 credit/month | 40K req/month | ✅ Yes |
| **Mapbox Geocoding** | 💰 100K req/month free | 100K/month | ✅ Yes |
| **LocationIQ** | 💰 5K req/day free | 5K/day | ✅ Yes |
| **Geocodio** | 💰 2.5K req/day free | 2.5K/day | ✅ Yes |

**Current Choice:** OpenStreetMap Nominatim (FREE, no API key)

---

## 🚀 **Production Considerations:**

### **1. For Nominatim (OSM):**
- ✅ Good for small apps (< 10 employees)
- ⚠️ May need self-hosting or paid alternative for larger companies
- ⚠️ Rate limit: 1 request/second

### **2. For Geolocation:**
- ✅ Works well in all modern browsers
- ⚠️ Requires HTTPS in production
- ⚠️ User can deny permission (handle gracefully)

### **3. For Firebase:**
- ✅ Free tier: 50K reads + 20K writes per day
- 💡 Upgrade to Blaze plan for production (pay-as-you-go)

---

## 📂 **Key Files:**

### **Employee Platform:**
```
New-hris/employee-platform/src/
├── pages/Employee/TimeManagement/
│   └── index.tsx                    # Main time tracking UI
└── services/
    ├── officeLocationService.ts     # Distance calculation
    ├── timeTrackingService.ts       # Firebase time entries
    └── timeNotificationService.ts   # Late/absent alerts
```

### **HR Platform:**
```
New-hris/hr-platform/src/
└── pages/Hr/CoreHr/TimeManagement/
    ├── index.tsx                    # HR view of time tracking
    └── services/
        └── timeService.ts           # Attendance management
```

---

## ✅ **Summary:**

**All APIs used are:**
- ✅ **FREE** (no API keys needed)
- ✅ **Browser built-in** (Geolocation, Battery, Network)
- ✅ **Open source** (OpenStreetMap Nominatim)
- ✅ **No external dependencies** (Haversine math)
- ✅ **Real-time** (Firebase Firestore)

**Perfect for a startup/MVP!** 🚀



