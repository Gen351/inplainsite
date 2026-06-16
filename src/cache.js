// cache.js
export const initItemCount = 20;

// Keep track of how many are cached
let itemCount = 0;
// Item caches are held here
let infoCache = {};

export async function getInfoCache() {
    return infoCache;
}

export async function add_payload_to_cache(newPayload) {
    const newKey = `item_${itemCount}`; // Unique string key
    infoCache[newKey] = {
        "name": newPayload.name,
        "data": newPayload.data,
    };
    itemCount++;
}

export function resetCache() {
    itemCount = 0;
    infoCache = {};
}