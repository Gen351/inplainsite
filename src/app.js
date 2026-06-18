// app.js
import { fetch_init_rows } from './api.js';
import { populate_feed_container, showFeedSpinner } from './ui.js';
import './buttons.js'; 

async function init() {
    showFeedSpinner(); // 1. Show the panel spinner
    await fetch_init_rows(); // 2. Fetch data
    await populate_feed_container(); // 3. Render items (removes spinner)
}

init();
