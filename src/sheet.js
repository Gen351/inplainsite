const SHEET_ID = "1-vZigfxDtew870csptOHzjw4JUKwPwuY9jEUW1GtqcM";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1-vZigfxDtew870csptOHzjw4JUKwPwuY9jEUW1GtqcM";

// Vite only exposes env vars prefixed with `VITE_` to client code.
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbyftBH2a6IW0zzZAp8_GUbYexreSKUWOJrQzXR8x9qx9h3lMhwabqLerCPYrkP1dxny/exec";

if (!SHEET_ENDPOINT) {
    console.warn('SHEET_ENDPOINT is not set. Make sure .env contains VITE_SHEET_ENDPOINT and restart the dev server.');
}

export function getSheetId() {
    return SHEET_ID;
}

export function getSheetEndpoint() {
    return SHEET_ENDPOINT;
}
