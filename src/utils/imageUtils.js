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
                if (typeof item === 'string' && item.trim()) {
                    results.push(item.trim());
                } else if (item && typeof item === 'object') {
                    const url = item.url || item.uri || item.src || item.link || item.path;
                    if (typeof url === 'string' && url.trim()) {
                        results.push(url.trim());
                    }
                }
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
                            if (typeof item === 'string' && item.trim()) {
                                results.push(item.trim());
                            } else if (item && typeof item === 'object') {
                                const url = item.url || item.uri || item.src || item.link || item.path;
                                if (typeof url === 'string' && url.trim()) {
                                    results.push(url.trim());
                                }
                            }
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
                    const url = parsed.url || parsed.uri || parsed.src || parsed.link || parsed.path;
                    if (typeof url === 'string' && url.trim()) {
                        results.push(url.trim());
                    }
                } catch (e) {
                    console.warn("Failed to JSON.parse image object string:", trimmed, e);
                }
                return;
            }

            // Direct URL / relative URL string
            if (trimmed.startsWith('http') || trimmed.startsWith('data:image') || trimmed.startsWith('/') || trimmed.startsWith('blob:')) {
                results.push(trimmed);
            }
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
