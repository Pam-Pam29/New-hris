import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

// Disable body parsing, we'll use formidable
export const config = {
    api: {
        bodyParser: false,
    },
};

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
        // Parse the multipart form data
        const form = formidable({ multiples: false });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        // Get the uploaded file
        const uploadedFile = files.file?.[0] || files.file;
        const path = fields.path?.[0] || fields.path;
        const metadataString = fields.metadata?.[0] || fields.metadata;

        if (!uploadedFile || !path) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: file and path'
            });
        }

        // Parse metadata if provided
        let parsedMetadata = {};
        if (metadataString) {
            try {
                parsedMetadata = JSON.parse(metadataString);
            } catch (error) {
                console.warn('Failed to parse metadata:', error);
            }
        }

        // Read the file from disk
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);

        // Upload file to Vercel Blob
        const blob = await put(path, fileBuffer, {
            access: 'public',
            contentType: uploadedFile.mimetype || 'application/octet-stream',
            addRandomSuffix: false,
        });

        // Clean up the temporary file
        fs.unlinkSync(uploadedFile.filepath);

        console.log('✅ [Vercel Blob] Document uploaded successfully:', {
            path: path,
            url: blob.url,
            size: uploadedFile.size
        });

        return res.status(200).json({
            success: true,
            downloadURL: blob.url,
            path: blob.pathname,
            metadata: {
                name: uploadedFile.originalFilename || uploadedFile.newFilename,
                size: uploadedFile.size,
                type: uploadedFile.mimetype,
                lastModified: new Date().toISOString(),
                ...parsedMetadata
            }
        });

    } catch (error) {
        console.error('❌ [Vercel Blob] Upload error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Upload failed'
        });
    }
}

