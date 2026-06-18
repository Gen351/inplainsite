// ui.js
import { getInfoCache } from './cache.js';

const feedContainer = document.getElementById('feed-container');

// Inject spinner into the left panel
export function showFeedSpinner() {
    feedContainer.innerHTML = '<div class="spinner panel-spinner"></div>';
    feedContainer.classList.add('loading-locked');
}

export async function populate_feed_container(filterText = "") {
    const cache = await getInfoCache();
    feedContainer.innerHTML = ''; 
    feedContainer.classList.remove('loading-locked'); // Unlock feed

    const query = filterText.toLowerCase().trim();

    Object.keys(cache).forEach(key => {
        const item = cache[key];
        
        if (query === "" || item.name.toLowerCase().includes(query)) {
            const div = document.createElement('div');
            div.className = 'feed-item';
            div.dataset.cacheKey = key; 
            
            // Build rich HTML conforming strictly to the mockup screenshot
            div.innerHTML = `
              <div class="feed-item-left">
                <div class="feed-item-title">${item.name}</div>
                <div class="feed-item-meta">
                  <svg class="meta-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; width: 11px; height: 11px; vertical-align: middle; margin-right: 4px; opacity: 0.7;">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  AES-256 Obfuscated
                </div>
              </div>
              <div class="feed-item-badge">DECODE</div>
            `;
            
            feedContainer.appendChild(div);
        }
    });
}

export function removeItemHighlights() {
    const items = document.querySelectorAll('.feed-item');
    items.forEach(i => i.classList.remove('active'));
}

// Programmatic Toast Notification Generator
export function showToast(message, type = 'info') {
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
