const SHEET_ID = "1-vZigfxDtew870csptOHzjw4JUKwPwuY9jEUW1GtqcM";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1-vZigfxDtew870csptOHzjw4JUKwPwuY9jEUW1GtqcM"

// Vite only exposes env vars prefixed with `VITE_` to client code.
const SHEET_ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT;
const APP_SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY;

if (!SHEET_ENDPOINT) {
    console.warn('SHEET_ENDPOINT is not set. Make sure .env contains VITE_SHEET_ENDPOINT and restart the dev server.');
}
if (!APP_SECRET_KEY) {
    console.warn('APP_SECRET_KEY is not set. Make sure .env contains VITE_APP_SECRET_KEY and restart the dev server.');
}

export function getSheetId() {
    return SHEET_ID;
}

export function getAppKey() {
    return APP_SECRET_KEY;
}

export function getSheetEndpoint() {
    return SHEET_ENDPOINT;
}