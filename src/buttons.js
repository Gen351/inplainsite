// buttons.js
import { fetch_init_rows, addEntryToSheet } from './api.js';
import { getInfoCache } from './cache.js';
import { secureTwoKeyEncrypt, secureTwoKeyDecrypt } from './cipher.js';
import { APP_STATES, setState, getAppState } from './state.js';
import { populate_feed_container, removeItemHighlights, showFeedSpinner, showToast } from './ui.js';

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
const copyToClipboardBtn = document.getElementById('copy-encrypted-field-btn');

const cipherField = document.getElementById('cipher-field');
const keyField = document.getElementById('key-field');
const encryptedField = document.getElementById('encrypted-field');

let isEncrypted = false;

function setIsEncrypted(val) {
    isEncrypted = val;
    if (confirmAddBtn) {
        confirmAddBtn.style.backgroundColor = isEncrypted ? 'var(--green-accent)' : 'var(--red-accent)';
    }
    if(decryptBtn) {
        if(isEncrypted) {
            decryptBtn.style.backgroundColor = '#c23434';
        } else {
            decryptBtn.style.backgroundColor = '#181818';
        }
    }
}

function resetEncryptionState() {
    if (isEncrypted) {
        setIsEncrypted(false);
    }
}

if (cipherField) cipherField.addEventListener('input', resetEncryptionState);
if (keyField) keyField.addEventListener('input', resetEncryptionState);
if (encryptedField) encryptedField.addEventListener('input', resetEncryptionState);

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
        const targetTag = document.getElementById('target-tag-name');
        if (targetTag) targetTag.textContent = "Select an item";
    } else {
        container.classList.add('split-active');
    }

    encryptedField.readOnly = (state === APP_STATES.DECRYPT_MODE || state === APP_STATES.SEARCH);
    confirmAddBtn.classList.toggle('hidden', state !== APP_STATES.ADD);
    if (state === APP_STATES.ADD) {
        confirmAddBtn.style.backgroundColor = isEncrypted ? 'var(--green-accent)' : 'var(--red-accent)';
    }

    const panelStateLabel = document.getElementById('panel-state-label');
    const decryptBtnEl = document.getElementById('decrypt-btn');

    if (panelStateLabel && decryptBtnEl) {
        if (state === APP_STATES.DECRYPT_MODE) {
            panelStateLabel.textContent = "KEY DECODING INTERFACE";
            decryptBtnEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                DECODE RECORD
            `;
        } else if (state === APP_STATES.PLAYGROUND) {
            panelStateLabel.textContent = "KEY ENCODING INTERFACE";
            decryptBtnEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
                ENCRYPT SANDBOX DATA
            `;
        } else if (state === APP_STATES.ADD) {
            panelStateLabel.textContent = "KEY ENCODING INTERFACE";
            decryptBtnEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
                ENCRYPT FOR PUBLICATION
            `;
        }
    }

    removeItemHighlights();
    if (clickedItem) {
        clickedItem.classList.add('active');
        clickedItem.classList.add('ready-badge');
    }
}


// --- Modal Handlers --- //
const brandBtn = document.querySelector('.brand');
const aboutModal = document.getElementById('about-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

if (aboutModal && closeModalBtn) {
    if (brandBtn) {
        brandBtn.addEventListener('click', () => {
            aboutModal.classList.add('show');
        });
    }

    // Close the modal when clicking the 'X' button
    closeModalBtn.addEventListener('click', () => {
        aboutModal.classList.remove('show');
    });

    // Close the modal if the user clicks anywhere outside of the modal window
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('show');
        }
    });
}


// --- Button Functionalities --- //

// Item Click
feedContainer.addEventListener('click', async (e) => {
    const item = e.target.closest('.feed-item');
    if (!item) return;

    const cache = await getInfoCache();
    const cachedData = cache[item.dataset.cacheKey];
    
    const targetTag = document.getElementById('target-tag-name');
    if (targetTag) {
        targetTag.textContent = cachedData.name;
    }

    encryptedField.value = cachedData.data;
    cipherField.value = cachedData.name;
    keyField.value = '';

    setState(APP_STATES.DECRYPT_MODE); // Set state
    syncUI(item); // Update UI
});

// --- Search Functionality ---

if (searchInput) {
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
}

if (searchClearBtn) {
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
}

// -- Right Panel Buttons -- //

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        setState(APP_STATES.SEARCH);
        syncUI();
    });
}

if (decryptBtn) {
    decryptBtn.addEventListener('click', async () => {
        const state = getAppState();
        const cipher = cipherField.value;
        const key = keyField.value;
        const data = encryptedField.value;

        if (!cipher || !key || !data) {
            showToast("Required fields are empty", "error");
            return;
        }

        // Prevent double encryption spamming when already encrypted in playground or add state
        if (isEncrypted && (state === APP_STATES.PLAYGROUND || state === APP_STATES.ADD)) {
            showToast("Already encrypted. Edit fields to encrypt new values.", "error");
            return;
        }

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
            showToast("Success!", "success");
            if (state === APP_STATES.PLAYGROUND || state === APP_STATES.ADD) {
                setIsEncrypted(true);
            }
        } else {
            showToast("Action failed: Check your keys.", "error");
        }
        syncUI();
    });
}

if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', async () => {
        const name = cipherField.value;
        const data = encryptedField.value;

        if (!name || !data) {
            showToast('Name and encrypted data cannot be empty', 'error');
            return;
        }

        try {
            // 1. Show spinner inside the Add button
            confirmAddBtn.disabled = true;
            confirmAddBtn.innerHTML = '<div class="spinner"></div>';

            // 2. Write to DB
            await addEntryToSheet(name, data);

            // Success: clear fields
            cipherField.value = '';
            keyField.value = '';
            encryptedField.value = '';
            showToast('Entry added successfully!', 'success');

            // 3. Show spinner in left panel while refetching
            showFeedSpinner(); 
            await fetch_init_rows();
            await populate_feed_container();

            setIsEncrypted(false);
            setState(APP_STATES.SEARCH);
            syncUI();

        } catch (error) {
            console.error("Database Write Failed:", error);

            let userFriendlyMsg = "Something went wrong. Try again.";
            const errorMsg = error.message ? error.message.toLowerCase() : "";

            if (errorMsg.includes("unauthorized") || errorMsg.includes("recaptcha") || errorMsg.includes("bot") || errorMsg.includes("domain")) {
                userFriendlyMsg = "Security verification failed. Try again from the official site or turn off your adblocker.";
            } else if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("urlfetchapp") || errorMsg.includes("syntaxerror")) {
                userFriendlyMsg = "Network error: Unable to reach the database. Try again later.";
            } else if (errorMsg.includes("empty") || errorMsg.includes("missing")) {
                userFriendlyMsg = "Input fields cannot be blank.";
            }

            showToast(userFriendlyMsg, 'error');
        } finally {
            // 4. Restore original button icon
            confirmAddBtn.disabled = false;
            confirmAddBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-120v-320H120v-80h320v-320h80v320h320v80H520v320h-80Z"/></svg>';
            confirmAddBtn.style.backgroundColor = isEncrypted ? 'var(--green-accent)' : 'var(--red-accent)';
        }
    });
}

if (copyToClipboardBtn) {
    copyToClipboardBtn.addEventListener('click', async () => {
        if (encryptedField.value === '') {
            showToast("Nothing to copy!", "error");
            return;
        }

        const text = encryptedField.value;
        const copied = await copyToClipboard(text);
        if (copied) {
            showToast("Copied to clipboard!", "success");
        } else {
            showToast("Failed to copy to clipboard.", "error");
        }
    });
}

// -- Header buttons -- //
if (searchStateBtn) {
    searchStateBtn.addEventListener('click', () => {
        if (getAppState() !== APP_STATES.SEARCH) {
            setIsEncrypted(false);
            setState(APP_STATES.SEARCH);
            syncUI();
        }
    });
}

if (playgroundStateBtn) {
    playgroundStateBtn.addEventListener('click', () => {
        const state = getAppState();
        if (state !== APP_STATES.PLAYGROUND && state !== APP_STATES.ADD) {
            setIsEncrypted(false);
            encryptedField.value = "";
            cipherField.value = "";
            keyField.value = "";
            const targetTag = document.getElementById('target-tag-name');
            if (targetTag) targetTag.textContent = "playground Mode";
        }
        if (state !== APP_STATES.PLAYGROUND) {
            setState(APP_STATES.PLAYGROUND);
            syncUI();
        }
    });
}

if (addStateBtn) {
    addStateBtn.addEventListener('click', () => {
        const state = getAppState();
        if (state !== APP_STATES.PLAYGROUND && state !== APP_STATES.ADD) {
            setIsEncrypted(false);
            encryptedField.value = "";
            cipherField.value = "";
            keyField.value = "";
            const targetTag = document.getElementById('target-tag-name');
            if (targetTag) targetTag.textContent = "Publish New Entry";
        }
        if (state !== APP_STATES.ADD) {
            setState(APP_STATES.ADD);
            syncUI();
        }
    });
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}
