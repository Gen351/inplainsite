// app.js
import { fetch_init_rows } from './api.js';
import { populate_feed_container } from './ui.js';
import './buttons.js'; // Just import to initialize listeners

async function init() {
    await fetch_init_rows(); 
    await populate_feed_container();
}

init();