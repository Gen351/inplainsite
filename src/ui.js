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


function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Force browser reflow to trigger CSS transition smoothly
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}