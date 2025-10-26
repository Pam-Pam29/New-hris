# Cloudinary Configuration

## Setup Instructions

1. Create a free Cloudinary account at: https://cloudinary.com/users/register_free

2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Create an Upload Preset:
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Name: `hris-documents`
   - Signing Mode: **Unsigned** (important for browser uploads)
   - Folder: leave empty (we'll specify in code)
   - Save

4. Add to Vercel Environment Variables:
   - Go to your Employee Platform project settings
   - Add these environment variables:
     - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name
     - `VITE_CLOUDINARY_UPLOAD_PRESET` = hris-documents

5. Redeploy the Employee Platform

## Firestore Security Rules

Add this rule to allow document metadata storage:

```
match /documentMetadata/{docId} {
  allow create: if isAuthenticated();
  allow read: if isAuthenticated() && 
    (isOwner(resource.data.employeeId) || isHROrAdmin());
  allow delete: if isAuthenticated() && 
    (isOwner(resource.data.employeeId) || isHROrAdmin());
}
```


