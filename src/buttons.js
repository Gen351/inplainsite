// buttons.js
import { fetch_init_rows, addEntryToSheet } from './api.js';
import { getInfoCache } from './cache.js';
import { secureTwoKeyEncrypt, secureTwoKeyDecrypt } from './cipher.js';
import { APP_STATES, setState, getAppState } from './state.js';
import { populate_feed_container, removeItemHighlights } from './ui.js'; // Import from UI

const container = document.getElementById('app-container');
const feedContainer = document.getElementById('feed-container');

const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');

const searchStateBtn = document.getElementById('search-state-btn');
const playgroundStateBtn = document.getElementById('playground-state-btn');
const addStateBtn = document.getElementById('add-state-btn');
const closeBtn = document.getElementById('close-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const confirmAddBtn = document.getElementById('confirm-add-btn');

const cipherField = document.getElementById('cipher-field');
const keyField = document.getElementById('key-field');
const encryptedField = document.getElementById('encrypted-field');

function syncUI(clickedItem = null) {
    const state = getAppState();

    searchStateBtn.classList.toggle('active', state === APP_STATES.SEARCH || state === APP_STATES.DECRYPT_MODE);
    playgroundStateBtn.classList.toggle('active', state === APP_STATES.PLAYGROUND);
    addStateBtn.classList.toggle('active', state === APP_STATES.ADD);

    if (state === APP_STATES.SEARCH) {
        cipherField.value = "";
        keyField.value = "";
        encryptedField.value = "";
        container.classList.remove('split-active');
    } else {
        container.classList.add('split-active');
    }

    encryptedField.readOnly = (state === APP_STATES.DECRYPT_MODE || state === APP_STATES.SEARCH);
    confirmAddBtn.classList.toggle('hidden', state !== APP_STATES.ADD);

    removeItemHighlights();
    if (clickedItem) {
        clickedItem.classList.add('active');
    }
}

// --- Button Functionalities --- //

// Item Click
feedContainer.addEventListener('click', async (e) => {
    const item = e.target.closest('.feed-item');
    if (!item) return;

    const cache = await getInfoCache();
    const cachedData = cache[item.dataset.cacheKey];
    
    encryptedField.value = cachedData.data;
    cipherField.value = item.textContent;
    keyField.value = '';

    setState(APP_STATES.DECRYPT_MODE); // Set state
    syncUI(item); // Update UI
});



// --- Search Functionality ---

// Listen for typing
searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    
    // Toggle "X" button visibility
    if (value.length > 0) {
        searchClearBtn.classList.remove('hidden');
    } else {
        searchClearBtn.classList.add('hidden');
    }

    // Filter the feed
    populate_feed_container(value);
});

// Listen for "X" click
searchClearBtn.addEventListener('click', () => {
    // 1. Clear text
    searchInput.value = "";
    
    // 2. Hide "X" button
    searchClearBtn.classList.add('hidden');
    
    // 3. Reset State to Search/Default
    setState(APP_STATES.SEARCH);
    
    // 4. Reset UI
    syncUI();
    
    // 5. Show all items again
    populate_feed_container("");
    
    // 6. Focus back on input
    searchInput.focus();
});






// -- Right Panel Buttons -- //

// Close split screen on 'X' click
closeBtn.addEventListener('click', () => {
    setState(APP_STATES.SEARCH);
    syncUI();
});

decryptBtn.addEventListener('click', async () => {
    const state = getAppState();
    const cipher = cipherField.value;
    const key = keyField.value;
    const data = encryptedField.value;

    if (!cipher || !key || !data) return;

    let result;
    
    // Logic based on state
    if (state === APP_STATES.DECRYPT_MODE) {
        // We are looking at an existing item, so we DECRYPT
        result = await secureTwoKeyDecrypt(data, cipher, key);
    } else {
        // We are in Add or Playground, so we ENCRYPT
        const encrypted = await secureTwoKeyEncrypt(data, cipher, key);
        result = { success: true, decryptedText: encrypted };
    }

    if (result.success) {
        encryptedField.value = result.decryptedText;
        // If we just encrypted it, maybe copy to clipboard automatically?
    } else {
        alert("Action failed: Check your keys.");
    }
});


confirmAddBtn.addEventListener('click', async () => {
    const name = cipherField.value;
    const data = encryptedField.value;

    // Validation
    if (!name || !data) {
        alert('Name and encrypted data cannot be empty');
        return;
    }

    try {
        confirmAddBtn.disabled = true;
        confirmAddBtn.textContent = '...';

        const result = await addEntryToSheet(name, data);

        // Success: clear fields and refresh cache
        cipherField.value = '';
        keyField.value = '';
        encryptedField.value = '';
        alert('Entry added successfully!');

        // Refresh the feed from cache
        await fetch_init_rows();
        await populate_feed_container();

    } catch (error) {
        alert('Error adding entry: ' + error.message);
    } finally {
        confirmAddBtn.disabled = false;
        confirmAddBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/></svg>';
    }
});





// -- Header buttons -- //
searchStateBtn.addEventListener('click', () => {
    if(getAppState() != APP_STATES.SEARCH) {
        setState(APP_STATES.SEARCH);
        syncUI();
    }
});

playgroundStateBtn.addEventListener('click', () => {
    const state = getAppState();
    if(state != APP_STATES.PLAYGROUND && state != APP_STATES.ADD) {
        encryptedField.value = "";
        cipherField.value = "";
        keyField.value = "";
    }
    if(state != APP_STATES.PLAYGROUND) {
        setState(APP_STATES.PLAYGROUND);
        syncUI();
    }
});
addStateBtn.addEventListener('click', () => {
    const state = getAppState();
    if(state != APP_STATES.PLAYGROUND && state != APP_STATES.ADD) {
        encryptedField.value = "";
        cipherField.value = "";
        keyField.value = "";
    }
    if(state != APP_STATES.ADD) {
        setState(APP_STATES.ADD);
        syncUI();
    }
});










// -- Helper Functions -- //
function open_right_panel() {
    // Remove all the highlights
    removeHeaderHighlights();

    // Set encrypt to decrypt title on the button
    playgroundStateBtn.classList.add('active');

    // Open the right panel
    container.classList.add('split-active');
}


async function open_right_panel_w_ctx(item) {
    // Remove all the highlights
    removeHeaderHighlights();
    
    // Highlight search button
    searchStateBtn.classList.add('active');

    // Highlight the item
    item.classList.add('active');
    // Open the right panel
    container.classList.add('split-active');
}


function close_right_panel() {
    container.classList.remove('split-active');
    items.forEach(i => i.classList.remove('active'));

    // Remove all the highlights
    removeHeaderHighlights();
    
    // Set the text back


    // Highlight the searchStateBtn
    searchStateBtn.classList.add('active'); 
}

function removeHeaderHighlights() {
    // Remove all the highlights
    searchStateBtn.classList.remove('active');
    playgroundStateBtn.classList.remove('active');
    addStateBtn.classList.remove('active');
}