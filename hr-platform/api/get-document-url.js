import { head } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers - be very explicit
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: path'
      });
    }

    // Get document info from Vercel Blob
    const blob = await head(path);

    console.log('✅ [Vercel Blob] Got document URL:', path);

    return res.status(200).json({
      success: true,
      downloadURL: blob.url,
      metadata: {
        name: blob.pathname.split('/').pop() || 'unknown',
        size: blob.size || 0,
        type: blob.contentType || 'unknown',
        lastModified: new Date(blob.uploadedAt).toISOString(),
        path: blob.pathname
      }
    });

  } catch (error) {
    console.error('❌ [Vercel Blob] Get document URL error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get document URL'
    });
  }
}

