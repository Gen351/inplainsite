// ui.js
import { getInfoCache } from './cache.js';

const feedContainer = document.getElementById('feed-container');

export async function populate_feed_container(filterText = "") {
    const cache = await getInfoCache();
    feedContainer.innerHTML = ''; 

    const query = filterText.toLowerCase().trim();

    Object.keys(cache).forEach(key => {
        const item = cache[key];
        
        // Check if name matches query (if query exists)
        if (query === "" || item.name.toLowerCase().includes(query)) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.textContent = item.name;
            div.dataset.cacheKey = key; 
            feedContainer.appendChild(div);
        }
    });
}

export function removeItemHighlights() {
    const items = document.querySelectorAll('.feed-item');
    items.forEach(i => i.classList.remove('active'));
}