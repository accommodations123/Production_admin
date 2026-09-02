const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dmhxnuxlodsshdkunngb.supabase.co';

/**
 * Utility helper to convert any image path (relative, Supabase storage path, or full URL)
 * into a valid, displayable image URL.
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    let path = imagePath;
    if (typeof path === 'object') {
        path = path.url || path.uri || path.src || path.link || path.path;
    }
    if (!path || typeof path !== 'string') return null;

    const trimmed = path.trim();
    if (!trimmed) return null;

    // Full URL or data/blob URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // Normalize slashes
    const cleanPath = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');

    // If it's a Supabase storage path
    if (cleanPath.startsWith('storage/v1/object/public/')) {
        return `${SUPABASE_URL}/${cleanPath}`;
    }
    if (cleanPath.startsWith('media/')) {
        return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/media/${cleanPath}`;
};

/**
 * Utility helper to safely parse images from different formats
 * (PostgreSQL JSONB string, JSON string, Array of strings, Array of objects, or single URL string)
 */
export const parseImages = (...sources) => {
    const results = [];

    sources.forEach(source => {
        if (!source) return;

        // If it's already an Array
        if (Array.isArray(source)) {
            source.forEach(item => {
                const resolved = getImageUrl(item);
                if (resolved) results.push(resolved);
            });
            return;
        }

        // If it's a string
        if (typeof source === 'string') {
            const trimmed = source.trim();
            if (!trimmed) return;

            // Handle stringified JSON array: e.g. "[\"https://...\"]"
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(item => {
                            const resolved = getImageUrl(item);
                            if (resolved) results.push(resolved);
                        });
                    }
                } catch (e) {
                    console.warn("Failed to JSON.parse image array string:", trimmed, e);
                }
                return;
            }

            // Handle stringified JSON object: e.g. "{\"url\": \"https://...\"}"
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    const resolved = getImageUrl(parsed);
                    if (resolved) results.push(resolved);
                } catch (e) {
                    console.warn("Failed to JSON.parse image object string:", trimmed, e);
                }
                return;
            }

            // Direct URL or path
            const resolved = getImageUrl(trimmed);
            if (resolved) results.push(resolved);
        } else if (typeof source === 'object') {
            const resolved = getImageUrl(source);
            if (resolved) results.push(resolved);
        }
    });

    return [...new Set(results)];
};

/**
 * Returns the primary/first image URL for an entity or null
 */
export const getPrimaryImage = (item) => {
    if (!item) return null;
    const images = parseImages(
        item.images,
        item.photos,
        item.image,
        item.image_url,
        item.media,
        item.picture,
        item.thumbnail,
        item.gallery_images
    );
    return images.length > 0 ? images[0] : null;
};

